"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/books", label: "Books", icon: "📚" },
  { href: "/admin/books/create", label: "Add Book", icon: "➕" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/", label: "View Site", icon: "🌐" },
];

export function AdminSidebar() {
  const path = usePathname();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        flexShrink: 0,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        minHeight: "calc(100vh - 60px)",
        padding: "24px 0",
        position: "sticky",
        top: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "0 16px 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: 1.5,
            color: "var(--text-dim)",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Admin Panel
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 500,
            background: isSuperAdmin
              ? "rgba(245,197,24,0.12)"
              : "var(--accent-dim)",
            color: isSuperAdmin ? "#f5c518" : "var(--accent)",
            border: `1px solid ${isSuperAdmin ? "rgba(245,197,24,0.4)" : "var(--accent)"}`,
          }}
        >
          {isSuperAdmin ? "👑 Super Admin" : "⚙️ Admin"}
        </div>
        {user && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              marginTop: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </p>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === "/admin"
              ? path === "/admin"
              : path.startsWith(href) && href !== "/admin";
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "var(--accent-dim)" : "transparent",
                borderRight: active
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {icon}
              </span>
              <span>{label}</span>
              {href === "/admin/users" && isSuperAdmin && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    background: "rgba(245,197,24,0.15)",
                    color: "#f5c518",
                    padding: "1px 7px",
                    borderRadius: 99,
                  }}
                >
                  manage
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
          Permission levels:
        </p>
        {[
          { icon: "👑", label: "Super Admin", desc: "Full control + roles" },
          { icon: "⚙️", label: "Admin", desc: "Manage books" },
        ].map((r) => (
          <div
            key={r.label}
            style={{ display: "flex", gap: 6, marginBottom: 6 }}
          >
            <span style={{ fontSize: 13 }}>{r.icon}</span>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                {r.label}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-dim)" }}>{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
