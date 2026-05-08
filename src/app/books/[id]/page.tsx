/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  apiGetBook,
  apiGetBookWithReviews,
  apiCreateReview,
  apiDeleteReview,
} from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import type { Book, Review } from "@/types";

const GENRE_ICONS: Record<string, string> = {
  ACTION: "💥",
  COMEDY: "😂",
  DRAMA: "🎭",
  HORROR: "👻",
  SCI_FI: "🚀",
};
const GENRE_COLORS: Record<string, string> = {
  ACTION: "badge-action",
  COMEDY: "badge-comedy",
  DRAMA: "badge-drama",
  HORROR: "badge-horror",
  SCI_FI: "badge-sci_fi",
};
const GENRE_GRADIENTS: Record<string, string> = {
  ACTION: "linear-gradient(135deg,#1a0000,#3d0000,#1a0505)",
  COMEDY: "linear-gradient(135deg,#1a1500,#3d3000,#1a1a05)",
  DRAMA: "linear-gradient(135deg,#050010,#100030,#050015)",
  HORROR: "linear-gradient(135deg,#0a0010,#1a0035,#050010)",
  SCI_FI: "linear-gradient(135deg,#00101a,#002535,#00101a)",
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(n)}
          style={{
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            fontSize: 18,
            padding: "0 1px",
            color:
              n <= (hover || value) ? "var(--gold)" : "var(--border-hover)",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 7, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const admin = authUser?.role === "ADMIN" || authUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch book (has posterUrl) and reviews (has user) separately
    // to guarantee all fields are present
    Promise.all([apiGetBook(id), apiGetBookWithReviews(id).catch(() => null)])
      .then(([bookData, bookWithReviews]) => {
        if (cancelled) return;
        setBook(bookData);
        // Try to get reviews from the reviews endpoint
        // Fall back to empty array if the endpoint doesn't support it
        if (
          bookWithReviews &&
          Array.isArray((bookWithReviews as never).reviews)
        ) {
          setReviews((bookWithReviews as never).reviews);
        }
      })
      .catch(() => {
        if (!cancelled) setBook(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await apiCreateReview({ ...reviewForm, bookId: id });
      // If backend doesn't return user on new review, inject it from auth context
      const enriched: Review = {
        ...r,
        user: r.user ?? {
          id: authUser?.id ?? "",
          name: authUser?.name ?? "You",
        },
      };
      setReviews((rs) => [enriched, ...rs]);
      setReviewForm({ rating: 7, comment: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (rid: string) => {
    await apiDeleteReview(rid);
    setReviews((rs) => rs.filter((r) => r.id !== rid));
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div className="spinner" />
      </div>
    );

  if (!book)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--text-muted)" }}>Book not found</p>
        <Link href="/" className="btn btn-ghost" style={{ marginTop: 16 }}>
          ← Back
        </Link>
      </div>
    );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <Link
        href="/"
        style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: 14,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 24,
        }}
      >
        ← Back to books
      </Link>

      {/* Hero */}
      <div
        className="fade-up"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,280px) 1fr",
          gap: 32,
          marginBottom: 40,
        }}
      >
        {/* Poster */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            aspectRatio: "2/3",
            background: GENRE_GRADIENTS[book.genre] || "var(--bg-elevated)",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {book.posterUrl ? (
            <img
              src={book.posterUrl}
              alt={book.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 80 }}>
                {GENRE_ICONS[book.genre] || "📚"}
              </span>
              <span
                style={{
                  fontFamily: "Bebas Neue, cursive",
                  fontSize: 18,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: 3,
                }}
              >
                {book.genre.replace("_", " ")}
              </span>
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <span className={`badge ${GENRE_COLORS[book.genre]}`}>
              {GENRE_ICONS[book.genre]} {book.genre.replace("_", " ")}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {book.year}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Trebuchet MS, sans-serif",
              fontSize: "clamp(32px,5vw,56px)",
              letterSpacing: 2,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            {book.title}
          </h1>

          {book.author && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 16,
                marginBottom: 20,
              }}
            >
              by {book.author}
            </p>
          )}

          {avgRating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontFamily: "Bebas Neue, cursive",
                  fontSize: 36,
                  color: "var(--gold)",
                }}
              >
                {avgRating}
              </span>
              <div>
                <div style={{ color: "var(--gold)", fontSize: 18 }}>
                  {"★".repeat(Math.round(+avgRating / 2))}
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 12 }}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          )}

          {book.description && (
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.7,
                maxWidth: 600,
                marginBottom: 24,
              }}
            >
              {book.description}
            </p>
          )}

          {admin && (
            <Link
              href={`/admin/books/${book.id}`}
              className="btn btn-ghost btn-sm"
            >
              ✏ Edit Book
            </Link>
          )}
        </div>
      </div>

      {/* Review form — only for logged-in users */}
      {getAccessToken() && (
        <div className="card fade-up" style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontFamily: "Trebuchet MS, sans-serif",
              fontSize: 22,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            Write a Review
          </h3>
          <form
            onSubmit={submitReview}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Rating:{" "}
                <strong style={{ color: "var(--gold)" }}>
                  {reviewForm.rating}/10
                </strong>
              </label>
              <StarRating
                value={reviewForm.rating}
                onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
              />
            </div>
            <textarea
              rows={3}
              placeholder="Share your thoughts..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, comment: e.target.value }))
              }
            />
            {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ alignSelf: "flex-start" }}
            >
              {submitting ? "Posting…" : "Post Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="fade-up">
          <h2
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: 28,
              letterSpacing: 1,
              marginBottom: 20,
            }}
          >
            Reviews{" "}
            <span style={{ color: "var(--text-dim)", fontSize: 18 }}>
              ({reviews.length})
            </span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((r) => {
              // Safe: user may be undefined if backend doesn't populate it
              const userName = r.user?.name ?? "Unknown";
              const isOwner =
                authUser &&
                (r.userId === authUser.id || r.user?.id === authUser.id);
              return (
                <div
                  key={r.id}
                  className="card"
                  style={{ padding: "16px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {userName}
                      </span>
                      <span
                        style={{
                          color: "var(--text-dim)",
                          fontSize: 12,
                          marginLeft: 10,
                        }}
                      >
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          background: "var(--accent-dim)",
                          color: "var(--gold)",
                          borderRadius: 6,
                          padding: "2px 10px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        ★ {r.rating}/10
                      </span>
                      {(admin || isOwner) && (
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="btn btn-danger btn-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
