
export enum CourseStatus {
  APPROVED = 'Aprobado',
  IN_PROGRESS = 'En curso',
  FAILED = 'Reprobado',
  HOMOLOGATED = 'Homologado',
  PENDING = 'Pendiente'
}

export interface Course {
  nombre: string;
  codigo: string;
  creditos: number;
  tipo: 'obligatorio' | 'electivo';
  prerrequisitos: string[]; // List of codes
  periodoSugerido: number;
  componente?: string;
}

export interface Period {
  periodo: number;
  creditos_periodo: number;
  cursos: Course[];
}

export interface ProgramMalla {
  programa: string;
  resolucion: string;
  creditos_totales: number;
  periodos: Period[];
  electivos_max: {
    [key: string]: number;
  };
  notas: string[];
}

export interface StudentCourse {
  codigo: string;
  nombre: string;
  estado: CourseStatus;
  creditos: number;
  nota?: number;
  periodoReal?: string;
}

export interface ProgressSummary {
  totalCredits: number;
  approvedCredits: number;
  inProgressCredits: number;
  percentage: number;
  periodProgress: { [key: number]: number }; // % per period
}
