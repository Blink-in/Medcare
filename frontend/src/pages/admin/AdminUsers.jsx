import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  UserCheck,
  UserX,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteUser,
  getUsers,
  toggleUserStatus,
  updateUserRole,
} from "../../services/userService";

const roleStyles = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

const getFullName = (user) => {
  return (
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "N/A"
  );
};

const formatRole = (role) => {
  if (!role) return "Unknown";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      if (!data || !Array.isArray(data.users)) {
        setUsers([]);
        setError("Unable to load users. Invalid server response.");
        return;
      }

      setUsers(data.users);
    } catch (err) {
      console.error("Fetch users error:", err);

      setUsers([]);

      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (user.isDeleted === true) {
        return false;
      }

      const fullName = getFullName(user).toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const phone = user.phone?.toLowerCase() || "";
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        fullName.includes(searchText) ||
        email.includes(searchText) ||
        phone.includes(searchText);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleToggleStatus = async (user) => {
    try {
      setActionLoading(true);
      setError("");

      const data = await toggleUserStatus(user._id);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id ? data.user : currentUser
        )
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser(data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update user status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (user, role) => {
    if (role === user.role) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const data = await updateUserRole(user._id, role);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id ? data.user : currentUser
        )
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser(data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update user role."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Move ${getFullName(user)} to Trash?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteUser(user._id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser._id !== user._id
        )
      );

      setSelectedUser(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to move user to Trash."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital users and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchUsers}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              User List
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-green-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading users...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center px-5">
            <div className="text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-3 font-medium text-slate-700">
                No users found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {users.length === 0
                  ? "There are currently no users."
                  : "Try changing your search or filters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {getFullName(user)}
                          </p>

                          <p className="text-xs text-slate-500">
                            View details
                          </p>
                        </div>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {user.email || "N/A"}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {user.phone || "No phone"}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={user.role || "patient"}
                        onChange={(e) =>
                          handleRoleChange(
                            user,
                            e.target.value
                          )
                        }
                        disabled={actionLoading}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${
                          roleStyles[user.role] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <option value="patient">
                          Patient
                        </option>

                        <option value="doctor">
                          Doctor
                        </option>

                        <option value="admin">
                          Admin
                        </option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(user)
                          }
                          disabled={actionLoading}
                          title={
                            user.isActive
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isActive
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(user)
                          }
                          disabled={actionLoading}
                          title="Move to Trash"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                User Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <UserRound className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {getFullName(selectedUser)}
                  </h3>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      roleStyles[
                        selectedUser.role
                      ] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {formatRole(
                      selectedUser.role
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-800">
                    {selectedUser.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-slate-800">
                    {selectedUser.phone || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedUser.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    User ID
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-600">
                    {selectedUser._id}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleStatus(
                      selectedUser
                    )
                  }
                  disabled={actionLoading}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {selectedUser.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(selectedUser)
                  }
                  disabled={actionLoading}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;