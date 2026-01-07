export interface Document {
  id: number;
  userId: number;
  title: string;
  content: string;
  originalUrl?: string | null;
  contentType: 'url' | 'pdf' | 'text';
  readingTime?: number | null;
  isRead: number;
  readingProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: number;
  documentId: number;
  userId: number;
  text: string;
  color: 'yellow' | 'red' | 'green';
  startOffset: number;
  endOffset: number;
  createdAt: Date;
}

export interface Note {
  id: number;
  documentId: number;
  userId: number;
  content: string;
  offset: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
}
