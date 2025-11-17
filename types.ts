export type Page = 'chat' | 'image-lab' | 'file-analysis' | 'settings';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: string;
  prompt?: string; // The original prompt, used for "copy prompt" on image results
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}

export type ChatHistories = {
  [K in Page]?: Message[];
};

export interface User {
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  password?: string; // Will be undefined for Google sign-in users for security
}