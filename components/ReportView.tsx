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
                    elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
                } else if (listType === 'ol') {
                    elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>);
                }
                listItems = [];
                listType = null;
            }
        };

        lines.forEach((line, index) => {
            if (line.startsWith('### ')) {
                flushList();
                elements.push(<h3 key={index} className="text-xl font-semibold text-brand-green-dark mt-6 mb-2 pb-1 border-b-2 border-brand-green-light">{line.substring(4)}</h3>);
            } else if (line.startsWith('- ')) {
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                }
                listItems.push(<li key={index}>{renderInlineMarkdown(line.substring(2))}</li>);
            } else if (/^\d+\.\s/.test(line)) {
                 if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                }
                listItems.push(<li key={index}>{renderInlineMarkdown(line.substring(line.indexOf('.') + 2))}</li>);
            } else if (line.trim() === '---') {
                flushList();
                elements.push(<hr key={index} className="my-4"/>);
            } else if (line.trim() !== '') {
                flushList();
                elements.push(<p key={index} className="my-1 text-gray-700">{renderInlineMarkdown(line)}</p>);
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
        <div className="bg-brand-green-light p-4 rounded-lg mt-6">
            <h4 className="text-lg font-semibold text-brand-gray-dark mb-2">Medication Interaction Checker</h4>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Enter new medication name..."
                    className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                    disabled={isLoading}
                />
                <button
                    onClick={handleCheck}
                    disabled={isLoading || !newMedication.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-green text-white font-semibold rounded-md hover:bg-brand-green-dark disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? 'Checking...' : 'Check Interactions'}
                </button>
            </div>
            {result && (
                <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                    <MarkdownRenderer content={result} />
                </div>
            )}
        </div>
    );
};

const ConsultationHistory: React.FC<{ messages: Message[] }> = ({ messages }) => (
    <div className="space-y-4 pt-4">
        {messages.filter(msg => msg.sender !== 'system').map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                 {msg.sender === 'ai' && <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-teal-400 rounded-full flex-shrink-0"></div>}
                <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1 text-right">{msg.timestamp}</p>
                </div>
            </div>
        ))}
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
        <div className="flex flex-col h-full bg-gray-50">
            <header className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 ${isPrinting ? 'hidden' : ''}`}>
                <div className="flex items-center space-x-2">
                     <button
                        onClick={onBackToDashboard}
                        className="p-2 text-brand-gray hover:text-brand-green-dark transition-colors rounded-full hover:bg-gray-100"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-brand-gray-dark">Doctor's Summary: {patient.name}</h1>
                        <p className="text-sm text-gray-500">Consultation Date: {dateFormatter.format(new Date(consultation.date))}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrint}
                        className="p-2 text-brand-gray hover:text-brand-green-dark transition-colors rounded-full hover:bg-gray-100"
                        title="Print Report"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto" id="report-content-wrapper">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        
                        {consultation.reportHighlights && (
                            <div className="mb-8 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
                                <h2 className="text-lg font-bold text-teal-800 mb-2">Key Highlights</h2>
                                <div className="prose prose-sm max-w-none text-teal-700">
                                    <MarkdownRenderer content={consultation.reportHighlights} />
                                </div>
                            </div>
                        )}

                        <div className="border-b border-gray-200 mb-4">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-brand-green text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Report Summary
                                </button>
                                <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-brand-green text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Consultation History
                                </button>
                            </nav>
                        </div>
                        
                        <div id="report-content">
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
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">Generating Report...</p>
                                        </div>
                                    )}
                                </>
                            )}
                             {activeTab === 'history' && <ConsultationHistory messages={consultation.messages} />}
                        </div>
                    </div>
                </div>
            </main>
             <style>{`
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
                    }
                }
            `}</style>
        </div>
    );
};