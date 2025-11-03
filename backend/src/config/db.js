import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  // Prevent multiple connections
  if (isConnected) {
    console.log('...already connected to MongoDB');
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env file');
  }

  try {
    // Set strictQuery to false to prepare for Mongoose 7 behavior
    mongoose.set('strictQuery', false);

    const db = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'db_443fgftxj', // Explicitly setting the database name
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw new Error('Database connection failed');
  }
};