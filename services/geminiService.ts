
import { GoogleGenAI, Type } from "@google/genai";
import { StudentCourse, CourseStatus } from "../types";

// Always use the process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseAcademicProgress = async (text: string): Promise<StudentCourse[]> => {
  const prompt = `
    Analiza el siguiente texto extraído de un historial académico de la UNAD (Registro de Avance Individual).
    Extrae todos los cursos que el estudiante ha tomado.
    Para cada curso determina: nombre, código, créditos y su estado.
    
    IMPORTANTE: 
    - Si el estado es 'MATR', mapealo como 'En curso'.
    - Los estados permitidos son: 'Aprobado', 'En curso', 'Reprobado', 'Homologado', 'Pendiente'.
    
    Texto del PDF:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              codigo: { type: Type.STRING },
              nombre: { type: Type.STRING },
              estado: { type: Type.STRING, enum: Object.values(CourseStatus) },
              creditos: { type: Type.NUMBER },
              nota: { type: Type.NUMBER },
              periodoReal: { type: Type.STRING }
            },
            required: ["codigo", "nombre", "estado", "creditos"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error parsing progress:", error);
    throw error;
  }
};

export const generateCourseDescription = async (courseName: string): Promise<string> => {
  const prompt = `
    Eres un tutor académico de la UNAD para el programa LILEI. 
    Para el curso "${courseName}", proporciona 3 consejos de estudio altamente estratégicos y 1 frase sobre su relevancia en el perfil del egresado. 
    NO uses Markdown complejo (sin # o ***), solo texto plano fluido y motivador. Máximo 100 palabras.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "No hay recomendaciones disponibles en este momento.";
  } catch (error) {
    return "Error generando recomendaciones académicas.";
  }
};
