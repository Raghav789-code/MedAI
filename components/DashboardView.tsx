import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Patient } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  onNewChat: () => void;
  onViewReport: (patientId: string, consultationDate: string) => void;
}

const PatientCard: React.FC<{ patient: Patient; onViewReport: (id: string, date: string) => void; index: number }> = ({ patient, onViewReport, index }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const latestConsultation = patient.consultations[0];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 150);
        return () => clearTimeout(timer);
    }, [index]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
    };

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
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
            className={`group relative overflow-hidden rounded-3xl transition-all duration-700 ease-out cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg) translateZ(0)`,
                transition: 'transform 0.1s ease-out'
            }}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200/50 group-hover:animate-pulse" />
            
            <div className="relative p-8 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-700 transition-colors duration-300 group-hover:translate-x-1">
                                {patient.name}
                            </h3>
                            <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-all duration-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                {formattedDate} • {formattedTime}
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 group-hover:bg-emerald-200/80 group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500 shadow-lg">
                            ✓ Report Ready
                        </span>
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    </div>
                </div>
                
                {latestConsultation.reportHighlights && (
                    <div className="relative mb-6 p-5 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border-l-4 border-blue-400 group-hover:border-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-50/80 group-hover:to-indigo-50/80 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                        <div className="space-y-3">
                            {latestConsultation.reportHighlights.split('\n').filter(line => line.trim().startsWith('-')).slice(0, 2).map((line, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 group-hover:text-slate-800 transition-all duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 group-hover:scale-150 transition-transform duration-300" />
                                    <span className="leading-relaxed group-hover:translate-x-1 transition-transform duration-300">{line.substring(1).trim()}</span>
                                </div>
                            ))}
                            {latestConsultation.reportHighlights.split('\n').filter(line => line.trim().startsWith('-')).length > 2 && (
                                <div className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300 font-medium">
                                    +{latestConsultation.reportHighlights.split('\n').filter(line => line.trim().startsWith('-')).length - 2} more insights
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <button
                    onClick={() => onViewReport(patient.id, latestConsultation.date)}
                    className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <svg className="w-5 h-5 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="relative z-10">View Report</span>
                    <div className="absolute right-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 translate-x-2 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ patients, onNewChat, onViewReport }) => {
  const [filter, setFilter] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => new Date(b.consultations[0]?.date || 0).getTime() - new Date(a.consultations[0]?.date || 0).getTime());
  }, [patients, filter]);
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div 
          className="absolute w-4 h-4 bg-blue-400/30 rounded-full blur-sm transition-all duration-300 ease-out"
          style={{
            left: mousePos.x * 0.02,
            top: mousePos.y * 0.02,
          }}
        />
        <div 
          className="absolute w-2 h-2 bg-indigo-500/40 rounded-full blur-sm transition-all duration-500 ease-out"
          style={{
            left: mousePos.x * 0.05,
            top: mousePos.y * 0.05,
          }}
        />
      </div>

      {/* Custom Scrollbar & Animations */}
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
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
      
      {/* Header */}
      <header className={`relative flex items-center justify-between p-5 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative animate-float">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-500">
              MedAI Dashboard
            </h1>
            <p className="text-slate-600 text-sm font-medium hover:text-slate-700 transition-colors duration-300">Healthcare Management</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="relative px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative z-10">New Consultation</span>
        </button>
      </header>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 px-8 pb-8 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
        {/* Stats Section */}
        <div className={`py-4 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { title: 'Total Patients', value: patients.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'blue' },
              { title: "Today's Visits", value: patients.filter(p => {
                const today = new Date().toDateString();
                return p.consultations.some(c => new Date(c.date).toDateString() === today);
              }).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
              { title: 'Total Reports', value: patients.reduce((total, patient) => total + patient.consultations.length, 0), icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'indigo' }
            ].map((stat, index) => (
              <div key={stat.title} className={`relative group bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-${stat.color}-500/25 hover:scale-105 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className={`text-slate-600 text-xs font-bold group-hover:text-${stat.color}-700 transition-colors duration-300`}>{stat.title}</p>
                    <p className={`text-2xl font-black text-slate-800 group-hover:text-${stat.color}-700 transition-all duration-300 group-hover:scale-110`}>{stat.value}</p>
                  </div>
                  <div className={`bg-${stat.color}-100 p-2 rounded-xl group-hover:bg-${stat.color}-200 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <svg className={`w-5 h-5 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced Search Bar */}
          <div className={`relative group mb-4 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search patients by name..."
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 text-sm font-medium"
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="pb-4">
          {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {filteredPatients.map((patient, index) => (
                      <PatientCard key={patient.id} patient={patient} onViewReport={onViewReport} index={index} />
                  ))}
              </div>
          ) : (
              <div className={`flex flex-col items-center justify-center min-h-96 text-center p-8 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <div className="relative mb-6 animate-float">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-200 via-blue-200 to-indigo-300 rounded-full flex items-center justify-center shadow-xl animate-glow">
                          <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-xl animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3 hover:text-slate-800 transition-colors duration-300">No patients found</h3>
                  <p className="text-slate-500 mb-6 hover:text-slate-600 transition-colors duration-300">Start your first consultation to see patient records here</p>
                  <button
                      onClick={onNewChat}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1"
                  >
                      Start First Consultation
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};