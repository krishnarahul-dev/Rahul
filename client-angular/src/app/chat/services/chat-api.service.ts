import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, ChatMessage, ChatUser } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private baseUrl = 'https://cflow-chat-server.onrender.com/api';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  // ── V1 (backward compatible) ───────────────────────────

  getConversation(workflowId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}/conversations/${workflowId}`);
  }

  addParticipant(conversationId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/conversations/${conversationId}/participants`, { user_id: userId });
  }

  getMessages(conversationId: string, limit = 100, offset = 0): Observable<ChatMessage[]> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages/${conversationId}`, { params });
  }

  sendMessage(payload: { conversation_id: string; sender_id: string; message: string }): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/messages`, payload);
  }

  searchUsers(query: string): Observable<ChatUser[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ChatUser[]>(`${this.baseUrl}/users/search`, { params });
  }

  // ── V2 endpoints ───────────────────────────────────────

  listConversations(userId: string, type?: string): Observable<Conversation[]> {
    let params = new HttpParams().set('user_id', userId);
    if (type) params = params.set('type', type);
    return this.http.get<Conversation[]>(`${this.baseUrl}/conversations/v2/list`, { params });
  }

  getConversationById(id: string, userId: string): Observable<Conversation> {
    const params = new HttpParams().set('user_id', userId);
    return this.http.get<Conversation>(`${this.baseUrl}/conversations/v2/${id}`, { params });
  }

  getUnreadCount(userId: string): Observable<{ unread: number }> {
    const params = new HttpParams().set('user_id', userId);
    return this.http.get<{ unread: number }>(`${this.baseUrl}/conversations/v2/unread`, { params });
  }

  createDirect(userId: string, targetUserId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/conversations/v2/direct`, {
      user_id: userId, target_user_id: targetUserId
    });
  }

  createGroup(userId: string, name: string, memberIds: string[]): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/conversations/v2/group`, {
      user_id: userId, name, member_ids: memberIds
    });
  }

  markRead(conversationId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/conversations/v2/${conversationId}/read`, { user_id: userId });
  }

  listUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.baseUrl}/users`);
  }
}
