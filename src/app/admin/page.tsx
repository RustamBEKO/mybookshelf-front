"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetAdminStats } from "@/lib/api";
import type { AdminStats, Genre } from "@/types";

const GENRE_COLORS: Record<Genre, string> = {
  ACTION: "#ef4444",
  COMEDY: "#eab308",
  DRAMA: "#818cf8",
  HORROR: "#c084fc",
  SCI_FI: "#22d3ee",
};

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="card"
      style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color ? `${color}22` : "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
          {label}
        </p>
        <p
          style={{
            fontFamily: "Trebuchet MS, sans-serif",
            fontSize: 28,
            letterSpacing: 1,
            color: color || "var(--text)",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function GenreBar({
  genre,
  count,
  total,
}: {
  genre: Genre;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {genre.replace("_", " ")}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{count}</span>
      </div>
      <div
        style={{
          height: 8,
          background: "var(--bg-elevated)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            width: `${pct}%`,
            background: GENRE_COLORS[genre],
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}
      >
        <div className="spinner" />
      </div>
    );
  if (!stats)
    return <p style={{ color: "var(--text-muted)" }}>Failed to load stats</p>;

  const { overview, booksByGenre, recentBooks, recentUsers, topRatedBooks } =
    stats;
  const totalBooksByGenre = booksByGenre.reduce((s, g) => s + g.count, 0);

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "Trebuchet MS, sans-serif",
            fontSize: 36,
            letterSpacing: 2,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Overview of your book platform
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon="📚"
          label="Total Books"
          value={overview.totalBooks}
          sub={`+${overview.newBooksThisMonth} this month`}
          color="var(--accent)"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={overview.totalUsers}
          sub={`+${overview.newUsersThisMonth} this month`}
          color="#818cf8"
        />
        <StatCard
          icon="💬"
          label="Total Reviews"
          value={overview.totalReviews}
          sub={`+${overview.reviewsThisMonth} this month`}
          color="#22d3ee"
        />
        <StatCard
          icon="⭐"
          label="Avg Rating"
          value={`${overview.avgRating}/10`}
          sub={
            overview.reviewsGrowth >= 0
              ? `▲ ${overview.reviewsGrowth}% vs last month`
              : `▼ ${Math.abs(overview.reviewsGrowth)}% vs last month`
          }
          color="var(--gold)"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Genre distribution */}
        <div className="card">
          <h3
            style={{
              fontFamily: "Trebuchet MS, sans-serif",
              fontSize: 20,
              letterSpacing: 1,
              marginBottom: 20,
            }}
          >
            Books by Genre
          </h3>
          {booksByGenre.map((g) => (
            <GenreBar
              key={g.genre}
              genre={g.genre}
              count={g.count}
              total={totalBooksByGenre}
            />
          ))}
        </div>

        {/* Top rated */}
        <div className="card">
          <h3
            style={{
              fontFamily: "Trebuchet MS, sans-serif",
              fontSize: 20,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            Top Rated
          </h3>
          {topRatedBooks.length === 0 && (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
              No reviews yet
            </p>
          )}
          {topRatedBooks.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                padding: "8px 0",
                borderBottom:
                  i < topRatedBooks.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "Trebuchet MS, sans-serif",
                  fontSize: 20,
                  color: "var(--text-dim)",
                  width: 20,
                }}
              >
                #{i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/books/${b.id}`}
                  style={{
                    textDecoration: "none",
                    color: "var(--text)",
                    fontWeight: 500,
                    fontSize: 14,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.title}
                </Link>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  {b.reviewCount} reviews
                </span>
              </div>
              <span
                style={{ color: "var(--gold)", fontWeight: 600, fontSize: 14 }}
              >
                ★ {b.avgRating}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Recent books */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontFamily: "Trebuchet MS, sans-serif",
                fontSize: 20,
                letterSpacing: 1,
              }}
            >
              Recent Books
            </h3>
            <Link
              href="/admin/books"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>
          {recentBooks.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom:
                  i < recentBooks.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <div>
                <Link
                  href={`/books/${b.id}`}
                  style={{
                    textDecoration: "none",
                    color: "var(--text)",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {b.title}
                </Link>
                <p style={{ color: "var(--text-dim)", fontSize: 11 }}>
                  {b.year} · {b.genre}
                </p>
              </div>
              <span style={{ color: "var(--text-dim)", fontSize: 11 }}>
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {/* Recent users */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontFamily: "Trebuchet MS, sans-serif",
                fontSize: 20,
                letterSpacing: 1,
              }}
            >
              Recent Users
            </h3>
            <Link
              href="/admin/users"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>
          {recentUsers.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom:
                  i < recentUsers.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-dim)" }}>
                    {u.email}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background:
                    u.role === "ADMIN"
                      ? "var(--accent-dim)"
                      : "var(--bg-elevated)",
                  color:
                    u.role === "ADMIN" ? "var(--accent)" : "var(--text-dim)",
                }}
              >
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
