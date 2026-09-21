"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

interface TaskManagerProps {
  user: {
    name: string;
    email: string;
    image: string;
    role: "USER" | "ADMIN";
  };
}

export default function TaskManager({ user }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tasks");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data.tasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      setTasks((currentTasks) => [data.task, ...currentTasks]);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
    try {
      setError("");

      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === taskId ? data.task : task)),
      );

      setEditingTask(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDeleteTask(taskId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);
      setError("");

      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const todoTasks = tasks.filter((task) => task.status === "TODO").length;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  function startEditing(task: Task) {
    setEditingTask(task);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                TM
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Task Manager
                </h1>

                <p className="text-xs text-slate-500">
                  Stay focused. Get things done.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {user.role === "ADMIN" && (
              <a
                href="/admin"
                className="hidden rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100 sm:block"
              >
                Admin Panel
              </a>
            )}

            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:block"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">
                {getGreeting()}
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {user.name.split(" ")[0]}'s Tasks
              </h2>

              <p className="mt-2 text-slate-500">
                Organize your work and keep track of your progress.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            description="All your tasks"
            icon="○"
          />

          <StatCard
            label="To Do"
            value={todoTasks}
            description="Waiting to start"
            icon="◷"
          />

          <StatCard
            label="In Progress"
            value={inProgressTasks}
            description="Currently working"
            icon="↗"
          />

          <StatCard
            label="Completed"
            value={completedTasks}
            description={`${completionPercentage}% completion`}
            icon="✓"
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Create a task
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add something you want to accomplish.
              </p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Finish portfolio"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add some details..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  maxLength={1000}
                />
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "+ Create Task"}
              </button>
            </form>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Tasks</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "task" : "tasks"} shown
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:w-52"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "ALL" | TaskStatus)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <p className="text-sm text-slate-500">Loading your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                  ✓
                </div>

                <h4 className="text-lg font-semibold text-slate-900">
                  {tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  {tasks.length === 0
                    ? "Create your first task and start organizing your work."
                    : "Try changing your search or status filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    editingTask={editingTask}
                    deleting={deletingId === task._id}
                    onStatusChange={(status) =>
                      handleUpdateTask(task._id, { status })
                    }
                    onPriorityChange={(priority) =>
                      handleUpdateTask(task._id, { priority })
                    }
                    onEdit={() => startEditing(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                    onCancelEdit={() => setEditingTask(null)}
                    onSaveEdit={(updates) =>
                      handleUpdateTask(task._id, updates)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
}

function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
          {icon}
        </div>
      </div>

      <p className="text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  editingTask: Task | null;
  deleting: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (updates: { title: string; description: string }) => void;
}

function TaskCard({
  task,
  editingTask,
  deleting,
  onStatusChange,
  onPriorityChange,
  onEdit,
  onDelete,
  onCancelEdit,
  onSaveEdit,
}: TaskCardProps) {
  const isEditing = editingTask?._id === task._id;

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || "",
  );

  useEffect(() => {
    if (isEditing) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
    }
  }, [isEditing, task.title, task.description]);

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <input
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            maxLength={100}
          />

          <textarea
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            maxLength={1000}
          />

          <div className="flex gap-2">
            <button
              onClick={() =>
                onSaveEdit({
                  title: editTitle,
                  description: editDescription,
                })
              }
              disabled={!editTitle.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={onCancelEdit}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <button
            onClick={() =>
              onStatusChange(task.status === "COMPLETED" ? "TODO" : "COMPLETED")
            }
            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
              task.status === "COMPLETED"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 hover:border-slate-500"
            }`}
            aria-label="Toggle task completion"
          >
            {task.status === "COMPLETED" && <span className="text-xs">✓</span>}
          </button>

          <div className="min-w-0">
            <h4
              className={`truncate text-base font-semibold ${
                task.status === "COMPLETED"
                  ? "text-slate-400 line-through"
                  : "text-slate-900"
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p
                className={`mt-1 line-clamp-2 text-sm ${
                  task.status === "COMPLETED"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />

              <PriorityBadge priority={task.priority} />

              <span className="text-xs text-slate-400">
                {formatDate(task.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <select
            value={task.priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as TaskPriority)
            }
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none"
            aria-label="Change priority"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <button
            onClick={onEdit}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const styles = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  const labels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles = {
    LOW: "bg-slate-50 text-slate-500",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
