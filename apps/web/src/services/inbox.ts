import api from './api';

export interface InboxMessage {
  id: string;
  dealerId: string;
  platform: 'facebook' | 'instagram' | 'gmb';
  messageType: 'comment' | 'dm' | 'review';
  platformMessageId: string;
  postId?: string;
  customerName: string;
  customerAvatarUrl?: string;
  customerPlatformId?: string;
  messageText: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tag?: 'lead' | 'complaint' | 'general' | 'spam';
  aiSuggestedReply?: string;
  replyText?: string;
  repliedAt?: string;
  isRead: boolean;
  requiresApproval: boolean;
  receivedAt: string;
}

export interface Lead {
  id: string;
  dealerId: string;
  customerName?: string;
  customerPhone?: string;
  sourcePlatform?: 'facebook' | 'instagram' | 'gmb';
  sourceType?: 'post' | 'campaign' | 'inbox';
  sourcePostId?: string;
  sourceCampaignId?: string;
  sourceMessageId?: string;
  vehicleInterest?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateLeadRequest {
  customerName: string;
  customerPhone?: string;
  sourcePlatform: 'facebook' | 'instagram' | 'gmb';
  sourceMessageId?: string;
  vehicleInterest?: string;
  notes?: string;
}

export const inboxService = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    platform?: string;
    tag?: string;
    isRead?: boolean;
    search?: string;
  }) =>
    api.get<{ items: InboxMessage[]; total: number; unreadCount: number }>('/inbox', params),
  
  get: (id: string) =>
    api.get<{ item: InboxMessage }>(`/inbox/${id}`),
  
  markRead: (id: string) =>
    api.patch<{ item: InboxMessage }>(`/inbox/${id}`, { isRead: true }),
  
  markAllRead: () =>
    api.post<{ success: boolean }>('/inbox/mark-all-read'),
  
  updateTag: (id: string, tag: InboxMessage['tag']) =>
    api.patch<{ item: InboxMessage }>(`/inbox/${id}`, { tag }),
  
  sendReply: (id: string, replyText: string) =>
    api.post<{ item: InboxMessage }>(`/inbox/${id}/reply`, { replyText }),
  
  generateReply: (id: string) =>
    api.post<{ suggestedReply: string }>(`/inbox/${id}/suggest-reply`),
};

export const leadService = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    sourcePlatform?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    api.get<{ items: Lead[]; total: number }>('/leads', params),
  
  get: (id: string) =>
    api.get<{ item: Lead }>(`/leads/${id}`),
  
  create: (data: CreateLeadRequest) =>
    api.post<{ item: Lead }>('/leads', data),
  
  update: (id: string, data: Partial<Lead>) =>
    api.patch<{ item: Lead }>(`/leads/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/leads/${id}`),
};
