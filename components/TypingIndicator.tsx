
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-3 justify-start animate-fade-in group">
      {/* AI Avatar with Enhanced Effects */}
      <div className="relative group/avatar">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
          <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse" />
        {/* Thinking Ripples */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
        <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Enhanced Typing Bubble */}
      <div className="relative bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-bl-lg shadow-xl border border-white/40 group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Typing Animation */}
        <div className="flex items-center space-x-2 relative z-10">
          <span className="text-xs text-slate-600 font-medium mr-2">AI is thinking</span>
          <div className="flex space-x-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
        
        {/* Pulse Indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
