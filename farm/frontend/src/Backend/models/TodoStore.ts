import { TodoItem, createTodoItem } from './TodoItem';

// TodoStore class for managing todo items (localStorage removed, now uses backend API)
export class TodoStore {
  private items: TodoItem[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    // No longer loading from localStorage
  }

  // Get all todo items
  getAll(): TodoItem[] {
    return [...this.items];
  }

  // Add a new todo item
  add(title: string, description?: string): TodoItem {
    const newItem = createTodoItem(title, description);
    this.items.push(newItem);
    this.notifyListeners();
    return newItem;
  }

  // Update a todo item
  update(id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>): TodoItem | null {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date()
    };

    this.items[index] = updatedItem;
    this.notifyListeners();
    return updatedItem;
  }

  // Toggle completion status
  toggleComplete(id: string): TodoItem | null {
    const item = this.items.find(item => item.id === id);
    if (!item) return null;

    return this.update(id, { completed: !item.completed });
  }

  // Delete a todo item
  delete(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);

    if (this.items.length !== initialLength) {
      this.notifyListeners();
      return true;
    }

    return false;
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
