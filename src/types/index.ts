/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolGrade = '3ro' | '4to' | '5to' | '6to';

export type SubjectType = 'matematicas' | 'algoritmos' | 'lectura' | 'ciencias' | 'circuitos';

export type CharacterType = 'boy' | 'girl' | 'robot';

export type BoyOutfit = 'sport' | 'explorer' | 'futuristic' | 'casual';
export type GirlOutfit = 'sport' | 'explorer' | 'futuristic' | 'casual';
export type RobotOutfit = 'hat' | 'mustache' | 'bow_tie' | 'futuristic_suit';

export type NavigationSection =
  | 'home'         // 1. Inicio
  | 'character'    // 2. Mi personaje
  | 'world'        // 3. Mundo o isla
  | 'games'        // 4. Juegos
  | 'missions'     // 5. Misiones
  | 'lessons'      // 6. Academia o lecciones
  | 'evaluations'  // 7. Evaluaciones
  | 'rewards'      // 8. Recompensas
  | 'inventory'    // 9. Inventario
  | 'room'         // 10. Mi habitación
  | 'stats'        // 11. Estadísticas y progreso
  | 'tutor'        // 12. Tutor inteligente
  | 'settings'     // 13. Configuración
  | 'logout';      // 14. Cerrar sesión

export interface StudentAvatar {
  characterType?: CharacterType;
  outfitId?: string;
  suitId: string;
  suitColor: string;
  headgearId: string;
  accessoryId: string;
  petId: string;
  hairstyleId?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  pantsColor?: string;
  shoesColor?: string;
  shoesId?: string;
  specialUnlockableId?: string;
  expression: 'happy' | 'thinking' | 'victory' | 'curious' | 'wink';
}

export interface StudentProgress {
  subject: SubjectType;
  level: number;
  completed: boolean;
  score: number; // 0-100
  attempts: number;
  hintsUsed: number;
  timeSpentSeconds: number;
  realLearningMastery: number; // 0-100: evaluated based on conceptual understanding vs guessing
  lastAttemptDate: string;
}

export type AudioRegionId = 'reef' | 'kelp' | 'abyss' | 'ruins' | 'lab';

export interface AudioPreferences {
  masterVolume: number;   // 0.0 - 1.0
  musicVolume: number;    // 0.0 - 1.0
  sfxVolume: number;      // 0.0 - 1.0
  musicEnabled: boolean;
  sfxEnabled: boolean;
  ambienceEnabled: boolean;
  currentRegion: AudioRegionId;
  muted?: boolean;
}

export interface Student {
  id: string;
  name: string;
  lastName: string;
  username?: string;
  grade: SchoolGrade;
  age: number;
  group?: string;
  guardianEmail?: string;
  email?: string;
  authProvider?: 'google' | 'microsoft' | 'email' | 'local';
  avatar: StudentAvatar;
  coins: number; // Eurekas earned through real achievements
  unlockedItems: string[];
  progress: Record<SubjectType, number>; // current unlocked level (1-indexed)
  history: StudentProgress[];
  achievements: string[];
  totalLearningScore: number;
  createdAt: string;
  audioPreferences?: AudioPreferences;
}

export interface FractionItem {
  id: string;
  numerator: number;
  denominator: number;
  value: number; // numerator / denominator
  label: string; // e.g., "1/8"
  color: string;
}

export interface ScaleMission {
  id: number;
  grade: SchoolGrade;
  title: string;
  targetFraction: FractionItem;
  targetGems: number;
  availablePieces: {
    item: FractionItem;
    initialCount: number;
  }[];
  explanation: string;
  conceptTip: string;
}

export type GridDirection = 0 | 90 | 180 | 270; // 0: East, 90: North, 180: West, 270: South

export type AlgorithmCommand = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'COLLECT_GEM';

export interface GridMission {
  id: number;
  grade: SchoolGrade;
  title: string;
  objective: string;
  startPos: { x: number; y: number; dir: GridDirection };
  gemPos: { x: number; y: number };
  goalPos: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  maxBlocks: number;
  hint: string;
  learningConcept: string;
}

export interface ReadingQuestion {
  id: string;
  type: 'literal' | 'inferencial' | 'critica';
  question: string;
  options: string[];
  correctIndex: number;
  feedbackSuccess: string;
  feedbackRetry: string;
}

export interface ReadingMission {
  id: number;
  grade: SchoolGrade;
  title: string;
  subtitle: string;
  estimatedTime: string;
  textParagraphs: string[];
  audioKeywords: string[];
  questions: ReadingQuestion[];
}

// ==========================================
// CIENCIAS: ECOSISTEMAS Y CADENAS TRÓFICAS
// ==========================================
export type TrophicRole = 'producer' | 'primary_consumer' | 'secondary_consumer' | 'apex_predator' | 'decomposer';

export interface OrganismItem {
  id: string;
  name: string;
  scientificName: string;
  role: TrophicRole;
  roleLabel: string;
  icon: string;
  color: string;
  biomassUnits: number; // e.g. 1000 for producer, 100 for primary, 10 for secondary, 1 for apex
  feedsOn: string[]; // ids of organisms this feeds on
  habitat: string;
  scientificFact: string;
}

export interface EcosystemSlot {
  id: string;
  role: TrophicRole;
  roleLabel: string;
  description: string;
  correctOrganismId: string;
}

export interface EcosystemMission {
  id: number;
  grade: SchoolGrade;
  title: string;
  subsystemTitle: string;
  targetEcoBalance: number; // 100
  availableOrganisms: OrganismItem[];
  slots: EcosystemSlot[];
  environmentalCondition: {
    name: string;
    description: string;
    valueLabel: string;
    impactTip: string;
  };
  explanation: string;
  conceptTip: string;
}

// ==========================================
// COMPUTACIÓN & LÓGICA: CIRCUITOS Y COMPUERTAS
// ==========================================
export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'XOR';

export interface CircuitInputSignal {
  id: string;
  name: string;
  description: string;
  value: boolean;
  icon: string;
}

export interface CircuitMission {
  id: number;
  grade: SchoolGrade;
  title: string;
  subsystemName: string;
  objective: string;
  storyContext: string;
  inputs: CircuitInputSignal[];
  targetOutput: boolean;
  targetOutputLabel: string;
  availableGates: LogicGateType[];
  gateSlotsCount: 1 | 2;
  truthTable: {
    inputs: Record<string, boolean>;
    expected: boolean;
  }[];
  hint: string;
  learningConcept: string;
  pedagogicalTip: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'math' | 'code' | 'reading' | 'mastery' | 'science' | 'circuits';
  rewardCoins: number;
}

export interface WardrobeItem {
  id: string;
  type: 'suit' | 'headgear' | 'accessory' | 'pet';
  name: string;
  price: number;
  color?: string;
  icon: string;
  description: string;
  gradeRequirement?: SchoolGrade;
}

// ==========================================
// ADMINISTRACIÓN Y GESTIÓN ESCOLAR (RBAC)
// ==========================================
export type UserRole = 'admin' | 'teacher' | 'student';

export interface AppUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  sectionIds: string[]; // Sections to which the user belongs or teaches
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatarIcon?: string;
  grade?: SchoolGrade;
  assignedTeacherId?: string;
}

export interface SchoolSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  grade: SchoolGrade;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  activityIds: string[];
  materialIds: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
}

export interface ActivityAttachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'video' | 'link' | 'doc';
  sizeLabel?: string;
}

export interface SectionActivity {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  instructions: string;
  subject: SubjectType;
  points: number;
  publishDate: string;
  dueDate: string;
  attachments: ActivityAttachment[];
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
}

export interface SectionMaterial {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  type: 'pdf' | 'image' | 'video' | 'link' | 'document';
  url: string;
  sizeLabel?: string;
  status: 'published' | 'draft';
  uploadedBy: string;
  createdAt: string;
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  sectionId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  score?: number; // 0 - 100
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded';
  answerText?: string;
  attachmentUrl?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
}

export interface AcademicStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalSections: number;
  totalActivities: number;
  pendingActivitiesCount: number;
  overallGradeAverage: number;
}

