import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform';
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const MONGODB_URI = process.env.MONGODB_URI;
// Enable Mongoose debug mode in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// Handle initial connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
