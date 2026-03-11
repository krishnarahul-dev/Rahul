// ── Cflow Chat — Data Models ────────────────────────────

export interface ChatUser {
  id: string;
  cflow_id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Conversation {
  id: string;
  workflow_id: string;
  title: string;
  created_at: string;
  participants?: ChatUser[];
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: ChatUser;
  mentions?: Mention[];
}

export interface Mention {
  user_id: string;
  name: string;
}

export interface TypingEvent {
  user_id: string;
  name: string;
}
