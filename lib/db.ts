import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// @ts-ignore
let cached: MongooseCache = global.mongoose;
if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: undefined, // uses db in URI (pastebin)
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}