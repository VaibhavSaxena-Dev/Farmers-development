import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Ensure .env is loaded from the project root (one level up from backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Debug: log env resolution once on startup
const envExists = fs.existsSync(envPath);
if (!process.env.MONGODB_URI) {
  console.error(`[ENV DEBUG] cwd=${process.cwd()} envPath=${envPath} exists=${envExists}`);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!process.env.MONGODB_URI) {
  // Fail fast with a clear message if the env var is missing
  // This prevents the server from starting without a DB connection string
  console.error('Missing required environment variable: MONGODB_URI');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Import Todo model
import Todo from './models/Todo';

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db!.admin().ping();
      res.status(200).json({ status: 'OK', db: 'Connected' });
    } else {
      res.status(500).json({ status: 'Error', db: 'Disconnected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'Error', db: 'Disconnected' });
  }
});

// Todo Routes

// GET all todos
app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST new todo
app.post('/api/todos', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create todo' });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update todo' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
