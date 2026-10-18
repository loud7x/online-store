"use client";

import { useState } from "react";
import { adminUsers, type AdminUser } from "@/data/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState(adminUsers);

  function toggleSuspend(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  }

  function toggleVerified(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u))
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Verify sellers, suspend accounts, view roles
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">
                      {u.username}
                      {u.verified && (
                        <span className="text-[var(--primary)] ml-1">✓</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.status === "active"
                          ? "text-[var(--success)] text-xs font-medium"
                          : "text-[var(--danger)] text-xs font-medium"
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.sales}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.role !== "admin" && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleVerified(u.id)}
                            className="btn btn-secondary btn-sm text-xs px-2 py-1"
                          >
                            {u.verified ? "Unverify" : "Verify"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSuspend(u.id)}
                            className="btn btn-ghost btn-sm text-xs px-2 py-1"
                          >
                            {u.status === "active" ? "Suspend" : "Restore"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
