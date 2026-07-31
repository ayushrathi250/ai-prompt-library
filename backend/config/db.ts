import mongoose from 'mongoose';
import { INITIAL_SEED_PROMPTS, SeedPrompt } from '../utils/seedData';

let mongoConnected = false;
let inMemoryPrompts: SeedPrompt[] = [...INITIAL_SEED_PROMPTS];

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('ℹ️ MONGO_URI not provided. Running with high-performance in-memory prompt store.');
    mongoConnected = false;
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    mongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection failed. Falling back to in-memory store:', (error as Error).message);
    mongoConnected = false;
    return false;
  }
};

export const isMongoConnected = () => mongoConnected;

export const getInMemoryPrompts = () => inMemoryPrompts;

export const setInMemoryPrompts = (newPrompts: SeedPrompt[]) => {
  inMemoryPrompts = newPrompts;
};
