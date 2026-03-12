export type ConversationType = 'direct' | 'group' | 'workflow';
export type UserStatus = 'online' | 'away' | 'offline';
export type MessageType = 'text' | 'system' | 'file';

export interface ChatUser {
  id: string;
  cflow_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status?: UserStatus;
  last_seen?: string;
  role?: string;
  muted?: boolean;
}

export interface Conversation {
  id: string;
  type?: ConversationType;
  name?: string;
  title?: string;          // v1 compat
  workflow_id?: string;
  avatar_url?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  unread_count?: number;
  participants?: ChatUser[];
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  type?: MessageType;
  message: string;
  metadata?: any;
  created_at: string;
  sender?: Partial<ChatUser>;
  mentions?: Mention[];
}

export interface Mention {
  user_id: string;
  name: string;
}

export interface TypingEvent {
  conversation_id?: string;
  user_id: string;
  name: string;
}
