
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getTrashedUsers,
  restoreUser,
  permanentlyDeleteUser,
} from "../../services/userService";

const roleStyles = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

const getFullName = (user) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown user";

const formatDate = (date) => {
  if (!date) return "Unknown date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Unknown date";

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AdminTrash = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchTrashedUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTrashedUsers();
      setUsers(data.users || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load Trash. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrashedUsers();
  }, [fetchTrashedUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = getFullName(user).toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const phone = user.phone?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRestore = async (user) => {
    setActionLoading(user._id);
    setError("");
    setSuccess("");

    try {
      const data = await restoreUser(user._id);

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      setSuccess(
        data.message ||
          `${getFullName(user)} was restored successfully.`
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to restore this user."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handlePermanentDelete = async () => {
    if (!pendingDelete) return;

    const user = pendingDelete;
    setActionLoading(user._id);
    setError("");
    setSuccess("");

    try {
      const data = await permanentlyDeleteUser(user._id);

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      setPendingDelete(null);
      setSuccess(
        data.message || "User permanently deleted successfully."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to permanently delete this user."
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Trash2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Trash
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review deleted accounts and manage their recovery.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchTrashedUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Deleted accounts
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {users.length}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Users size={22} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Accounts currently waiting in Trash
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Before permanent deletion
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Permanent deletion cannot be undone. Accounts with
                linked patient or doctor profiles may require additional
                cleanup before deletion is allowed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <p className="flex-1">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              aria-label="Filter users by role"
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <span>
              {loading
                ? "Loading deleted accounts..."
                : `${filteredUsers.length} of ${users.length} accounts`}
            </span>

            {(search || roleFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
                className="font-medium text-green-700 hover:text-green-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Trash2 size={26} />
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              {users.length === 0
                ? "Your Trash is empty"
                : "No matching accounts"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {users.length === 0
                ? "Accounts moved to Trash will appear here, where you can restore them or permanently delete them."
                : "Try a different search term or change the role filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Date deleted</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserRound size={19} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {getFullName(user)}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <Mail size={13} />
                            <span className="break-all">
                              {user.email || "No email"}
                            </span>
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={12} />
                            {user.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          roleStyles[user.role] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-slate-400"
                        />
                        {formatDate(user.deletedAt)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        In Trash
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestore(user)}
                          disabled={Boolean(actionLoading)}
                          title="Restore account"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          Restore
                        </button>

                        <button
                          type="button"
                          onClick={() => setPendingDelete(user)}
                          disabled={Boolean(actionLoading)}
                          title="Permanently delete account"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Permanently delete ${getFullName(user)}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              setPendingDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="permanent-delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h2
              id="permanent-delete-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Permanently delete this account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to permanently delete{" "}
              <strong>{getFullName(pendingDelete)}</strong>. This
              action cannot be undone. If related medical profiles
              remain, the server may reject the request.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={Boolean(actionLoading)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={Boolean(actionLoading)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {actionLoading
                  ? "Deleting..."
                  : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrash;
