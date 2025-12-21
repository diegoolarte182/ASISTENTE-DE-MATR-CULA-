
import { ProgramMalla } from './types';

export const LILEI_MALLA: ProgramMalla = {
  programa: "Licenciatura en Lenguas Extranjeras con Énfasis en Inglés",
  resolucion: "018456-2024-10-21",
  creditos_totales: 160,
  periodos: [
    {
      periodo: 1,
      creditos_periodo: 15,
      cursos: [
        { nombre: "Elementary English", codigo: "503438689", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 1 },
        { nombre: "Cátedra Unadista", codigo: "80017", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 1 },
        { nombre: "Introducción a la Licenciatura en Lenguas Extranjeras con Énfasis en Inglés", codigo: "503438688", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 1 },
        { nombre: "Competencias Comunicativas", codigo: "40003", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 1 },
        { nombre: "Ética y Ciudadanía", codigo: "40002", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 1 }
      ]
    },
    {
      periodo: 2,
      creditos_periodo: 16,
      cursos: [
        { nombre: "English I", codigo: "518002", creditos: 3, tipo: "obligatorio", prerrequisitos: ["503438689"], periodoSugerido: 2 },
        { nombre: "Prestación servicio social Unadista", codigo: "700004", creditos: 0, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 2 },
        { nombre: "Epistemología e Historia de la Pedagogía", codigo: "520027", creditos: 4, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 2 },
        { nombre: "Matemáticas para la Resolución de Problemas", codigo: "517031", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 2 },
        { nombre: "Pensamiento Lógico y Matemático", codigo: "200611", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 2 },
        { nombre: "Herramientas Digitales para la Gestión del Conocimiento", codigo: "200610", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 2 }
      ]
    },
    {
      periodo: 3,
      creditos_periodo: 16,
      cursos: [
        { nombre: "English II", codigo: "518007", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518002"], periodoSugerido: 3 },
        { nombre: "Fundamentos y Generalidades de la Investigación", codigo: "150001", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 3 },
        { nombre: "Teorías del Aprendizaje", codigo: "517022", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 3 },
        { nombre: "Introduction to Linguistics", codigo: "503438691", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 3 },
        { nombre: "Foreign Language Acquisition and Learning", codigo: "518015", creditos: 2, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 3 },
        { nombre: "Lengua Materna", codigo: "518003", creditos: 2, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 3 }
      ]
    },
    {
      periodo: 4,
      creditos_periodo: 16,
      cursos: [
        { nombre: "English III", codigo: "518008", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518007"], periodoSugerido: 4 },
        { nombre: "Evaluación", codigo: "520026", creditos: 3, tipo: "obligatorio", prerrequisitos: ["520027"], periodoSugerido: 4 },
        { nombre: "Didáctica", codigo: "517020", creditos: 3, tipo: "obligatorio", prerrequisitos: ["517022"], periodoSugerido: 4 },
        { nombre: "English Phonetics", codigo: "518014", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 4 },
        { nombre: "Ética de la Profesión Docente", codigo: "520025", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 4 },
        { nombre: "Electivo Formación Complementaria 1", codigo: "ELECT_FC_1", creditos: 1, tipo: "electivo", componente: "Formación Complementaria", prerrequisitos: [], periodoSugerido: 4 }
      ]
    },
    {
      periodo: 5,
      creditos_periodo: 18,
      cursos: [
        { nombre: "English IV", codigo: "518009", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518008"], periodoSugerido: 5 },
        { nombre: "Enfoques Curriculares", codigo: "517021", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 5 },
        { nombre: "Methodology in Foreign Language Teaching", codigo: "518005", creditos: 3, tipo: "obligatorio", prerrequisitos: ["517020"], periodoSugerido: 5 },
        { nombre: "Didactics of English", codigo: "503438690", creditos: 3, tipo: "obligatorio", prerrequisitos: ["517020"], periodoSugerido: 5 },
        { nombre: "Administración y Gestión Educativas", codigo: "500001", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 5 },
        { nombre: "Electivo Formación Complementaria 2", codigo: "ELECT_FC_2", creditos: 3, tipo: "electivo", componente: "Formación Complementaria", prerrequisitos: [], periodoSugerido: 5 }
      ]
    },
    {
      periodo: 6,
      creditos_periodo: 17,
      cursos: [
        { nombre: "English V", codigo: "518010", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518009"], periodoSugerido: 6 },
        { nombre: "Educación para la Transformación Social", codigo: "517027", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 6 },
        { nombre: "Teaching English to Children, Adolescents and Adults", codigo: "518004", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518005"], periodoSugerido: 6 },
        { nombre: "Materials Design in EFL", codigo: "503438692", creditos: 3, tipo: "obligatorio", prerrequisitos: ["503438690"], periodoSugerido: 6 },
        { nombre: "Electivo Disciplinar Específico 1", codigo: "ELECT_DE_1", creditos: 2, tipo: "electivo", componente: "Disciplinar Específico", prerrequisitos: [], periodoSugerido: 6 },
        { nombre: "Electivo Interdisciplinar Básico Común 1", codigo: "ELECT_IBC_1", creditos: 3, tipo: "electivo", componente: "Interdisciplinar Básico Común", prerrequisitos: [], periodoSugerido: 6 }
      ]
    },
    {
      periodo: 7,
      creditos_periodo: 17,
      cursos: [
        { nombre: "English VI", codigo: "518011", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518010"], periodoSugerido: 7 },
        { nombre: "Escenarios Educativos Inclusivos", codigo: "517028", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 7 },
        { nombre: "Technology in Foreign Language Teaching", codigo: "518006", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518005"], periodoSugerido: 7 },
        { nombre: "Intercultural Competence in ELT", codigo: "503438693", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 7 },
        { nombre: "Testing and Evaluation in ELT", codigo: "518023", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 7 },
        { nombre: "Electivo Interdisciplinar Básico Común 2", codigo: "ELECT_IBC_2", creditos: 2, tipo: "electivo", componente: "Interdisciplinar Básico Común", prerrequisitos: [], periodoSugerido: 7 }
      ]
    },
    {
      periodo: 8,
      creditos_periodo: 17,
      cursos: [
        { nombre: "English VII - English Conversation", codigo: "518012", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518011"], periodoSugerido: 8 },
        { nombre: "Investigación Educativa y Pedagógica", codigo: "517023", creditos: 3, tipo: "obligatorio", prerrequisitos: ["150001"], periodoSugerido: 8 },
        { nombre: "Integral Pedagogical Practice", codigo: "518018", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518004", "518006"], periodoSugerido: 8 },
        { nombre: "Electivo Disciplinar Específico 2", codigo: "ELECT_DE_2", creditos: 2, tipo: "electivo", componente: "Disciplinar Específico", prerrequisitos: [], periodoSugerido: 8 },
        { nombre: "Teacher Development", codigo: "518021", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 8 },
        { nombre: "Electivo Disciplinar Común 1", codigo: "ELECT_DC_1", creditos: 3, tipo: "electivo", componente: "Disciplinar Común", prerrequisitos: [], periodoSugerido: 8 }
      ]
    },
    {
      periodo: 9,
      creditos_periodo: 16,
      cursos: [
        { nombre: "English VIII - Academic Writing", codigo: "503438694", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518012"], periodoSugerido: 9 },
        { nombre: "Educational Research", codigo: "518024", creditos: 3, tipo: "obligatorio", prerrequisitos: ["517023"], periodoSugerido: 9 },
        { nombre: "Research Pedagogical Practice", codigo: "518019", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518018"], periodoSugerido: 9 },
        { nombre: "Electivo Disciplinar Específico 3", codigo: "ELECT_DE_3", creditos: 3, tipo: "electivo", componente: "Disciplinar Específico", prerrequisitos: [], periodoSugerido: 9 },
        { nombre: "Electivo Formación Complementaria 3", codigo: "ELECT_FC_3", creditos: 1, tipo: "electivo", componente: "Formación Complementaria", prerrequisitos: [], periodoSugerido: 9 },
        { nombre: "Electivo Disciplinar Común 2", codigo: "ELECT_DC_2", creditos: 3, tipo: "electivo", componente: "Disciplinar Común", prerrequisitos: [], periodoSugerido: 9 }
      ]
    },
    {
      periodo: 10,
      creditos_periodo: 12,
      cursos: [
        { nombre: "Research Project", codigo: "503438695", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518024"], periodoSugerido: 10 },
        { nombre: "Prácticas educativas mediadas por TIC", codigo: "517018", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 10 },
        { nombre: "Pedagogical Practice in Online Environments", codigo: "518020", creditos: 3, tipo: "obligatorio", prerrequisitos: ["518019"], periodoSugerido: 10 },
        { nombre: "Opción de Grado", codigo: "GRADO_01", creditos: 3, tipo: "obligatorio", prerrequisitos: [], periodoSugerido: 10 }
      ]
    }
  ],
  electivos_max: {
    "Formación Complementaria": 3,
    "Interdisciplinar Básico Común": 6,
    "Disciplinar Común": 6,
    "Disciplinar Específico": 12
  },
  notas: [
    "Servicio social unadista: se paga equivalente a 3 créditos (pecuniario) y no suma a la malla; requisito de grado.",
    "Trabajo/Opción de grado: requiere 75% o 90% de créditos según la modalidad."
  ]
};
