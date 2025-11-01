import React, { useState, useMemo } from 'react';
import { Patient } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  onNewChat: () => void;
  onViewReport: (patientId: string, consultationDate: string) => void;
}

const PatientCard: React.FC<{ patient: Patient; onViewReport: (id: string, date: string) => void }> = ({ patient, onViewReport }) => {
    const latestConsultation = patient.consultations[0];

    const formattedDate = useMemo(() => {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(latestConsultation.date));
    }, [latestConsultation.date]);
    
    const formattedTime = useMemo(() => {
        return new Intl.DateTimeFormat('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(latestConsultation.date));
    }, [latestConsultation.date]);

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col justify-between p-5">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-brand-gray-dark">{patient.name}</h3>
                    <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Report Ready
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formattedDate} - {formattedTime}</p>
                {latestConsultation.reportHighlights && (
                    <div className="mt-3 text-sm text-gray-600 border-l-2 border-brand-green-light pl-3">
                       {latestConsultation.reportHighlights.split('\n').filter(line => line.trim().startsWith('-')).map((line, index) => (
                           <p key={index} className="truncate">{line.substring(1).trim()}</p>
                       ))}
                    </div>
                )}
            </div>
            <div className="mt-4 text-right">
                <button
                    onClick={() => onViewReport(patient.id, latestConsultation.date)}
                    className="px-4 py-2 text-sm bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors"
                >
                    View Report
                </button>
            </div>
        </div>
    );
};


export const DashboardView: React.FC<DashboardViewProps> = ({ patients, onNewChat, onViewReport }) => {
  const [filter, setFilter] = useState('');
  
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patients, filter]);
  
  return (
    <div className="flex flex-col h-full bg-brand-gray-light">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-brand-gray-dark">Doctor's Dashboard</h1>
        <button
          onClick={onNewChat}
          className="px-4 py-2 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          <span>New Consultation</span>
        </button>
      </header>
      
      <div className="p-4 md:p-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by patient name..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} onViewReport={onViewReport} />
                ))}
            </div>
        ) : (
            <div className="text-center p-8 text-gray-500">
                <p>No patient records found.</p>
            </div>
        )}
      </div>
    </div>
  );
};