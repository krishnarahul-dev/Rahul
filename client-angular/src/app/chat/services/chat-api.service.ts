import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, ChatMessage, ChatUser } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  /**
   * Base URL for the chat server.
   * Override via environment config or provider token in production.
   */
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  // ── Conversations ──────────────────────────────────────

  getConversation(workflowId: string): Observable<Conversation> {
    return this.http.get<Conversation>(
      `${this.baseUrl}/conversations/${workflowId}`
    );
  }

  addParticipant(conversationId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/conversations/${conversationId}/participants`,
      { user_id: userId }
    );
  }

  // ── Messages ───────────────────────────────────────────

  getMessages(
    conversationId: string,
    limit = 100,
    offset = 0
  ): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<ChatMessage[]>(
      `${this.baseUrl}/messages/${conversationId}`,
      { params }
    );
  }

  sendMessage(payload: {
    conversation_id: string;
    sender_id: string;
    message: string;
  }): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/messages`, payload);
  }

  // ── Users ──────────────────────────────────────────────

  searchUsers(query: string): Observable<ChatUser[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ChatUser[]>(`${this.baseUrl}/users/search`, {
      params,
    });
  }
}
