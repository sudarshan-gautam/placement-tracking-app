import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let globalWithMongo = global as typeof globalThis & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

// Reset cached connection on each request during development
if (process.env.NODE_ENV === 'development') {
  if (globalWithMongo.mongoose) {
    globalWithMongo.mongoose.conn = null;
    globalWithMongo.mongoose.promise = null;
  }
}

let cached = globalWithMongo.mongoose;

if (!cached) {
  cached = globalWithMongo.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('MongoDB: Using cached connection');
    return cached.conn;
  }

  // Always create a new connection - clear any existing promise
  cached.promise = null;

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    };

    try {
      console.log('MongoDB: Attempting to connect...');
      console.log('MongoDB Connection URI:', MONGODB_URI?.replace(/:[^:@]*@/, ':****@')); // Hide password
      
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log('MongoDB: Connected successfully');
        return mongoose;
      }).catch((error) => {
        console.error('MongoDB: Connection error details:', error);
        
        // Try to provide helpful error information
        if (error.name === 'MongooseServerSelectionError') {
          console.error('MongoDB: IP address whitelist issue detected');
          console.error('MongoDB: Make sure your IP address is allowed in MongoDB Atlas:');
          console.error('1. Log into https://cloud.mongodb.com');
          console.error('2. Go to Network Access in the security section');
          console.error('3. Click "Add IP Address"');
          console.error('4. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
        }
        
        throw error;
      });
    } catch (error) {
      console.error('MongoDB: Failed to initialize connection:', error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// Export a function to explicitly clear the connection cache
export function clearMongoCache() {
  if (globalWithMongo.mongoose) {
    console.log('MongoDB: Clearing cached connection');
    
    if (globalWithMongo.mongoose.conn) {
      globalWithMongo.mongoose.conn.disconnect().catch(console.error);
    }
    
    globalWithMongo.mongoose.conn = null;
    globalWithMongo.mongoose.promise = null;
  }
}

export default connectDB; 