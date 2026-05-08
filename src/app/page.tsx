"use client";
import { useEffect, useState, useCallback } from "react";
import { apiGetBooks } from "@/lib/api";
import { BookCard } from "@/components/BookCard";
import { Pagination } from "@/components/Pagination";
import type { Book, BooksQuery, Genre } from "@/types";

const GENRES: Genre[] = ["ACTION", "COMEDY", "DRAMA", "HORROR", "SCI_FI"];
const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Сначала новые" },
  { value: "createdAt:asc", label: "Сначала старые" },
  { value: "year:desc", label: "Год ↓" },
  { value: "year:asc", label: "Год ↑" },
  { value: "title:asc", label: "Название A–Z" },
  { value: "title:desc", label: "Название Z–A" },
  { value: "author:asc", label: "Автор A–Z" },
  { value: "author:desc", label: "Автор Z–A" },
];

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<BooksQuery>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    order: "desc",
  });
  const [titleInput, setTitleInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [yearInput, setYearInput] = useState("");

  const load = useCallback(async (q: BooksQuery) => {
    setLoading(true);
    try {
      const res = await apiGetBooks(q);
      setBooks(res.data);
      setMeta({
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
      });
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query);
  }, [query, load]);

  const setGenre = (g: Genre | undefined) =>
    setQuery((q) => ({ ...q, genre: g, page: 1 }));
  const setSort = (v: string) => {
    const [sortBy, order] = v.split(":") as [
      BooksQuery["sortBy"],
      BooksQuery["order"],
    ];
    setQuery((q) => ({ ...q, sortBy, order, page: 1 }));
  };
  const applySearch = () =>
    setQuery((q) => ({
      ...q,
      title: titleInput || undefined,
      author: authorInput || undefined,
      year: yearInput ? +yearInput : undefined,
      page: 1,
    }));

  const skeletons = Array.from({ length: 20 });

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 24px" }}>
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: 'trebuchet ms',
            fontSize: "clamp(36px, 6vw, 72px)",
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          MY<span style={{ color: "var(--accent)" }}>BOOK</span>SHELF
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16 }}>
          {meta.total} книг · discover, rate, review
        </p>
      </div>

      {/* Filters */}
      <div
        className="card fade-up"
        style={{ marginBottom: 32, padding: "20px 24px" }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* Title search */}
          <div style={{ display: "flex", gap: 8, flex: "1 1 240px" }}>
            <input
              placeholder="Поиск книги..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={applySearch}>
              Поиск
            </button>
          </div>

          {/* Author search */}
          <input
            placeholder="Автор"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            style={{ flex: "1 1 200px" }}
          />

          {/* Year */}
          <input
            placeholder="Год"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            style={{ width: 100 }}
            type="number"
          />

          {/* Sort */}
          <select
            value={`${query.sortBy}:${query.order}`}
            onChange={(e) => setSort(e.target.value)}
            style={{ width: 160 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Clear */}
          {(query.title || query.author || query.year || query.genre) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setTitleInput("");
                setAuthorInput("");
                setYearInput("");
                setQuery({
                  page: 1,
                  limit: 20,
                  sortBy: "createdAt",
                  order: "desc",
                });
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Genre tabs */}
        <div
          style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}
        >
          <button
            className="btn btn-sm"
            onClick={() => setGenre(undefined)}
            style={{
              background: !query.genre ? "var(--accent)" : "var(--bg-elevated)",
              color: !query.genre ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            All
          </button>
          {GENRES.map((g) => (
            <button
              key={g}
              className="btn btn-sm"
              onClick={() => setGenre(query.genre === g ? undefined : g)}
              style={{
                background:
                  query.genre === g ? "var(--accent)" : "var(--bg-elevated)",
                color: query.genre === g ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {g.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {skeletons.map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ borderRadius: 12, paddingTop: "150%" }}
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--text-dim)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <p>No books found</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            {books.map((b, i) => (
              <div
                key={b.id}
                className="fade-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <BookCard book={b} />
              </div>
            ))}
          </div>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onChange={(p) => setQuery((q) => ({ ...q, page: p }))}
          />
        </>
      )}
    </div>
  );
}
