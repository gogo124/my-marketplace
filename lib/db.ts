import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        memoryServer: MongoMemoryServer | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
  memoryServer: null
};

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    let mongoUri = process.env.MONGODB_URI;
    const allowInMemoryDatabase = process.env.ALLOW_IN_MEMORY_DB === "true";

    if (!mongoUri) {
      if (process.env.NODE_ENV === "production" && !allowInMemoryDatabase) {
        throw new Error(
          "Missing MONGODB_URI environment variable. Add it to .env.local or set ALLOW_IN_MEMORY_DB=true for a temporary in-memory database."
        );
      }

      cached.memoryServer ??= await MongoMemoryServer.create({
        instance: { dbName: "my-marketplace" }
      });
      mongoUri = cached.memoryServer.getUri();
    }

    cached.promise = mongoose.connect(mongoUri, {
      dbName: "my-marketplace"
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
