export interface Snippet {
  source: string;
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: string[];
  snippets?: Snippet[];
  time: string;
  error?: boolean;
  feedback?: 'up' | 'down';
}

export interface ApiResponse {
  answer?: string;
  sources?: string[];
  snippets?: Snippet[];
  error?: string;
}
