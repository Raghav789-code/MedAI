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
    <div className="bg-brand-gray-light font-sans w-full h-screen flex flex-col items-center justify-center">
      <main className="w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {renderView()}
        {error && <div className="absolute bottom-5 bg-red-500 text-white p-3 rounded-lg shadow-lg animate-pulse">{error}</div>}
      </main>
    </div>
  );
};

export default App;