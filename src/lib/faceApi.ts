// src/lib/faceApi.ts

const LOCAL_URL = "http://127.0.0.1:8000";

// Use environment variable if available, otherwise fallback to local
export const FACE_API_URL =
  process.env.FACE_API_URL || LOCAL_URL;
