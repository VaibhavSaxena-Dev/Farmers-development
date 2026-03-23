import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todoApi } from "@/Backend/api/todoApi";
import { SpeechButton } from "@/components/ui/speech-button";
import { Trash2 } from "lucide-react";

const TodoList = () => {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState(todoApi.getAll());

  useEffect(() => {
    const unsubscribe = todoApi.subscribe(() => {
      setTodos(todoApi.getAll());
    });
    return unsubscribe;
  }, []);

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

  const handleAdd = () => {
    if (!title.trim()) return;
    todoApi.add(title.trim(), description.trim() || undefined);
    setTitle("");
    setDescription("");
  };

  const handleVoiceToTitle = (text: string) => {
    setTitle(text);
  };

  const handleVoiceToDescription = (text: string) => {
    setDescription(text);
  };

  const toggleComplete = (id: string) => {
    todoApi.toggleComplete(id);
  };

  const removeTodo = (id: string) => {
    todoApi.delete(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t('todoList')}</CardTitle>
            <CardDescription>{t('addNewTodo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button onClick={handleAdd} disabled={!title.trim()}>{t('addTodo')}</Button>
            </div>

            <div className="mt-6 space-y-3">
              {todos.length === 0 ? (
                <p className="text-muted-foreground">{t('noTodos')}</p>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        id={`todo-${todo.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={!!todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                      />
                      <div>
                        <label htmlFor={`todo-${todo.id}`} className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.title}
                        </label>
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


