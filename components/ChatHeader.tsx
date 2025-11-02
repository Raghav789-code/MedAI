import React from 'react';
import { RefreshCw } from './icons/RefreshCw';
import { ArrowLeft } from './icons/ArrowLeft';

interface ChatHeaderProps {
  onNewChat: () => void;
  onBackToDashboard: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onBackToDashboard }) => {
  return (
    <header className="relative flex items-center justify-between p-5 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg overflow-hidden group">
      {/* Animated Background Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="flex items-center gap-4 relative z-10">
         <button 
          onClick={onBackToDashboard}
          className="relative p-3 text-slate-600 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/50 hover:scale-110 hover:shadow-lg group/btn overflow-hidden"
          title="Back to Dashboard"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
          <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 group-hover/btn:scale-110 transition-all duration-300 relative z-10" />
        </button>
        
        <div className="relative group/avatar cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-float group-hover/avatar:scale-110 group-hover/avatar:rotate-3 transition-all duration-500">
            <svg className="w-6 h-6 text-white group-hover/avatar:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse group-hover/avatar:opacity-60 group-hover/avatar:blur-2xl transition-all duration-500" />
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping group-hover/avatar:border-blue-500/50" />
        </div>
        
        <div className="group/text cursor-pointer">
          <h1 className="text-xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent group-hover/text:from-blue-600 group-hover/text:to-purple-600 transition-all duration-500 group-hover/text:scale-105">
            AI Consultation
          </h1>
          <div className="flex items-center gap-2 group-hover/text:translate-x-1 transition-transform duration-300">
            <div className="relative">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse group-hover/text:bg-blue-600 group-hover/text:scale-125 transition-all duration-300 block"></span>
              <span className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></span>
            </div>
            <p className="text-sm text-blue-600 font-medium group-hover/text:text-blue-700 transition-colors duration-300">
              MedAI Assistant Active
            </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onNewChat}
        className="relative p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group/refresh overflow-hidden"
        title="Start New Chat"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/refresh:translate-x-full transition-transform duration-700" />
        <RefreshCw className="w-5 h-5 group-hover/refresh:rotate-180 group-hover/refresh:scale-110 transition-all duration-500 relative z-10" />
        {/* Button Ripple */}
        <div className="absolute inset-0 rounded-xl border border-white/20 group-hover/refresh:animate-ping" />
      </button>
    </header>
  );
};