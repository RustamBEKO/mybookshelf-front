/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import type { Book } from "@/types";

const GENRE_COLORS: Record<string, string> = {
  ACTION: "badge-action",
  COMEDY: "badge-comedy",
  DRAMA: "badge-drama",
  HORROR: "badge-horror",
  SCI_FI: "badge-sci_fi",
};

// Unique gradient per genre for the placeholder
const GENRE_GRADIENTS: Record<string, string> = {
  ACTION: "linear-gradient(135deg, #1a0000 0%, #3d0000 50%, #1a0505 100%)",
  COMEDY: "linear-gradient(135deg, #1a1500 0%, #3d3000 50%, #1a1a05 100%)",
  DRAMA: "linear-gradient(135deg, #050010 0%, #100030 50%, #050015 100%)",
  HORROR: "linear-gradient(135deg, #0a0010 0%, #1a0035 50%, #050010 100%)",
  SCI_FI: "linear-gradient(135deg, #00101a 0%, #002535 50%, #00101a 100%)",
};

const GENRE_ICONS: Record<string, string> = {
  ACTION: "💥",
  COMEDY: "😂",
  DRAMA: "🎭",
  HORROR: "👻",
  SCI_FI: "🚀",
};

function Placeholder({ genre, title }: { genre: string; title: string }) {
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          GENRE_GRADIENTS[genre] || "linear-gradient(135deg, #141414, #1f1f1f)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          top: -20,
          right: -20,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.02)",
          bottom: 30,
          left: -15,
        }}
      />
      <span style={{ fontSize: 36, lineHeight: 1 }}>
        {GENRE_ICONS[genre] || "🎬"}
      </span>
      <span
        style={{
          fontFamily: "Bebas Neue, cursive",
          fontSize: 22,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          padding: "0 8px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {initials}
      </span>
    </div>
  );
}

interface Props {
  book: Book;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export function MovieCard({ book, onDelete, isAdmin }: Props) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "var(--shadow-lg)";
        el.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "var(--border)";
      }}
    >
      <Link
        href={`/books/${book.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        {/* Poster area */}
        <div
          style={{
            position: "relative",
            paddingTop: "148%",
            background: "var(--bg-elevated)",
          }}
        >
          {book.posterUrl ? (
            <img
              src={book.posterUrl}
              alt={book.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                // Show placeholder sibling
                const ph = img.nextElementSibling as HTMLElement;
                if (ph) ph.style.display = "flex";
              }}
            />
          ) : null}

          {/* Placeholder — always rendered, hidden if poster loaded */}
          <div
            style={{
              display: book.posterUrl ? "none" : "flex",
              position: "absolute",
              inset: 0,
            }}
          >
            <Placeholder genre={book.genre} title={book.title} />
          </div>

          {/* Bottom gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />

          {/* Genre badge */}
          <div
            style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}
          >
            <span
              className={`badge ${GENRE_COLORS[book.genre] || "badge-action"}`}
              style={{ fontSize: 11 }}
            >
              {GENRE_ICONS[book.genre]} {book.genre.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px" }}>
          <h3
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: 17,
              letterSpacing: 0.5,
              color: "var(--text)",
              marginBottom: 4,
              lineHeight: 1.2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {book.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {book.year}
            </span>
            {(book._count?.reviews ?? 0) > 0 && (
              <span style={{ color: "var(--text-dim)", fontSize: 12 }}>
                ⭐ {book._count!.reviews}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Admin delete button */}
      {isAdmin && onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(book.id);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(239,68,68,0.5)",
            borderRadius: 6,
            padding: "3px 8px",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: 12,
            lineHeight: 1,
            backdropFilter: "blur(4px)",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
