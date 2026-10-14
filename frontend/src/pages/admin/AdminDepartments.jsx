import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from "../../services/departmentService";

const emptyForm = {
  name: "",
  description: "",
  location: "",
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Something went wrong. Please try again.";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments();
      setDepartments(data.departments || data.data?.departments || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const activeCount = departments.filter(
    (department) => department.isActive
  ).length;

  const filteredDepartments = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return departments.filter((department) => {
      const matchesSearch =
        !searchText ||
        department.name?.toLowerCase().includes(searchText) ||
        department.description?.toLowerCase().includes(searchText) ||
        department.location?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && department.isActive) ||
        (statusFilter === "inactive" && !department.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setForm({
      name: department.name || "",
      description: department.description || "",
      location: department.location || "",
    });
    setEditingId(department._id);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();

    if (name.length < 2 || name.length > 100) {
      setError("Department name must be between 2 and 100 characters.");
      return;
    }

    setSaving(true);

    try {
      const departmentData = {
        name,
        description: form.description.trim(),
        location: form.location.trim(),
      };

      if (editingId) {
        const result = await updateDepartment(editingId, departmentData);
        setSuccess(result.message || "Department updated successfully.");
      } else {
        const result = await createDepartment(departmentData);
        setSuccess(result.message || "Department created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      setActionId(department._id);
      setError("");
      setSuccess("");

      const result = await toggleDepartmentStatus(department._id);
      setSuccess(
        result.message ||
          `Department ${department.isActive ? "deactivated" : "activated"} successfully.`
      );

      await fetchDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${department.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionId(department._id);
      setError("");
      setSuccess("");

      const result = await deleteDepartment(department._id);
      setSuccess(result.message || "Department deleted successfully.");

      if (editingId === department._id) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
      }

      await fetchDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const getHeadDoctorName = (department) => {
    const doctorUser = department.headDoctor?.user;

    if (!doctorUser) {
      return department.headDoctor ? "Assigned" : "Not assigned";
    }

    return (
      `${doctorUser.firstName || ""} ${doctorUser.lastName || ""}`.trim() ||
      "Assigned"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Departments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage hospital departments, locations, and availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchDepartments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add department
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total departments</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {departments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active departments</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Inactive departments</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {departments.length - activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="self-start rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {success}
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded-lg p-1 text-green-700 transition hover:bg-green-100"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                {editingId ? "Edit department" : "Add new department"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the department information below."
                  : "Enter the details for the new hospital department."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close department form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="department-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Department name *
                </label>
                <input
                  id="department-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="e.g. Cardiology"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use a clear, recognizable department name.
                </p>
              </div>

              <div>
                <label
                  htmlFor="department-location"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="department-location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    maxLength={200}
                    placeholder="e.g. Ground floor, Block A"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="department-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="department-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                maxLength={1000}
                rows={4}
                placeholder="Describe the department and the services it provides..."
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create department"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Department list
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredDepartments.length} department
              {filteredDepartments.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search departments..."
                aria-label="Search departments"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter departments by status"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-green-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading departments...
              </p>
            </div>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center px-5">
            <div className="text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 font-medium text-slate-700">
                No departments found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or filters."
                  : "Add your first department to get started."}
              </p>
              {!search && statusFilter === "all" && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  Add department
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Head doctor
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDepartments.map((department) => (
                  <tr
                    key={department._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {department.name}
                          </p>
                          <p className="mt-1 max-w-sm whitespace-normal text-xs text-slate-500">
                            {department.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        {department.location || "Not specified"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 shrink-0 text-slate-400" />
                        {getHeadDoctorName(department)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          department.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {department.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Edit department"
                          aria-label={`Edit ${department.name}`}
                          onClick={() => openEditForm(department)}
                          disabled={actionId === department._id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title={
                            department.isActive ? "Deactivate" : "Activate"
                          }
                          aria-label={`${
                            department.isActive ? "Deactivate" : "Activate"
                          } ${department.name}`}
                          onClick={() => handleToggleStatus(department)}
                          disabled={actionId === department._id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                        >
                          {department.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Delete department"
                          aria-label={`Delete ${department.name}`}
                          onClick={() => handleDelete(department)}
                          disabled={actionId === department._id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          {actionId === department._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
    </div>
  );
};

export default AdminDepartments;