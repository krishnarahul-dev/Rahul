import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatUser, TypingEvent } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private serverUrl = 'https://cflow-chat-server.onrender.com';

  // ── Observable streams for components to subscribe to ──
  private messageSubject = new Subject<ChatMessage>();
  private typingSubject = new Subject<TypingEvent>();
  private stopTypingSubject = new Subject<{ user_id: string }>();
  private userJoinedSubject = new Subject<{ user: Partial<ChatUser>; workflow_id: string }>();
  private userLeftSubject = new Subject<{ user: Partial<ChatUser>; workflow_id: string }>();
  private errorSubject = new Subject<{ message: string }>();

  readonly message$: Observable<ChatMessage> = this.messageSubject.asObservable();
  readonly typing$: Observable<TypingEvent> = this.typingSubject.asObservable();
  readonly stopTyping$: Observable<{ user_id: string }> = this.stopTypingSubject.asObservable();
  readonly userJoined$ = this.userJoinedSubject.asObservable();
  readonly userLeft$ = this.userLeftSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Set the socket server URL.
   * Call before connect() if the chat server is on a different host.
   */
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  /**
   * Open a socket connection and join a workflow room.
   */
  connect(workflowId: string, user: ChatUser): void {
    // Disconnect previous connection if any
    this.disconnect();

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      this.socket!.emit('join_workflow', {
        workflow_id: workflowId,
        user: {
          cflow_id: user.cflow_id,
          name: user.name,
          email: user.email,
        },
      });
    });

    // ── Wire server events to RxJS subjects ────────────
    this.socket.on('receive_message', (msg: ChatMessage) => {
      this.messageSubject.next(msg);
    });

    this.socket.on('user_typing', (data: TypingEvent) => {
      this.typingSubject.next(data);
    });

    this.socket.on('user_stop_typing', (data: { user_id: string }) => {
      this.stopTypingSubject.next(data);
    });

    this.socket.on('user_joined', (data: any) => {
      this.userJoinedSubject.next(data);
    });

    this.socket.on('user_left', (data: any) => {
      this.userLeftSubject.next(data);
    });

    this.socket.on('error_event', (data: { message: string }) => {
      this.errorSubject.next(data);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[ChatSocket] Disconnected:', reason);
    });
  }

  /**
   * Send a message through the socket (preferred over REST for real-time).
   */
  sendMessage(message: string): void {
    this.socket?.emit('send_message', { message });
  }

  /** Broadcast typing start. */
  emitTyping(): void {
    this.socket?.emit('typing');
  }

  /** Broadcast typing stop. */
  emitStopTyping(): void {
    this.socket?.emit('stop_typing');
  }

  /** True if the socket is currently connected. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Clean disconnect. */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messageSubject.complete();
    this.typingSubject.complete();
    this.stopTypingSubject.complete();
    this.userJoinedSubject.complete();
    this.userLeftSubject.complete();
    this.errorSubject.complete();
  }
}
