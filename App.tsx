
import React, { useState, useCallback, useRef } from 'react';
import { LILEI_MALLA } from './constants';
import { StudentCourse, CourseStatus, Course, ProgressSummary } from './types';
import { parseAcademicProgress, generateCourseDescription } from './services/geminiService';
import { Upload, PieChart, Layout, GraduationCap, FileText, CheckCircle, AlertCircle, Clock, Info, X, Download, Star, Sparkles, TrendingUp, RefreshCcw, MapPin, Award, BookOpen, ChevronRight, ArrowRight, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Sub-components ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{title}</h3>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Ficha Técnica de Seguimiento</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'recommendation' | 'malla'>('upload');
  const [mallaView, setMallaView] = useState<'grid' | 'pathways'>('grid');
  const [studentProgress, setStudentProgress] = useState<StudentCourse[]>([]);
  const [studentName, setStudentName] = useState<string>('Estudiante LILEI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [creditLimit, setCreditLimit] = useState(21);
  const exportRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Pathways course sequences
  const englishPath = ["503438689", "518002", "518007", "518008", "518009", "518010", "518011", "518012", "503438694"];
  
  const practiceStages = [
    {
      name: "Etapa 1: Observación Participante",
      scenario: "Propio UNAD - Virtual",
      courses: ["517020", "520026", "517021", "517027", "518005"]
    },
    {
      name: "Etapa 2: Inmersión",
      scenario: "Institución Educativa",
      courses: ["518004", "518006", "518018", "517028", "517023", "517018"]
    },
    {
      name: "Etapa 3: Investigación",
      scenario: "Institución Educativa (Virtual para PPOE)",
      courses: ["518024", "518019", "518020"]
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep('Iniciando lectura del documento...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // @ts-ignore
        if (!window.pdfjsLib) {
          alert("La librería de PDF no se ha cargado correctamente. Por favor recarga la página.");
          setIsProcessing(false);
          return;
        }

        // @ts-ignore
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setProcessingStep(`Extrayendo texto de ${pdf.numPages} páginas...`);
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Improve extraction by adding newlines to separate potential rows/sections
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + "\n";
        }

        // Validation for scanned PDFs or empty files
        if (fullText.trim().length < 50) {
          alert("El documento parece estar vacío o es una imagen escaneada. Por favor sube el PDF original descargado de la plataforma (con texto seleccionable).");
          setIsProcessing(false);
          return;
        }
        
        setProcessingStep('Analizando historial con IA...');
        const extractedCourses = await parseAcademicProgress(fullText);
        
        if (!extractedCourses || extractedCourses.length === 0) {
          alert("No se pudieron identificar cursos en el documento. Verifica que sea el 'Registro de Avance Individual' oficial de la UNAD.");
          setIsProcessing(false);
          return;
        }

        setStudentProgress(extractedCourses);
        setShowNotification(`¡Análisis completado! ${extractedCourses.length} cursos identificados.`);
        setTimeout(() => setShowNotification(null), 5000);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      alert("Error al procesar el archivo. Intenta nuevamente o usa otro archivo.");
      setIsProcessing(false);
    }
  };

  const handleNewAnalysis = () => {
    if (window.confirm("¿Deseas realizar un nuevo análisis? El informe actual se reemplazará.")) {
      setStudentProgress([]);
      setStudentName('Estudiante LILEI');
      setActiveTab('upload');
      setShowNotification("Sesión reiniciada");
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const calculateProgress = useCallback((): ProgressSummary => {
    const approved = studentProgress
      .filter(c => c.estado === CourseStatus.APPROVED || c.estado === CourseStatus.HOMOLOGATED)
      .reduce((acc, c) => acc + c.creditos, 0);
    
    const inProgress = studentProgress
      .filter(c => c.estado === CourseStatus.IN_PROGRESS)
      .reduce((acc, c) => acc + c.creditos, 0);

    const periodProgress: { [key: number]: number } = {};
    LILEI_MALLA.periodos.forEach(p => {
      const totalInPeriod = p.cursos.length;
      const approvedInPeriod = p.cursos.filter(mCourse => 
        studentProgress.some(sCourse => sCourse.codigo === mCourse.codigo && 
          (sCourse.estado === CourseStatus.APPROVED || sCourse.estado === CourseStatus.HOMOLOGATED))
      ).length;
      periodProgress[p.periodo] = (approvedInPeriod / totalInPeriod) * 100;
    });

    return {
      totalCredits: LILEI_MALLA.creditos_totales,
      approvedCredits: approved,
      inProgressCredits: inProgress,
      percentage: (approved / LILEI_MALLA.creditos_totales) * 100,
      periodProgress
    };
  }, [studentProgress]);

  const getRecommendations = () => {
    const approvedCodes = new Set(
      studentProgress
        .filter(c => c.estado === CourseStatus.APPROVED || c.estado === CourseStatus.HOMOLOGATED)
        .map(c => c.codigo)
    );
    const inProgressCodes = new Set(studentProgress.filter(c => c.estado === CourseStatus.IN_PROGRESS).map(c => c.codigo));
    const allMallaCursos = LILEI_MALLA.periodos.flatMap(p => p.cursos);
    const pending = allMallaCursos.filter(c => !approvedCodes.has(c.codigo) && !inProgressCodes.has(c.codigo));

    const recommendations: { course: Course; reason: string; priority: number }[] = [];
    pending.forEach(course => {
      const prerequisitesMet = course.prerrequisitos.every(pre => approvedCodes.has(pre));
      if (prerequisitesMet) {
        let priority = course.periodoSugerido;
        let reason = `Siguiente en malla (P${course.periodoSugerido})`;
        const currentEstimatedPeriod = Math.floor(approvedCodes.size / 5) + 1; 
        if (course.periodoSugerido < currentEstimatedPeriod) {
          priority = 0; 
          reason = "Curso atrasado";
        }
        recommendations.push({ course, reason, priority });
      }
    });
    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  const getCourseStatus = (codigo: string) => {
    const found = studentProgress.find(c => c.codigo === codigo);
    return found ? found.estado : CourseStatus.PENDING;
  };

  const getCEFRLevel = () => {
    const approved = new Set(studentProgress.filter(c => c.estado === CourseStatus.APPROVED || c.estado === CourseStatus.HOMOLOGATED).map(c => c.codigo));
    
    const levels = [
      { id: "A1", courses: ["503438689"], name: "A1 - Elementary" },
      { id: "A2", courses: ["518002", "518007"], name: "A2 - English I & II" },
      { id: "B1", courses: ["518008", "518009"], name: "B1 - English III & IV" },
      { id: "B2", courses: ["518010", "518011"], name: "B2 - English V & VI" },
      { id: "C1", courses: ["518012", "503438694"], name: "C1 - Conversation & Writing" }
    ];

    let current = "Sin nivel";
    let reached = [];
    let pending = [];

    for (const level of levels) {
      if (level.courses.every(c => approved.has(c))) {
        reached.push(level);
        current = level.id;
      } else {
        pending.push(level);
      }
    }

    return { current, reached, pending };
  };

  const getPostRequisites = (codigo: string) => {
    const allCourses = LILEI_MALLA.periodos.flatMap(p => p.cursos);
    return allCourses.filter(c => c.prerrequisitos.includes(codigo));
  };

  const handleCourseClick = async (course: Course) => {
    setSelectedCourse(course);
    setCourseDescription('Generando recomendaciones de estudio...');
    const desc = await generateCourseDescription(course.nombre);
    setCourseDescription(desc);
  };

  const exportEnrollmentPdf = () => {
    const element = exportRef.current;
    if (!element) return;
    const opt = {
      margin: 1,
      filename: `Pre-matricula_LILEI_${studentName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  const exportFullReportPdf = () => {
    const element = reportRef.current;
    if (!element) return;
    const opt = {
      margin: 0.25,
      filename: `Informe_LILEI_${studentName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  const stats = calculateProgress();
  const rawRecommendations = getRecommendations();
  let currentCredits = 0;
  const filteredRecommendations = rawRecommendations.reduce((acc: any[], curr) => {
    if (currentCredits + curr.course.creditos <= creditLimit) {
      acc.push(curr);
      currentCredits += curr.course.creditos;
    }
    return acc;
  }, []);

  const chartData = Object.entries(stats.periodProgress).map(([period, progress]) => ({
    name: `P${period}`,
    progress
  }));

  const cefr = getCEFRLevel();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white shadow-xl sticky top-0 z-40 backdrop-blur-md bg-opacity-95 no-print">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
              <GraduationCap className="w-7 h-7 text-indigo-900" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Asistente LILEI</h1>
              <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mt-1">Gestión de Matrícula UNAD</p>
            </div>
          </div>
          <nav className="flex gap-2 bg-white/10 p-1.5 rounded-[1.25rem]">
            {[
              { id: 'upload', icon: Upload, label: 'Inicio' },
              { id: 'recommendation', icon: TrendingUp, label: 'Matrícula' },
              { id: 'malla', icon: Layout, label: 'Malla' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                  activeTab === tab.id ? 'bg-white text-blue-900 shadow-xl scale-105' : 'hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-lg animate-in fade-in">
          <div className="text-center space-y-8 max-w-sm w-full p-12 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-8 border-slate-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Procesando Registro</h3>
              <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">{processingStep}</p>
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="fixed top-28 right-6 z-50 animate-in slide-in-from-right-10 fade-in no-print">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <p className="font-black text-xs uppercase tracking-widest">{showNotification}</p>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        {activeTab === 'upload' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
            <div className={`max-w-2xl mx-auto transition-all ${studentProgress.length > 0 ? 'scale-90 opacity-60' : 'py-12'}`}>
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-dashed border-slate-200 hover:border-indigo-400 transition-all group text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter uppercase">Análisis Académico</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">Sube tu Registro de Avance Individual (PDF)</p>
                
                <label className="block">
                  <span className="sr-only">Seleccionar PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-10 file:rounded-2xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all shadow-xl"
                  />
                </label>
              </div>
            </div>

            {studentProgress.length > 0 && (
              <div className="space-y-10 animate-in zoom-in-95">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                      <TrendingUp className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Panel de Avance</h3>
                      <div className="flex gap-4 items-center mt-1">
                        <input 
                          className="text-[10px] text-indigo-600 font-black uppercase tracking-widest border-b-2 border-indigo-100 outline-none w-64 bg-transparent focus:border-indigo-600 transition-colors"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Nombre del estudiante..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleNewAnalysis}
                      className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3 shadow-sm"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Nuevo Análisis
                    </button>
                    <button 
                      onClick={exportFullReportPdf}
                      className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3"
                    >
                      <Download className="w-4 h-4" />
                      Exportar Informe (PDF)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-green-300 transition-all">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Aprobado</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-blue-300 transition-all">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Créditos Totales</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.approvedCredits}<span className="text-sm font-bold opacity-30">/160</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-yellow-300 transition-all">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Créditos en Curso</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.inProgressCredits}<span className="text-sm font-bold opacity-30"> CR</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-slate-800">
                        <PieChart className="w-6 h-6 text-indigo-600" />
                        Distribución por Periodos
                      </h3>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={900} />
                            <YAxis unit="%" axisLine={false} tickLine={false} fontSize={10} fontWeight={900} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                            <Bar dataKey="progress" radius={[10, 10, 0, 0]} barSize={28}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#4f46e5'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                      <h3 className="text-xl font-black mb-8 uppercase tracking-tighter text-slate-800">Detalle de Historial</h3>
                      <div className="overflow-y-auto max-h-[450px] -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-white z-10 border-b-2 border-slate-50">
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <th className="pb-5">Asignatura</th>
                              <th className="pb-5">Estado</th>
                              <th className="pb-5 text-right">Cr.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {studentProgress.map((c, i) => (
                              <tr key={i} className="text-sm hover:bg-slate-50 transition-all group">
                                <td className="py-5 pr-2">
                                  <p className="font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.nombre}</p>
                                  <p className="text-[9px] text-slate-400 font-black font-mono mt-1 opacity-50">ID: {c.codigo}</p>
                                </td>
                                <td className="py-5">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-tight ${
                                    c.estado === CourseStatus.APPROVED || c.estado === CourseStatus.HOMOLOGATED ? 'bg-green-100 text-green-700' :
                                    c.estado === CourseStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
                                    c.estado === CourseStatus.FAILED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {c.estado === CourseStatus.IN_PROGRESS ? 'MATRICULADO' : c.estado.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-5 text-right font-mono text-slate-500 font-black">{c.creditos}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendation' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Proyección Académica</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Cursos recomendados para tu próximo periodo.</p>
              </div>
              <div className="flex flex-col items-end gap-2 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Créditos Máximos</span>
                <input 
                  type="number" max={21} min={0} value={creditLimit} 
                  onChange={e => setCreditLimit(Math.min(21, parseInt(e.target.value) || 0))}
                  className="w-24 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3 text-center font-black text-2xl text-indigo-600 focus:border-indigo-500 outline-none transition-all shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredRecommendations.map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all group hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      item.priority === 0 ? 'bg-amber-100 text-amber-600 shadow-amber-100' : 'bg-indigo-50 text-indigo-600 shadow-indigo-100'
                    }`}>
                      {item.priority === 0 ? <AlertCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xl tracking-tighter uppercase leading-tight">{item.course.nombre}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-slate-400 font-black font-mono uppercase tracking-widest">#{item.course.codigo}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.course.creditos} CRÉDITOS</p>
                      </div>
                      <span className={`inline-block mt-3 text-[9px] px-4 py-1 rounded-full font-black uppercase tracking-[0.1em] ${
                        item.priority === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.reason}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleCourseClick(item.course)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white p-4 rounded-2xl transition-all shadow-xl">
                    <Info className="w-6 h-6" />
                  </button>
                </div>
              ))}
              {filteredRecommendations.length === 0 && (
                <div className="text-center py-24 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-widest">No hay proyecciones disponibles.</p>
                </div>
              )}
            </div>

            {filteredRecommendations.length > 0 && (
              <div className="p-10 bg-indigo-950 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-3xl shadow-indigo-900/40">
                <div>
                  <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Total Proyección Matrícula</p>
                  <p className="text-6xl font-black tracking-tighter">{currentCredits} <span className="text-2xl opacity-30">/ {creditLimit} CR</span></p>
                </div>
                <button 
                  onClick={exportEnrollmentPdf}
                  className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 px-12 py-6 rounded-[2rem] font-black text-xl tracking-tighter transition-all flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95"
                >
                  <Download className="w-7 h-7" />
                  CONFIRMAR PRE-MATRÍCULA (PDF)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'malla' && (
          <div className="space-y-12 animate-in fade-in zoom-in-95">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-[100px] z-30 backdrop-blur-md bg-white/90 no-print">
               <div className="flex bg-slate-100 p-2 rounded-[1.5rem] w-full md:w-auto shadow-inner">
                 <button 
                   onClick={() => setMallaView('grid')}
                   className={`flex-1 md:flex-none px-10 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${mallaView === 'grid' ? 'bg-white shadow-xl text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Malla Curricular
                 </button>
                 <button 
                   onClick={() => setMallaView('pathways')}
                   className={`flex-1 md:flex-none px-10 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${mallaView === 'pathways' ? 'bg-white shadow-xl text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Rutas Formativas
                 </button>
               </div>
               <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-slate-400 px-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-200"></div> Aprobado / Homol.</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-200"></div> Matriculado</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded-full"></div> Pendiente</div>
               </div>
            </div>

            {mallaView === 'grid' ? (
              <div className="overflow-x-auto pb-12 scrollbar-thin scrollbar-thumb-slate-300 -mx-4 px-4">
                <div className="inline-flex gap-8 min-w-max p-4">
                  {LILEI_MALLA.periodos.map(period => (
                    <div key={period.periodo} className="w-72 flex flex-col gap-6">
                      <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-center shadow-xl group overflow-hidden relative">
                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <h3 className="font-black uppercase text-xs tracking-[0.2em]">Periodo {period.periodo}</h3>
                        <p className="text-[10px] text-blue-300 font-black mt-2 opacity-60 tracking-widest uppercase">{period.creditos_periodo} CRÉDITOS</p>
                      </div>
                      <div className="flex flex-col gap-5">
                        {period.cursos.map(course => {
                          const status = getCourseStatus(course.codigo);
                          return (
                            <button
                              key={course.codigo}
                              onClick={() => handleCourseClick(course)}
                              className={`p-6 rounded-[2.5rem] border-l-[8px] text-left shadow-sm transition-all hover:scale-[1.06] hover:shadow-2xl relative group/card ${
                                status === CourseStatus.APPROVED || status === CourseStatus.HOMOLOGATED ? 'bg-white border-green-500' :
                                status === CourseStatus.IN_PROGRESS ? 'bg-white border-yellow-400' :
                                status === CourseStatus.FAILED ? 'bg-white border-red-500' :
                                'bg-white border-slate-100 hover:border-indigo-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-mono text-slate-300 font-black tracking-tight opacity-50">#{course.codigo}</span>
                                <span className="text-[9px] font-black text-slate-400 group-hover/card:text-indigo-600 transition-colors uppercase tracking-widest">{course.creditos} CR</span>
                              </div>
                              <p className="text-[11px] font-black text-slate-800 leading-tight mb-4 uppercase tracking-tight line-clamp-2">{course.nombre}</p>
                              <span className={`text-[9px] uppercase font-black px-4 py-1.5 rounded-full inline-block shadow-sm ${
                                status === CourseStatus.APPROVED || status === CourseStatus.HOMOLOGATED ? 'text-green-700 bg-green-50' :
                                status === CourseStatus.IN_PROGRESS ? 'text-yellow-800 bg-yellow-50' :
                                status === CourseStatus.FAILED ? 'text-red-700 bg-red-50' :
                                'text-slate-400 bg-slate-100'
                              }`}>
                                {status === CourseStatus.IN_PROGRESS ? 'MATR' : status.toUpperCase()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-16 pb-20">
                {/* CEFR Level Section - Ruta de Inglés */}
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="p-6 bg-blue-900 text-white rounded-[1.5rem] shadow-2xl">
                          <BookOpen className="w-10 h-10" />
                       </div>
                       <div>
                          <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ruta de Lengua Inglesa</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <Award className="w-4 h-4 text-indigo-500" />
                             <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Estimación MCER: {cefr.current}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nivel Alcanzado</p>
                        <div className="w-28 h-28 bg-indigo-950 text-white rounded-[2rem] flex items-center justify-center font-black text-5xl shadow-2xl shadow-indigo-900/20">
                          {cefr.current}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-3 bg-green-50 text-green-700 px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-tight">
                            <CheckCircle className="w-4 h-4" /> {cefr.reached.length} Niveles Aprobados
                         </div>
                         <div className="flex items-center gap-3 bg-yellow-50 text-yellow-700 px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-tight">
                            <Clock className="w-4 h-4" /> {cefr.pending.filter(l => l.courses.some(c => getCourseStatus(c) === CourseStatus.IN_PROGRESS)).length} Nivel en Curso
                         </div>
                         <div className="flex items-center gap-3 bg-slate-50 text-slate-400 px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-tight">
                            <AlertCircle className="w-4 h-4" /> {cefr.pending.filter(l => !l.courses.some(c => getCourseStatus(c) === CourseStatus.IN_PROGRESS)).length} Niveles Pendientes
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                    {cefr.reached.concat(cefr.pending).map((level, i) => {
                      const approved = level.courses.every(c => getCourseStatus(c) === CourseStatus.APPROVED || getCourseStatus(c) === CourseStatus.HOMOLOGATED);
                      const inProgress = level.courses.some(c => getCourseStatus(c) === CourseStatus.IN_PROGRESS);
                      return (
                        <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center ${approved ? 'bg-green-50 border-green-200 shadow-sm' : inProgress ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                           <p className="text-xl font-black text-slate-800">{level.id}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-tight">{level.name}</p>
                           {approved ? <CheckCircle className="w-5 h-5 text-green-500" /> : inProgress ? <Clock className="w-5 h-5 text-yellow-500 animate-pulse" /> : <div className="w-5 h-5 rounded-full border border-slate-200"></div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-5">
                    <Info className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-900 leading-relaxed italic uppercase">
                        Equivalencia MCER - Acuerdo 421: A1 → Elementary | A2 → English I/II | B1 → English III/IV | B2 → English V/VI | C1 → English VII/VIII.
                      </p>
                      <p className="text-[10px] font-black text-red-600 mt-2 uppercase tracking-tight">
                        ADVERTENCIA: El nivel MCER mostrado es una estimación académica basada en cursos aprobados y no reemplaza certificaciones oficiales.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practice Route Stages Visualization */}
                <div className="space-y-12">
                  <div className="flex items-center gap-6 pl-8 border-l-[12px] border-indigo-600">
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ruta de Práctica Pedagógica</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {practiceStages.map((stage, idx) => {
                      const stageCourses = stage.courses;
                      const approved = stageCourses.filter(c => getCourseStatus(c) === CourseStatus.APPROVED || getCourseStatus(c) === CourseStatus.HOMOLOGATED).length;
                      const inProgress = stageCourses.filter(c => getCourseStatus(c) === CourseStatus.IN_PROGRESS).length;
                      const progressPerc = (approved / stageCourses.length) * 100;

                      return (
                        <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden flex flex-col">
                          <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
                          
                          <div className="space-y-4">
                             <div className="flex justify-between items-start">
                               <h5 className="font-black text-slate-900 text-xl uppercase tracking-tighter leading-tight w-2/3">{stage.name}</h5>
                               <span className="bg-indigo-950 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">{approved}/{stageCourses.length}</span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl w-fit">
                               <MapPin className="w-3 h-3" />
                               {stage.scenario}
                             </div>
                          </div>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progressPerc}%` }}></div>
                          </div>

                          <div className="space-y-3 flex-grow">
                             {stage.courses.map(code => {
                               const c = LILEI_MALLA.periodos.flatMap(p => p.cursos).find(x => x.codigo === code);
                               const s = getCourseStatus(code);
                               const isApproved = s === CourseStatus.APPROVED || s === CourseStatus.HOMOLOGATED;
                               const isMatr = s === CourseStatus.IN_PROGRESS;
                               return (
                                 <div key={code} onClick={() => handleCourseClick(c!)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer hover:scale-105 ${isApproved ? 'bg-green-50 border-green-200' : isMatr ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                    <span className="text-[10px] font-black uppercase text-slate-700 leading-tight pr-4">{c?.nombre || code}</span>
                                    {isApproved ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : isMatr ? <Clock className="w-4 h-4 text-yellow-500 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0"></div>}
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden Templates for PDFs */}
      <div className="hidden">
        {/* Full Institutional Report PDF */}
        <div ref={reportRef} className="p-16 text-slate-900 bg-white font-sans max-w-[8.5in] mx-auto border-t-[20px] border-indigo-900">
           <div className="flex justify-between items-start pb-12 mb-12 border-b-2 border-slate-100">
              <div className="text-left">
                <h1 className="text-5xl font-black text-indigo-900 uppercase tracking-tighter mb-4">Informe de Avance Académico</h1>
                <p className="text-lg font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{LILEI_MALLA.programa}</p>
                <p className="text-xs font-bold text-slate-300 mt-4 uppercase tracking-[0.4em]">Resolución Académica 018456 • UNAD</p>
              </div>
              <div className="text-right">
                 <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
                    <p className="text-[10px] font-black tracking-widest opacity-40 uppercase mb-2">Fecha de Emisión</p>
                    <p className="font-black text-2xl">{new Date().toLocaleDateString()}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-12 mb-16">
              <div className="bg-slate-50 p-12 rounded-[3rem] border-2 border-slate-100 text-center shadow-inner">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Progreso Global</p>
                 <p className="text-8xl font-black text-slate-900 tracking-tighter">{stats.percentage.toFixed(1)}%</p>
              </div>
              <div className="bg-slate-50 p-12 rounded-[3rem] border-2 border-slate-100 text-center shadow-inner">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Créditos Alcanzados</p>
                 <p className="text-8xl font-black text-slate-900 tracking-tighter">{stats.approvedCredits}<span className="text-2xl font-black opacity-10">/160</span></p>
              </div>
           </div>

           {/* Institutional Letter Section */}
           <div className="space-y-10 mb-16 text-sm leading-relaxed text-slate-800 bg-white p-12 rounded-[3.5rem] border-4 border-slate-50 relative overflow-hidden">
              <div className="grid grid-cols-1 gap-4 pb-8 border-b-2 border-slate-50">
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 mb-2">Ficha Técnica de Seguimiento</p>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Estudiante</p>
                    <p className="font-black uppercase text-indigo-900 text-xl border-b-2 border-indigo-50">{studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Programa</p>
                    <p className="font-black uppercase text-slate-800 text-xl border-b-2 border-slate-50">{LILEI_MALLA.programa}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 text-justify relative z-10 font-medium">
                <p>Recibe un cordial saludo.</p>
                <p>
                  De acuerdo con el análisis realizado de tu trayectoria académica y con el propósito de orientarte en esta nueva etapa de tu proceso formativo, se recomienda la matrícula de los siguientes cursos para el próximo periodo académico:
                </p>
                <div className="bg-indigo-50 p-8 rounded-[2rem] border-l-[12px] border-indigo-600">
                  <ul className="grid grid-cols-2 gap-4 list-none font-black text-indigo-950 uppercase text-xs">
                    {filteredRecommendations.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0" />
                        {item.course.nombre} – {item.course.codigo}
                      </li>
                    ))}
                  </ul>
                </div>
                <p>
                  No obstante, es importante recordar que la matrícula es una responsabilidad personal; por tanto, la decisión final sobre los cursos a inscribir corresponde exclusivamente al estudiante. En este sentido, se recomienda revisar cuidadosamente toda la información académica y administrativa necesaria antes de realizar el proceso de matrícula.
                </p>
                <p>
                  La presente propuesta tiene como objetivo articular los cursos reconocidos del plan anterior con los espacios formativos propios de tu programa académico, garantizando así la continuidad, coherencia y el fortalecimiento de tu proceso formativo.
                </p>
              </div>
           </div>
        </div>

        {/* Short Enrollment PDF Template */}
        <div ref={exportRef} className="p-20 text-slate-900 bg-white font-sans max-w-[8.5in] mx-auto">
          <div className="flex justify-between items-start border-b-8 border-indigo-900 pb-12 mb-12">
            <div>
              <h1 className="text-6xl font-black text-indigo-900 uppercase tracking-tighter mb-4 leading-none">Pre-Matrícula</h1>
              <p className="text-xl text-slate-500 font-black uppercase tracking-widest">{LILEI_MALLA.programa}</p>
            </div>
          </div>
          <div className="mb-12">
             <p className="text-sm font-black uppercase text-slate-400 mb-2">Estudiante:</p>
             <p className="text-3xl font-black text-indigo-900 uppercase underline decoration-indigo-100">{studentName}</p>
          </div>
          <table className="w-full mb-20 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-8 px-10 text-left text-xs font-black uppercase tracking-widest">Código</th>
                <th className="py-8 px-10 text-left text-xs font-black uppercase tracking-widest">Asignatura</th>
                <th className="py-8 px-10 text-center text-xs font-black uppercase tracking-widest">Créditos</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-50">
              {filteredRecommendations.map((item, idx) => (
                <tr key={idx} className="bg-slate-50/50">
                  <td className="py-8 px-10 font-mono font-black text-indigo-600 text-lg">#{item.course.codigo}</td>
                  <td className="py-8 px-10 font-black uppercase text-slate-800 text-base leading-tight">{item.course.nombre}</td>
                  <td className="py-8 px-10 text-center font-black text-2xl">{item.course.creditos}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-950 text-white font-black">
                <td colSpan={2} className="py-12 px-10 text-right uppercase tracking-[0.5em] text-xs">Total Créditos Sugeridos:</td>
                <td className="py-12 px-10 text-center text-6xl tracking-tighter">{currentCredits}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Course Detail Modal */}
      <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse?.nombre || ''}>
        {selectedCourse && (
          <div className="space-y-12">
            {/* Standard Data Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { l: 'Código', v: `#${selectedCourse.codigo}`, c: 'indigo' },
                { l: 'Créditos', v: selectedCourse.creditos, c: 'indigo' },
                { l: 'Periodo', v: `P${selectedCourse.periodoSugerido}`, c: 'indigo' },
                { l: 'Status', v: (getCourseStatus(selectedCourse.codigo) === CourseStatus.IN_PROGRESS ? 'MATR' : getCourseStatus(selectedCourse.codigo).toUpperCase()), c: 'blue' }
              ].map((x, i) => (
                <div key={i} className={`p-8 bg-slate-50 rounded-[2.5rem] text-center shadow-inner border border-slate-100 transition-all hover:bg-white`}>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">{x.l}</p>
                  <p className="font-black text-slate-900 text-3xl tracking-tighter">{x.v}</p>
                </div>
              ))}
            </div>

            {/* Curriculum Location (Nucleo / Ruta) */}
            <div className="p-8 bg-indigo-50/50 rounded-[3rem] border border-indigo-100 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-600 text-white rounded-xl">
                   <Layers className="w-5 h-5" />
                 </div>
                 <h4 className="font-black text-xs uppercase text-indigo-900 tracking-widest">Núcleo / Componente Formativo</h4>
              </div>
              <p className="text-xl font-black text-slate-800 uppercase tracking-tight pl-10">
                {selectedCourse.componente || (selectedCourse.tipo === 'obligatorio' ? 'Formación Disciplinar Común' : 'Electiva')}
              </p>
            </div>

            {/* Relations: Prerequisites and Post-requisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Pre-requisites */}
               <div className="space-y-6">
                  <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                    <Clock className="w-4 h-4" /> Prerrequisitos (Antes)
                  </h4>
                  <div className="space-y-3">
                    {selectedCourse.prerrequisitos.length > 0 ? (
                      selectedCourse.prerrequisitos.map(preCode => {
                        const preCourse = LILEI_MALLA.periodos.flatMap(p => p.cursos).find(x => x.codigo === preCode);
                        const isApproved = getCourseStatus(preCode) === CourseStatus.APPROVED || getCourseStatus(preCode) === CourseStatus.HOMOLOGATED;
                        return (
                          <div key={preCode} className={`p-4 rounded-[1.5rem] border-2 flex items-center justify-between group transition-all ${isApproved ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase text-slate-800 leading-tight">{preCourse?.nombre || preCode}</span>
                               <span className="text-[8px] font-mono text-slate-400">ID: {preCode}</span>
                             </div>
                             {isApproved ? <CheckCircle className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-slate-300" />}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic bg-slate-50 p-4 rounded-2xl border border-dashed text-center">Sin prerrequisitos</p>
                    )}
                  </div>
               </div>

               {/* Post-requisites (Subsequent courses) */}
               <div className="space-y-6">
                  <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                    <ArrowRight className="w-4 h-4" /> Habilita a (Después)
                  </h4>
                  <div className="space-y-3">
                    {getPostRequisites(selectedCourse.codigo).length > 0 ? (
                      getPostRequisites(selectedCourse.codigo).map(post => (
                        <div key={post.codigo} className="p-4 rounded-[1.5rem] border-2 border-indigo-50 bg-indigo-50/20 flex items-center justify-between group hover:border-indigo-300 transition-all">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-indigo-900 leading-tight">{post.nombre}</span>
                             <span className="text-[8px] font-mono text-indigo-300">ID: {post.codigo}</span>
                           </div>
                           <ArrowRight className="w-5 h-5 text-indigo-200 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic bg-slate-50 p-4 rounded-2xl border border-dashed text-center">Curso final de ruta</p>
                    )}
                  </div>
               </div>
            </div>

            {/* AI Recommendations Badges */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h4 className="font-black text-slate-800 flex items-center gap-4 uppercase text-xs tracking-[0.3em]">
                <Star className="w-6 h-6 text-yellow-500" />
                Recomendaciones Estratégicas
              </h4>
              <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-10 rounded-[3rem] italic border border-slate-100 shadow-sm relative">
                <div className="absolute top-4 left-4 text-indigo-100"><Sparkles className="w-8 h-8" /></div>
                {courseDescription.replace(/###|#|\*\*|---/g, '')}
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      <footer className="bg-slate-900 text-slate-500 py-24 px-8 text-center mt-auto border-t-8 border-indigo-600/20 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-left">
            <div className="flex items-center gap-4 mb-3">
              <GraduationCap className="w-8 h-8 text-yellow-400" />
              <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Asistente LILEI</p>
            </div>
            <p className="text-[11px] font-black tracking-[0.5em] opacity-30 uppercase">Universidad Nacional Abierta y a Distancia © 2024</p>
          </div>
          <div className="flex flex-wrap justify-center gap-16 text-[11px] font-black uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-yellow-400 transition-all hover:scale-110 active:scale-95">ECEDU Oficial</a>
            <a href="#" className="hover:text-yellow-400 transition-all hover:scale-110 active:scale-95">Consejería</a>
            <a href="#" className="hover:text-yellow-400 transition-all hover:scale-110 active:scale-95">Resolución 018456</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
