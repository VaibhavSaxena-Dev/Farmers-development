const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    console.log(`📍 Connection string: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('💡 Please create a .env file with your MongoDB Atlas connection string');
      process.exit(1);
    }
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'farm-management'
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Database Information:');
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Existing collections:');
      collections.forEach(col => {
        console.log(`     - ${col.name}`);
      });
    } else {
      console.log('   No collections found (this is normal for a new database)');
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Create a test collection
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    
    // Read from test collection
    const testDoc = await testCollection.findOne({ test: true });
    console.log('   ✅ Write operation: Success');
    console.log('   ✅ Read operation: Success');
    
    // Clean up test collection
    await testCollection.drop();
    console.log('   ✅ Cleanup operation: Success');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is ready to use.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run "npm run setup-db" to populate with sample data');
    console.log('   2. Run "npm run dev:full" to start the application');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication Error:');
      console.log('   - Check your username and password in the connection string');
      console.log('   - Verify the database user exists in MongoDB Atlas');
      console.log('   - Ensure the user has proper permissions');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network Error:');
      console.log('   - Check your internet connection');
      console.log('   - Verify your IP is whitelisted in MongoDB Atlas');
      console.log('   - Check firewall settings');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 DNS Error:');
      console.log('   - Check the connection string format');
      console.log('   - Verify the cluster URL is correct');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

// Run test
testConnection();
