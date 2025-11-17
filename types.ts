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
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}