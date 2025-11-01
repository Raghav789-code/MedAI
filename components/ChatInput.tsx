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
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        disabled={disabled || isLive}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-brand-gray hover:text-brand-green-dark transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50"
        disabled={disabled || isLive}
        title="Attach PDF, JPG, or PNG report"
      >
        <Paperclip className="w-6 h-6" />
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green transition"
        disabled={disabled || isLive}
      />
       <button
        type="button"
        onClick={onToggleLive}
        className={`p-3 text-white rounded-full transition-colors ${isLive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-brand-green hover:bg-brand-green-dark'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400`}
        disabled={disabled && !isLive}
        title={isLive ? "Stop voice chat" : "Start voice chat"}
      >
        <Mic className="w-6 h-6" />
      </button>
      <button
        type="submit"
        className="p-3 bg-brand-green text-white rounded-full hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400 transition-colors"
        disabled={!text.trim() || disabled || isLive}
        title="Send Message"
      >
        <Send className="w-6 h-6" />
      </button>
    </form>
  );
};