import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatUser, TypingEvent } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private serverUrl = 'https://rahul-xq9c.onrender.com';

  private messageSubject = new Subject<ChatMessage>();
  private typingSubject = new Subject<TypingEvent>();
  private stopTypingSubject = new Subject<{ conversation_id?: string; user_id: string }>();
  private userJoinedSubject = new Subject<any>();
  private userLeftSubject = new Subject<any>();
  private presenceSubject = new Subject<{ user_id: string; status: string }>();
  private unreadSubject = new Subject<{ conversation_id: string }>();
  private mentionedSubject = new Subject<any>();
  private convCreatedSubject = new Subject<any>();
  private errorSubject = new Subject<{ message: string }>();

  readonly message$ = this.messageSubject.asObservable();
  readonly typing$ = this.typingSubject.asObservable();
  readonly stopTyping$ = this.stopTypingSubject.asObservable();
  readonly userJoined$ = this.userJoinedSubject.asObservable();
  readonly userLeft$ = this.userLeftSubject.asObservable();
  readonly presence$ = this.presenceSubject.asObservable();
  readonly unread$ = this.unreadSubject.asObservable();
  readonly mentioned$ = this.mentionedSubject.asObservable();
  readonly convCreated$ = this.convCreatedSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  setServerUrl(url: string): void {
    this.serverUrl = url.replace(/\/+$/, '');
  }

  connect(workflowId: string, user: ChatUser): void {
    this.disconnect();
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      this.socket!.emit('join_workflow', {
        workflow_id: workflowId,
        user: {
          cflow_id: user.cflow_id,
          name: user.name,
          email: user.email
        }
      });
    });

    this.wireEvents();
  }

  connectV2(user: ChatUser): void {
    this.disconnect();
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      this.socket!.emit('authenticate', {
        user: {
          cflow_id: user.cflow_id,
          name: user.name,
          email: user.email
        }
      });
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('[Chat] Authenticated, conversations:', data.conversations?.length);
    });

    this.wireEvents();
  }

  private wireEvents(): void {
    if (!this.socket) return;

    this.socket.on('receive_message', (msg: any) => this.messageSubject.next(msg));
    this.socket.on('user_typing', (evt: any) => this.typingSubject.next(evt));
    this.socket.on('user_stop_typing', (evt: any) => this.stopTypingSubject.next(evt));
    this.socket.on('user_joined', (evt: any) => this.userJoinedSubject.next(evt));
    this.socket.on('user_left', (evt: any) => this.userLeftSubject.next(evt));
    this.socket.on('presence_change', (evt: any) => this.presenceSubject.next(evt));
    this.socket.on('unread_update', (evt: any) => this.unreadSubject.next(evt));
    this.socket.on('mentioned', (evt: any) => this.mentionedSubject.next(evt));
    this.socket.on('conversation_created', (evt: any) => this.convCreatedSubject.next(evt));
    this.socket.on('error_event', (evt: any) => this.errorSubject.next(evt));
    this.socket.on('disconnect', (reason: string) => console.warn('[ChatSocket] Disconnected:', reason));
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', { conversation_id: conversationId });
  }

  sendMessage(message: string, conversationId?: string): void {
    this.socket?.emit('send_message', { message, conversation_id: conversationId });
  }

  markRead(conversationId: string): void {
    this.socket?.emit('mark_read', { conversation_id: conversationId });
  }

  emitTyping(conversationId?: string): void {
    this.socket?.emit('typing', conversationId ? { conversation_id: conversationId } : undefined);
  }

  emitStopTyping(conversationId?: string): void {
    this.socket?.emit('stop_typing', conversationId ? { conversation_id: conversationId } : undefined);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}