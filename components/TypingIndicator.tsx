
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-teal-400 rounded-full flex-shrink-0"></div>
      <div className="bg-white px-4 py-3 rounded-2xl shadow-md rounded-bl-none flex items-center space-x-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};
