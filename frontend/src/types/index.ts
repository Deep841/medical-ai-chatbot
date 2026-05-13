export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: string[];
  time: string;
  error?: boolean;
}

export interface ApiResponse {
  answer?: string;
  sources?: string[];
  error?: string;
}
