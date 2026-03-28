import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set"
  );
}

/**
 * Global cache for Next.js hot reload
 */
let cached =
  (global as any).mongoose;

if (!cached) {

  cached =
    (global as any).mongoose = {

      conn: null,

      promise: null,

    };

}
      
export async function connectDB() {

  try {

    // If already connected, return connection
    if (cached.conn) {

      return cached.conn;

    }

    // If no promise exists, create one
    if (!cached.promise) {

      mongoose.set(
        "strictQuery",
        true
      );

      cached.promise =
        mongoose.connect(
          MONGODB_URI,
          {

            dbName:
              "klick-share-new",

            bufferCommands:
              false,

          }
        );

    }

    // Wait for connection
    cached.conn =
      await cached.promise;

    console.log(
      "MongoDB connected"
    );

    return cached.conn;

  } catch (error) {

    console.error(
      "MongoDB connection error:",
      error
    );

    cached.promise =
      null;

    throw error;

  }

}
