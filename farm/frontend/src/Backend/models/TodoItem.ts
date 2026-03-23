// TodoItem model
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isImportant?: boolean;
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new TodoItem
export const createTodoItem = (title: string, description?: string): TodoItem => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title,
    description,
    completed: false,
    createdAt: now,
    updatedAt: now
  };
};