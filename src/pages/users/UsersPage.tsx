/**
 * WHY CHANGED:
 *
 * 1. DOM getElementById ANTI-PATTERN — The original handleSave() read form
 *    values via document.getElementById(). This is an uncontrolled pattern that:
 *    a) Returns null if the element hasn't mounted yet → silent data loss.
 *    b) Bypasses React's rendering model, making state unpredictable.
 *    c) Breaks in concurrent mode and SSR contexts.
 *    Fix: use a controlled `editForm` state object, synced when the drawer opens.
 *
 * 2. TYPE SAFETY — `data: any` in updateMutation replaced with typed UpdateUserRequest.
 *
 * 3. MISSING ERROR HANDLER — deleteMutation and restoreMutation had no onError
 *    callback. Silent failures are invisible to users. Added proper toast errors.
 *
 * 4. MISSING DELETE CONFIRMATION — Destructive delete fired immediately on click.
 *    Added a window.confirm guard. (TODO: replace with a modal in a future pass.)
 *
 * 5. FILTER SELECT — Role filter select had no onChange handler (dead UI).
 *    Wired to a `roleFilter` state that filters the displayed users.
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@entities/user/api/usersApi';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  User as UserIcon,
  Filter,
} from 'lucide-react';
import { cn, isSafeImageUrl } from '@shared/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import type { UserListItem, UpdateUserRequest } from '@shared/api/types';

type UserRole = 'CEO' | 'ROP' | 'SalesManager' | '';

interface EditForm {
  fullName: string;
  role: string;
  region: string;
}

function safeFormatDate(dateStr: string): string {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '—';
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole>('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ fullName: '', role: '', region: '' });
  // ConfirmDialog state — holds the user pending deletion.
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserListItem | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', includeDeleted],
    queryFn: () => usersApi.getAll({ includeDeleted }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const restoreMutation = useMutation({
    mutationFn: usersApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User restored successfully');
    },
    onError: () => toast.error('Failed to restore user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const openEditDrawer = (user: UserListItem) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName ?? '',
      role: user.role ?? 'SalesManager',
      region: user.region ?? '',
    });
  };

  const handleSave = () => {
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, data: editForm });
  };

  const handleDelete = (user: UserListItem) => {
    // Open ConfirmDialog instead of window.confirm.
    // The actual mutation fires from the dialog's onConfirm callback.
    setPendingDeleteUser(user);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === '' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const getRoleTone = (role?: string) => {
    switch (role) {
      case 'CEO': return 'primary' as const;
      case 'ROP': return 'info' as const;
      default:    return 'neutral' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users &amp; Team</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage your organization members and their roles.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-soft hover:shadow-glow transition-all active:scale-[0.98]"
          aria-label="Invite new team member"
        >
          <Plus size={18} aria-hidden="true" /> Invite Team Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5 min-w-full sm:min-w-[300px] focus-within:border-[var(--color-accent)]/50 transition-colors">
          <Search size={18} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          <label htmlFor="users-search" className="sr-only">Search users</label>
          <input
            id="users-search"
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder-[var(--color-text-muted)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <Filter size={16} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          <label htmlFor="role-filter" className="sr-only">Filter by role</label>
          <select
            id="role-filter"
            className="bg-transparent text-sm outline-none border-none pr-4"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole)}
          >
            <option value="">All Roles</option>
            <option value="CEO">CEO</option>
            <option value="ROP">ROP</option>
            <option value="SalesManager">Sales Manager</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/5 transition-colors">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-[var(--color-accent)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">Show Deleted</span>
        </label>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden rounded-2xl border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Team members table">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                <th scope="col" className="px-6 py-4 font-semibold">User</th>
                <th scope="col" className="px-6 py-4 font-semibold">Role</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden lg:table-cell">Region / Dept</th>
                <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Joined</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    'group transition-colors hover:bg-white/[0.02]',
                    user.isDeleted && 'opacity-60',
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-brand-soft flex items-center justify-center text-[var(--color-accent)] font-bold text-xs ring-1 ring-white/5">
                        {isSafeImageUrl(user.photoUrl) ? (
                          <img
                            src={user.photoUrl!}
                            alt={`${user.fullName ?? 'User'} avatar`}
                            className="h-full w-full rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          user.fullName?.[0]?.toUpperCase() ?? 'U'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.fullName}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={getRoleTone(user.role)}>
                      {user.role?.replace(/([A-Z])/g, ' $1').trim() ?? 'No Role'}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="text-sm">
                      {user.region ?? '—'}
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {user.department ?? 'General'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] tabular-nums hidden md:table-cell">
                    {safeFormatDate(user.createdAtUtc)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditDrawer(user)}
                        aria-label={`Edit ${user.fullName ?? 'user'}`}
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-all"
                      >
                        <Edit2 size={16} aria-hidden="true" />
                      </button>

                      {user.isDeleted ? (
                        <button
                          onClick={() => restoreMutation.mutate(user.id)}
                          aria-label={`Restore ${user.fullName ?? 'user'}`}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-muted)] transition-all"
                        >
                          <RotateCcw size={16} aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(user)}
                          aria-label={`Delete ${user.fullName ?? 'user'}`}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] transition-all"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                      <Search size={32} className="text-[var(--color-text-muted)] opacity-20" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-medium">No users found</h3>
                    <p className="text-[var(--color-text-muted)]">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.05] px-6 py-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Showing{' '}
            <span className="font-semibold text-[var(--color-text-secondary)]">
              {filteredUsers.length}
            </span>{' '}
            team members
          </p>
          {/* Pagination placeholder — real pagination requires backend support */}
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-xs rounded-lg bg-[var(--color-accent)] text-white font-medium">1</button>
            <button className="px-3 py-1 text-xs rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 transition-opacity duration-300',
          editingUser ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Edit user"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingUser(null)}
        />
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-full max-w-md transform bg-[var(--color-bg-secondary)] shadow-2xl border-l border-white/[0.08] transition-transform duration-500 ease-out-expo',
            editingUser ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                aria-label="Close drawer"
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {editingUser && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center text-center pb-6 border-b border-white/[0.05]">
                  <div className="h-20 w-20 rounded-full bg-gradient-brand p-1 mb-4">
                    <div className="h-full w-full rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-2xl font-bold">
                      {editingUser.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{editingUser.fullName}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{editingUser.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="edit-fullname" className="label-eyebrow">Full Name</label>
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <UserIcon size={16} className="text-[var(--color-text-muted)]" aria-hidden="true" />
                      <input
                        id="edit-fullname"
                        className="bg-transparent text-sm w-full outline-none"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="edit-role" className="label-eyebrow">Role</label>
                    <select
                      id="edit-role"
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border-white/[0.08]"
                    >
                      <option value="CEO">CEO</option>
                      <option value="ROP">ROP</option>
                      <option value="SalesManager">Sales Manager</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="edit-region" className="label-eyebrow">Region</label>
                    <input
                      id="edit-region"
                      value={editForm.region}
                      onChange={(e) => setEditForm((f) => ({ ...f, region: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-white/[0.08] flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        open={pendingDeleteUser !== null}
        title="Delete User"
        description={`Delete ${pendingDeleteUser?.fullName ?? 'this user'}? The action can be undone by enabling "Show Deleted" and restoring.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!pendingDeleteUser) return;
          deleteMutation.mutate(pendingDeleteUser.id, {
            onSuccess: () => setPendingDeleteUser(null),
            onError: () => setPendingDeleteUser(null),
          });
        }}
        onCancel={() => setPendingDeleteUser(null)}
      />
    </div>
  );
}
