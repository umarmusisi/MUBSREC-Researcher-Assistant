export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  feedback?: 'up' | 'down' | null;
}

export interface QuickTopic {
  id: string;
  label: string;
  query: string;
  iconName: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: 'Protocol' | 'Consent' | 'Review' | 'Reporting';
  description: string;
  fileFormat: string;
  downloadUrl?: string;
  contentSnippet: string;
}

export interface FeeStructure {
  category: string;
  applicantType: string;
  amountUGX: string;
  amountUSD?: string;
  notes: string;
}

export interface ManagedDocument {
  id: string;
  title: string;
  category: 'Protocol' | 'Consent' | 'Checklist' | 'Fee Schedule' | 'Guidelines' | 'Other';
  description: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  downloadCount: number;
  url: string;
  isOfficial: boolean;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: 'General' | 'Submission' | 'Review Process' | 'Fees & Banking' | 'Post-Approval' | 'Contacts';
  keywords: string[];
  content: string;
  lastUpdated: string;
  author: string;
}
