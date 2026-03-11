// ── Cflow Chat — Public API ─────────────────────────────
// Import from this file to use the chat system:
//
//   import { ChatWindowComponent, ChatApiService, ChatSocketService }
//     from '@cflow/chat';
//

// Components
export { ChatWindowComponent } from './components/chat-window/chat-window.component';
export { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
export { MentionDropdownComponent } from './components/mention-dropdown/mention-dropdown.component';

// Services
export { ChatApiService } from './services/chat-api.service';
export { ChatSocketService } from './services/chat-socket.service';

// Models
export type {
  ChatUser,
  ChatMessage,
  Conversation,
  Mention,
  TypingEvent,
} from './models/chat.models';

// Utilities
export { avatarColor, initials } from './services/avatar.util';