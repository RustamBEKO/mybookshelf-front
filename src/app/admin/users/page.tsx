'use client';
import { useEffect, useState, useMemo } from 'react';
import { apiGetAllUsers, apiDeleteUser, apiUpdateUserRole } from '@/lib/api';
import { getUserInfo, isSuperAdmin } from '@/lib/auth';
import type { User, Role } from '@/types';

// ── Role badge config ─────────────────────────────────────────────
const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string; icon: string }> = {
  USER:        { label: 'User',        icon: '👤', color: '#a3a3a3', bg: 'var(--bg-elevated)',     border: 'var(--border)' },
  ADMIN:       { label: 'Admin',       icon: '⚙️',  color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent)' },
  SUPER_ADMIN: { label: 'Super Admin', icon: '👑',  color: '#f5c518',       bg: 'rgba(245,197,24,0.12)', border: 'rgba(245,197,24,0.5)' },
};

function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, padding: '3px 10px', borderRadius: 99, fontWeight: 500,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap',
    }}>
      {m.icon} {m.label}
    </span>
  );
}

// ── Role selector dropdown ────────────────────────────────────────
function RoleSelector({
  user, onUpdate, disabled,
}: {
  user: User;
  onUpdate: (id: string, role: Role) => Promise<void>;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Super Admin role can never be assigned via the UI (must be done in DB)
  const assignableRoles: Role[] = ['USER', 'ADMIN'];

  const handleSelect = async (role: Role) => {
    if (role === user.role) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try { await onUpdate(user.id, role); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        disabled={disabled || loading}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 8, padding: '4px 10px', cursor: disabled ? 'not-allowed' : 'pointer',
          color: 'var(--text-muted)', fontSize: 13, transition: 'border-color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={e => !disabled && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
      >
        {loading ? '…' : (<><RoleBadge role={user.role} /> ▾</>)}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 160, overflow: 'hidden',
          }}>
            {assignableRoles.map(role => {
              const m = ROLE_META[role];
              const isActive = role === user.role;
              return (
                <button
                  key={role}
                  onClick={() => handleSelect(role)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? m.color : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 13, textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => !isActive && ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => !isActive && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  {isActive && <span style={{ marginLeft: 'auto', color: m.color }}>✓</span>}
                </button>
              );
            })}
            <div style={{ padding: '8px 14px 10px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                👑 Super Admin can only be set via database
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
type RoleFilter = 'ALL' | Role;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const me = getUserInfo();
  const superAdmin = isSuperAdmin();

  useEffect(() => {
    apiGetAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateRole = async (id: string, role: Role) => {
    setUpdatingRole(id);
    try {
      const updated = await apiUpdateUserRole(id, role);
      setUsers(us => us.map(u => u.id === id ? { ...u, role: updated.role } : u));
      showToast(`Role updated to ${ROLE_META[role].label}`);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async (user: User) => {
    setDeleting(user.id);
    try {
      await apiDeleteUser(user.id);
      setUsers(us => us.filter(u => u.id !== user.id));
      showToast('User deleted');
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setDeleting(null);
      setConfirm(null);
    }
  };

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'ALL') list = list.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, search, roleFilter]);

  // Stats
  const counts = useMemo(() => ({
    total: users.length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
  }), [users]);

  const filterTabs: { value: RoleFilter; label: string; icon: string; count: number }[] = [
    { value: 'ALL',         label: 'All',        icon: '👥', count: counts.total },
    { value: 'SUPER_ADMIN', label: 'Super Admin', icon: '👑', count: counts.superAdmins },
    { value: 'ADMIN',       label: 'Admins',      icon: '⚙️',  count: counts.admins },
    { value: 'USER',        label: 'Users',       icon: '👤', count: counts.users },
  ];

  return (
    <div className="fade-up">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 20px', boxShadow: 'var(--shadow-lg)',
          fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeUp 0.3s ease',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: 36, letterSpacing: 2 }}>Users</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {counts.total} total
          {superAdmin && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>· You can manage roles</span>}
        </p>
      </div>

      {/* Role info banner for non-superadmins */}
      {!superAdmin && (
        <div style={{
          background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: 18 }}>👑</span>
          <p>Role management is only available to <strong style={{ color: '#f5c518' }}>Super Admins</strong>. You can view all users but cannot change roles or delete accounts.</p>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',       value: counts.total,       icon: '👥', color: '#818cf8' },
          { label: 'Super Admins', value: counts.superAdmins, icon: '👑', color: '#f5c518' },
          { label: 'Admins',      value: counts.admins,      icon: '⚙️',  color: 'var(--accent)' },
          { label: 'Users',       value: counts.users,       icon: '👤', color: '#22d3ee' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.label}</p>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 220px' }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className="btn btn-sm"
                style={{
                  background: roleFilter === tab.value ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: roleFilter === tab.value ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  gap: 4,
                }}
              >
                {tab.icon} {tab.label}
                <span style={{
                  background: roleFilter === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)',
                  borderRadius: 99, padding: '1px 7px', fontSize: 11,
                }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
            <p>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {['User', 'Email', 'Role', 'Reviews', 'Joined', superAdmin ? 'Actions' : ''].filter(Boolean).map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
                      textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const isMe = u.id === me?.id;
                  const isSuperAdminUser = u.role === 'SUPER_ADMIN';
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s',
                        background: isMe ? 'var(--accent-dim)' : 'transparent',
                      }}
                      onMouseEnter={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
                      onMouseLeave={e => !isMe && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      {/* Avatar + Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: isSuperAdminUser ? 'rgba(245,197,24,0.2)'
                              : u.role === 'ADMIN' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                            border: `2px solid ${isSuperAdminUser ? 'rgba(245,197,24,0.5)'
                              : u.role === 'ADMIN' ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSuperAdminUser ? '#f5c518' : u.role === 'ADMIN' ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: 15,
                          }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, lineHeight: 1.3 }}>
                              {u.name}
                              {isMe && (
                                <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 6, fontWeight: 400 }}>
                                  (you)
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>#{u.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: 220 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {u.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '12px 16px' }}>
                        {superAdmin && !isMe && !isSuperAdminUser ? (
                          <RoleSelector
                            user={u}
                            onUpdate={handleUpdateRole}
                            disabled={updatingRole === u.id}
                          />
                        ) : (
                          <RoleBadge role={u.role} />
                        )}
                      </td>

                      {/* Reviews count */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {u._count?.reviews ?? '—'}
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions — SUPER_ADMIN only */}
                      {superAdmin && (
                        <td style={{ padding: '12px 16px' }}>
                          {!isMe && !isSuperAdminUser ? (
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={deleting === u.id}
                              onClick={() => setConfirm(u)}
                            >
                              {deleting === u.id ? '…' : 'Delete'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Protected</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission note */}
      {superAdmin && (
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          👑 Super Admin accounts are protected — role & deletion must be managed directly in the database
        </p>
      )}

      {/* Delete confirm modal */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
        }}>
          <div className="card" style={{ maxWidth: 420, width: '100%' }}>
            <h3 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 26, marginBottom: 8 }}>
              Delete User?
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--text-muted)',
              }}>
                {confirm.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>{confirm.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{confirm.email}</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              This will permanently delete the account and all their reviews. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                style={{
                  flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontWeight: 500,
                  fontSize: 14, padding: '10px',
                }}
                onClick={() => handleDelete(confirm)}
                disabled={!!deleting}
              >
                {deleting ? 'Deleting…' : '🗑 Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
