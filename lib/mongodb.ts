import { MongoClient, Db } from 'mongodb';

let dbConnection: Db;

export async function connectToDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error('❌ MONGODB_URI is not defined in environment variables.');

  try {
    const client = await MongoClient.connect(uri);
    dbConnection = client.db();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

export function getDb(): Db {
  if (!dbConnection) {
    throw new Error('❌ Database not initialized. Call connectToDb() first.');
  }
  return dbConnection;
}
