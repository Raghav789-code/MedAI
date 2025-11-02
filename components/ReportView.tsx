import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft } from './icons/ArrowLeft';
import { Patient, Message, Consultation } from '../types';
import { checkMedicationInteractions } from '../services/geminiService';

const renderInlineMarkdown = (text: string): React.ReactNode => {
    if (!text.includes('**')) {
        return text;
    }

    return text.split(/(\*{2}.*?\*{2})/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = useMemo(() => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let listType: 'ul' | 'ol' | null = null;
        let listItems: React.ReactNode[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ul') {
                    elements.push(
                        <ul key={`ul-${elements.length}`} className="space-y-2 my-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 hover:bg-slate-50/80 hover:border-slate-300/50 transition-all duration-300">
                            {listItems}
                        </ul>
                    );
                } else if (listType === 'ol') {
                    elements.push(
                        <ol key={`ol-${elements.length}`} className="space-y-2 my-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50 hover:bg-slate-50/80 hover:border-slate-300/50 transition-all duration-300">
                            {listItems}
                        </ol>
                    );
                }
                listItems = [];
                listType = null;
            }
        };

        lines.forEach((line, index) => {
            if (line.startsWith('### ')) {
                flushList();
                elements.push(
                    <div key={index} className="relative group mt-8 mb-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent pb-2 border-b-2 border-gradient-to-r from-blue-400 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500">
                            {line.substring(4)}
                        </h3>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 w-0 group-hover:w-full transition-all duration-500" />
                    </div>
                );
            } else if (line.startsWith('- ')) {
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                }
                listItems.push(
                    <li key={index} className="flex items-start gap-3 py-1 group hover:translate-x-1 transition-transform duration-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 group-hover:scale-125 transition-transform duration-300" />
                        <span className="text-slate-700 group-hover:text-slate-800 transition-colors duration-300">{renderInlineMarkdown(line.substring(2))}</span>
                    </li>
                );
            } else if (/^\d+\.\s/.test(line)) {
                 if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                }
                listItems.push(
                    <li key={index} className="flex items-start gap-3 py-1 group hover:translate-x-1 transition-transform duration-300">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            {line.match(/^(\d+)/)?.[1]}
                        </div>
                        <span className="text-slate-700 group-hover:text-slate-800 transition-colors duration-300">{renderInlineMarkdown(line.substring(line.indexOf('.') + 2))}</span>
                    </li>
                );
            } else if (line.trim() === '---') {
                flushList();
                elements.push(
                    <div key={index} className="relative my-8 group">
                        <hr className="border-none h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                );
            } else if (line.trim() !== '') {
                flushList();
                elements.push(
                    <p key={index} className="my-3 text-slate-700 leading-relaxed hover:text-slate-800 hover:translate-x-0.5 transition-all duration-300 group cursor-pointer">
                        {renderInlineMarkdown(line)}
                    </p>
                );
            }
        });
        flushList();
        return elements;

    }, [content]);

    return <>{renderContent}</>;
};

const InteractionChecker: React.FC<{ currentMedications: string }> = ({ currentMedications }) => {
    const [newMedication, setNewMedication] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleCheck = async () => {
        setIsLoading(true);
        setResult('');
        try {
            const interactionResult = await checkMedicationInteractions(currentMedications, newMedication);
            setResult(interactionResult);
        } catch (error) {
            setResult('Error: Could not check for interactions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-6 rounded-3xl mt-8 border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden animate-fade-in">
            {/* Background Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-float group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.586-3H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
                    </svg>
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500">
                    Medication Interaction Checker
                </h4>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                <div className="flex-1 w-full relative group/input">
                    <input
                        type="text"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter new medication name..."
                        className="w-full p-4 bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-white/80 hover:border-white/60 transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium shadow-lg"
                        disabled={isLoading}
                    />
                    {/* Focus Indicator */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full ${
                        isFocused ? 'w-full' : 'w-0'
                    }`} />
                    
                    {/* Input Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 -translate-x-full group-hover/input:translate-x-full transition-transform duration-1000 rounded-2xl" />
                </div>
                
                <button
                    onClick={handleCheck}
                    disabled={isLoading || !newMedication.trim()}
                    className={`relative w-full sm:w-auto px-6 py-4 text-white font-bold rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn overflow-hidden ${
                        isLoading
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 cursor-not-allowed animate-pulse'
                            : newMedication.trim()
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25'
                                : 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed'
                    }`}
                >
                    {/* Button Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="relative z-10">Checking...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="relative z-10">Check Interactions</span>
                        </>
                    )}
                    
                    {/* Button Ripple */}
                    {newMedication.trim() && !isLoading && (
                        <div className="absolute inset-0 rounded-2xl border border-blue-400/20 group-hover/btn:animate-ping" />
                    )}
                </button>
            </div>
            
            {result && (
                <div className="mt-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg animate-fade-in relative overflow-hidden group/result">
                    {/* Result Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover/result:translate-x-full transition-transform duration-1000" />
                    
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h5 className="font-semibold text-slate-800">Interaction Analysis Results</h5>
                    </div>
                    
                    <div className="relative z-10">
                        <MarkdownRenderer content={result} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ConsultationHistory: React.FC<{ messages: Message[] }> = ({ messages }) => (
    <div className="space-y-6 pt-6">
        {messages.filter(msg => msg.sender !== 'system').map((msg, index) => (
            <div key={msg.id} className={`flex items-start gap-4 animate-fade-in group ${msg.sender === 'user' ? 'justify-end' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
                {msg.sender === 'ai' && (
                    <div className="relative group/avatar">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-float">
                            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse group-hover:opacity-60 transition-all duration-500" />
                        {/* Avatar Ripple */}
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 group-hover/avatar:animate-ping" />
                    </div>
                )}
                
                <div className={`relative max-w-lg p-5 shadow-xl backdrop-blur-sm border transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer group/message overflow-hidden ${
                    msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-700/90 hover:to-indigo-700/90 text-white rounded-3xl rounded-br-lg border-blue-500/30'
                        : 'bg-white/80 hover:bg-white/90 text-slate-800 rounded-3xl rounded-bl-lg border-white/40 hover:border-white/60'
                }`}>
                    {/* Message Shimmer */}
                    <div className={`absolute inset-0 bg-gradient-to-r -translate-x-full group-hover/message:translate-x-full transition-transform duration-1000 rounded-3xl ${
                        msg.sender === 'user' 
                            ? 'from-white/0 via-white/20 to-white/0'
                            : 'from-blue-500/0 via-blue-500/10 to-blue-500/0'
                    }`} />
                    
                    <div className="relative z-10">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed group-hover/message:translate-x-0.5 transition-transform duration-300">
                            {msg.text}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    msg.sender === 'user' ? 'bg-white/60' : 'bg-blue-400'
                                } animate-pulse`} />
                                <span className={`text-xs font-medium ${
                                    msg.sender === 'user' ? 'text-white/80' : 'text-slate-500'
                                }`}>
                                    {msg.sender === 'user' ? 'You' : 'MedAI'}
                                </span>
                            </div>
                            <p className={`text-xs font-medium ${
                                msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'
                            } group-hover/message:translate-x-1 transition-transform duration-300`}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </div>
                    
                    {/* Message Type Indicator */}
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                        msg.sender === 'user' ? 'bg-white/30' : 'bg-blue-400/30'
                    } animate-pulse`} />
                </div>
                
                {msg.sender === 'user' && (
                    <div className="relative group/user">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full blur-lg opacity-30 animate-pulse group-hover:opacity-60 transition-all duration-500" />
                        {/* User Ripple */}
                        <div className="absolute inset-0 rounded-full border-2 border-slate-400/20 group-hover/user:animate-ping" />
                    </div>
                )}
            </div>
        ))}
        
        {/* End of Conversation Indicator */}
        <div className="flex justify-center pt-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-lg animate-fade-in">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">End of consultation history</span>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
        </div>
    </div>
);


interface ReportViewProps {
  patient: Patient;
  consultation: Consultation;
  onBackToDashboard: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ patient, consultation, onBackToDashboard }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');

    const currentMedications = useMemo(() => {
        const medsSection = consultation.report.split('### 4. Current Medications')[1]?.split('###')[0];
        return medsSection ? medsSection.split('\n').filter(line => line.startsWith('- ')).map(line => line.substring(2).trim()).join(', ') : '';
    }, [consultation.report]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
        }, 100);
    };
    
    useEffect(() => {
        const afterPrint = () => setIsPrinting(false);
        window.addEventListener('afterprint', afterPrint);
        return () => window.removeEventListener('afterprint', afterPrint);
    }, []);

    const dateFormatter = useMemo(() => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Custom Scrollbar & Animation Styles */}
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
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #report-content-wrapper, #report-content-wrapper * {
                        visibility: visible;
                    }
                    #report-content-wrapper {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 1rem;
                        border: none;
                        box-shadow: none;
                        border-radius: 0;
                        background: white !important;
                        backdrop-filter: none !important;
                    }
                }
            `}</style>

            <div className="flex flex-col h-screen relative z-10">
                {/* Enhanced Header */}
                <header className={`flex items-center justify-between p-5 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50 transition-all duration-500 ${isPrinting ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBackToDashboard}
                            className="p-3 text-slate-600 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/50 hover:scale-110 hover:shadow-lg group"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        </button>
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                Medical Report: {patient.name}
                            </h1>
                            <p className="text-slate-600 text-sm font-medium">
                                Consultation: {dateFormatter.format(new Date(consultation.date))}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
                        title="Print Report"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                </header>
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-5xl mx-auto animate-fade-in" id="report-content-wrapper">
                        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
                            
                            {consultation.reportHighlights && (
                                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border-l-4 border-emerald-400 rounded-2xl shadow-lg animate-fade-in">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center animate-float">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-emerald-800">Key Highlights</h2>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-emerald-700">
                                        <MarkdownRenderer content={consultation.reportHighlights} />
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Tabs */}
                            <div className="border-b border-slate-200/60 mb-6">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button 
                                        onClick={() => setActiveTab('summary')} 
                                        className={`relative whitespace-nowrap py-4 px-1 font-semibold text-sm transition-all duration-300 ${
                                            activeTab === 'summary' 
                                                ? 'text-blue-700 border-b-2 border-blue-500' 
                                                : 'text-slate-500 hover:text-slate-700 hover:scale-105'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Report Summary
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('history')} 
                                        className={`relative whitespace-nowrap py-4 px-1 font-semibold text-sm transition-all duration-300 ${
                                            activeTab === 'history' 
                                                ? 'text-blue-700 border-b-2 border-blue-500' 
                                                : 'text-slate-500 hover:text-slate-700 hover:scale-105'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Consultation History
                                        </span>
                                    </button>
                                </nav>
                            </div>
                            
                            {/* Content Area */}
                            <div id="report-content" className="animate-fade-in">
                                {activeTab === 'summary' && (
                                    <>
                                        {consultation.report ? (
                                            <>
                                                <div className="prose max-w-none">
                                                    <MarkdownRenderer content={consultation.report} />
                                                </div>
                                                <InteractionChecker currentMedications={currentMedications} />
                                            </>
                                        ) : (
                                            <div className="text-center py-16">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-500 text-lg font-medium">Generating Report...</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {activeTab === 'history' && <ConsultationHistory messages={consultation.messages} />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};