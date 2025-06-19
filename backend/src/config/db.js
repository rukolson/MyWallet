import pkg from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const { MongoClient } = pkg;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB:", dbName);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

export async function closeDB() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }
}
