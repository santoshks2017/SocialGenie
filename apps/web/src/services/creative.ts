import api from './api';

export interface Prompt {
  id: string;
  category: string;
  text_en: string;
  text_hi?: string;
  is_active: boolean;
  usage_count: number;
}

export interface CaptionVariant {
  caption_text: string;
  hashtags: string[];
  suggested_emoji: string[];
  platform_notes?: string;
  style?: string;
}

export interface CreativeBackend {
  id: string;
  template_name: string;
  thumbnail_url: string | null;
  platform_urls: Record<string, string | null>;
}

export interface AIGenerationResponse {
  captions: CaptionVariant[];
  hindi_captions: CaptionVariant[] | null;
  creatives: CreativeBackend[];
  inventory_matched: Record<string, unknown> | null;
  platforms_requested: string[];
}

export interface Post {
  id: string;
  dealer_id: string;
  prompt_text: string;
  caption_text?: string;
  caption_hashtags: string[];
  creative_urls?: Record<string, string>;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  metrics?: {
    reach?: number;
    likes?: number;
    comments?: number;
  };
  created_at: string;
}

export const creativeService = {
  getPrompts: (category?: string) =>
    api.get<{ data: Prompt[] }>('/creatives/prompts', { category }),

  generateCaptions: (prompt: string, platforms: string[], imageId?: string, force?: boolean) =>
    api.post<AIGenerationResponse>('/creatives/generate', { prompt, platforms, image_id: imageId, force }),

  getTemplates: (category?: string) =>
    api.get<{ items: unknown[] }>('/creatives/templates', { category }),

  renderCreative: (templateId: string, data: Record<string, unknown>) =>
    api.post<{ urls: Record<string, string> }>('/creatives/render', { templateId, data }),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.upload<{ id: string; url: string }>('/upload/image', form);
  },

  uploadVideo: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.upload<{ id: string; url: string }>('/upload/video', form);
  },
};

export const postService = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get<{ data: Post[]; total: number; page: number; pageSize: number }>('/publisher/posts', params),
  
  get: (id: string) =>
    api.get<{ data: Post }>(`/publisher/posts/${id}`),
  
  create: (data: {
    promptText: string;
    platforms: string[];
    captionText?: string;
    captionHashtags?: string[];
    creativeUrls?: Record<string, string>;
  }) =>
    api.post<{ item: Post }>('/publisher', data),
  
  update: (id: string, data: Partial<Post>) =>
    api.patch<{ item: Post }>(`/publisher/posts/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/publisher/${id}`),
  
  publish: (id: string, platforms: string[]) =>
    api.post<{ item: Post, job_ids: string[] }>('/publisher/publish', { post_id: id, platforms }),
  
  schedule: (id: string, platforms: string[], scheduled_at: string) =>
    api.post<{ item: Post, job_ids: string[] }>('/publisher/publish', { post_id: id, platforms, scheduled_at }),
  
  getCalendar: (startDate: string, endDate: string) =>
    api.get<{ data: Post[] }>('/publisher/calendar', { from: startDate, to: endDate }),
  
  getMetrics: (id: string) =>
    api.get<{ metrics: Post['metrics'] }>(`/publisher/posts/${id}/metrics`),
};

export const inventoryService = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    make?: string;
    model?: string;
    condition?: string;
    status?: string;
  }) =>
    api.get<{ items: InventoryItem[]; total: number }>('/inventory', params),
  
  get: (id: string) =>
    api.get<{ item: InventoryItem }>(`/inventory/${id}`),
  
  create: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<{ item: InventoryItem }>('/inventory', data),
  
  update: (id: string, data: Partial<InventoryItem>) =>
    api.patch<{ item: InventoryItem }>(`/inventory/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/inventory/${id}`),
  
  markSold: (id: string) =>
    api.patch<{ item: InventoryItem }>(`/inventory/${id}`, { status: 'sold' }),
  
  bulkMarkSold: (ids: string[]) =>
    api.post<{ success: boolean }>('/inventory/bulk-sold', { ids }),
  
  upload: async (file: File, mapping: Record<string, string>, mode: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('mode', mode);
    return api.upload<{ result: InventoryImportResult }>('/inventory/upload', formData);
  },
};

export interface InventoryItem {
  id: string;
  dealerId: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  condition: 'new' | 'used';
  color?: string;
  fuelType?: string;
  transmission?: string;
  mileageKm?: number;
  stockCount: number;
  imageUrls: string[];
  status: 'in_stock' | 'sold' | 'reserved';
  source: 'manual' | 'csv' | 'api';
  createdAt: string;
}

export interface InventoryImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; field: string; message: string }>;
}
