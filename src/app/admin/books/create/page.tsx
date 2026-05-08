"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCreateBook } from "@/lib/api";
import { PosterUpload } from "@/components/admin/PosterUpload";
import type { Genre } from "@/types";

const GENRES: Genre[] = ["ACTION", "COMEDY", "DRAMA", "HORROR", "SCI_FI"];
const CURRENT_YEAR = new Date().getFullYear();

export default function CreateBookPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    year: CURRENT_YEAR,
    genre: "ACTION" as Genre,
    posterUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const book = await apiCreateBook({
        title: form.title,
        author: form.author || undefined,
        description: form.description || undefined,
        year: form.year,
        genre: form.genre,
        posterUrl: form.posterUrl || undefined,
      });
      router.push(`/admin/books/${book.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Link
          href="/admin/books"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Books
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1
          style={{
            fontFamily: "Bebas Neue, cursive",
            fontSize: 32,
            letterSpacing: 2,
          }}
        >
          Add Book
        </h1>
      </div>

      <form
        onSubmit={handle}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <h3
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: 18,
              letterSpacing: 1,
              color: "var(--text-muted)",
              marginBottom: -4,
            }}
          >
            Details
          </h3>

          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Title *
            </label>
            <input
              required
              placeholder="Book title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Author
            </label>
            <input
              placeholder="Book author"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Brief description…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Year *
              </label>
              <input
                type="number"
                required
                min={1888}
                max={CURRENT_YEAR + 5}
                value={form.year}
                onChange={(e) => set("year", +e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Genre *
              </label>
              <select
                value={form.genre}
                onChange={(e) => set("genre", e.target.value)}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <PosterUpload
            value={form.posterUrl}
            onChange={(url) => set("posterUrl", url)}
            genre={form.genre}
          />
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#ef4444",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1, padding: 14 }}
          >
            {loading ? "Creating…" : "📖 Create Book"}
          </button>
          <Link
            href="/admin/books"
            className="btn btn-ghost"
            style={{ flex: 1, padding: 14, textAlign: "center" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
