import { Student, SchoolGrade, SubjectType, WardrobeItem, Achievement, AudioPreferences } from '../types';
import { audio } from './audioService';

const STORAGE_KEY_STUDENTS = 'eurekalab_students_db_v2';
const STORAGE_KEY_CURRENT_USER = 'eurekalab_active_user_id';
const STORAGE_KEY_TEACHER_PIN = 'eurekalab_teacher_pin';

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  // Suits
  {
    id: 'suit_diver',
    type: 'suit',
    name: 'Traje de Buzo Clásico',
    price: 0,
    color: '#0284c7',
    icon: '🤿',
    description: 'Resistente a la presión con neopreno térmico.',
  },
  {
    id: 'suit_astronaut',
    type: 'suit',
    name: 'Escafandra Cósmica',
    price: 50,
    color: '#ec4899',
    icon: '🚀',
    description: 'Permite explorar zonas abisales con gravedad cero.',
  },
  {
    id: 'suit_scientist',
    type: 'suit',
    name: 'Bata de Biólogo Marino',
    price: 80,
    color: '#10b981',
    icon: '🔬',
    description: 'Equipada con sensores de salinidad y pH.',
  },
  {
    id: 'suit_cyber',
    type: 'suit',
    name: 'Armadura Neón Abisal',
    price: 120,
    color: '#8b5cf6',
    icon: '⚡',
    description: 'Brilla en la oscuridad de las profundidades.',
  },

  // Headgear
  {
    id: 'head_bubble',
    type: 'headgear',
    name: 'Burbuja Oxigenada',
    price: 0,
    icon: '🫧',
    description: 'Visión panorámica de 360 grados.',
  },
  {
    id: 'head_coral',
    type: 'headgear',
    name: 'Corona de Coral Viviente',
    price: 45,
    icon: '👑',
    description: 'Un símbolo de respeto entre los arrecifes.',
  },
  {
    id: 'head_goggles',
    type: 'headgear',
    name: 'Gafas de Visión Nocturna',
    price: 60,
    icon: '🥽',
    description: 'Detecta organismos bioluminiscentes.',
  },
  {
    id: 'head_pirate',
    type: 'headgear',
    name: 'Gorra Capitán Nautilus',
    price: 90,
    icon: '⚓',
    description: 'Para líderes de expedición submarina.',
  },

  // Accessories
  {
    id: 'acc_compass',
    type: 'accessory',
    name: 'Brújula Magnética Abisal',
    price: 0,
    icon: '🧭',
    description: 'Nunca pierdas el rumbo hacia la meta.',
  },
  {
    id: 'acc_jetpack',
    type: 'accessory',
    name: 'Propulsor Hidráulico',
    price: 70,
    icon: '🎒',
    description: 'Impulso suave entre corrientes marinas.',
  },
  {
    id: 'acc_camera',
    type: 'accessory',
    name: 'Cámara 4K Submarina',
    price: 85,
    icon: '📸',
    description: 'Registra descubrimientos oceanográficos.',
  },

  // Pets
  {
    id: 'pet_jellyfish',
    type: 'pet',
    name: 'Medusita Rosa',
    price: 30,
    icon: '🪼',
    description: 'Flota suavemente iluminando tu camino.',
  },
  {
    id: 'pet_turtle',
    type: 'pet',
    name: 'Tortuga Sabia',
    price: 90,
    icon: '🐢',
    description: 'Acompañante tranquila que ama las matemáticas.',
  },
  {
    id: 'pet_octopus',
    type: 'pet',
    name: 'Pulpo Curioso',
    price: 110,
    icon: '🐙',
    description: 'Gran estratega en pensamiento computacional.',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_math_1',
    title: 'Equilibrio Cuántico',
    description: 'Resuelve tu primera balanza de fracciones sin usar pistas.',
    icon: '⚖️',
    category: 'math',
    rewardCoins: 25,
  },
  {
    id: 'ach_code_1',
    title: 'Primer Algoritmo',
    description: 'Programa la nave espacial hasta la meta en menos de 5 bloques.',
    icon: '🚀',
    category: 'code',
    rewardCoins: 25,
  },
  {
    id: 'ach_reading_1',
    title: 'Lector Abisal',
    description: 'Completa una lectura respondiendo correctamente la pregunta crítica.',
    icon: '📖',
    category: 'reading',
    rewardCoins: 25,
  },
  {
    id: 'ach_science_1',
    title: 'Biólogo Marino',
    description: 'Equilibra con éxito una red trófica marina respetando el flujo de biomasa.',
    icon: '🧪',
    category: 'science',
    rewardCoins: 25,
  },
  {
    id: 'ach_circuits_1',
    title: 'Ingeniero Lógico',
    description: 'Restaura un subsistema del Nautilus aplicando compuertas lógicas sin fallos.',
    icon: '⚡',
    category: 'circuits',
    rewardCoins: 25,
  },
  {
    id: 'ach_mastery_5',
    title: 'Maestro del Saber Real',
    description: 'Alcanza un Índice de Aprendizaje Real superior al 85% en 3 niveles.',
    icon: '🌟',
    category: 'mastery',
    rewardCoins: 50,
  },
];

// Initial real cohort of students with genuine educational records
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std_01',
    name: 'Mateo',
    lastName: 'Vargas Silva',
    username: 'mateo_vargas',
    grade: '4to',
    age: 9,
    email: 'mateo.vargas@colegio.edu.mx',
    authProvider: 'google',
    avatar: {
      characterType: 'boy',
      outfitId: 'sport',
      suitId: 'suit_diver',
      suitColor: '#0284c7',
      headgearId: 'head_bubble',
      accessoryId: 'acc_compass',
      petId: 'pet_jellyfish',
      expression: 'happy',
    },
    coins: 65,
    unlockedItems: ['suit_diver', 'head_bubble', 'acc_compass', 'pet_jellyfish'],
    progress: {
      matematicas: 3, // completed 1 and 2, working on 3
      algoritmos: 2,   // completed 1, working on 2
      lectura: 2,
      ciencias: 2,
      circuitos: 1,
    },
    totalLearningScore: 88,
    createdAt: '2026-10-15',
    history: [
      {
        subject: 'matematicas',
        level: 1,
        completed: true,
        score: 95,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 142,
        realLearningMastery: 92,
        lastAttemptDate: '2026-11-01',
      },
      {
        subject: 'matematicas',
        level: 2,
        completed: true,
        score: 90,
        attempts: 2,
        hintsUsed: 1,
        timeSpentSeconds: 198,
        realLearningMastery: 86,
        lastAttemptDate: '2026-11-02',
      },
      {
        subject: 'algoritmos',
        level: 1,
        completed: true,
        score: 100,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 110,
        realLearningMastery: 95,
        lastAttemptDate: '2026-11-03',
      },
      {
        subject: 'lectura',
        level: 1,
        completed: true,
        score: 85,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 230,
        realLearningMastery: 84,
        lastAttemptDate: '2026-11-03',
      },
    ],
    achievements: ['ach_math_1', 'ach_code_1'],
  },
  {
    id: 'std_02',
    name: 'Sofía',
    lastName: 'Ramos Morales',
    username: 'sofia_ramos',
    grade: '5to',
    age: 10,
    email: 'sofia.ramos@colegio.edu.mx',
    authProvider: 'email',
    avatar: {
      suitId: 'suit_astronaut',
      suitColor: '#ec4899',
      headgearId: 'head_coral',
      accessoryId: 'acc_jetpack',
      petId: 'pet_octopus',
      expression: 'victory',
    },
    coins: 140,
    unlockedItems: ['suit_diver', 'suit_astronaut', 'head_bubble', 'head_coral', 'acc_compass', 'acc_jetpack', 'pet_octopus'],
    progress: {
      matematicas: 4,
      algoritmos: 4,
      lectura: 3,
      ciencias: 2,
      circuitos: 2,
    },
    totalLearningScore: 94,
    createdAt: '2026-10-12',
    history: [
      {
        subject: 'matematicas',
        level: 1,
        completed: true,
        score: 100,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 105,
        realLearningMastery: 98,
        lastAttemptDate: '2026-10-20',
      },
      {
        subject: 'matematicas',
        level: 2,
        completed: true,
        score: 95,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 130,
        realLearningMastery: 94,
        lastAttemptDate: '2026-10-22',
      },
      {
        subject: 'matematicas',
        level: 3,
        completed: true,
        score: 90,
        attempts: 2,
        hintsUsed: 0,
        timeSpentSeconds: 215,
        realLearningMastery: 91,
        lastAttemptDate: '2026-11-01',
      },
      {
        subject: 'algoritmos',
        level: 1,
        completed: true,
        score: 100,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 85,
        realLearningMastery: 96,
        lastAttemptDate: '2026-10-25',
      },
      {
        subject: 'algoritmos',
        level: 2,
        completed: true,
        score: 95,
        attempts: 1,
        hintsUsed: 0,
        timeSpentSeconds: 140,
        realLearningMastery: 93,
        lastAttemptDate: '2026-10-28',
      },
      {
        subject: 'algoritmos',
        level: 3,
        completed: true,
        score: 90,
        attempts: 2,
        hintsUsed: 1,
        timeSpentSeconds: 200,
        realLearningMastery: 89,
        lastAttemptDate: '2026-11-02',
      },
    ],
    achievements: ['ach_math_1', 'ach_code_1', 'ach_reading_1', 'ach_mastery_5'],
  },
  {
    id: 'std_03',
    name: 'Valentina',
    lastName: 'Cruz Estrada',
    username: 'valentina_cruz',
    grade: '3ro',
    age: 8,
    email: 'valentina.cruz@colegio.edu.mx',
    authProvider: 'google',
    avatar: {
      suitId: 'suit_diver',
      suitColor: '#10b981',
      headgearId: 'head_bubble',
      accessoryId: 'acc_compass',
      petId: 'pet_turtle',
      expression: 'curious',
    },
    coins: 35,
    unlockedItems: ['suit_diver', 'head_bubble', 'acc_compass', 'pet_turtle'],
    progress: {
      matematicas: 2,
      algoritmos: 1,
      lectura: 1,
      ciencias: 1,
      circuitos: 1,
    },
    totalLearningScore: 79,
    createdAt: '2026-10-25',
    history: [
      {
        subject: 'matematicas',
        level: 1,
        completed: true,
        score: 80,
        attempts: 3,
        hintsUsed: 2,
        timeSpentSeconds: 310,
        realLearningMastery: 78,
        lastAttemptDate: '2026-11-02',
      },
    ],
    achievements: ['ach_math_1'],
  },
  {
    id: 'std_04',
    name: 'Diego',
    lastName: 'Navarro Soto',
    username: 'diego_navarro',
    grade: '6to',
    age: 11,
    email: 'diego.navarro@colegio.edu.mx',
    authProvider: 'microsoft',
    avatar: {
      suitId: 'suit_cyber',
      suitColor: '#8b5cf6',
      headgearId: 'head_goggles',
      accessoryId: 'acc_camera',
      petId: 'pet_octopus',
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
    totalLearningScore: 0,
    createdAt: '2026-11-04',
    history: [], // NEW STUDENT WITH ZERO REAL ADVANCE: Prompt rule: "si no tienen un avance real no se le registra nada a menos que el usuario tenga su avance"
    achievements: [],
  },
];

class StorageService {
  private students: Student[] = [];
  private activeUserId: string = 'std_01'; // Default active student

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (stored) {
        const parsed: Student[] = JSON.parse(stored);
        this.students = parsed.map((s) => ({
          ...s,
          progress: {
            matematicas: s.progress?.matematicas || 1,
            algoritmos: s.progress?.algoritmos || 1,
            lectura: s.progress?.lectura || 1,
            ciencias: s.progress?.ciencias || 1,
            circuitos: s.progress?.circuitos || 1,
          },
        }));
      } else {
        this.students = [...DEFAULT_STUDENTS];
        this.saveStudents();
      }

      const active = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (active && this.students.some((s) => s.id === active)) {
        this.activeUserId = active;
      } else if (this.students.length > 0) {
        this.activeUserId = this.students[0].id;
      }
    } catch {
      this.students = [...DEFAULT_STUDENTS];
    }
  }

  private saveStudents() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(this.students));
    } catch {
      // ignore quota exceeded in edge cases
    }
  }

  public getStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  public getActiveStudent(): Student {
    const found = this.students.find((s) => s.id === this.activeUserId);
    if (found) return found;
    return this.students[0] || DEFAULT_STUDENTS[0];
  }

  public setActiveStudent(id: string) {
    const exists = this.students.find((s) => s.id === id);
    if (exists) {
      this.activeUserId = id;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, id);
    }
  }

  public upsertStudent(student: Student) {
    const idx = this.students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      this.students[idx] = { ...student };
    } else {
      this.students.push({ ...student });
    }
    this.activeUserId = student.id;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, student.id);
    this.saveStudents();
  }

  // Teacher PIN validation (default 1234)
  public verifyTeacherPin(pin: string): boolean {
    const savedPin = localStorage.getItem(STORAGE_KEY_TEACHER_PIN) || '1234';
    return pin.trim() === savedPin;
  }

  public setTeacherPin(newPin: string) {
    localStorage.setItem(STORAGE_KEY_TEACHER_PIN, newPin.trim());
  }

  // Register a new student: Nombre, Apellidos, Grado (3ro-6to), Edad
  public registerStudent(data: {
    name: string;
    lastName: string;
    grade: SchoolGrade;
    age: number;
    email?: string;
    authProvider?: 'google' | 'microsoft' | 'email' | 'local';
  }): Student {
    const newStudent: Student = {
      id: `std_${Date.now()}`,
      name: data.name.trim(),
      lastName: data.lastName.trim(),
      grade: data.grade,
      age: Number(data.age),
      email: data.email || `${data.name.toLowerCase()}.${data.lastName.toLowerCase().replace(/\s+/g, '')}@escuela.edu`,
      authProvider: data.authProvider || 'local',
      avatar: {
        suitId: 'suit_diver',
        suitColor: '#0284c7',
        headgearId: 'head_bubble',
        accessoryId: 'acc_compass',
        petId: 'pet_jellyfish',
        expression: 'curious',
      },
      coins: 0,
      unlockedItems: ['suit_diver', 'head_bubble', 'acc_compass'],
      progress: {
        matematicas: 1, // Must start at level 1
        algoritmos: 1,
        lectura: 1,
        ciencias: 1,
        circuitos: 1,
      },
      history: [], // No registered progress until real learning achievement is reached
      achievements: [],
      totalLearningScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.students.push(newStudent);
    this.activeUserId = newStudent.id;
    this.saveStudents();
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, newStudent.id);
    return newStudent;
  }

  // Update real learning progress:
  // Strict rule: level N+1 only unlocked if level N is passed with real learning mastery!
  public recordProgress(
    studentId: string,
    subject: SubjectType,
    level: number,
    result: {
      score: number;
      attempts: number;
      hintsUsed: number;
      timeSpentSeconds: number;
      realLearningMastery: number;
    }
  ): { unlockedNext: boolean; earnedCoins: number } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { unlockedNext: false, earnedCoins: 0 };

    const isSuccess = result.realLearningMastery >= 70; // 70% threshold for real understanding
    let earnedCoins = 0;

    const existingProgressIndex = student.history.findIndex(
      (h) => h.subject === subject && h.level === level
    );

    const newProgressEntry = {
      subject,
      level,
      completed: isSuccess,
      score: result.score,
      attempts: result.attempts,
      hintsUsed: result.hintsUsed,
      timeSpentSeconds: result.timeSpentSeconds,
      realLearningMastery: result.realLearningMastery,
      lastAttemptDate: new Date().toISOString().split('T')[0],
    };

    if (existingProgressIndex >= 0) {
      // Only overwrite if better or newly completed
      student.history[existingProgressIndex] = newProgressEntry;
    } else if (isSuccess) {
      // Only register into real history if they demonstrated real advance
      student.history.push(newProgressEntry);
    }

    let unlockedNext = false;

    if (isSuccess) {
      // Calculate reward coins based on real autonomy and mastery
      earnedCoins = Math.round(result.realLearningMastery / 5) - result.hintsUsed * 3;
      if (earnedCoins < 5) earnedCoins = 5;

      student.coins += earnedCoins;

      // Unlock next level consecutively (cannot skip!)
      if (student.progress[subject] === level) {
        student.progress[subject] = level + 1;
        unlockedNext = true;
        audio.playLevelUp();
      }

      // Check achievements
      if (subject === 'matematicas' && !student.achievements.includes('ach_math_1')) {
        student.achievements.push('ach_math_1');
        student.coins += 25;
      }
      if (subject === 'algoritmos' && !student.achievements.includes('ach_code_1')) {
        student.achievements.push('ach_code_1');
        student.coins += 25;
      }
      if (subject === 'lectura' && !student.achievements.includes('ach_reading_1')) {
        student.achievements.push('ach_reading_1');
        student.coins += 25;
      }
      if (subject === 'ciencias' && !student.achievements.includes('ach_science_1')) {
        student.achievements.push('ach_science_1');
        student.coins += 25;
      }
      if (subject === 'circuitos' && !student.achievements.includes('ach_circuits_1')) {
        student.achievements.push('ach_circuits_1');
        student.coins += 25;
      }
      if (result.realLearningMastery >= 85) {
        const masteryCount = student.history.filter((h) => h.realLearningMastery >= 85).length;
        if (masteryCount >= 3 && !student.achievements.includes('ach_mastery_5')) {
          student.achievements.push('ach_mastery_5');
          student.coins += 50;
        }
      }
    }

    // Recompute total learning score (weighted average of completed real learning mastery)
    if (student.history.length > 0) {
      const sum = student.history.reduce((acc, h) => acc + h.realLearningMastery, 0);
      student.totalLearningScore = Math.round(sum / student.history.length);
    } else {
      student.totalLearningScore = 0;
    }

    this.saveStudents();
    return { unlockedNext, earnedCoins };
  }

  // Update student avatar configuration
  public updateAvatar(studentId: string, avatarData: Partial<Student['avatar']>) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return;

    student.avatar = {
      ...student.avatar,
      ...avatarData,
    };
    this.saveStudents();
  }

  // Purchase wardrobe item
  public buyItem(studentId: string, itemId: string): boolean {
    const student = this.students.find((s) => s.id === studentId);
    const item = INITIAL_WARDROBE_ITEMS.find((w) => w.id === itemId);
    if (!student || !item) return false;

    if (student.unlockedItems.includes(itemId)) return true;
    if (student.coins < item.price) return false;

    student.coins -= item.price;
    student.unlockedItems.push(itemId);

    // Auto-equip
    if (item.type === 'suit') {
      student.avatar.suitId = item.id;
      if (item.color) student.avatar.suitColor = item.color;
    } else if (item.type === 'headgear') {
      student.avatar.headgearId = item.id;
    } else if (item.type === 'accessory') {
      student.avatar.accessoryId = item.id;
    } else if (item.type === 'pet') {
      student.avatar.petId = item.id;
    }

    this.saveStudents();
    return true;
  }

  // Generate downloadable CSV monthly report for teachers
  public generateMonthlyReportCSV(): string {
    const headers = [
      'ID_Alumno',
      'Nombre',
      'Apellidos',
      'Grado',
      'Edad',
      'Email_Sincronizado',
      'Estado_Avance',
      'Indice_Aprendizaje_Real_%',
      'Nivel_Matematicas_Desbloqueado',
      'Nivel_Algoritmos_Desbloqueado',
      'Nivel_Lectura_Desbloqueado',
      'Nivel_Ciencias_Desbloqueado',
      'Nivel_Circuitos_Desbloqueado',
      'Monedas_Eurekas_Ganadas',
      'Lecciones_Acreditadas_Total',
      'Tiempo_Total_Plataforma_Minutos',
      'Diagnostico_Pedagogico',
    ];

    const rows = this.students.map((std) => {
      const hasRealProgress = std.history.length > 0;
      const totalTimeMin = Math.round(
        std.history.reduce((acc, h) => acc + h.timeSpentSeconds, 0) / 60
      );

      let diagnosis = 'En diagnóstico inicial';
      if (hasRealProgress) {
        if (std.totalLearningScore >= 90) diagnosis = 'Sobresaliente - Alta Autonomía y Razonamiento';
        else if (std.totalLearningScore >= 75) diagnosis = 'Satisfactorio - Progresión Estable';
        else diagnosis = 'Refuerzo Requerido en Fracciones y Algoritmos';
      }

      return [
        std.id,
        `"${std.name}"`,
        `"${std.lastName}"`,
        std.grade,
        std.age,
        std.email || 'N/A',
        hasRealProgress ? 'Con Avance Real Registrado' : 'Sin Avance Registrado (En Diagnóstico)',
        std.totalLearningScore,
        std.progress.matematicas || 1,
        std.progress.algoritmos || 1,
        std.progress.lectura || 1,
        std.progress.ciencias || 1,
        std.progress.circuitos || 1,
        std.coins,
        std.history.filter((h) => h.completed).length,
        totalTimeMin,
        `"${diagnosis}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Award bonus experience and Eurekas from real-time friendly duels
  public awardDuelRewards(
    studentId: string,
    bonusXp: number,
    bonusCoins: number
  ): { newCoins: number; newScore: number } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return { newCoins: 0, newScore: 0 };

    student.coins = (student.coins || 0) + bonusCoins;
    student.totalLearningScore = Math.min(100, (student.totalLearningScore || 0) + Math.round(bonusXp / 10));

    this.saveStudents();
    return { newCoins: student.coins, newScore: student.totalLearningScore };
  }
}

export const storage = new StorageService();
