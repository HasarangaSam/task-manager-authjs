"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "USER" | "ADMIN";
type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type Tab = "overview" | "users" | "tasks";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string;
  taskCount: number;
}

interface AdminTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  user: { _id: string; name: string; email: string; image?: string } | null;
}

interface Stats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  activeUsers: number;
  completionRate: number;
}

interface AdminPanelProps {
  currentUser: { name: string; email: string; image?: string };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-root">
      <style>{adminStyles}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">TaskAdmin</div>
            <div className="sidebar-logo-sub">Control Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            id="tab-overview"
            className={`sidebar-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            Overview
          </button>

          <button
            id="tab-users"
            className={`sidebar-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Users
          </button>

          <button
            id="tab-tasks"
            className={`sidebar-nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("tasks");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11l3 3L22 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Tasks
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="sidebar-user-img"
              />
            ) : (
              <span>{currentUser.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser.name}</div>
            <div className="sidebar-user-email">{currentUser.email}</div>
          </div>
          <button
            id="logout-btn"
            className="sidebar-logout-btn"
            title="Logout"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="topbar-title">
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "users" && "User Management"}
            {activeTab === "tasks" && "Task Management"}
          </div>

          <div className="topbar-badge">Admin</div>
        </header>

        <div className="content-area">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "tasks" && <TasksTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
        else setError(data.message || "Failed to load stats");
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading platform stats..." />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Platform Overview</h2>
        <p className="page-sub">Real-time insights across all users and tasks</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
          color="purple"
          description="Registered accounts"
        />
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="blue"
          description="Across all users"
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M22 4L12 14.01l-3-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="green"
          description={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8v4l3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="amber"
          description="Users with tasks"
        />
      </div>

      {/* Task distribution */}
      <div className="overview-grid">
        <div className="glass-card">
          <h3 className="card-title">Task Distribution</h3>
          <div className="task-dist-bars">
            <DistBar
              label="To Do"
              value={stats.todoTasks}
              total={stats.totalTasks}
              color="#6366f1"
            />
            <DistBar
              label="In Progress"
              value={stats.inProgressTasks}
              total={stats.totalTasks}
              color="#f59e0b"
            />
            <DistBar
              label="Completed"
              value={stats.completedTasks}
              total={stats.totalTasks}
              color="#10b981"
            />
          </div>
        </div>

        <div className="glass-card">
          <h3 className="card-title">Completion Rate</h3>
          <div className="donut-wrapper">
            <DonutChart percentage={stats.completionRate} />
            <p className="donut-label">{stats.completionRate}% complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="dist-bar-row">
      <div className="dist-bar-header">
        <span className="dist-bar-label">{label}</span>
        <span className="dist-bar-count">
          {value} <span className="dist-bar-pct">({pct}%)</span>
        </span>
      </div>
      <div className="dist-bar-track">
        <div
          className="dist-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function DonutChart({ percentage }: { percentage: number }) {
  const size = 120;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="12"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="url(#grad)"
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <text
        x="60"
        y="65"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="700"
      >
        {percentage}%
      </text>
    </svg>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      const r = await fetch(`/api/admin/users?${params}`);
      const data = await r.json();
      if (data.success) {
        setUsers(data.users);
        setTotal(data.pagination.total);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingRoleId(userId);
    try {
      const r = await fetch(`/api/admin/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await r.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
      } else {
        setError(data.message || "Failed to update role");
      }
    } catch {
      setError("Failed to update role");
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function handleDelete(user: AdminUser) {
    setDeletingId(user._id);
    setConfirmDelete(null);
    try {
      const r = await fetch(`/api/admin/users?id=${user._id}`, {
        method: "DELETE",
      });
      const data = await r.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        setTotal((t) => t - 1);
      } else {
        setError(data.message || "Failed to delete user");
      }
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-sub">{total} registered users</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {/* Search */}
      <div className="table-toolbar">
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="user-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading users..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tasks</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="user-avatar-img"
                            />
                          ) : (
                            <span>
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="cell-muted">{user.email}</td>
                    <td>
                      <select
                        id={`role-select-${user._id}`}
                        value={user.role}
                        disabled={updatingRoleId === user._id}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value as UserRole)
                        }
                        className={`role-select ${user.role === "ADMIN" ? "role-admin" : "role-user"}`}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className="task-count-badge">{user.taskCount}</span>
                    </td>
                    <td className="cell-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <button
                        id={`delete-user-${user._id}`}
                        className="delete-btn"
                        disabled={deletingId === user._id}
                        onClick={() => setConfirmDelete(user)}
                      >
                        {deletingId === user._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This will also delete all ${confirmDelete.taskCount} of their task(s). This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminTask | null>(null);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const r = await fetch(`/api/admin/tasks?${params}`);
      const data = await r.json();
      if (data.success) {
        setTasks(data.tasks);
        setTotal(data.pagination.total);
      } else {
        setError(data.message || "Failed to load tasks");
      }
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setUpdatingId(taskId);
    try {
      const r = await fetch(`/api/admin/tasks?id=${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await r.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status } : t)),
        );
      } else {
        setError(data.message || "Failed to update task");
      }
    } catch {
      setError("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePriorityChange(taskId: string, priority: TaskPriority) {
    setUpdatingId(taskId);
    try {
      const r = await fetch(`/api/admin/tasks?id=${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      const data = await r.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, priority } : t)),
        );
      } else {
        setError(data.message || "Failed to update task");
      }
    } catch {
      setError("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(task: AdminTask) {
    setDeletingId(task._id);
    setConfirmDelete(null);
    try {
      const r = await fetch(`/api/admin/tasks?id=${task._id}`, {
        method: "DELETE",
      });
      const data = await r.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id));
        setTotal((n) => n - 1);
      } else {
        setError(data.message || "Failed to delete task");
      }
    } catch {
      setError("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveEdit(updates: {
    title: string;
    description: string;
  }) {
    if (!editingTask) return;
    setUpdatingId(editingTask._id);
    try {
      const r = await fetch(`/api/admin/tasks?id=${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await r.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === editingTask._id ? { ...t, ...updates } : t,
          ),
        );
        setEditingTask(null);
      } else {
        setError(data.message || "Failed to update task");
      }
    } catch {
      setError("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredCount = useMemo(() => tasks.length, [tasks]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-sub">{total} tasks total</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="table-toolbar">
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="task-search"
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="task-count-row">
        {filteredCount} task{filteredCount !== 1 ? "s" : ""} shown
      </div>

      {loading ? (
        <LoadingState message="Loading tasks..." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>User</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) =>
                  editingTask?._id === task._id ? (
                    <TaskEditRow
                      key={task._id}
                      task={task}
                      saving={updatingId === task._id}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingTask(null)}
                    />
                  ) : (
                    <tr key={task._id} className="table-row">
                      <td>
                        <div className="task-title-cell">
                          <span
                            className={
                              task.status === "COMPLETED"
                                ? "line-through text-dim"
                                : ""
                            }
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="task-desc-preview">
                              {task.description.slice(0, 60)}
                              {task.description.length > 60 ? "…" : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {task.user ? (
                          <div className="user-cell">
                            <div className="user-avatar user-avatar-sm">
                              {task.user.image ? (
                                <img
                                  src={task.user.image}
                                  alt={task.user.name}
                                  className="user-avatar-img"
                                />
                              ) : (
                                <span>
                                  {task.user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="cell-name">{task.user.name}</div>
                              <div className="cell-email">
                                {task.user.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="cell-muted">Unknown</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={task.status}
                          disabled={updatingId === task._id}
                          onChange={(e) =>
                            handleStatusChange(
                              task._id,
                              e.target.value as TaskStatus,
                            )
                          }
                          className={`status-select status-${task.status.toLowerCase().replace("_", "-")}`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={task.priority}
                          disabled={updatingId === task._id}
                          onChange={(e) =>
                            handlePriorityChange(
                              task._id,
                              e.target.value as TaskPriority,
                            )
                          }
                          className={`priority-select priority-${task.priority.toLowerCase()}`}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </td>
                      <td className="cell-muted">{formatDate(task.createdAt)}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            id={`edit-task-${task._id}`}
                            className="edit-btn"
                            onClick={() => setEditingTask(task)}
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-task-${task._id}`}
                            className="delete-btn"
                            disabled={deletingId === task._id}
                            onClick={() => setConfirmDelete(task)}
                          >
                            {deletingId === task._id ? "..." : "Del"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Task"
          message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Task Edit Row ─────────────────────────────────────────────────────────────

function TaskEditRow({
  task,
  saving,
  onSave,
  onCancel,
}: {
  task: AdminTask;
  saving: boolean;
  onSave: (u: { title: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  return (
    <tr className="table-row edit-row">
      <td colSpan={6}>
        <div className="edit-row-inner">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="edit-input"
            placeholder="Task title"
            maxLength={100}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="edit-textarea"
            placeholder="Description (optional)"
            rows={2}
            maxLength={1000}
          />
          <div className="edit-actions">
            <button
              className="save-btn"
              disabled={!title.trim() || saving}
              onClick={() => onSave({ title, description })}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  description,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "purple" | "blue" | "green" | "amber";
  description: string;
}) {
  const colors = {
    purple: { bg: "rgba(124,58,237,0.15)", text: "#a78bfa" },
    blue: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
    green: { bg: "rgba(16,185,129,0.15)", text: "#34d399" },
    amber: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  };

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        <span
          className="stat-icon"
          style={{ background: colors[color].bg, color: colors[color].text }}
        >
          {icon}
        </span>
      </div>
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-description">{description}</div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-state">
      <p>{message}</p>
    </div>
  );
}

function ErrorBanner({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="error-banner">
      <span>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .admin-root {
    display: flex;
    min-height: 100vh;
    background: #0d0d14;
    font-family: 'Inter', system-ui, sans-serif;
    color: #e2e8f0;
    position: relative;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px;
    min-height: 100vh;
    background: rgba(15, 15, 25, 0.95);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 99;
    backdrop-filter: blur(2px);
    display: none;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar-logo-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 15px rgba(124,58,237,0.4);
  }

  .sidebar-logo-text {
    font-size: 16px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.3px;
  }

  .sidebar-logo-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
    margin-top: 1px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sidebar-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.85);
  }

  .sidebar-nav-item.active {
    background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.25));
    color: #a78bfa;
    border: 1px solid rgba(124,58,237,0.25);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px; height: 20px;
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar-user-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-user-img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .sidebar-user-info {
    flex: 1;
    min-width: 0;
  }

  .sidebar-user-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    truncate: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .sidebar-user-email {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .sidebar-logout-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }

  .sidebar-logout-btn:hover {
    background: rgba(239,68,68,0.12);
    color: #f87171;
  }

  /* ── Main Content ── */
  .main-content {
    flex: 1;
    margin-left: 260px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(13,13,20,0.8);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
  }

  .topbar-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
  }

  .topbar-badge {
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3));
    border: 1px solid rgba(124,58,237,0.4);
    color: #a78bfa;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .content-area {
    flex: 1;
    padding: 32px;
    max-width: 1200px;
    width: 100%;
  }

  /* ── Page header ── */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .page-title {
    font-size: 26px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    margin: 0;
  }

  .page-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin: 4px 0 0;
  }

  /* ── Stats Grid ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }

  .stat-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-1px);
  }

  .stat-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: white;
    letter-spacing: -1px;
    line-height: 1;
  }

  .stat-description {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    margin-top: 6px;
  }

  /* ── Overview grid ── */
  .overview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 24px;
  }

  .glass-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
  }

  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: white;
    margin: 0 0 20px;
  }

  /* ── Dist bars ── */
  .task-dist-bars {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .dist-bar-row { display: flex; flex-direction: column; gap: 8px; }

  .dist-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dist-bar-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.65);
  }

  .dist-bar-count {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
  }

  .dist-bar-pct {
    font-size: 11px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
  }

  .dist-bar-track {
    width: 100%;
    height: 8px;
    background: rgba(255,255,255,0.06);
    border-radius: 100px;
    overflow: hidden;
  }

  .dist-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 1s cubic-bezier(.4,0,.2,1);
  }

  /* ── Donut ── */
  .donut-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }

  .donut-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }

  /* ── Table toolbar ── */
  .table-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.3);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 14px 10px 38px;
    font-size: 14px;
    color: white;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
  }

  .search-input::placeholder { color: rgba(255,255,255,0.25); }
  .search-input:focus {
    border-color: rgba(124,58,237,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .filter-select:focus {
    border-color: rgba(124,58,237,0.5);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .task-count-row {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    margin-bottom: 10px;
  }

  /* ── Table ── */
  .table-wrapper {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .data-table thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .data-table th {
    padding: 14px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    white-space: nowrap;
  }

  .table-row {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
  }

  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: rgba(255,255,255,0.03); }

  .data-table td {
    padding: 14px 16px;
    vertical-align: middle;
  }

  .table-empty {
    text-align: center;
    padding: 48px 16px !important;
    color: rgba(255,255,255,0.25);
    font-size: 14px;
  }

  /* ── User cell ── */
  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    overflow: hidden;
  }

  .user-avatar-sm {
    width: 30px; height: 30px;
    font-size: 11px;
  }

  .user-avatar-img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .user-name {
    font-weight: 600;
    color: rgba(255,255,255,0.85);
  }

  .cell-muted { color: rgba(255,255,255,0.4); font-size: 13px; }
  .cell-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
  .cell-email { font-size: 11px; color: rgba(255,255,255,0.35); }
  .text-dim { color: rgba(255,255,255,0.3); }
  .line-through { text-decoration: line-through; }

  /* ── Badges & selects ── */
  .task-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: rgba(99,102,241,0.15);
    color: #818cf8;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
  }

  .role-select {
    border: none;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
  }

  .role-admin {
    background: rgba(124,58,237,0.2);
    color: #a78bfa;
  }

  .role-user {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.6);
  }

  .status-select {
    border: none;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
  }

  .status-todo { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
  .status-in-progress { background: rgba(245,158,11,0.15); color: #fbbf24; }
  .status-completed { background: rgba(16,185,129,0.15); color: #34d399; }

  .priority-select {
    border: none;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
  }

  .priority-low { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45); }
  .priority-medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
  .priority-high { background: rgba(239,68,68,0.15); color: #f87171; }

  /* ── Task cell ── */
  .task-title-cell {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-width: 260px;
  }

  .task-desc-preview {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Action buttons ── */
  .action-btns {
    display: flex;
    gap: 6px;
  }

  .edit-btn {
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.2);
    color: #818cf8;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .edit-btn:hover {
    background: rgba(99,102,241,0.2);
  }

  .delete-btn {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .delete-btn:hover:not(:disabled) {
    background: rgba(239,68,68,0.2);
  }

  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Edit row ── */
  .edit-row { background: rgba(124,58,237,0.06) !important; }

  .edit-row-inner {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0;
  }

  .edit-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(124,58,237,0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    outline: none;
    width: 100%;
    font-family: inherit;
  }

  .edit-input:focus { border-color: rgba(124,58,237,0.6); }

  .edit-textarea {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    outline: none;
    width: 100%;
    resize: none;
    font-family: inherit;
  }

  .edit-textarea:focus { border-color: rgba(124,58,237,0.4); }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  .save-btn {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border: none;
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
  }

  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .save-btn:hover:not(:disabled) { opacity: 0.9; }

  .cancel-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .cancel-btn:hover { background: rgba(255,255,255,0.1); }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    background: #1a1a2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 32px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    animation: slideUp 0.2s ease;
  }

  .modal-icon { font-size: 36px; margin-bottom: 12px; }

  .modal-title {
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px;
  }

  .modal-message {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    line-height: 1.6;
    margin: 0 0 24px;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .modal-cancel {
    flex: 1;
    max-width: 140px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    font-weight: 600;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .modal-cancel:hover { background: rgba(255,255,255,0.1); }

  .modal-confirm {
    flex: 1;
    max-width: 140px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
  }

  .modal-confirm:hover { opacity: 0.9; }

  /* ── Loading & Error ── */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 16px;
    gap: 16px;
  }

  .spinner {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.06);
    border-top-color: #7c3aed;
    animation: spin 0.8s linear infinite;
  }

  .loading-text { font-size: 14px; color: rgba(255,255,255,0.35); }

  .error-state {
    text-align: center;
    padding: 48px;
    color: #f87171;
    font-size: 14px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    color: #f87171;
    margin-bottom: 16px;
  }

  .error-banner button {
    background: none;
    border: none;
    color: #f87171;
    cursor: pointer;
    font-size: 16px;
    padding: 0 4px;
  }

  /* ── Animations ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .overview-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar-open {
      transform: translateX(0);
    }

    .sidebar-backdrop {
      display: block;
    }

    .main-content { margin-left: 0; }

    .mobile-menu-btn { display: flex; align-items: center; }

    .content-area { padding: 20px; }

    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr; }
    .table-toolbar { flex-direction: column; align-items: stretch; }
    .filter-row { flex-direction: column; }
  }
`;
