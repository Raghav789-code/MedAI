export type Sender = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
}

export type View = 'chat' | 'report' | 'dashboard';

export interface Consultation {
  date: string;
  messages: Message[];
  files: File[];
  report: string;
  reportHighlights?: string;
}

export interface Patient {
    id: string;
    name: string;
    consultations: Consultation[];
}