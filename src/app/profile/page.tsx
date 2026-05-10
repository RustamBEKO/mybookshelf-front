"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGetProfile, apiDeleteReview } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { User } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    apiGetProfile()
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const deleteReview = async (id: string) => {
    await apiDeleteReview(id);
    setUser((u) =>
      u ? { ...u, reviews: u.reviews?.filter((r) => r.id !== id) } : u,
    );
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="spinner" />
      </div>
    );
  if (!user) return null;

  const avgRating = user.reviews?.length
    ? (
        user.reviews.reduce((s, r) => s + r.rating, 0) / user.reviews.length
      ).toFixed(1)
    : null;

  return (
    <div
      style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}
      className="fade-up"
    >
      {/* Header card */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Bebas Neue, cursive",
            fontSize: 32,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: 32,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            {user.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {user.email}
          </p>
          <div
            style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}
          >
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span
              style={{
                fontSize: 12,
                padding: "2px 10px",
                borderRadius: 99,
                background:
                  user.role === "ADMIN"
                    ? "var(--accent-dim)"
                    : "var(--bg-elevated)",
                color:
                  user.role === "ADMIN" ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {user.role}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontFamily: "Bebas Neue, cursive",
                fontSize: 28,
                color: "var(--accent)",
              }}
            >
              {user.reviews?.length || 0}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Reviews</p>
          </div>
          {avgRating && (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "Trebuchet MS, sans-serif",
                  fontSize: 28,
                  color: "var(--gold)",
                }}
              >
                ★ {avgRating}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Avg Rating
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <h2
        style={{
          fontFamily: "Trebuchet MS, sans-serif",
          fontSize: 26,
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        My Reviews
        {user.reviews?.length ? (
          <span
            style={{ color: "var(--text-dim)", fontSize: 18, marginLeft: 8 }}
          >
            ({user.reviews.length})
          </span>
        ) : (
          ""
        )}
      </h2>

      {!user.reviews?.length ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            You haven't reviewed any books yet
          </p>
          <Link href="/" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {user.reviews.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{
                padding: "16px 20px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/books/${r.book.id}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: 600,
                      color: "var(--text)",
                      fontSize: 15,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.book.title}
                  </Link>
                  <span
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--gold)",
                      borderRadius: 6,
                      padding: "2px 10px",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    ★ {r.rating}/10
                  </span>
                </div>
                {r.comment && (
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    {r.comment}
                  </p>
                )}
                <p
                  style={{
                    color: "var(--text-dim)",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => deleteReview(r.id)}
                className="btn btn-danger btn-sm"
                style={{ flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
