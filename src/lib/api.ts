"use client";

import { NEXT_PUBLIC_API_BASE_URL, STORAGE_KEYS } from "./config";
import type { ApiInfo } from "@/types";

export type ApiError = {
  status: number;
  message: string;
};

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window === "undefined") return headers;
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const type = localStorage.getItem(STORAGE_KEYS.tokenType) || "bearer";
  if (token) headers["Authorization"] = `${type} ${token}`;
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const error: ApiError = {
      status: res.status,
      message: (data && (data.detail || data.message)) || res.statusText,
    };
    throw error;
  }
  return data as T;
}

export async function getApiInfo(): Promise<ApiInfo> {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/`, { cache: "no-store" });
  return handleJson<ApiInfo>(res);
}

export type PredictResponse = {
  prediction_id: string;
  predicted_class: string;
  confidence_score: number;
  all_predictions: Record<string, number>;
  processing_time: number;
  created_at: string;
};

export async function predictImage(args: {
  file: File;
  user_name?: string;
  user_email?: string;
}): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", args.file);
  if (args.user_name) form.append("user_name", args.user_name);
  if (args.user_email) form.append("user_email", args.user_email);

  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/predict`, {
    method: "POST",
    body: form,
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleJson<PredictResponse>(res);
}

export type HealthResponse = {
  status: string;
  database: string | boolean;
  model: string | boolean;
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/health`, { cache: "no-store" });
  return handleJson<HealthResponse>(res);
}

export type StatsResponse = {
  total_predictions: number;
  recent_predictions: unknown[];
  model_info: Record<string, unknown>;
};

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/stats`, {
    cache: "no-store",
    headers: { ...getAuthHeaders() },
  });
  return handleJson<StatsResponse>(res);
}

export type UserStatsResponse = {
  total_predictions: number;
  most_common_prediction?: string | null;
  average_confidence: number;
};

export async function getUserStats(email: string): Promise<UserStatsResponse> {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/user/${encodeURIComponent(email)}/stats`, {
    cache: "no-store",
    headers: { ...getAuthHeaders() },
  });
  return handleJson<UserStatsResponse>(res);
}

export type UserPredictionListItem = {
  prediction_id: string;
  predicted_class: string;
  confidence_score: number;
  all_predictions: Record<string, number>;
  processing_time: number;
  created_at: string;
  image_url?: string; // optional, if backend exposes a URL for the stored image
};

export async function getUserPredictions(args: {
  email: string;
  skip?: number;
  limit?: number;
}): Promise<UserPredictionListItem[]> {
  const { email, skip = 0, limit = 50 } = args;
  const url = new URL(`${NEXT_PUBLIC_API_BASE_URL}/user/${encodeURIComponent(email)}/predictions`);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { ...getAuthHeaders() },
  });
  return handleJson<UserPredictionListItem[]>(res);
}

export async function registerUser(args: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await handleJson<{ access_token: string; token_type: string }>(res);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    localStorage.setItem(STORAGE_KEYS.tokenType, data.token_type || "bearer");
  }
  return data;
}

export async function loginUser(args: { email: string; password: string }) {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await handleJson<{ access_token: string; token_type: string }>(res);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    localStorage.setItem(STORAGE_KEYS.tokenType, data.token_type || "bearer");
  }
  return data;
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.tokenType);
}


