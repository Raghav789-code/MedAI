import React from 'react';
import { RefreshCw } from './icons/RefreshCw';
import { ArrowLeft } from './icons/ArrowLeft';

interface ChatHeaderProps {
  onNewChat: () => void;
  onBackToDashboard: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onBackToDashboard }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
         <button 
          onClick={onBackToDashboard}
          className="p-2 text-brand-gray hover:text-brand-green-dark transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-teal-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12_8v4l2_1"/><path d="M12_12h4"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-brand-gray-dark">New Patient Consultation</h1>
          <p className="text-sm text-green-500 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            Aida is active
          </p>
        </div>
      </div>
      <button 
        onClick={onNewChat}
        className="p-2 text-brand-gray hover:text-brand-green-dark transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
        title="Start New Chat"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </header>
  );
};