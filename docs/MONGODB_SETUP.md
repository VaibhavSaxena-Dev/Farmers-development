# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)

## Step 2: Configure Database Access

1. In Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username: `farmuser`
5. Create password: `farmpass123` (or your preferred password)
6. Set privileges to "Read and write to any database"

## Step 3: Configure Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. For development, add `0.0.0.0/0` (allow access from anywhere)
4. For production, add your specific IP addresses

## Step 4: Get Connection String

1. Go to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

## Step 5: Environment Configuration

Create a `.env` file in the project root with:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://farmuser:YOUR_PASSWORD@cluster0.mongodb.net/farm-management?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=farm_management_super_secret_jwt_key_2024_change_in_production

# Server Configuration
PORT=5002
CLIENT_ORIGIN=http://localhost:8080

# Voice Service Configuration
VOICE_ENABLED=true
NOTIFICATION_ENABLED=true

# Disease Alert System
DISEASE_ALERT_ENABLED=true
ALERT_RADIUS_KM=50
```

## Step 6: Test Connection

Run the following commands to test the connection:

```bash
# Install dependencies
npm install

# Start the backend server
npm run server

# In another terminal, start the frontend
npm run dev
```

## Step 7: Verify Database Connection

1. Check the console output for "MongoDB Connected" message
2. Visit `http://localhost:5002/health` to verify database connection
3. The health endpoint should show "Connected" status

## Database Collections

The application will automatically create these collections:

- `users` - User accounts and profiles
- `todos` - Farm management tasks
- `notifications` - System notifications
- `payments` - Payment transactions
- `subscriptions` - User subscriptions
- `complianceitems` - Compliance tracking
- `marketplaceitems` - Marketplace products

## Production Considerations

1. **Security**: Change default passwords and JWT secret
2. **Network**: Restrict IP access to your servers only
3. **Backup**: Enable automated backups
4. **Monitoring**: Set up monitoring and alerts
5. **Scaling**: Upgrade cluster as needed

## Troubleshooting

### Connection Issues
- Verify username and password
- Check network access settings
- Ensure connection string is correct

### Authentication Errors
- Verify database user permissions
- Check if user exists in Atlas

### Network Errors
- Add your IP to network access list
- Check firewall settings

## Support

For MongoDB Atlas specific issues:
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forum](https://community.mongodb.com/)
