
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, text } = message;
  const isUser = sender === 'user';
  const isSystem = sender === 'system';

  if (isSystem) {
    return (
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm text-slate-600 px-4 py-2 rounded-full text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="relative">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300" />
            <div className="absolute inset-0 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-50" />
          </div>
          <span className="group-hover:translate-x-0.5 transition-transform duration-300">{text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 animate-fade-in group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="relative group/avatar">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 cursor-pointer">
            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse group-hover:opacity-60 group-hover:blur-2xl transition-all duration-500" />
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 group-hover/avatar:animate-ping" />
        </div>
      )}
      
      <div className={`relative max-w-xs md:max-w-md lg:max-w-lg px-5 py-4 shadow-xl backdrop-blur-sm border transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer group/bubble overflow-hidden ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-3xl rounded-br-lg border-blue-500/30'
            : 'bg-white/80 hover:bg-white/90 text-slate-800 rounded-3xl rounded-bl-lg border-white/40 hover:border-white/60'
        }`}
      >
        {/* Shimmer Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r -translate-x-full group-hover/bubble:translate-x-full transition-transform duration-1000 ${
          isUser 
            ? 'from-white/0 via-white/20 to-white/0'
            : 'from-blue-500/0 via-blue-500/10 to-blue-500/0'
        }`} />
        
        {/* Typing Effect for AI Messages */}
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-300">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap leading-relaxed relative z-10 group-hover/bubble:translate-x-0.5 transition-transform duration-300">
          {text.replace(/^\*\s/gm, '- ')}
        </p>
      </div>
      
      {isUser && (
        <div className="relative group/user">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 cursor-pointer">
            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full blur-lg opacity-30 animate-pulse group-hover:opacity-60 transition-all duration-500" />
          {/* User Ripple Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-400/20 group-hover/user:animate-ping" />
        </div>
      )}
    </div>
  );
};
