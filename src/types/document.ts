export type DocumentStatus = 'Draft' | 'Active' | 'Archived';

export interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  owner: string;
  lastEdited: string;
  status: DocumentStatus;
  tags?: string[];
  wordCount?: number;
}

export interface OutlineItem {
  id: string;
  title: string;
  level: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
