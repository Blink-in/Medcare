import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";

import {
  createDoctor,
  getDoctors,
  toggleDoctorStatus,
  verifyDoctor,
} from "../../services/doctorService";
import { getUsers } from "../../services/userService";
import { getDepartments } from "../../services/departmentService";

const emptyForm = {
  user: "",
  licenseNumber: "",
  specialization: "",
  qualification: "",
  experience: "",
  bio: "",
  consultationFee: "",
  department: "",
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [doctorsData, usersData, departmentsData] =
        await Promise.all([
          getDoctors(),
          getUsers(),
          getDepartments(),
        ]);

      setDoctors(doctorsData.doctors || []);
      setUsers(usersData.users || []);
      setDepartments(departmentsData.departments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load doctor information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const doctorUserIds = useMemo(
    () => new Set(doctors.map((doctor) => doctor.user?._id)),
    [doctors]
  );

  const availableDoctorUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "doctor" &&
          user.isActive &&
          !doctorUserIds.has(user._id)
      ),
    [users, doctorUserIds]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const firstName = doctor.user?.firstName || "";
      const lastName = doctor.user?.lastName || "";
      const email = doctor.user?.email || "";
      const specialization = doctor.specialization || "";
      const licenseNumber = doctor.licenseNumber || "";

      const searchText =
        `${firstName} ${lastName} ${email} ${specialization} ${licenseNumber}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && doctor.isActive) ||
        (statusFilter === "inactive" && !doctor.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [doctors, search, statusFilter]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setFormError("");

      if (!form.user) {
        setFormError("Please select a doctor user.");
        return;
      }

      if (!form.licenseNumber.trim()) {
        setFormError("License number is required.");
        return;
      }

      if (!form.specialization.trim()) {
        setFormError("Specialization is required.");
        return;
      }

      if (!form.qualification.trim()) {
        setFormError("At least one qualification is required.");
        return;
      }

      if (!form.department) {
        setFormError("Please select a department.");
        return;
      }

      const qualification = form.qualification
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const data = await createDoctor({
        user: form.user,
        licenseNumber: form.licenseNumber.trim(),
        specialization: form.specialization.trim(),
        qualification,
        experience: form.experience
          ? Number(form.experience)
          : 0,
        bio: form.bio.trim(),
        consultationFee: form.consultationFee
          ? Number(form.consultationFee)
          : 0,
        department: form.department,
      });

      setDoctors((currentDoctors) => [
        data.doctor,
        ...currentDoctors,
      ]);

      setForm(emptyForm);
      setShowCreateModal(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to create doctor profile."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    try {
      setActionLoading(true);
      setError("");

      const data = await toggleDoctorStatus(doctor._id);

      setDoctors((currentDoctors) =>
        currentDoctors.map((currentDoctor) =>
          currentDoctor._id === doctor._id
            ? data.doctor
            : currentDoctor
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update doctor status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (doctor) => {
    try {
      setActionLoading(true);
      setError("");

      const data = await verifyDoctor(doctor._id);

      setDoctors((currentDoctors) =>
        currentDoctors.map((currentDoctor) =>
          currentDoctor._id === doctor._id
            ? data.doctor
            : currentDoctor
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to verify doctor."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Doctors
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage doctor profiles and verification.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setFormError("");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Doctors
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {doctors.length}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active Doctors
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {doctors.filter((doctor) => doctor.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Unverified
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {doctors.filter((doctor) => !doctor.isVerified).length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 appearance-none rounded-lg border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <Stethoscope className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-medium">
              No doctors found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a doctor profile for a user with the doctor role.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium">
                    Doctor
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Specialization
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Department
                  </th>
                  <th className="px-4 py-3 font-medium">
                    License
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {doctor.user?.firstName}{" "}
                        {doctor.user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doctor.user?.email}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {doctor.specialization}
                    </td>

                    <td className="px-4 py-4">
                      {doctor.department?.name || "Not assigned"}
                    </td>

                    <td className="px-4 py-4">
                      {doctor.licenseNumber}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          doctor.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {doctor.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {doctor.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {!doctor.isVerified && (
                          <button
                            type="button"
                            onClick={() =>
                              handleVerify(doctor)
                            }
                            disabled={actionLoading}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(doctor)
                          }
                          disabled={actionLoading}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                        >
                          {doctor.isActive
                            ? "Deactivate"
                            : "Activate"}
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Doctor Profile
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a professional profile for a doctor user.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateDoctor}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Doctor User
                </label>

                <select
                  name="user"
                  value={form.user}
                  onChange={handleFormChange}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select doctor user
                  </option>

                  {availableDoctorUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} -{" "}
                      {user.email}
                    </option>
                  ))}
                </select>

                {availableDoctorUsers.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    There are no active doctor-role users without a
                    Doctor profile.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    License Number
                  </label>

                  <input
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. MDCN-12345"
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Specialization
                  </label>

                  <input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleFormChange}
                    placeholder="e.g. Cardiology"
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Qualification
                </label>

                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleFormChange}
                  placeholder="e.g. MBBS, FWACP, FACC"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Separate multiple qualifications with commas.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Experience
                  </label>

                  <input
                    type="number"
                    name="experience"
                    min="0"
                    max="70"
                    value={form.experience}
                    onChange={handleFormChange}
                    placeholder="Years"
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Consultation Fee
                  </label>

                  <input
                    type="number"
                    name="consultationFee"
                    min="0"
                    value={form.consultationFee}
                    onChange={handleFormChange}
                    placeholder="Amount"
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Department
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments
                      .filter(
                        (department) => department.isActive
                      )
                      .map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Short professional biography..."
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Creating..."
                    : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;