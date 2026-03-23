# Render Deployment Fix - Farmers App
Current Working Directory: c:/Users/vaibh/Documents/Desktop/farmers-dev-new/Farmers-development

## Status: ✅ Created TODO.md

**PHASE 1: Core Backend Fix (2/7 files)**
- [x] 1. Create render.yaml (Multi-service blueprint) 
- [x] 2. Fix backend/server.js (PORT=0.0.0.0 + CORS)
- [ ] 3. Create frontend/src/config/env.ts (API/ML URLs)
- [ ] 4. Update todoApi.ts, gpsApi.ts, medicalApi.ts 
- [ ] 5. Fix DiseaseDetection.tsx (/predict ML URL)
- [ ] 6. Update .env.production (VITE_* vars)
- [ ] 7. Update ML/app.py port binding (if needed)

**PHASE 2: Deploy & Test**
- [ ] Git commit/push
- [ ] Render: Connect repo → Auto-deploy 3 services
- [ ] Set env vars (MONGODB_URI, JWT_SECRET, CLIENT_ORIGINS)
- [ ] Test: backend/health, ml/health, frontend APIs
- [ ] Full E2E test

**Next Step:** User confirm → implement file 3 (env.ts)

**Env Vars Needed for Render:**
```
MONGODB_URI=mongodb+srv://... (Atlas)
JWT_SECRET=your-secret
CLIENT_ORIGINS=frontend.onrender.com,backend.onrender.com
```

