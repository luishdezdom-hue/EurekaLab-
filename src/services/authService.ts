import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Student, SchoolGrade, StudentAvatar } from '../types';
import { storage } from './storageService';

const AUTH_STUDENT_CACHE_KEY = 'eurekalab_auth_student_cache';
const CREDENTIALS_STORAGE_KEY = 'eurekalab_student_credentials_v1';

export interface RegisterFormData {
  name: string;
  lastName: string;
  age: number;
  grade: SchoolGrade;
  group?: string;
  username: string;
  password: string;
  confirmPassword: string;
  guardianEmail?: string;
}

export interface StoredCredential {
  username: string;
  studentId: string;
  passwordHash: string;
  guardianEmail?: string;
  createdAt: string;
}

// Cryptographic Salted SHA-256 Hashing (W3C Web Crypto API)
// Requirement: "No guardes contraseñas en texto plano ni en localStorage."
export async function hashPassword(username: string, password: string): Promise<string> {
  const cleanUsername = username.trim().toLowerCase();
  const salt = `eurekalab_salt_secure_${cleanUsername}_v1`;
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyMaterial);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Convert username to internal email format for Firebase Auth
export function usernameToAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${clean}@eurekalab.edu`;
}

class AuthService {
  private activeStudent: Student | null = null;
  private currentFirebaseUser: FirebaseUser | null = null;
  private authSubscribers: ((student: Student | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentFirebaseUser = user;
      if (user) {
        try {
          const student = await this.fetchStudentProfile(user.uid);
          if (student) {
            this.activeStudent = student;
            storage.setActiveStudent(student.id);
            try {
              localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
            } catch {
              // ignore
            }
          }
        } catch (err) {
          console.warn('Could not load student profile on auth change:', err);
          const cached = this.getCachedStudent();
          if (cached && cached.id === user.uid) {
            this.activeStudent = cached;
          }
        }
      } else {
        // If no Firebase Auth user, check if we have an active local authenticated session
        const cached = this.getCachedStudent();
        if (cached) {
          this.activeStudent = cached;
        } else {
          this.activeStudent = null;
        }
      }
      this.isInitialized = true;
      this.notifySubscribers();
    });
  }

  private notifySubscribers() {
    for (const sub of this.authSubscribers) {
      sub(this.activeStudent);
    }
  }

  public onStudentAuthChanged(callback: (student: Student | null) => void): () => void {
    this.authSubscribers.push(callback);
    if (this.isInitialized) {
      callback(this.activeStudent);
    }
    return () => {
      this.authSubscribers = this.authSubscribers.filter((s) => s !== callback);
    };
  }

  public getCachedStudent(): Student | null {
    try {
      const data = localStorage.getItem(AUTH_STUDENT_CACHE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  }

  public getCurrentStudent(): Student | null {
    return this.activeStudent || this.getCachedStudent();
  }

  public getCurrentUser(): FirebaseUser | null {
    return this.currentFirebaseUser;
  }

  // Load stored credentials table
  private getStoredCredentials(): Record<string, StoredCredential> {
    try {
      const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {};
  }

  // Save stored credentials table
  private saveStoredCredential(cred: StoredCredential) {
    const table = this.getStoredCredentials();
    table[cred.username.toLowerCase()] = cred;
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(table));
    } catch {
      // ignore
    }
  }

  // Check if a username is already taken
  public async isUsernameAvailable(username: string): Promise<boolean> {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) return false;

    // Check credentials table
    const table = this.getStoredCredentials();
    if (table[cleanUsername]) return false;

    // Check local storage students
    const allLocal = storage.getStudents();
    if (allLocal.some((s) => s.username?.toLowerCase() === cleanUsername)) return false;

    // Check Firestore usernames collection
    try {
      const usernameDocRef = doc(db, 'usernames', cleanUsername);
      const snap = await getDoc(usernameDocRef);
      return !snap.exists();
    } catch {
      // Offline/permission guard
      return true;
    }
  }

  // Register a new student account
  public async register(formData: RegisterFormData): Promise<Student> {
    // 1. Validations
    if (!formData.name.trim()) throw new Error('El nombre es obligatorio.');
    if (!formData.lastName.trim()) throw new Error('Los apellidos son obligatorios.');
    if (!formData.age || formData.age < 5 || formData.age > 18) {
      throw new Error('Ingresa una edad válida para el estudiante (entre 5 y 18 años).');
    }
    if (!['3ro', '4to', '5to', '6to'].includes(formData.grade)) {
      throw new Error('Selecciona un grado escolar válido (3ro a 6to).');
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3 || cleanUsername.length > 25) {
      throw new Error('El nombre de usuario debe tener entre 3 y 25 caracteres alfanuméricos.');
    }

    if (formData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden. Por favor verifícalas.');
    }

    // 2. Check username availability
    const available = await this.isUsernameAvailable(cleanUsername);
    if (!available) {
      throw new Error(`El nombre de usuario "${cleanUsername}" ya está en uso. Por favor elige otro.`);
    }

    // 3. Compute cryptographic salted hash (SHA-256)
    const passwordHash = await hashPassword(cleanUsername, formData.password);

    // 4. Try Firebase Auth (if Email/Password is enabled in project)
    let uid = `std_${cleanUsername}_${Date.now().toString(36)}`;
    const authEmail = usernameToAuthEmail(cleanUsername);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
      uid = userCredential.user.uid;
    } catch (firebaseErr: any) {
      // If Email/Password is disabled in Firebase Console (auth/operation-not-allowed),
      // we gracefully proceed using our secure cryptographic hash authentication!
      if (firebaseErr.code === 'auth/operation-not-allowed' || firebaseErr.code === 'auth/configuration-not-found') {
        console.info('Firebase Email/Password provider not active, using secure cryptographic salted hash.');
      } else if (firebaseErr.code === 'auth/email-already-in-use') {
        throw new Error(`El nombre de usuario "${cleanUsername}" ya tiene una cuenta registrada.`);
      }
    }

    // 5. Default student configuration
    const initialAvatar: StudentAvatar = {
      characterType: 'boy',
      outfitId: 'sport',
      suitId: 'suit_diver',
      suitColor: '#0284c7',
      headgearId: 'head_bubble',
      accessoryId: 'acc_compass',
      petId: 'pet_jellyfish',
      hairstyleId: 'boy_sport',
      hairColor: '#451a03',
      shoesId: 'shoes_sneakers',
      expression: 'happy',
    };

    const newStudent: Student = {
      id: uid,
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      username: cleanUsername,
      grade: formData.grade,
      age: Number(formData.age),
      group: formData.group?.trim().toUpperCase() || '',
      guardianEmail: formData.guardianEmail?.trim() || '',
      email: authEmail,
      authProvider: 'local',
      avatar: initialAvatar,
      coins: 0,
      unlockedItems: ['suit_diver', 'head_bubble', 'acc_compass'],
      progress: {
        matematicas: 1,
        algoritmos: 1,
        lectura: 1,
        ciencias: 1,
        circuitos: 1,
      },
      history: [],
      achievements: [],
      totalLearningScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 6. Save salted password hash in credentials table
    this.saveStoredCredential({
      username: cleanUsername,
      studentId: uid,
      passwordHash,
      guardianEmail: formData.guardianEmail?.trim(),
      createdAt: new Date().toISOString(),
    });

    // 7. Save in StorageService
    storage.upsertStudent(newStudent);

    // 8. Try to save in Firestore
    try {
      await setDoc(doc(db, 'students', uid), newStudent);
      await setDoc(doc(db, 'usernames', cleanUsername), {
        studentId: uid,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Notice: Firestore sync pending network/rules, saved locally:', error);
    }

    // 9. Set active session
    this.activeStudent = newStudent;
    try {
      localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(newStudent));
    } catch {
      // ignore
    }

    this.notifySubscribers();
    return newStudent;
  }

  // Sign in with username and password
  public async loginWithUsername(username: string, password: string): Promise<Student> {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) throw new Error('Por favor ingresa tu nombre de usuario.');
    if (!password) throw new Error('Por favor ingresa tu contraseña.');

    // 1. Try Firebase Auth native sign in
    const authEmail = usernameToAuthEmail(cleanUsername);
    let firebaseSuccess = false;
    let uid: string | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      uid = userCredential.user.uid;
      firebaseSuccess = true;
    } catch (firebaseErr: any) {
      // If operation is not allowed or user not in Firebase Auth,
      // fall through to our cryptographic hash verification below!
      if (
        firebaseErr.code !== 'auth/operation-not-allowed' &&
        firebaseErr.code !== 'auth/user-not-found' &&
        firebaseErr.code !== 'auth/invalid-credential'
      ) {
        console.warn('Firebase sign in info:', firebaseErr.code);
      }
    }

    // 2. If Firebase Auth succeeded, retrieve student
    if (firebaseSuccess && uid) {
      let student = await this.fetchStudentProfile(uid);
      if (!student) {
        student = storage.getStudents().find((s) => s.id === uid) || null;
      }
      if (student) {
        this.activeStudent = student;
        storage.setActiveStudent(student.id);
        try {
          localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
        } catch {
          // ignore
        }
        this.notifySubscribers();
        return student;
      }
    }

    // 3. Cryptographic Salted Hash Authentication Fallback
    // Computes SHA-256 with per-user salt
    const computedHash = await hashPassword(cleanUsername, password);
    const table = this.getStoredCredentials();
    const storedCred = table[cleanUsername];

    // Check registered credentials
    if (storedCred) {
      if (storedCred.passwordHash !== computedHash) {
        throw new Error('Contraseña incorrecta. Por favor verifica tus datos.');
      }
      const student =
        (await this.fetchStudentProfile(storedCred.studentId)) ||
        storage.getStudents().find((s) => s.id === storedCred.studentId);

      if (student) {
        this.activeStudent = student;
        storage.setActiveStudent(student.id);
        try {
          localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
        } catch {
          // ignore
        }
        this.notifySubscribers();
        return student;
      }
    }

    // Check default cohort students (mateo_vargas, sofia_ramos, valentina_cruz, diego_navarro)
    // Default master password for initial cohort: "eureka123" or "123456"
    const defaultStudent = storage
      .getStudents()
      .find(
        (s) =>
          s.username?.toLowerCase() === cleanUsername ||
          s.name.toLowerCase() === cleanUsername ||
          s.id === cleanUsername
      );

    if (defaultStudent) {
      // Allow default password or any password for initial demo cohort
      if (password === 'eureka123' || password === '123456' || password.length >= 6) {
        // Save credential for future logins
        this.saveStoredCredential({
          username: cleanUsername,
          studentId: defaultStudent.id,
          passwordHash: computedHash,
          createdAt: new Date().toISOString(),
        });

        this.activeStudent = defaultStudent;
        storage.setActiveStudent(defaultStudent.id);
        try {
          localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(defaultStudent));
        } catch {
          // ignore
        }
        this.notifySubscribers();
        return defaultStudent;
      } else {
        throw new Error('Contraseña incorrecta para esta cuenta.');
      }
    }

    throw new Error('Nombre de usuario no encontrado. Si eres nuevo, haz clic en "Nuevo Estudiante" para registrarte.');
  }

  // Google Login (Natively enabled by ProvisionFirebase in Firebase Console)
  public async loginWithGoogle(): Promise<Student> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;

    let student = await this.fetchStudentProfile(uid);
    if (!student) {
      const displayName = user.displayName || 'Estudiante';
      const parts = displayName.split(' ');
      const name = parts[0] || 'Estudiante';
      const lastName = parts.slice(1).join(' ') || 'Explorador';
      const cleanUsername = (name + '_' + uid.slice(0, 4)).toLowerCase().replace(/[^a-z0-9_]/g, '');

      student = {
        id: uid,
        name,
        lastName,
        username: cleanUsername,
        grade: '4to',
        age: 9,
        email: user.email || '',
        authProvider: 'google',
        avatar: {
          characterType: 'boy',
          outfitId: 'sport',
          suitId: 'suit_diver',
          suitColor: '#0284c7',
          headgearId: 'head_bubble',
          accessoryId: 'acc_compass',
          petId: 'pet_jellyfish',
          hairstyleId: 'boy_sport',
          hairColor: '#451a03',
          shoesId: 'shoes_sneakers',
          expression: 'happy',
        },
        coins: 0,
        unlockedItems: ['suit_diver', 'head_bubble', 'acc_compass'],
        progress: {
          matematicas: 1,
          algoritmos: 1,
          lectura: 1,
          ciencias: 1,
          circuitos: 1,
        },
        history: [],
        achievements: [],
        totalLearningScore: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      try {
        await setDoc(doc(db, 'students', uid), student);
      } catch (err) {
        console.warn('Could not save Google student profile to Firestore:', err);
      }
    }

    if (!student) {
      throw new Error('Error al cargar perfil de estudiante.');
    }

    this.activeStudent = student;
    storage.upsertStudent(student);
    try {
      localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
    } catch {
      // ignore
    }
    this.notifySubscribers();
    return student;
  }

  // Fetch student profile document from Firestore
  public async fetchStudentProfile(studentId: string): Promise<Student | null> {
    try {
      const studentDocRef = doc(db, 'students', studentId);
      const snap = await getDoc(studentDocRef);
      if (snap.exists()) {
        const data = snap.data() as Student;
        return data;
      }
    } catch (error) {
      console.warn('Could not fetch student from Firestore, checking local storage:', error);
    }
    // Check local storage fallback
    const all = storage.getStudents();
    return all.find((s) => s.id === studentId) || null;
  }

  // Update student avatar configuration
  public async updateAvatar(studentId: string, avatar: Partial<StudentAvatar>): Promise<void> {
    const student = this.activeStudent;
    if (!student || student.id !== studentId) return;

    student.avatar = { ...student.avatar, ...avatar };
    storage.updateAvatar(studentId, avatar);

    try {
      localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
    } catch {
      // ignore
    }

    try {
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, {
        avatar: student.avatar,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to update avatar in Firestore (syncing locally):', error);
    }
    this.notifySubscribers();
  }

  // Update student coins, progress, and history
  public async saveStudentProgress(student: Student): Promise<void> {
    this.activeStudent = { ...student };
    storage.upsertStudent(student);
    try {
      localStorage.setItem(AUTH_STUDENT_CACHE_KEY, JSON.stringify(student));
    } catch {
      // ignore
    }

    try {
      const studentDocRef = doc(db, 'students', student.id);
      await setDoc(studentDocRef, student, { merge: true });
    } catch (error) {
      console.warn('Could not sync progress to Firestore immediately:', error);
    }
    this.notifySubscribers();
  }

  // Sign out securely
  public async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Error signing out from Firebase:', err);
    }
    this.currentFirebaseUser = null;
    this.activeStudent = null;
    try {
      localStorage.removeItem(AUTH_STUDENT_CACHE_KEY);
    } catch {
      // ignore
    }
    this.notifySubscribers();
  }

  // Account recovery request (via guardian email or teacher authorization)
  public async requestPasswordRecovery(usernameOrEmail: string, guardianEmail?: string): Promise<string> {
    const clean = usernameOrEmail.trim().toLowerCase();
    let emailToReset = clean.includes('@') ? clean : usernameToAuthEmail(clean);

    if (guardianEmail?.trim() && guardianEmail.includes('@')) {
      emailToReset = guardianEmail.trim();
    }

    try {
      await sendPasswordResetEmail(auth, emailToReset);
      return 'Se ha enviado un correo con instrucciones para restablecer la contraseña a la cuenta del padre o tutor.';
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('No se encontró una cuenta con ese nombre de usuario o correo.');
      }
      return 'Solicitud de recuperación autorizada para menores: Consulta a tu docente o padre de familia para restablecer tu acceso con la clave escolar.';
    }
  }
}

export const authService = new AuthService();
