/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppUser,
  SchoolSection,
  SectionActivity,
  SectionMaterial,
  ActivitySubmission,
  AdminAuditLog,
  AcademicStatistics,
  UserRole,
  SchoolGrade,
  SubjectType,
} from '../types';
import { storage } from './storageService';
import { firestore } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const STORAGE_USERS = 'eurekalab_admin_users_v2';
const STORAGE_SECTIONS = 'eurekalab_admin_sections_v2';
const STORAGE_ACTIVITIES = 'eurekalab_admin_activities_v2';
const STORAGE_MATERIALS = 'eurekalab_admin_materials_v2';
const STORAGE_SUBMISSIONS = 'eurekalab_admin_submissions_v2';
const STORAGE_AUDIT = 'eurekalab_admin_audit_logs_v2';
const STORAGE_ACTIVE_USER = 'eurekalab_admin_active_session_v2';

class AdminService {
  private users: AppUser[] = [];
  private sections: SchoolSection[] = [];
  private activities: SectionActivity[] = [];
  private materials: SectionMaterial[] = [];
  private submissions: ActivitySubmission[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private currentUser: AppUser | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    this.loadFromStorage();
    this.syncWithStudentStorage();
    this.isInitialized = true;
  }

  // Sync existing student accounts from storageService into AppUser directory
  private syncWithStudentStorage() {
    const existingStudents = storage.getStudents();
    let updated = false;

    for (const std of existingStudents) {
      const found = this.users.find((u) => u.id === std.id);
      if (!found) {
        // Derive assigned section from grade or group
        const matchingSection = this.sections.find(
          (sec) => sec.grade === std.grade
        );
        const sectionIds = matchingSection ? [matchingSection.id] : [];

        this.users.push({
          id: std.id,
          name: std.name,
          lastName: std.lastName,
          email: std.email || `${std.name.toLowerCase()}.${std.lastName.toLowerCase().split(' ')[0]}@estudiante.eurekalab.edu`,
          role: 'student',
          sectionIds,
          status: 'active',
          createdAt: std.createdAt || new Date().toISOString(),
          grade: std.grade,
          avatarIcon: std.avatar?.petId === 'pet_turtle' ? '🐢' : std.avatar?.petId === 'pet_octopus' ? '🐙' : '🪼',
        });

        if (matchingSection && !matchingSection.studentIds.includes(std.id)) {
          matchingSection.studentIds.push(std.id);
        }
        updated = true;
      }
    }

    if (updated) {
      this.saveUsers();
      this.saveSections();
    }
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS);
      const storedSections = localStorage.getItem(STORAGE_SECTIONS);
      const storedActivities = localStorage.getItem(STORAGE_ACTIVITIES);
      const storedMaterials = localStorage.getItem(STORAGE_MATERIALS);
      const storedSubmissions = localStorage.getItem(STORAGE_SUBMISSIONS);
      const storedAudit = localStorage.getItem(STORAGE_AUDIT);
      const storedActive = localStorage.getItem(STORAGE_ACTIVE_USER);

      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.seedInitialUsers();
      }

      if (storedSections) {
        this.sections = JSON.parse(storedSections);
      } else {
        this.seedInitialSections();
      }

      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
      } else {
        this.seedInitialActivities();
      }

      if (storedMaterials) {
        this.materials = JSON.parse(storedMaterials);
      } else {
        this.seedInitialMaterials();
      }

      if (storedSubmissions) {
        this.submissions = JSON.parse(storedSubmissions);
      } else {
        this.seedInitialSubmissions();
      }

      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [
          {
            id: 'log_init',
            timestamp: new Date().toISOString(),
            actorId: 'usr_admin_1',
            actorName: 'Dra. Elena Vasquez',
            actorRole: 'admin',
            action: 'INICIALIZACION_SISTEMA',
            target: 'Plataforma EurekaLab',
            details: 'Configuración de roles pedagógicos y secciones iniciales.',
          },
        ];
        this.saveAudit();
      }

      if (storedActive) {
        const found = this.users.find((u) => u.id === storedActive);
        this.currentUser = found || this.users[0];
      } else {
        this.currentUser = this.users[0]; // Admin by default
      }
    } catch (e) {
      console.warn('Error reading admin storage, re-seeding:', e);
      this.seedInitialUsers();
      this.seedInitialSections();
      this.seedInitialActivities();
      this.seedInitialMaterials();
      this.seedInitialSubmissions();
    }
  }

  // Seeds default realistic educational data
  private seedInitialUsers() {
    this.users = [
      {
        id: 'usr_admin_1',
        name: 'Elena',
        lastName: 'Vásquez Directora',
        email: 'direccion@eurekalab.edu',
        role: 'admin',
        sectionIds: ['sec_4a', 'sec_4b', 'sec_5a', 'sec_6a'],
        status: 'active',
        createdAt: '2026-01-10T08:00:00Z',
        avatarIcon: '👑',
      },
      {
        id: 'usr_teach_1',
        name: 'Mariana',
        lastName: 'Gómez Morales',
        email: 'mariana.gomez@eurekalab.edu',
        role: 'teacher',
        sectionIds: ['sec_4a', 'sec_5a'],
        status: 'active',
        createdAt: '2026-01-15T09:30:00Z',
        avatarIcon: '👩‍🏫',
      },
      {
        id: 'usr_teach_2',
        name: 'Carlos',
        lastName: 'Mendoza Rivas',
        email: 'carlos.mendoza@eurekalab.edu',
        role: 'teacher',
        sectionIds: ['sec_4b', 'sec_6a'],
        status: 'active',
        createdAt: '2026-01-18T10:00:00Z',
        avatarIcon: '👨‍🏫',
      },
    ];
    this.saveUsers();
  }

  private seedInitialSections() {
    this.sections = [
      {
        id: 'sec_4a',
        name: '4to Grado A • Arrecife de Coral',
        description: 'Grupo matutino enfocado en fracciones y cadenas tróficas marinas.',
        icon: '🪸',
        grade: '4to',
        teacherId: 'usr_teach_1',
        teacherName: 'Profa. Mariana Gómez',
        studentIds: ['std_default_1', 'std_default_2', 'std_default_3'],
        activityIds: ['act_math_1', 'act_read_1', 'act_sci_1'],
        materialIds: ['mat_pdf_fracciones', 'mat_vid_algoritmos'],
        status: 'active',
        order: 1,
        createdAt: '2026-02-01T08:00:00Z',
      },
      {
        id: 'sec_4b',
        name: '4to Grado B • Naufragio Científico',
        description: 'Sección con énfasis en pensamiento computacional y algoritmos de cuadrícula.',
        icon: '🚢',
        grade: '4to',
        teacherId: 'usr_teach_2',
        teacherName: 'Prof. Carlos Mendoza',
        studentIds: ['std_default_4', 'std_default_5'],
        activityIds: ['act_code_1', 'act_circ_1'],
        materialIds: ['mat_pdf_algoritmos', 'mat_guia_ciencia'],
        status: 'active',
        order: 2,
        createdAt: '2026-02-01T08:30:00Z',
      },
      {
        id: 'sec_5a',
        name: '5to Grado A • Fosa Abisal Exploradora',
        description: 'Comprensión lectora inferencial e investigación de biomasa marina profunda.',
        icon: '🌊',
        grade: '5to',
        teacherId: 'usr_teach_1',
        teacherName: 'Profa. Mariana Gómez',
        studentIds: ['std_default_6'],
        activityIds: ['act_read_1', 'act_sci_1'],
        materialIds: ['mat_vid_ecosistemas'],
        status: 'active',
        order: 3,
        createdAt: '2026-02-02T09:00:00Z',
      },
      {
        id: 'sec_6a',
        name: '6to Grado A • Laboratorio Nautilus de Lógica',
        description: 'Compuertas lógicas booleanas y diseño de circuitos submarinos de alta presión.',
        icon: '🔬',
        grade: '6to',
        teacherId: 'usr_teach_2',
        teacherName: 'Prof. Carlos Mendoza',
        studentIds: [],
        activityIds: ['act_circ_1'],
        materialIds: ['mat_pdf_circuitos'],
        status: 'active',
        order: 4,
        createdAt: '2026-02-02T09:30:00Z',
      },
    ];
    this.saveSections();
  }

  private seedInitialActivities() {
    this.activities = [
      {
        id: 'act_math_1',
        sectionId: 'sec_4a',
        title: 'Balanza de Fracciones Equivalentes',
        description: 'Equilibrar gemas y porciones fraccionarias con sumas de distinto denominador.',
        instructions: 'Usa la balanza interactiva del laboratorio. Comprueba que 1/2 + 1/4 equivale exactamente a 3/4 antes de confirmar.',
        subject: 'matematicas',
        points: 100,
        publishDate: '2026-02-10',
        dueDate: '2026-03-30',
        attachments: [
          {
            id: 'att_1',
            name: 'Guia_Fracciones_Visuales.pdf',
            url: 'https://example.com/docs/guia-fracciones.pdf',
            type: 'pdf',
            sizeLabel: '1.2 MB',
          },
        ],
        status: 'active',
        createdBy: 'usr_teach_1',
        createdAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'act_code_1',
        sectionId: 'sec_4b',
        title: 'Algoritmos y Cuadrícula: Navegación del Submarino',
        description: 'Programar secuencias paso a paso evitando arrecifes y obstáculos.',
        instructions: 'Diseña una secuencia de bloques con menos de 10 instrucciones para llegar a la gema dorada y luego al portal final.',
        subject: 'algoritmos',
        points: 100,
        publishDate: '2026-02-12',
        dueDate: '2026-04-05',
        attachments: [
          {
            id: 'att_2',
            name: 'Manual_Bloques_Logicos.pdf',
            url: 'https://example.com/docs/manual-bloques.pdf',
            type: 'pdf',
            sizeLabel: '2.4 MB',
          },
        ],
        status: 'active',
        createdBy: 'usr_teach_2',
        createdAt: '2026-02-12T11:00:00Z',
      },
      {
        id: 'act_read_1',
        sectionId: 'sec_4a',
        title: 'Comprensión Crítica: La Fosa de las Marianas',
        description: 'Lectura de texto oceanográfico y análisis de preguntas inferenciales.',
        instructions: 'Lee con atención los tres párrafos científicos. Identifica las ideas principales y responde el cuestionario crítico.',
        subject: 'lectura',
        points: 100,
        publishDate: '2026-02-15',
        dueDate: '2026-04-10',
        attachments: [
          {
            id: 'att_3',
            name: 'Lectura_Profundidades_Oceanicas.pdf',
            url: 'https://example.com/docs/lectura-oceanica.pdf',
            type: 'pdf',
            sizeLabel: '950 KB',
          },
        ],
        status: 'active',
        createdBy: 'usr_teach_1',
        createdAt: '2026-02-15T09:00:00Z',
      },
      {
        id: 'act_sci_1',
        sectionId: 'sec_4a',
        title: 'Cadenas Tróficas y Flujo de Biomasa',
        description: 'Ubicar organismos productores, consumidores primarios y depredadores tope.',
        instructions: 'Arma la pirámide alimenticia marina asegurando que el fitoplancton sirva de base trófica equilibrada.',
        subject: 'ciencias',
        points: 100,
        publishDate: '2026-02-18',
        dueDate: '2026-04-15',
        attachments: [],
        status: 'active',
        createdBy: 'usr_teach_1',
        createdAt: '2026-02-18T14:00:00Z',
      },
      {
        id: 'act_circ_1',
        sectionId: 'sec_4b',
        title: 'Compuertas Lógicas AND y OR en Presurización',
        description: 'Diseñar el sistema de compuertas para activar las bombas de drenaje.',
        instructions: 'Completa la tabla de verdad y coloca las compuertas lógicas correspondientes para lograr la salida requerida.',
        subject: 'circuitos',
        points: 100,
        publishDate: '2026-02-20',
        dueDate: '2026-04-20',
        attachments: [],
        status: 'active',
        createdBy: 'usr_teach_2',
        createdAt: '2026-02-20T16:00:00Z',
      },
    ];
    this.saveActivities();
  }

  private seedInitialMaterials() {
    this.materials = [
      {
        id: 'mat_pdf_fracciones',
        sectionId: 'sec_4a',
        title: 'Guía Ilustrada: Fracciones en la Vida Cotidiana',
        description: 'Documento PDF con gráficos a color y ejemplos de fracciones equivalentes.',
        type: 'pdf',
        url: 'https://cdn.eurekalab.edu/docs/fracciones-ilustradas-v2.pdf',
        sizeLabel: '2.8 MB',
        status: 'published',
        uploadedBy: 'usr_teach_1',
        createdAt: '2026-02-05T10:00:00Z',
      },
      {
        id: 'mat_vid_algoritmos',
        sectionId: 'sec_4a',
        title: 'Video Clase: Pensamiento Computacional para Niños',
        description: 'Animación interactiva de 8 minutos explicando algoritmos paso a paso.',
        type: 'video',
        url: 'https://cdn.eurekalab.edu/videos/algoritmos-intro.mp4',
        sizeLabel: '18.4 MB',
        status: 'published',
        uploadedBy: 'usr_teach_1',
        createdAt: '2026-02-06T11:30:00Z',
      },
      {
        id: 'mat_pdf_algoritmos',
        sectionId: 'sec_4b',
        title: 'Ficha Práctica: Diagramas de Flujo Submarinos',
        description: 'Plantilla de ejercicios prácticos para trazar trayectorias en cuadrículas.',
        type: 'pdf',
        url: 'https://cdn.eurekalab.edu/docs/diagramas-flujo.pdf',
        sizeLabel: '1.5 MB',
        status: 'published',
        uploadedBy: 'usr_teach_2',
        createdAt: '2026-02-08T09:00:00Z',
      },
      {
        id: 'mat_guia_ciencia',
        sectionId: 'sec_4b',
        title: 'Infografía: Ecosistemas Abisales y Presión Marina',
        description: 'Póster de alta resolución con organismos bioluminiscentes.',
        type: 'image',
        url: 'https://cdn.eurekalab.edu/images/infografia-abisal.png',
        sizeLabel: '4.2 MB',
        status: 'published',
        uploadedBy: 'usr_teach_2',
        createdAt: '2026-02-09T14:20:00Z',
      },
      {
        id: 'mat_vid_ecosistemas',
        sectionId: 'sec_5a',
        title: 'Documental: Arrecifes de Coral y Cambio Climático',
        description: 'Grabación de investigación biológica y conservación.',
        type: 'video',
        url: 'https://cdn.eurekalab.edu/videos/arrecifes-conservacion.mp4',
        sizeLabel: '32.0 MB',
        status: 'published',
        uploadedBy: 'usr_teach_1',
        createdAt: '2026-02-11T12:00:00Z',
      },
      {
        id: 'mat_pdf_circuitos',
        sectionId: 'sec_6a',
        title: 'Manual de Compuertas Lógicas y Tablas de Verdad',
        description: 'Guía técnica para secundaria temprana y 6to de primaria.',
        type: 'pdf',
        url: 'https://cdn.eurekalab.edu/docs/compuertas-logicas.pdf',
        sizeLabel: '3.1 MB',
        status: 'published',
        uploadedBy: 'usr_teach_2',
        createdAt: '2026-02-14T15:00:00Z',
      },
    ];
    this.saveMaterials();
  }

  private seedInitialSubmissions() {
    this.submissions = [
      {
        id: 'sub_1',
        activityId: 'act_math_1',
        sectionId: 'sec_4a',
        studentId: 'std_default_1',
        studentName: 'Sofía Martínez',
        submissionDate: '2026-02-18T16:20:00Z',
        score: 95,
        feedback: '¡Excelente demostración conceptual! Comprendiste perfectamente el común denominador.',
        status: 'graded',
        answerText: 'Resolví la balanza colocando 2 piezas de 1/8 y 1 pieza de 1/4 para igualar la gema de 1/2.',
      },
      {
        id: 'sub_2',
        activityId: 'act_math_1',
        sectionId: 'sec_4a',
        studentId: 'std_default_2',
        studentName: 'Mateo González',
        submissionDate: '2026-02-19T10:15:00Z',
        score: 88,
        feedback: 'Buen trabajo Mateo. Recuerda revisar la simplificación de 4/8 a 1/2.',
        status: 'graded',
        answerText: 'Comprobé que 4 octavos equilibran exactamente medio litro en el platillo izquierdo.',
      },
      {
        id: 'sub_3',
        activityId: 'act_math_1',
        sectionId: 'sec_4a',
        studentId: 'std_default_3',
        studentName: 'Valentina López',
        submissionDate: '2026-02-21T18:40:00Z',
        status: 'submitted', // Pendiente de calificar
        answerText: 'Subí mi solución a la balanza utilizando 3 combinaciones diferentes.',
      },
      {
        id: 'sub_4',
        activityId: 'act_code_1',
        sectionId: 'sec_4b',
        studentId: 'std_default_4',
        studentName: 'Lucas Ramírez',
        submissionDate: '2026-02-22T14:10:00Z',
        score: 92,
        feedback: 'Ruta óptima completada sin colisiones contra arrecifes.',
        status: 'graded',
        answerText: 'AVANZAR 3, GIRAR_DERECHA, AVANZAR 2, RECOGER_GEMA, AVANZAR 1.',
      },
      {
        id: 'sub_5',
        activityId: 'act_code_1',
        sectionId: 'sec_4b',
        studentId: 'std_default_5',
        studentName: 'Emma Torres',
        submissionDate: '2026-02-23T11:05:00Z',
        status: 'submitted', // Pendiente de calificar
        answerText: 'Programé el bucle para recoger la gema antes de que se agote la energía.',
      },
    ];
    this.saveSubmissions();
  }

  // Persistence helpers
  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error(e);
    }
  }

  private saveSections() {
    try {
      localStorage.setItem(STORAGE_SECTIONS, JSON.stringify(this.sections));
    } catch (e) {
      console.error(e);
    }
  }

  private saveActivities() {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(this.activities));
    } catch (e) {
      console.error(e);
    }
  }

  private saveMaterials() {
    try {
      localStorage.setItem(STORAGE_MATERIALS, JSON.stringify(this.materials));
    } catch (e) {
      console.error(e);
    }
  }

  private saveSubmissions() {
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(this.submissions));
    } catch (e) {
      console.error(e);
    }
  }

  private saveAudit() {
    try {
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.error(e);
    }
  }

  // Asynchronous background firestore mirror
  private async mirrorToFirestore(collectionName: string, id: string, data: any) {
    try {
      if (!firestore) return;
      const ref = doc(firestore, collectionName, id);
      await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {
      // Graceful offline fallback
    }
  }

  private async deleteFromFirestore(collectionName: string, id: string) {
    try {
      if (!firestore) return;
      const ref = doc(firestore, collectionName, id);
      await deleteDoc(ref);
    } catch {
      // Graceful offline fallback
    }
  }

  // ==========================================
  // SESSION & RBAC METHODS
  // ==========================================
  public getCurrentUser(): AppUser {
    if (!this.currentUser) {
      this.currentUser = this.users[0] || {
        id: 'usr_admin_1',
        name: 'Administrador',
        lastName: 'General',
        email: 'admin@eurekalab.edu',
        role: 'admin',
        sectionIds: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }
    return this.currentUser;
  }

  public setCurrentUser(user: AppUser) {
    this.currentUser = user;
    localStorage.setItem(STORAGE_ACTIVE_USER, user.id);
  }

  public switchUser(userId: string): AppUser | null {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.setCurrentUser(user);
      this.logAction(
        'CAMBIO_USUARIO_ACTIVO',
        user.name,
        `Sesión activa cambiada al rol: ${user.role} (${user.email})`
      );
      return user;
    }
    return null;
  }

  public isSuperAdmin(): boolean {
    return this.getCurrentUser().role === 'admin';
  }

  public isTeacher(): boolean {
    return this.getCurrentUser().role === 'teacher';
  }

  // ==========================================
  // 1. OVERVIEW & STATISTICS
  // ==========================================
  public getAcademicStatistics(): AcademicStatistics {
    this.init();
    const students = this.users.filter((u) => u.role === 'student' && u.status === 'active');
    const teachers = this.users.filter((u) => u.role === 'teacher' && u.status === 'active');
    const activeSections = this.sections.filter((s) => s.status === 'active');
    const activeActivities = this.activities.filter((a) => a.status === 'active');

    // Pending activities count (submissions submitted but not graded yet)
    const pendingCount = this.submissions.filter((s) => s.status === 'submitted').length;

    // Overall grade average from graded submissions
    const graded = this.submissions.filter((s) => s.status === 'graded' && typeof s.score === 'number');
    const avg =
      graded.length > 0
        ? Math.round(graded.reduce((acc, curr) => acc + (curr.score || 0), 0) / graded.length)
        : 88;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalSections: activeSections.length,
      totalActivities: activeActivities.length,
      pendingActivitiesCount: pendingCount,
      overallGradeAverage: avg,
    };
  }

  // ==========================================
  // 2. AUDIT LOGS
  // ==========================================
  public logAction(action: string, target: string, details: string) {
    const actor = this.getCurrentUser();
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: `${actor.name} ${actor.lastName}`,
      actorRole: actor.role,
      action,
      target,
      details,
    };

    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
    this.saveAudit();
  }

  public getAuditLogs(): AdminAuditLog[] {
    return [...this.auditLogs];
  }

  // ==========================================
  // 3. USER MANAGEMENT
  // ==========================================
  public getUsers(filterRole?: UserRole | 'all', search?: string): AppUser[] {
    this.init();
    let result = [...this.users];

    // Role-based visibility:
    // Teachers can only see students and their own profile, not other teachers or admins
    const current = this.getCurrentUser();
    if (current.role === 'teacher') {
      result = result.filter(
        (u) => u.role === 'student' || u.id === current.id
      );
    }

    if (filterRole && filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public addUser(userData: {
    name: string;
    lastName: string;
    email: string;
    role: UserRole;
    sectionIds: string[];
    grade?: SchoolGrade;
    status?: 'active' | 'inactive';
  }): { success: boolean; user?: AppUser; error?: string } {
    // RBAC: Teachers cannot create other teachers or administrators
    const current = this.getCurrentUser();
    if (current.role === 'teacher' && userData.role !== 'student') {
      return {
        success: false,
        error: 'Los docentes solo tienen autorización para registrar estudiantes.',
      };
    }

    // Check duplicate email
    if (this.users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico.' };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: AppUser = {
      id: newId,
      name: userData.name.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      sectionIds: userData.sectionIds || [],
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      grade: userData.grade || '4to',
      avatarIcon: userData.role === 'student' ? '🎒' : userData.role === 'teacher' ? '👩‍🏫' : '👑',
    };

    this.users.push(newUser);
    this.saveUsers();
    this.mirrorToFirestore('app_users', newUser.id, newUser);

    // If role is student, register in student game storage so they can play immediately
    if (newUser.role === 'student') {
      storage.registerStudent({
        name: newUser.name,
        lastName: newUser.lastName,
        grade: newUser.grade || '4to',
        age: 9,
      });
    }

    // Assign to sections roster
    for (const secId of newUser.sectionIds) {
      const sec = this.sections.find((s) => s.id === secId);
      if (sec) {
        if (newUser.role === 'student' && !sec.studentIds.includes(newUser.id)) {
          sec.studentIds.push(newUser.id);
        }
      }
    }
    this.saveSections();

    this.logAction(
      'CREAR_USUARIO',
      `${newUser.name} ${newUser.lastName}`,
      `Nuevo usuario con rol ${newUser.role} registrado con correo ${newUser.email}`
    );

    return { success: true, user: newUser };
  }

  public updateUser(
    id: string,
    updates: Partial<Omit<AppUser, 'id' | 'createdAt'>>
  ): { success: boolean; error?: string } {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const targetUser = this.users[userIndex];
    const current = this.getCurrentUser();

    // RBAC: Teacher cannot edit Admin or other Teachers
    if (current.role === 'teacher' && targetUser.role !== 'student' && targetUser.id !== current.id) {
      return {
        success: false,
        error: 'No tienes permisos para modificar cuentas de docentes o administradores.',
      };
    }

    // If changing email, ensure no collision
    if (updates.email && updates.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      if (this.users.some((u) => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        return { success: false, error: 'El correo electrónico ya está en uso por otro usuario.' };
      }
    }

    // Apply updates
    const updatedUser = { ...targetUser, ...updates };
    this.users[userIndex] = updatedUser;
    this.saveUsers();
    this.mirrorToFirestore('app_users', id, updatedUser);

    this.logAction(
      'EDITAR_USUARIO',
      `${updatedUser.name} ${updatedUser.lastName}`,
      `Actualización de datos para el usuario ${updatedUser.email}`
    );

    return { success: true };
  }

  public deleteUser(id: string): { success: boolean; error?: string } {
    const targetUser = this.users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const current = this.getCurrentUser();
    // Cannot delete yourself
    if (current.id === id) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta en uso.' };
    }

    // Teacher cannot delete teachers or admins
    if (current.role === 'teacher' && targetUser.role !== 'student') {
      return {
        success: false,
        error: 'Los docentes solo pueden eliminar cuentas de estudiantes autorizados.',
      };
    }

    // Remove from sections
    this.sections.forEach((sec) => {
      sec.studentIds = sec.studentIds.filter((sid) => sid !== id);
      if (sec.teacherId === id) {
        sec.teacherId = '';
        sec.teacherName = 'Sin docente asignado';
      }
    });
    this.saveSections();

    // Remove user
    this.users = this.users.filter((u) => u.id !== id);
    this.saveUsers();
    this.deleteFromFirestore('app_users', id);

    this.logAction(
      'ELIMINAR_USUARIO',
      `${targetUser.name} ${targetUser.lastName}`,
      `Cuenta de ${targetUser.role} (${targetUser.email}) eliminada definitivamente`
    );

    return { success: true };
  }

  public toggleUserStatus(id: string): { success: boolean; newStatus?: 'active' | 'inactive'; error?: string } {
    const user = this.users.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    const current = this.getCurrentUser();
    if (current.role === 'teacher' && user.role !== 'student') {
      return { success: false, error: 'No tienes permisos para modificar el estado de este usuario.' };
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    this.saveUsers();
    this.mirrorToFirestore('app_users', id, user);

    this.logAction(
      'CAMBIO_ESTADO_USUARIO',
      `${user.name} ${user.lastName}`,
      `Estado cambiado a: ${user.status.toUpperCase()}`
    );

    return { success: true, newStatus: user.status };
  }

  // ==========================================
  // 4. SECTIONS MANAGEMENT
  // ==========================================
  public getSections(): SchoolSection[] {
    this.init();
    const current = this.getCurrentUser();
    let list = [...this.sections].sort((a, b) => a.order - b.order);

    // If teacher, show their assigned sections first or filter if needed
    if (current.role === 'teacher') {
      // Return their assigned sections or all active
      return list.filter((s) => s.teacherId === current.id || current.sectionIds.includes(s.id));
    }

    return list;
  }

  public getAllSectionsForAdmin(): SchoolSection[] {
    this.init();
    return [...this.sections].sort((a, b) => a.order - b.order);
  }

  public addSection(sectionData: {
    name: string;
    description: string;
    icon: string;
    grade: SchoolGrade;
    teacherId: string;
    status?: 'active' | 'inactive';
  }): { success: boolean; section?: SchoolSection; error?: string } {
    const teacher = this.users.find((u) => u.id === sectionData.teacherId);
    const newId = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newSection: SchoolSection = {
      id: newId,
      name: sectionData.name.trim(),
      description: sectionData.description.trim(),
      icon: sectionData.icon || '🌊',
      grade: sectionData.grade,
      teacherId: sectionData.teacherId,
      teacherName: teacher ? `${teacher.name} ${teacher.lastName}` : 'Docente Asignado',
      studentIds: [],
      activityIds: [],
      materialIds: [],
      status: sectionData.status || 'active',
      order: this.sections.length + 1,
      createdAt: new Date().toISOString(),
    };

    this.sections.push(newSection);
    this.saveSections();
    this.mirrorToFirestore('school_sections', newSection.id, newSection);

    // Link section to teacher
    if (teacher && !teacher.sectionIds.includes(newId)) {
      teacher.sectionIds.push(newId);
      this.saveUsers();
    }

    this.logAction(
      'CREAR_SECCION',
      newSection.name,
      `Sección creada para grado ${newSection.grade} a cargo de ${newSection.teacherName}`
    );

    return { success: true, section: newSection };
  }

  public updateSection(
    id: string,
    updates: Partial<Omit<SchoolSection, 'id' | 'createdAt'>>
  ): { success: boolean; error?: string } {
    const sec = this.sections.find((s) => s.id === id);
    if (!sec) return { success: false, error: 'Sección no encontrada.' };

    if (updates.teacherId && updates.teacherId !== sec.teacherId) {
      const teacher = this.users.find((u) => u.id === updates.teacherId);
      if (teacher) {
        updates.teacherName = `${teacher.name} ${teacher.lastName}`;
        if (!teacher.sectionIds.includes(id)) {
          teacher.sectionIds.push(id);
          this.saveUsers();
        }
      }
    }

    Object.assign(sec, updates);
    this.saveSections();
    this.mirrorToFirestore('school_sections', id, sec);

    this.logAction('EDITAR_SECCION', sec.name, 'Información de la sección actualizada');
    return { success: true };
  }

  public deleteSection(id: string): {
    success: boolean;
    error?: string;
    warningDetails?: { students: number; activities: number; materials: number };
  } {
    const sec = this.sections.find((s) => s.id === id);
    if (!sec) return { success: false, error: 'Sección no encontrada.' };

    const studentCount = sec.studentIds.length;
    const activityCount = this.activities.filter((a) => a.sectionId === id).length;
    const materialCount = this.materials.filter((m) => m.sectionId === id).length;

    // Remove section
    this.sections = this.sections.filter((s) => s.id !== id);
    this.saveSections();
    this.deleteFromFirestore('school_sections', id);

    // Unlink from users
    this.users.forEach((u) => {
      u.sectionIds = u.sectionIds.filter((sid) => sid !== id);
    });
    this.saveUsers();

    this.logAction(
      'ELIMINAR_SECCION',
      sec.name,
      `Sección eliminada con ${studentCount} estudiantes desvinculados, ${activityCount} actividades y ${materialCount} materiales`
    );

    return {
      success: true,
      warningDetails: { students: studentCount, activities: activityCount, materials: materialCount },
    };
  }

  public reorderSection(id: string, direction: 'up' | 'down') {
    const sorted = [...this.sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const cur = sorted[index];
      const tempOrder = prev.order;
      prev.order = cur.order;
      cur.order = tempOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const cur = sorted[index];
      const tempOrder = next.order;
      next.order = cur.order;
      cur.order = tempOrder;
    }

    this.sections = sorted;
    this.saveSections();
  }

  public toggleSectionStatus(id: string): { success: boolean; newStatus?: 'active' | 'inactive'; error?: string } {
    const sec = this.sections.find((s) => s.id === id);
    if (!sec) return { success: false, error: 'Sección no encontrada.' };

    sec.status = sec.status === 'active' ? 'inactive' : 'active';
    this.saveSections();
    this.mirrorToFirestore('school_sections', id, sec);

    this.logAction(
      'CAMBIO_ESTADO_SECCION',
      sec.name,
      `Estado de sección cambiado a: ${sec.status.toUpperCase()}`
    );

    return { success: true, newStatus: sec.status };
  }

  // ==========================================
  // 5. STUDENT ASSIGNMENT TO SECTIONS
  // ==========================================
  public assignStudentsToSection(sectionId: string, studentIds: string[]): { success: boolean; assignedCount: number } {
    const sec = this.sections.find((s) => s.id === sectionId);
    if (!sec) return { success: false, assignedCount: 0 };

    let count = 0;
    for (const sid of studentIds) {
      if (!sec.studentIds.includes(sid)) {
        sec.studentIds.push(sid);
        count++;
      }
      const user = this.users.find((u) => u.id === sid);
      if (user && !user.sectionIds.includes(sectionId)) {
        user.sectionIds.push(sectionId);
      }
    }

    this.saveSections();
    this.saveUsers();

    this.logAction(
      'ASIGNAR_ESTUDIANTES',
      sec.name,
      `Se asignaron ${count} estudiantes a la sección ${sec.name}`
    );

    return { success: true, assignedCount: count };
  }

  public removeStudentFromSection(sectionId: string, studentId: string): boolean {
    const sec = this.sections.find((s) => s.id === sectionId);
    if (!sec) return false;

    sec.studentIds = sec.studentIds.filter((sid) => sid !== studentId);
    const user = this.users.find((u) => u.id === studentId);
    if (user) {
      user.sectionIds = user.sectionIds.filter((sid) => sid !== sectionId);
    }

    this.saveSections();
    this.saveUsers();

    this.logAction(
      'RETIRAR_ESTUDIANTE',
      sec.name,
      `Estudiante retirado de la sección ${sec.name}`
    );

    return true;
  }

  public transferStudent(studentId: string, fromSectionId: string, toSectionId: string): boolean {
    this.removeStudentFromSection(fromSectionId, studentId);
    this.assignStudentsToSection(toSectionId, [studentId]);

    const student = this.users.find((u) => u.id === studentId);
    const toSec = this.sections.find((s) => s.id === toSectionId);

    this.logAction(
      'TRASLADAR_ESTUDIANTE',
      student ? `${student.name} ${student.lastName}` : studentId,
      `Trasladado a la sección ${toSec?.name || toSectionId}`
    );

    return true;
  }

  public getStudentsForSection(sectionId: string): AppUser[] {
    const sec = this.sections.find((s) => s.id === sectionId);
    if (!sec) return [];
    return this.users.filter((u) => sec.studentIds.includes(u.id));
  }

  public getUnassignedStudents(): AppUser[] {
    return this.users.filter((u) => u.role === 'student' && (!u.sectionIds || u.sectionIds.length === 0));
  }

  // Student portal filter: gets only sections assigned to this student
  public getSectionsForStudent(studentId: string): SchoolSection[] {
    this.init();
    return this.sections.filter(
      (s) => s.status === 'active' && s.studentIds.includes(studentId)
    );
  }

  // ==========================================
  // 6. ACTIVITIES MANAGEMENT
  // ==========================================
  public getActivities(sectionId?: string): SectionActivity[] {
    this.init();
    let list = [...this.activities];

    if (sectionId && sectionId !== 'all') {
      list = list.filter((a) => a.sectionId === sectionId);
    }

    // RBAC: Teachers view activities in their sections
    const current = this.getCurrentUser();
    if (current.role === 'teacher') {
      const allowedSecIds = this.getSections().map((s) => s.id);
      list = list.filter((a) => allowedSecIds.includes(a.sectionId));
    }

    return list;
  }

  public addActivity(actData: Omit<SectionActivity, 'id' | 'createdAt' | 'createdBy'>): {
    success: boolean;
    activity?: SectionActivity;
    error?: string;
  } {
    const current = this.getCurrentUser();
    const newId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newActivity: SectionActivity = {
      id: newId,
      sectionId: actData.sectionId,
      title: actData.title.trim(),
      description: actData.description.trim(),
      instructions: actData.instructions.trim(),
      subject: actData.subject,
      points: actData.points || 100,
      publishDate: actData.publishDate,
      dueDate: actData.dueDate,
      attachments: actData.attachments || [],
      status: actData.status || 'active',
      createdBy: current.id,
      createdAt: new Date().toISOString(),
    };

    this.activities.unshift(newActivity);
    this.saveActivities();
    this.mirrorToFirestore('school_activities', newId, newActivity);

    // Link to section
    const sec = this.sections.find((s) => s.id === actData.sectionId);
    if (sec && !sec.activityIds.includes(newId)) {
      sec.activityIds.push(newId);
      this.saveSections();
    }

    this.logAction(
      'CREAR_ACTIVIDAD',
      newActivity.title,
      `Actividad pedagógica asignada a ${sec?.name || actData.sectionId} (${newActivity.points} pts)`
    );

    return { success: true, activity: newActivity };
  }

  public updateActivity(
    id: string,
    updates: Partial<Omit<SectionActivity, 'id' | 'createdAt' | 'createdBy'>>
  ): { success: boolean; error?: string } {
    const act = this.activities.find((a) => a.id === id);
    if (!act) return { success: false, error: 'Actividad no encontrada.' };

    Object.assign(act, updates);
    this.saveActivities();
    this.mirrorToFirestore('school_activities', id, act);

    this.logAction('EDITAR_ACTIVIDAD', act.title, 'Parámetros o instrucciones de la actividad actualizados');
    return { success: true };
  }

  public deleteActivity(id: string): { success: boolean; error?: string } {
    const act = this.activities.find((a) => a.id === id);
    if (!act) return { success: false, error: 'Actividad no encontrada.' };

    this.activities = this.activities.filter((a) => a.id !== id);
    this.submissions = this.submissions.filter((s) => s.activityId !== id);
    this.saveActivities();
    this.saveSubmissions();
    this.deleteFromFirestore('school_activities', id);

    this.logAction('ELIMINAR_ACTIVIDAD', act.title, 'Actividad eliminada junto con sus entregas asociadas');
    return { success: true };
  }

  public toggleActivityStatus(id: string): { success: boolean; newStatus?: 'active' | 'inactive'; error?: string } {
    const act = this.activities.find((a) => a.id === id);
    if (!act) return { success: false, error: 'Actividad no encontrada.' };

    act.status = act.status === 'active' ? 'inactive' : 'active';
    this.saveActivities();
    this.mirrorToFirestore('school_activities', id, act);

    this.logAction(
      'CAMBIO_ESTADO_ACTIVIDAD',
      act.title,
      `Actividad ${act.status === 'active' ? 'Publicada/Activada' : 'Desactivada'}`
    );

    return { success: true, newStatus: act.status };
  }

  // ==========================================
  // 7. MATERIALS MANAGEMENT
  // ==========================================
  public getMaterials(sectionId?: string): SectionMaterial[] {
    this.init();
    let list = [...this.materials];

    if (sectionId && sectionId !== 'all') {
      list = list.filter((m) => m.sectionId === sectionId);
    }

    const current = this.getCurrentUser();
    if (current.role === 'teacher') {
      const allowedSecIds = this.getSections().map((s) => s.id);
      list = list.filter((m) => allowedSecIds.includes(m.sectionId));
    }

    return list;
  }

  public addMaterial(matData: Omit<SectionMaterial, 'id' | 'createdAt' | 'uploadedBy'>): {
    success: boolean;
    material?: SectionMaterial;
    error?: string;
  } {
    const current = this.getCurrentUser();
    const newId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newMaterial: SectionMaterial = {
      id: newId,
      sectionId: matData.sectionId,
      title: matData.title.trim(),
      description: matData.description.trim(),
      type: matData.type,
      url: matData.url.trim(),
      sizeLabel: matData.sizeLabel || '1.0 MB',
      status: matData.status || 'published',
      uploadedBy: current.id,
      createdAt: new Date().toISOString(),
    };

    this.materials.unshift(newMaterial);
    this.saveMaterials();
    this.mirrorToFirestore('school_materials', newId, newMaterial);

    const sec = this.sections.find((s) => s.id === matData.sectionId);
    if (sec && !sec.materialIds.includes(newId)) {
      sec.materialIds.push(newId);
      this.saveSections();
    }

    this.logAction(
      'SUBIR_MATERIAL',
      newMaterial.title,
      `Material pedagógico (${newMaterial.type.toUpperCase()}) añadido a ${sec?.name || matData.sectionId}`
    );

    return { success: true, material: newMaterial };
  }

  public updateMaterial(
    id: string,
    updates: Partial<Omit<SectionMaterial, 'id' | 'createdAt' | 'uploadedBy'>>
  ): { success: boolean; error?: string } {
    const mat = this.materials.find((m) => m.id === id);
    if (!mat) return { success: false, error: 'Material no encontrado.' };

    Object.assign(mat, updates);
    this.saveMaterials();
    this.mirrorToFirestore('school_materials', id, mat);

    this.logAction('EDITAR_MATERIAL', mat.title, 'Descripción o enlace del material modificado');
    return { success: true };
  }

  public deleteMaterial(id: string): { success: boolean; error?: string } {
    const mat = this.materials.find((m) => m.id === id);
    if (!mat) return { success: false, error: 'Material no encontrado.' };

    this.materials = this.materials.filter((m) => m.id !== id);
    this.saveMaterials();
    this.deleteFromFirestore('school_materials', id);

    this.logAction('ELIMINAR_MATERIAL', mat.title, 'Archivo/recurso retirado del repositorio');
    return { success: true };
  }

  public toggleMaterialStatus(id: string): { success: boolean; newStatus?: 'published' | 'draft'; error?: string } {
    const mat = this.materials.find((m) => m.id === id);
    if (!mat) return { success: false, error: 'Material no encontrado.' };

    mat.status = mat.status === 'published' ? 'draft' : 'published';
    this.saveMaterials();
    this.mirrorToFirestore('school_materials', id, mat);

    this.logAction(
      'CAMBIO_ESTADO_MATERIAL',
      mat.title,
      `Visibilidad cambiada a: ${mat.status === 'published' ? 'Publicado' : 'Borrador'}`
    );

    return { success: true, newStatus: mat.status };
  }

  // ==========================================
  // 8. SUBMISSIONS & GRADES
  // ==========================================
  public getSubmissions(activityId?: string): ActivitySubmission[] {
    this.init();
    if (activityId) {
      return this.submissions.filter((s) => s.activityId === activityId);
    }
    return [...this.submissions];
  }

  public gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string
  ): { success: boolean; error?: string } {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: 'Entrega no encontrada.' };

    sub.score = Math.max(0, Math.min(100, score));
    sub.feedback = feedback.trim();
    sub.status = 'graded';

    this.saveSubmissions();
    this.mirrorToFirestore('activity_submissions', submissionId, sub);

    // Update real learning score of student if applicable
    const student = storage.getStudentById(sub.studentId);
    if (student) {
      student.totalLearningScore = Math.min(
        100,
        Math.round((student.totalLearningScore * 3 + sub.score) / 4)
      );
      storage.upsertStudent(student);
    }

    this.logAction(
      'CALIFICAR_ACTIVIDAD',
      sub.studentName,
      `Calificación registrada: ${sub.score}/100 con observación personalizada`
    );

    return { success: true };
  }

  public submitActivityByStudent(data: {
    activityId: string;
    studentId: string;
    studentName: string;
    sectionId: string;
    answerText: string;
    attachmentUrl?: string;
  }): ActivitySubmission {
    const existing = this.submissions.find(
      (s) => s.activityId === data.activityId && s.studentId === data.studentId
    );

    if (existing) {
      existing.submissionDate = new Date().toISOString();
      existing.answerText = data.answerText;
      existing.attachmentUrl = data.attachmentUrl;
      existing.status = 'submitted';
      this.saveSubmissions();
      return existing;
    }

    const newSub: ActivitySubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activityId: data.activityId,
      sectionId: data.sectionId,
      studentId: data.studentId,
      studentName: data.studentName,
      submissionDate: new Date().toISOString(),
      status: 'submitted',
      answerText: data.answerText,
      attachmentUrl: data.attachmentUrl,
    };

    this.submissions.push(newSub);
    this.saveSubmissions();
    this.mirrorToFirestore('activity_submissions', newSub.id, newSub);

    return newSub;
  }

  // ==========================================
  // 9. EXPORT & REPORTING
  // ==========================================
  public exportGradesCSV(sectionId?: string): string {
    const students = sectionId ? this.getStudentsForSection(sectionId) : this.users.filter((u) => u.role === 'student');
    const activities = this.getActivities(sectionId);

    const headers = [
      'ID_Alumno',
      'Nombre',
      'Apellidos',
      'Correo',
      'Grado',
      ...activities.map((a) => `"${a.title} (${a.subject})"`),
      'Promedio_Calificaciones',
      'Entregas_Pendientes',
      'Estado',
    ];

    const rows = students.map((std) => {
      let totalScore = 0;
      let gradedCount = 0;
      let pendingCount = 0;

      const actScores = activities.map((act) => {
        const sub = this.submissions.find(
          (s) => s.activityId === act.id && s.studentId === std.id
        );
        if (!sub) return 'Sin entregar';
        if (sub.status === 'graded') {
          totalScore += sub.score || 0;
          gradedCount++;
          return sub.score;
        }
        pendingCount++;
        return 'Pendiente';
      });

      const avg = gradedCount > 0 ? (totalScore / gradedCount).toFixed(1) : 'S/C';

      return [
        std.id,
        `"${std.name}"`,
        `"${std.lastName}"`,
        std.email,
        std.grade || 'N/A',
        ...actScores,
        avg,
        pendingCount,
        std.status,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // ==========================================
  // 10. COMPREHENSIVE ANALYTICS FOR DASHBOARDS
  // ==========================================
  public getDetailedAnalytics(options?: {
    period?: 'week' | 'month' | 'term' | 'year';
    sectionId?: string;
    studentId?: string;
  }) {
    this.init();
    const period = options?.period || 'term';
    const sectionFilter = options?.sectionId && options.sectionId !== 'all' ? options.sectionId : null;
    const studentFilter = options?.studentId && options.studentId !== 'all' ? options.studentId : null;

    // Filter students
    let students = this.users.filter((u) => u.role === 'student');
    if (sectionFilter) {
      students = students.filter((s) => s.sectionIds.includes(sectionFilter));
    }
    if (studentFilter) {
      students = students.filter((s) => s.id === studentFilter);
    }

    const teachers = this.users.filter((u) => u.role === 'teacher');
    const admins = this.users.filter((u) => u.role === 'admin');
    const sections = sectionFilter
      ? this.sections.filter((s) => s.id === sectionFilter)
      : this.sections;
    const activities = sectionFilter
      ? this.activities.filter((a) => a.sectionId === sectionFilter)
      : this.activities;

    // Submissions relevant to current filters
    let submissions = [...this.submissions];
    if (sectionFilter) {
      submissions = submissions.filter((s) => s.sectionId === sectionFilter);
    }
    if (studentFilter) {
      submissions = submissions.filter((s) => s.studentId === studentFilter);
    }

    const completedSubs = submissions.filter((s) => s.status === 'graded');
    const pendingSubs = submissions.filter((s) => s.status === 'submitted');

    // Overall grade calculation
    const gradedWithScores = completedSubs.filter((s) => typeof s.score === 'number');
    const overallAvg =
      gradedWithScores.length > 0
        ? Math.round(gradedWithScores.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedWithScores.length)
        : 88;

    // Student performance list
    const studentPerformance = students.map((std) => {
      const stdSubs = this.submissions.filter((s) => s.studentId === std.id);
      const stdGraded = stdSubs.filter((s) => s.status === 'graded' && typeof s.score === 'number');
      const stdPending = stdSubs.filter((s) => s.status === 'submitted');

      // Real game learning score from storage
      const gameStudent = storage.getStudentById(std.id);
      const realLearning = gameStudent?.totalLearningScore || 85;

      const avgScore =
        stdGraded.length > 0
          ? Math.round(stdGraded.reduce((acc, s) => acc + (s.score || 0), 0) / stdGraded.length)
          : realLearning;

      return {
        id: std.id,
        name: std.name,
        lastName: std.lastName,
        fullName: `${std.name} ${std.lastName}`,
        email: std.email,
        grade: std.grade || '4to',
        avatarIcon: std.avatarIcon || '🎒',
        averageGrade: avgScore,
        realLearningScore: realLearning,
        activitiesCompleted: stdGraded.length,
        activitiesPending: stdPending.length,
        status: std.status,
      };
    }).sort((a, b) => b.averageGrade - a.averageGrade);

    // Section metrics and subject breakdown
    const sectionAverages = this.sections.map((sec) => {
      const secStudents = this.users.filter((u) => sec.studentIds.includes(u.id));
      const secSubs = this.submissions.filter((s) => s.sectionId === sec.id);
      const secGraded = secSubs.filter((s) => s.status === 'graded' && typeof s.score === 'number');
      const secPending = secSubs.filter((s) => s.status === 'submitted');

      const avgGrade =
        secGraded.length > 0
          ? Math.round(secGraded.reduce((acc, s) => acc + (s.score || 0), 0) / secGraded.length)
          : 86;

      const totalPossible = (sec.studentIds.length || 1) * (sec.activityIds.length || 1);
      const completionRate = Math.min(100, Math.round(((secGraded.length + secPending.length) / totalPossible) * 100)) || 75;

      // Calculate subject mastery for this section
      const getSubjectScore = (sub: SubjectType, baseFallback: number) => {
        const subActs = this.activities.filter((a) => a.sectionId === sec.id && a.subject === sub);
        const actIds = subActs.map((a) => a.id);
        const subGraded = secSubs.filter((s) => actIds.includes(s.activityId) && s.status === 'graded');
        if (subGraded.length > 0) {
          return Math.round(subGraded.reduce((acc, s) => acc + (s.score || 0), 0) / subGraded.length);
        }
        return baseFallback;
      };

      return {
        sectionId: sec.id,
        sectionName: sec.name,
        icon: sec.icon,
        grade: sec.grade,
        teacherName: sec.teacherName,
        studentCount: sec.studentIds.length,
        averageGrade: avgGrade,
        completionRate: completionRate,
        subjectMastery: {
          matematicas: getSubjectScore('matematicas', avgGrade + 2),
          algoritmos: getSubjectScore('algoritmos', avgGrade - 3),
          lectura: getSubjectScore('lectura', avgGrade + 4),
          ciencias: getSubjectScore('ciencias', avgGrade + 1),
          circuitos: getSubjectScore('circuitos', avgGrade - 4),
        },
      };
    });

    // Role distribution
    const roleDistribution = [
      {
        id: 'student',
        label: 'Estudiantes',
        value: this.users.filter((u) => u.role === 'student').length,
        color: '#6366f1',
      },
      {
        id: 'teacher',
        label: 'Profesores',
        value: this.users.filter((u) => u.role === 'teacher').length,
        color: '#0284c7',
      },
      {
        id: 'admin',
        label: 'Administradores',
        value: this.users.filter((u) => u.role === 'admin').length,
        color: '#f59e0b',
      },
    ];

    // Activity usage ranking
    const activityUsageRanking = this.activities.map((act) => {
      const actSubs = this.submissions.filter((s) => s.activityId === act.id);
      const graded = actSubs.filter((s) => s.status === 'graded');
      const pending = actSubs.filter((s) => s.status === 'submitted');
      const avg =
        graded.length > 0
          ? Math.round(graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.length)
          : 90;

      return {
        id: act.id,
        title: act.title,
        subject: act.subject,
        dueDate: act.dueDate,
        totalSubmissions: actSubs.length,
        gradedCount: graded.length,
        pendingCount: pending.length,
        averageScore: avg,
        points: act.points,
      };
    }).sort((a, b) => b.totalSubmissions - a.totalSubmissions);

    // Section participation ranking (percentage of students who submitted at least 1 activity)
    const sectionParticipationRanking = this.sections.map((sec) => {
      const assignedCount = sec.studentIds.length;
      if (assignedCount === 0) {
        return {
          id: sec.id,
          label: sec.name,
          icon: sec.icon,
          value: 0,
          studentCount: 0,
          badge: 'Sin alumnos',
        };
      }

      const activeStudentsInSec = sec.studentIds.filter((sid) =>
        this.submissions.some((sub) => sub.sectionId === sec.id && sub.studentId === sid)
      );

      const participationPct = Math.round((activeStudentsInSec.length / assignedCount) * 100);

      return {
        id: sec.id,
        label: sec.name,
        sublabel: `Docente: ${sec.teacherName}`,
        icon: sec.icon,
        value: participationPct,
        studentCount: assignedCount,
        badge: `${activeStudentsInSec.length}/${assignedCount} activos`,
      };
    }).sort((a, b) => b.value - a.value);

    // Students needing attention (pending submissions or average < 75)
    const studentsNeedingAttention = studentPerformance.filter(
      (s) => s.activitiesPending > 0 || s.averageGrade < 75
    );

    // Timeline Evolution (Weekly & Monthly)
    const evolutionWeekly = [
      { date: 'Sem 1', label: 'Sem 1', values: { rendimiento: 78, retencion: 74, entregas: 3 } },
      { date: 'Sem 2', label: 'Sem 2', values: { rendimiento: 81, retencion: 79, entregas: 5 } },
      { date: 'Sem 3', label: 'Sem 3', values: { rendimiento: 84, retencion: 82, entregas: 8 } },
      { date: 'Sem 4', label: 'Sem 4', values: { rendimiento: 86, retencion: 85, entregas: 12 } },
      { date: 'Sem 5', label: 'Sem 5', values: { rendimiento: 89, retencion: 87, entregas: 16 } },
      { date: 'Sem 6 (Actual)', label: 'Sem 6', values: { rendimiento: overallAvg, retencion: 90, entregas: completedSubs.length + pendingSubs.length } },
    ];

    const evolutionMonthly = [
      { date: 'Enero', label: 'Ene', values: { rendimiento: 76, retencion: 72, entregas: 4 } },
      { date: 'Febrero', label: 'Feb', values: { rendimiento: 83, retencion: 80, entregas: 14 } },
      { date: 'Marzo (Actual)', label: 'Mar', values: { rendimiento: overallAvg, retencion: 88, entregas: completedSubs.length + pendingSubs.length } },
    ];

    // User growth timeline
    const userGrowthTimeline = [
      { date: '10 Ene', label: '10 Ene', values: { estudiantes: 1, profesores: 1, total: 2 } },
      { date: '20 Ene', label: '20 Ene', values: { estudiantes: 2, profesores: 2, total: 4 } },
      { date: '01 Feb', label: '01 Feb', values: { estudiantes: 4, profesores: 2, total: 6 } },
      { date: '15 Feb', label: '15 Feb', values: { estudiantes: 5, profesores: 2, total: 7 } },
      { date: 'Actual', label: 'Hoy', values: { estudiantes: students.length, profesores: teachers.length, total: this.users.length } },
    ];

    return {
      kpiCards: {
        totalStudents: {
          value: students.length,
          trend: { value: 6.8, isPositive: true, label: 'vs periodo anterior' },
          description: 'Alumnos activos matriculados',
        },
        totalTeachers: {
          value: teachers.length,
          trend: { value: 0.0, isPositive: true, label: 'Plantel docente completo' },
          description: 'Profesores y tutores',
        },
        activeSections: {
          value: sections.filter((s) => s.status === 'active').length,
          trend: { value: 12.5, isPositive: true, label: '3ro a 6to de Primaria' },
          description: 'Aulas virtuales activas',
        },
        completedActivities: {
          value: completedSubs.length,
          trend: { value: 18.4, isPositive: true, label: '+18% entregas aprobadas' },
          description: 'Actividades corregidas',
        },
        pendingActivities: {
          value: pendingSubs.length,
          trend: { value: -12.5, isPositive: true, label: 'Por calificar y retroalimentar' },
          description: 'Pendientes de revisión',
        },
        overallAverage: {
          value: overallAvg,
          trend: { value: 3.5, isPositive: true, label: 'Escala 0-100 pts' },
          description: 'Promedio general del alumnado',
        },
      },
      studentPerformance,
      sectionAverages,
      roleDistribution,
      activityUsageRanking,
      sectionParticipationRanking,
      studentsNeedingAttention,
      evolutionWeekly,
      evolutionMonthly,
      userGrowthTimeline,
      completedSubsCount: completedSubs.length,
      pendingSubsCount: pendingSubs.length,
      overallAverage: overallAvg,
    };
  }
}

export const adminService = new AdminService();
