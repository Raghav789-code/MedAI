import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';
import { getAiResponse, startLiveSession, sendLiveAudio, stopLiveSession } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { GenerateReportButton } from './GenerateReportButton';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface ChatViewProps {
  onGenerateReport: (messages: Message[], files: File[]) => void;
  isGeneratingReport: boolean;
  onBackToDashboard: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ onGenerateReport, isGeneratingReport, onBackToDashboard }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(true);
  const [showReportButton, setShowReportButton] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLive, setIsLive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isAiTyping]);
  
  const handleStartChat = useCallback(async () => {
    setMessages([]);
    setAttachedFiles([]);
    setShowReportButton(false);
    setIsAiTyping(true);
    const firstMessage = await getAiResponse([], "Hello");
    setMessages([{
      id: Date.now().toString(),
      sender: 'ai',
      text: firstMessage,
      timestamp: new Date().toLocaleTimeString(),
    }]);
    setIsAiTyping(false);
  }, []);

  useEffect(() => {
    handleStartChat();
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    const aiResponseText = await getAiResponse(messages, text);
    if (aiResponseText.toLowerCase().includes("generate report")) {
        setShowReportButton(true);
    }
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsAiTyping(false);
  };

  const handleFileAttach = (file: File) => {
    setAttachedFiles(prev => [...prev, file]);
    const systemMessage: Message = {
        id: Date.now().toString(),
        sender: 'system',
        text: `You attached: ${file.name}`,
        timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const processLiveMessage = async (message: LiveServerMessage) => {
      if (message.serverContent?.outputTranscription) {
          currentOutputTranscription.current += message.serverContent.outputTranscription.text;
      }
      if (message.serverContent?.inputTranscription) {
          currentInputTranscription.current += message.serverContent.inputTranscription.text;
      }

      if (message.serverContent?.turnComplete) {
          let updatedMessages: Message[] = [];
          if (currentInputTranscription.current) {
              const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: currentInputTranscription.current, timestamp: new Date().toLocaleTimeString() };
              updatedMessages.push(userMessage);
          }
          if (currentOutputTranscription.current) {
               if (currentOutputTranscription.current.toLowerCase().includes("generate report")) {
                  setShowReportButton(true);
               }
              const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: currentOutputTranscription.current, timestamp: new Date().toLocaleTimeString() };
              updatedMessages.push(aiMessage);
          }
          if(updatedMessages.length > 0) {
            setMessages(prev => [...prev, ...updatedMessages]);
          }
          currentInputTranscription.current = '';
          currentOutputTranscription.current = '';
      }
      
      const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
      if (base64EncodedAudioString && outputAudioContextRef.current) {
          nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
          const source = outputAudioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContextRef.current.destination);
          source.addEventListener('ended', () => { sources.delete(source); });
          source.start(nextStartTime);
          nextStartTime = nextStartTime + audioBuffer.duration;
          sources.add(source);
      }
      const interrupted = message.serverContent?.interrupted;
      if (interrupted) {
          for (const source of sources.values()) {
              source.stop();
              sources.delete(source);
          }
          nextStartTime = 0;
      }
  };

  const handleToggleLive = async () => {
    if (isLive) { // Stop session
        if (scriptProcessorRef.current) {
          scriptProcessorRef.current.disconnect();
          scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        if(audioContextRef.current) {
           await audioContextRef.current.close();
           audioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        await stopLiveSession();
        setIsLive(false);
    } else { // Start session
        try {
            // Fix: Cast window to `any` to access vendor-prefixed `webkitAudioContext` for broader browser support.
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // Fix: Cast window to `any` to access vendor-prefixed `webkitAudioContext` for broader browser support.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = startLiveSession({
                onopen: () => {
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        sessionPromiseRef.current?.then(() => sendLiveAudio(inputData));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: processLiveMessage,
                onerror: (e) => console.error(e),
                onclose: () => console.log('Session closed'),
            });
            setIsLive(true);
        } catch (error) {
            console.error('Failed to start live session:', error);
        }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Custom Scrollbar Styles */}
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
      `}</style>

      <div className="flex flex-col h-screen relative z-10">
        {/* Enhanced Header */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
          <ChatHeader onNewChat={handleStartChat} onBackToDashboard={onBackToDashboard} />
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={msg.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <MessageBubble message={msg} />
              </div>
            ))}
            {isAiTyping && !isLive && (
              <div className="flex justify-start">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30 animate-pulse">
                  <TypingIndicator />
                </div>
              </div>
            )}
            {isLive && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                  <span className="font-semibold">Recording Live Session...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Enhanced Input Area */}
        <div className="bg-white/70 backdrop-blur-xl border-t border-white/20 shadow-lg p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {showReportButton && (
              <div className="animate-fade-in">
                <GenerateReportButton 
                  onClick={() => onGenerateReport(messages, attachedFiles)} 
                  isLoading={isGeneratingReport} 
                />
              </div>
            )}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              onFileAttach={handleFileAttach} 
              onToggleLive={handleToggleLive} 
              isLive={isLive} 
              disabled={isAiTyping || isGeneratingReport} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};