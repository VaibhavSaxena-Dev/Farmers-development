# 🚀 Farm Management System - Frontend-Backend Connection Guide

## ✅ Connection Status: CONFIGURED

Your frontend and backend are now properly connected! Here's what has been configured:

### 🔧 **Connection Configuration**

#### **Backend Configuration**
- **Port**: 5002
- **CORS Origin**: http://localhost:8083
- **Database**: MongoDB Atlas (farm-management)
- **Environment**: `.env` file configured

#### **Frontend Configuration**
- **Port**: 8083
- **API Proxy**: `/api` → `http://localhost:5002`
- **Environment**: `.env` file created
- **Vite Config**: Updated with proxy settings

### 🌐 **API Endpoints Available**

#### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### **Todos**
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

#### **GPS Tracking** 🆕
- `POST /api/gps` - Create GPS record
- `GET /api/gps/current` - Get current location
- `GET /api/gps/history` - Get location history
- `POST /api/gps/checkin` - Check in at location
- `POST /api/gps/checkout` - Check out from location
- `GET /api/gps/stats` - Get location statistics

#### **Notifications**
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read

### 🚀 **How to Run the Application**

#### **Method 1: Easy Startup (Windows)**
```bash
# Double-click this file or run in terminal
start.bat
```

#### **Method 2: Easy Startup (Linux/Mac)**
```bash
# Make executable and run
chmod +x start.sh
./start.sh
```

#### **Method 3: Manual Startup**

**Step 1: Install Node.js**
- Download from [https://nodejs.org](https://nodejs.org)
- Install LTS version
- Restart terminal

**Step 2: Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**Step 3: Start Servers**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 🌍 **Access URLs**

- **Frontend Application**: http://localhost:8083
- **Backend API**: http://localhost:5002
- **API Health Check**: http://localhost:5002/health
- **GPS Tracking**: http://localhost:8083/gps-tracking

### 📱 **Testing the Connection**

#### **1. Test Backend Health**
```bash
curl http://localhost:5002/health
```
Expected response:
```json
{
  "status": "OK",
  "db": "Connected",
  "database": "farm-management",
  "timestamp": "2024-..."
}
```

#### **2. Test Frontend-Backend Connection**
1. Open http://localhost:8083 in browser
2. Register a new account
3. Login to the system
4. Navigate to GPS Tracking page
5. Try getting current location

### 🔧 **Troubleshooting**

#### **Common Issues**

**Issue: "Connection refused"**
- **Solution**: Ensure both servers are running on correct ports
- **Check**: Backend on 5002, Frontend on 8083

**Issue: "CORS error"**
- **Solution**: Check CLIENT_ORIGIN in backend .env matches frontend port
- **Should be**: `CLIENT_ORIGIN=http://localhost:8083`

**Issue: "API not found"**
- **Solution**: Check proxy configuration in vite.config.ts
- **Should have**: Proxy from `/api` to `http://localhost:5002`

**Issue: "MongoDB connection failed"**
- **Solution**: Check MONGODB_URI in .env file
- **Ensure**: MongoDB Atlas credentials are correct

#### **Debug Steps**

1. **Check Backend Logs**
   ```bash
   cd backend
   npm run dev
   # Look for "Server running on port 5002"
   ```

2. **Check Frontend Logs**
   ```bash
   cd frontend
   npm run dev
   # Look for "Local: http://localhost:8083"
   ```

3. **Test API Directly**
   ```bash
   curl http://localhost:5002/
   # Should return API endpoints list
   ```

### 🎯 **Features Ready to Use**

✅ **User Authentication** - Register/Login system  
✅ **Todo Management** - CRUD operations for todos  
✅ **GPS Tracking** - Real-time location tracking  
✅ **Location History** - View past locations  
✅ **Check-in/Check-out** - Todo location tracking  
✅ **Notifications** - System notifications  
✅ **Responsive Design** - Mobile-friendly interface  

### 📊 **Database Schema**

#### **Users Collection**
```javascript
{
  email: String,
  pwdHash: String,
  name: String,
  preferences: {
    voiceEnabled: Boolean,
    notificationsEnabled: Boolean,
    voiceLanguage: String
  }
}
```

#### **Todos Collection**
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  done: Boolean,
  due: Date,
  priority: String,
  category: String,
  tags: [String],
  isImportant: Boolean
}
```

#### **GpsTracking Collection**
```javascript
{
  userId: ObjectId,
  todoId: ObjectId,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  altitude: Number,
  speed: Number,
  timestamp: Date,
  locationType: String,
  address: String
}
```

### 🔄 **Development Workflow**

1. **Make changes to frontend code**
2. **Frontend auto-reloads** (Vite HMR)
3. **Backend changes require restart**
4. **Test API endpoints** with browser dev tools
5. **Check console** for any errors

### 📝 **Next Steps**

1. **Install Node.js** if not already installed
2. **Run the startup script** (`start.bat` on Windows)
3. **Open browser** to http://localhost:8083
4. **Register and login** to test the system
5. **Try GPS tracking** feature

---

**🎉 Your Farm Management System is now fully connected and ready to use!**

For any issues, check the troubleshooting section or verify the server logs.
