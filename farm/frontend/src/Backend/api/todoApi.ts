import { TodoItem } from '../models/TodoItem';

interface TodoResponse {
  _id: string;
  title: string;
  description?: string;
  done?: boolean;
  completed?: boolean;
  isImportant?: boolean;
  priority?: string;
  createdAt: string;
  updatedAt: string;
}

// API for todo operations using HTTP requests to backend
import { API_BASE_URL } from '../../config/env';
const API_BASE = API_BASE_URL;
// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const todoApi = {
  // Get all todos
  getAll: async (): Promise<TodoItem[]> => {
    const response = await fetch(`${API_BASE}/todos`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }
    const data = (await response.json()) as TodoResponse[];
    // Map _id to id for frontend compatibility
    return data.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      completed: Boolean(item.done ?? item.completed),
      isImportant: item.isImportant,
      priority: item.priority,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  },
  
  // Add a new todo
  add: async (title: string, description?: string, isImportant?: boolean): Promise<TodoItem> => {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, isImportant }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add todo: ${response.statusText}`);
    }
    const data = (await response.json()) as TodoResponse;
    // Map _id to id
    return {
      id: data._id,
      title: data.title,
      description: data.description,
      completed: Boolean(data.done ?? data.completed),
      isImportant: data.isImportant,
      priority: data.priority,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },
  
  // Update a todo
  update: async (id: string, updates: { title?: string; description?: string; completed?: boolean; isImportant?: boolean }): Promise<TodoItem | null> => {
    const payload: Record<string, unknown> = { ...updates };
    if (payload.completed !== undefined) {
      payload.done = payload.completed;
      delete payload.completed;
    }

    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to update todo: ${response.statusText}`);
    }
    const data = (await response.json()) as TodoResponse;
    // Map _id to id
    return {
      id: data._id,
      title: data.title,
      description: data.description,
      completed: Boolean(data.done ?? data.completed),
      isImportant: data.isImportant,
      priority: data.priority,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  },
  
  // Toggle todo completion status
  toggleComplete: async (id: string): Promise<TodoItem | null> => {
    const todos = await todoApi.getAll();
    const item = todos.find(item => item.id === id);
    if (!item) return null;
    return todoApi.update(id, { completed: !item.completed });
  },
  
  // Delete a todo
  delete: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error(`Failed to delete todo: ${response.statusText}`);
    }
    return true;
  },
  
  // Subscribe to changes (placeholder: in production, use WebSockets or polling)
  subscribe: (listener: () => void): (() => void) => {
    // For now, manual refetch trigger; integrate with React Query for auto-updates
    const interval = setInterval(listener, 5000); // Poll every 5s as fallback
    return () => clearInterval(interval);
  },
};

// Authentication API
export const authApi = {
  // Register new user
  register: async (phone: string, password: string, name: string, email?: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, name, email }),
    });
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  // Login user
  login: async (phone: string, password: string, email?: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, email }),
    });
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get profile: ${response.statusText}`);
    }
    return response.json();
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

// Notifications API
export const notificationApi = {
  // Get all notifications for the authenticated user
  getAll: async (unreadOnly = false): Promise<any> => {
    const url = unreadOnly ? `${API_BASE}/notifications?unreadOnly=true` : `${API_BASE}/notifications`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    return response.json();
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to get unread count: ${response.statusText}`);
    }
    return response.json();
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }
    return response.json();
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete a notification
  delete: async (notificationId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
    return true;
  }
};
