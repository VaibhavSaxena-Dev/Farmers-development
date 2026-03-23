import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { todoApi, notificationApi } from "@/Backend/api/todoApi";
import { SpeechButton } from "@/components/ui/speech-button";
import { Trash2, Star, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isImportant?: boolean;
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TodoList = () => {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTodos();
    loadNotifications();
  }, []);

  const loadTodos = async () => {
    try {
      const todosData = await todoApi.getAll();
      setTodos(todosData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsData = await notificationApi.getAll();
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const mapLocale = (lang: string) => {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'kn':
        return 'kn-IN';
      default:
        return 'en-US';
    }
  };

  const formatDateTime = (date: Date) => {
    try {
      return new Date(date).toLocaleString(mapLocale(language), {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return new Date(date).toLocaleString();
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await todoApi.add(title.trim(), description.trim() || undefined, isImportant);
      setTitle("");
      setDescription("");
      setIsImportant(false);
      await loadTodos();
      await loadNotifications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVoiceToTitle = (text: string) => {
    setTitle(text);
  };

  const handleVoiceToDescription = (text: string) => {
    setDescription(text);
  };

  const toggleComplete = async (id: string) => {
    try {
      await todoApi.toggleComplete(id);
      await loadTodos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeTodo = async (id: string) => {
    try {
      await todoApi.delete(id);
      await loadTodos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">{t('loadingTodos')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Notifications Section */}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t('todoList')}</CardTitle>
            <CardDescription>{t('addNewTodo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('todoTitle')}
                />
                <SpeechButton onTextCapture={handleVoiceToTitle} />
              </div>
              <div className="flex items-center gap-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('todoDescription')}
                />
                <SpeechButton onTextCapture={handleVoiceToDescription} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="important"
                  checked={isImportant}
                  onCheckedChange={(checked) => setIsImportant(!!checked)}
                />
                <label htmlFor="important" className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  {t('todoMarkImportant')}
                </label>
              </div>
              <Button onClick={handleAdd} disabled={!title.trim()}>{t('addTodo')}</Button>
            </div>

            <div className="mt-6 space-y-3">
              {todos.length === 0 ? (
                <p className="text-muted-foreground">{t('noTodos')}</p>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className={`flex items-start justify-between gap-4 p-4 border rounded-lg ${todo.isImportant ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={!!todo.completed}
                        onCheckedChange={() => toggleComplete(todo.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`todo-${todo.id}`} className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.title}
                          </label>
                          {todo.isImportant && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {todo.priority && (
                            <Badge className={`text-white ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </Badge>
                          )}
                        </div>
                        {todo.description && (
                          <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>{todo.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(todo.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTodo(todo.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodoList;