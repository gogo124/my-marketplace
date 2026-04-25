import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer: {
    getUri(): string;
  } | null;
  listenersAttached: boolean;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached =
  global.mongooseCache ??
  {
    conn: null,
    promise: null,
    memoryServer: null,
    listenersAttached: false
  };

global.mongooseCache = cached;

const DEFAULT_DB_NAME = "my-marketplace";
const MAX_CONNECT_RETRIES = 3;
const CONNECT_RETRY_DELAY_MS = 750;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getConfiguredMongoUri() {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    return mongoUri;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  return null;
}

async function getMongoUri() {
  const configuredMongoUri = getConfiguredMongoUri();

  if (configuredMongoUri) {
    return configuredMongoUri;
  }

  const allowInMemoryDatabase = process.env.ALLOW_IN_MEMORY_DB === "true";

  if (!allowInMemoryDatabase) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  cached.memoryServer ??= await MongoMemoryServer.create({
    instance: { dbName: DEFAULT_DB_NAME }
  });

  return cached.memoryServer.getUri();
}

function attachConnectionListeners() {
  if (cached.listenersAttached) {
    return;
  }

  cached.listenersAttached = true;

  mongoose.connection.on("connected", () => {
    console.info("[db] MongoDB connection established.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("[db] MongoDB connection error.", error);
  });

  mongoose.connection.on("disconnected", () => {
    cached.conn = null;
    cached.promise = null;
    console.warn("[db] MongoDB connection disconnected.");
  });
}

async function connectWithRetry() {
  const mongoUri = await getMongoUri();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt += 1) {
    try {
      console.info(`[db] Connecting to MongoDB (attempt ${attempt}/${MAX_CONNECT_RETRIES}).`);

      const connection = await mongoose.connect(mongoUri, {
        dbName: DEFAULT_DB_NAME,
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 15000
      });

      return connection;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === MAX_CONNECT_RETRIES;

      console.error(
        `[db] MongoDB connection attempt ${attempt} failed.`,
        error instanceof Error ? error.message : error
      );

      if (!isLastAttempt) {
        await sleep(CONNECT_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("MongoDB connection failed.");
}

export async function connectToDatabase() {
  attachConnectionListeners();

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 2 && cached.promise) {
    return cached.promise;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry().catch((error) => {
      cached.conn = null;
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
