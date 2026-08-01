import mongoose from 'mongoose';
import { IPromptRepository } from '../repositories/promptRepository';
import { MongoPromptRepository } from '../repositories/mongoPromptRepository';
import { InMemoryPromptRepository } from '../repositories/inMemoryPromptRepository';

let mongoConnected = false;
let promptRepository: IPromptRepository | null = null;

export const getPromptRepository = (): IPromptRepository => {
  if (!promptRepository) {
    promptRepository = new InMemoryPromptRepository();
  }
  return promptRepository;
};

mongoose.connection.on('disconnected', () => {
  mongoConnected = false;
  promptRepository = new InMemoryPromptRepository();
  console.warn('⚠️ MongoDB connection lost. Falling back to in-memory store.');
});

mongoose.connection.on('connected', () => {
  mongoConnected = true;
  promptRepository = new MongoPromptRepository();
  console.log('✅ MongoDB connection established.');
});

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('ℹ️ MONGO_URI not provided. Running with high-performance in-memory prompt store.');
    mongoConnected = false;
    promptRepository = new InMemoryPromptRepository();
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    mongoConnected = true;
    promptRepository = new MongoPromptRepository();
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection failed. Falling back to in-memory store:', (error as Error).message);
    mongoConnected = false;
    promptRepository = new InMemoryPromptRepository();
    return false;
  }
};

export const isMongoConnected = () => {
  return mongoConnected && mongoose.connection.readyState === 1;
};
