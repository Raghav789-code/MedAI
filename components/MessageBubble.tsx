
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
      <div className="text-center text-xs text-gray-500 my-2">{text}</div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-teal-400 rounded-full flex-shrink-0"></div>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-brand-green text-white rounded-br-none'
            : 'bg-white text-brand-gray-dark rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{text.replace(/^\*\s/gm, '- ')}</p>
      </div>
    </div>
  );
};
