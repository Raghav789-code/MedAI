import React, { useState, useCallback } from 'react';
import { ChatView } from './components/ChatView';
import { ReportView } from './components/ReportView';
import { DashboardView } from './components/DashboardView';
import { Message, View, Patient, Consultation } from './types';
import { generateReport, generateReportHighlights, extractPatientName } from './services/geminiService';
import { MOCK_PATIENTS } from './mockData';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [activeState, setActiveState] = useState<{ patient: Patient, consultation: Consultation } | null>(null);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateReport = useCallback(async (messages: Message[], files: File[]) => {
    setIsLoadingReport(true);
    setError('');
    try {
      const patientName = await extractPatientName(messages);
      const reportContent = await generateReport(messages, files);
      const highlights = await generateReportHighlights(reportContent);
      
      const newConsultation: Consultation = {
        date: new Date().toISOString(),
        messages,
        files,
        report: reportContent,
        reportHighlights: highlights,
      };

      const existingPatient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());

      if (existingPatient) {
        const updatedPatient = {
          ...existingPatient,
          consultations: [newConsultation, ...existingPatient.consultations],
        };
        setPatients(prev => prev.map(p => p.id === existingPatient.id ? updatedPatient : p));
        setActiveState({ patient: updatedPatient, consultation: newConsultation });
      } else {
        const newPatient: Patient = {
          id: `patient_${Date.now()}`,
          name: patientName || `Patient #${patients.length + 1}`,
          consultations: [newConsultation],
        };
        setPatients(prev => [newPatient, ...prev]);
        setActiveState({ patient: newPatient, consultation: newConsultation });
      }

      setView('report');
    } catch (err) {
      setError('Failed to generate the report. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingReport(false);
    }
  }, [patients]);

  const handleNavigateToDashboard = useCallback(() => {
    setView('dashboard');
    setActiveState(null);
  }, []);

  const handleNavigateToChat = useCallback(() => {
    setView('chat');
  }, []);

  const handleNavigateToReport = useCallback((patientId: string, consultationDate: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      const consultation = patient.consultations.find(c => c.date === consultationDate);
      if (consultation) {
        setActiveState({ patient, consultation });
        setView('report');
      }
    }
  }, [patients]);

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return <DashboardView patients={patients} onNewChat={handleNavigateToChat} onViewReport={handleNavigateToReport} />;
      case 'chat':
        return <ChatView onGenerateReport={handleGenerateReport} isGeneratingReport={isLoadingReport} onBackToDashboard={handleNavigateToDashboard} />;
      case 'report':
        return activeState ? <ReportView patient={activeState.patient} consultation={activeState.consultation} onBackToDashboard={handleNavigateToDashboard} /> : <DashboardView patients={patients} onNewChat={handleNavigateToChat} onViewReport={handleNavigateToReport} />;
      default:
        return <DashboardView patients={patients} onNewChat={handleNavigateToChat} onViewReport={handleNavigateToReport} />;
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden">
      {/* Global Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Global Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
          margin: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #4f46e5, #7c3aed);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>

      <main className="relative z-10 w-full h-screen flex flex-col overflow-hidden">
        {renderView()}
        
        {/* Enhanced Error Toast */}
        {error && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-red-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400/30 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;