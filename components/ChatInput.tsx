import React, { useState, useRef } from 'react';
import { Paperclip } from './icons/Paperclip';
import { Send } from './icons/Send';
import { Mic } from './icons/Mic';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onFileAttach: (file: File) => void;
  onToggleLive: () => void;
  isLive: boolean;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFileAttach, onToggleLive, isLive, disabled }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileAttach(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group">
        {/* Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl" />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={disabled || isLive}
        />
        
        {/* File Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative p-3 text-slate-600 hover:text-blue-600 transition-all duration-300 rounded-2xl hover:bg-white/50 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 group/attach overflow-hidden"
          disabled={disabled || isLive}
          title="Attach PDF, JPG, or PNG report"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-full group-hover/attach:translate-x-full transition-transform duration-500" />
          <Paperclip className="w-5 h-5 group-hover/attach:rotate-12 group-hover/attach:scale-110 transition-all duration-300 relative z-10" />
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-2xl border border-blue-400/20 group-hover/attach:animate-ping" />
        </button>
        
        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full p-4 bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 text-sm font-medium"
            disabled={disabled || isLive}
          />
          {/* Focus Indicator */}
          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
            isFocused ? 'w-full' : 'w-0'
          }`} />
          
          {/* Typing Indicator */}
          {text && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        
        {/* Voice Button */}
        <button
          type="button"
          onClick={onToggleLive}
          className={`relative p-3 text-white rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100 group/mic overflow-hidden ${
            isLive 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse shadow-lg shadow-red-500/25' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
          }`}
          disabled={disabled && !isLive}
          title={isLive ? "Stop voice chat" : "Start voice chat"}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/mic:translate-x-full transition-transform duration-700" />
          <Mic className={`w-5 h-5 transition-all duration-300 relative z-10 ${
            isLive ? 'animate-pulse scale-110' : 'group-hover/mic:scale-125'
          }`} />
          {/* Mic Ripple */}
          {isLive && (
            <div className="absolute inset-0 rounded-2xl border-2 border-red-400/50 animate-ping" />
          )}
        </button>
        
        {/* Send Button */}
        <button
          type="submit"
          className={`relative p-3 text-white rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl group/send overflow-hidden ${
            text.trim() && !disabled && !isLive
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              : 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed'
          }`}
          disabled={!text.trim() || disabled || isLive}
          title="Send Message"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/send:translate-x-full transition-transform duration-700" />
          <Send className="w-5 h-5 group-hover/send:translate-x-0.5 group-hover/send:scale-110 transition-all duration-300 relative z-10" />
          {/* Send Ripple */}
          {text.trim() && !disabled && !isLive && (
            <div className="absolute inset-0 rounded-2xl border border-blue-400/20 group-hover/send:animate-ping" />
          )}
        </button>
      </div>
    </form>
  );
};