# TODO: Add MongoDB Atlas Backend

## Steps to Complete
- [x] Update package.json with backend dependencies (express, mongoose, cors, dotenv, nodemon, @types/express, @types/cors, ts-node, concurrently)
- [x] Create backend/.env template with MONGODB_URI placeholder
- [x] Create backend/models/Todo.ts (Mongoose schema)
- [x] Create backend/server.ts (Express server with MongoDB connection and todo routes)
- [x] Update src/Backend/api/todoApi.ts to use HTTP fetch calls to backend
- [x] Update src/Backend/models/TodoStore.ts to remove localStorage logic
- [x] Install new dependencies via npm install
- [ ] Test backend connection and todo CRUD via frontend
- [ ] Verify data in MongoDB Atlas dashboard

## Notes
- User must provide MongoDB Atlas connection string in backend/.env (e.g., mongodb+srv://...)
- Run backend with `npm run server`, full app with `npm run dev:full`
- Check /health endpoint for connection status
