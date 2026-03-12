// ── Cflow Chat v2 — Public API ──────────────────────────
export { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';
export { ChatWindowComponent } from './components/chat-window/chat-window.component';
export { ChatPanelComponent } from './components/chat-panel/chat-panel.component';
export { ConversationListComponent } from './components/conversation-list/conversation-list.component';
export { ConversationItemComponent } from './components/conversation-item/conversation-item.component';
export { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
export { MentionDropdownComponent } from './components/mention-dropdown/mention-dropdown.component';
export { NewChatDialogComponent } from './components/new-chat-dialog/new-chat-dialog.component';
export { GroupCreateDialogComponent } from './components/group-create-dialog/group-create-dialog.component';
export { UserStatusComponent } from './components/user-status/user-status.component';
export { ChatApiService } from './services/chat-api.service';
export { ChatSocketService } from './services/chat-socket.service';
export type { ChatUser, ChatMessage, Conversation, Mention, TypingEvent } from './models/chat.models';
export { avatarColor, initials } from './services/avatar.util';
