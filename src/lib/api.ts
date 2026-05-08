import {
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
  saveUserInfo,
} from "./auth";
import type {
  Book,
  BooksResponse,
  BooksQuery,
  Review,
  User,
  AdminStats,
  Role,
} from "@/types";

const BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(endpoint, options, true);
    clearAccessToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || `Error ${res.status}`;
    throw new Error(msg);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    saveAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ── AUTH ──────────────────────────────────────────────────────────
export async function apiRegister(
  email: string,
  password: string,
  name: string,
) {
  const data = await request<{ accessToken: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  saveAccessToken(data.accessToken);
  return data;
}

export async function apiLogin(email: string, password: string) {
  const data = await request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAccessToken(data.accessToken);
  return data;
}

export async function apiLogout() {
  await request("/auth/logout", { method: "POST" });
  clearAccessToken();
}

// ── USERS ─────────────────────────────────────────────────────────
export async function apiGetProfile(): Promise<User> {
  return request<User>("/users/profile");
}

export async function apiGetAllUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

export async function apiUpdateUserRole(id: string, role: Role): Promise<User> {
  return request<User>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function apiDeleteUser(id: string): Promise<void> {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}

// ── BOOKS ────────────────────────────────────────────────────────
export async function apiGetBooks(
  query: BooksQuery = {},
): Promise<BooksResponse> {
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, String(v));
  });
  const qs = p.toString();
  return request<BooksResponse>(`/books${qs ? `?${qs}` : ""}`);
}

export async function apiGetBook(id: string): Promise<Book> {
  return request<Book>(`/books/${id}`);
}

export async function apiGetBookWithReviews(
  id: string,
): Promise<Book & { reviews: Review[] }> {
  return request(`/books/${id}/reviews`);
}

export async function apiCreateBook(data: Partial<Book>): Promise<Book> {
  return request<Book>("/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateBook(
  id: string,
  data: Partial<Book>,
): Promise<Book> {
  return request<Book>(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteBook(id: string): Promise<void> {
  return request<void>(`/books/${id}`, { method: "DELETE" });
}

// ── REVIEWS ───────────────────────────────────────────────────────
export async function apiCreateReview(data: {
  rating: number;
  comment?: string;
  bookId: string;
}): Promise<Review> {
  return request<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteReview(id: string): Promise<void> {
  return request<void>(`/reviews/${id}`, { method: "DELETE" });
}

// ── FILE ──────────────────────────────────────────────────────────
export async function apiUploadPoster(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request<{ url: string }>("/file", { method: "POST", body: form });
}

// ── ADMIN ─────────────────────────────────────────────────────────
export async function apiGetAdminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats");
}
