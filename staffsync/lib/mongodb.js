/**
 * lib/mongodb.js
 * Author: StaffSync Team (Ziya Mahesaniya, Sagal Mohamed, Anne-Marie Dorscht)
 * Date: 2026
 * Description: Establishes and caches a single Mongoose connection to the
 * MongoDB Atlas database. Next.js reloads modules frequently in dev mode and
 * serverless functions can be invoked many times concurrently, so we cache
 * the connection promise on the global object to avoid opening a new
 * connection on every request (which would quickly exhaust the connection
 * pool). Inputs: none (reads MONGODB_URI from environment). Processing:
 * reuses an existing connection if present, otherwise opens a new one.
 * Output: a connected Mongoose instance.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to .env.local."
  );
}

// Reuse the connection across hot reloads / serverless invocations.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  // Already connected -> reuse it.
  if (cached.conn) return cached.conn;

  // A connection attempt is already in flight -> wait for it (supports
  // multiple concurrent requests hitting the API at the same time).
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
