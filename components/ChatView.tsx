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
    <div className="flex flex-col h-full bg-brand-green-light">
      <ChatHeader onNewChat={handleStartChat} onBackToDashboard={onBackToDashboard} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
        {isAiTyping && !isLive && <TypingIndicator />}
        {isLive && <div className="text-center text-sm text-red-500 animate-pulse">Recording...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        {showReportButton && (
          <GenerateReportButton 
            onClick={() => onGenerateReport(messages, attachedFiles)} 
            isLoading={isGeneratingReport} 
          />
        )}
        <ChatInput onSendMessage={handleSendMessage} onFileAttach={handleFileAttach} onToggleLive={handleToggleLive} isLive={isLive} disabled={isAiTyping || isGeneratingReport} />
      </div>
    </div>
  );
};