# 🗺️ Google Maps API Setup Guide

## 📋 Prerequisites

1. **Google Cloud Account**: Create a free Google Cloud account at https://console.cloud.google.com/
2. **Enable APIs**: Enable the following APIs in your Google Cloud project:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Static Maps API

## 🔑 Getting Your API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter project name (e.g., "Farm Management System")
4. Click "Create"

### Step 2: Enable Required APIs
1. In your project, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
   - **Static Maps API**

### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### Step 4: Restrict API Key (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add: `http://localhost:8083/*` (for development)
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled in Step 2

## ⚙️ Configuration

### Method 1: Environment Variable (Recommended)
Add your API key to the frontend environment file:

```bash
# File: frontend/.env
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Method 2: Direct Update in Code
Update the API key in the component:

```typescript
// File: src/components/GoogleMapsGpsTracking.tsx
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

## 🚀 Features Available with Google Maps

### 📍 **Location Tracking**
- **Real-time GPS tracking** with live map updates
- **Current location detection** with accuracy indicators
- **Location history** with timestamps
- **Address resolution** from coordinates

### 🗺️ **Interactive Maps**
- **Multiple map types**: Roadmap, Satellite, Hybrid, Terrain
- **Zoom controls** and pan navigation
- **Live location markers** with animations
- **Custom map styling** for better visibility

### 🏥 **Medical Facilities Discovery**
- **Nearby doctors** within specified radius
- **Clinic locations** with contact information
- **Specialization filtering** for targeted search
- **Distance calculations** and route planning
- **Directions integration** with Google Maps

### 📱 **Mobile Features**
- **Touch-friendly controls** for mobile devices
- **GPS optimization** for mobile browsers
- **Responsive design** for all screen sizes
- **Offline caching** of location data

## 🔧 API Usage Limits

### Free Tier (Per Day)
- **Maps JavaScript API**: 28,000 map loads
- **Geocoding API**: 40,000 requests
- **Places API**: 1,000 requests
- **Static Maps API**: 28,000 requests

### Optimization Tips
1. **Caching**: Cache geocoded addresses
2. **Debouncing**: Limit API calls during tracking
3. **Batch requests**: Group multiple operations
4. **Error handling**: Implement retry logic

## 🛠️ Troubleshooting

### Common Issues

#### "API Key Invalid"
- **Cause**: API key is incorrect or restricted
- **Solution**: Verify key and check referrer restrictions

#### "Referer Not Allowed"
- **Cause**: Domain not in API key restrictions
- **Solution**: Add `http://localhost:8083/*` to referrers

#### "Quota Exceeded"
- **Cause**: Daily API limit reached
- **Solution**: Wait for quota reset or upgrade plan

#### "Network Error"
- **Cause**: Internet connectivity issues
- **Solution**: Check network and retry

### Debug Mode
Enable debug logging in the component:

```typescript
// In GoogleMapsGpsTracking.tsx
const DEBUG = true; // Set to true for debugging

if (DEBUG) {
  console.log('GPS Data:', location);
  console.log('API Response:', response);
}
```

## 🔒 Security Best Practices

1. **API Key Restrictions**: Always restrict your API key
2. **Environment Variables**: Never commit API keys to Git
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement client-side rate limiting
5. **CORS**: Configure proper CORS settings

## 🌍 Deployment

### Production Setup
1. **Update referrer**: Add your production domain
2. **Environment variables**: Use production API key
3. **HTTPS**: Ensure your site uses HTTPS
4. **Monitoring**: Set up API usage monitoring

### Environment Variables
```bash
# Production (.env.production)
VITE_GOOGLE_MAPS_API_KEY=PRODUCTION_API_KEY

# Development (.env.development)  
VITE_GOOGLE_MAPS_API_KEY=DEVELOPMENT_API_KEY
```

## 📞 Support

### Google Cloud Support
- **Documentation**: https://developers.google.com/maps
- **Pricing**: https://cloud.google.com/maps-platform/pricing
- **Quotas**: https://console.cloud.google.com/apis/dashboard

### Common Resources
- **API Documentation**: https://developers.google.com/maps/documentation
- **Sample Code**: https://github.com/googlemaps/js-samples
- **Community**: https://stackoverflow.com/questions/tagged/google-maps

---

**🎉 Once configured, your GPS tracking will display on Google Maps with full medical facilities discovery!**

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key to enable Google Maps functionality.
