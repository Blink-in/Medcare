import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  createPatient,
  deletePatient,
  getPatients,
} from "../../services/patientService";
import { getUsers, toggleUserStatus } from "../../services/userService";

const emptyForm = {
  user: "",
  dateOfBirth: "",
  gender: "",
  bloodType: "",
  address: "",
  allergies: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  medicalHistory: "",
};

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientsData, usersData] = await Promise.all([
        getPatients(),
        getUsers(),
      ]);

      setPatients(patientsData.patients || []);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load patient information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const patientUserIds = useMemo(
    () =>
      new Set(
        patients.map((patient) => patient.user?._id)
      ),
    [patients]
  );

  const availablePatientUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "patient" &&
          !patientUserIds.has(user._id)
      ),
    [users, patientUserIds]
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const firstName = patient.user?.firstName || "";
      const lastName = patient.user?.lastName || "";
      const email = patient.user?.email || "";
      const phone = patient.user?.phone || "";

      const searchText =
        `${firstName} ${lastName} ${email} ${phone}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesGender =
        genderFilter === "all" ||
        patient.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, search, genderFilter]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setFormError("");

      if (!form.user) {
        setFormError("Please select a patient user.");
        return;
      }

      const allergies = form.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const emergencyContact =
        form.emergencyName ||
        form.emergencyRelationship ||
        form.emergencyPhone
          ? {
              name: form.emergencyName.trim(),
              relationship: form.emergencyRelationship.trim(),
              phone: form.emergencyPhone.trim(),
            }
          : undefined;

      const data = await createPatient({
        user: form.user,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodType: form.bloodType || undefined,
        address: form.address.trim(),
        allergies,
        emergencyContact,
        medicalHistory: form.medicalHistory.trim(),
      });

      setPatients((currentPatients) => [
        data.patient,
        ...currentPatients,
      ]);

      setForm(emptyForm);
      setShowCreateModal(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to create patient profile."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (patient) => {
    const userId = patient.user?._id;

    if (!userId) {
      setError("Patient user information is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const data = await toggleUserStatus(userId);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? data.user : user
        )
      );

      setPatients((currentPatients) =>
        currentPatients.map((currentPatient) =>
          currentPatient._id === patient._id
            ? {
                ...currentPatient,
                user: data.user,
              }
            : currentPatient
        )
      );

      if (selectedPatient?._id === patient._id) {
        setSelectedPatient((currentPatient) => ({
          ...currentPatient,
          user: data.user,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update patient status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Delete the patient profile for ${patient.user?.firstName || ""} ${
        patient.user?.lastName || ""
      }? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deletePatient(patient._id);

      setPatients((currentPatients) =>
        currentPatients.filter(
          (currentPatient) =>
            currentPatient._id !== patient._id
        )
      );

      setSelectedPatient(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete patient."
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
            Patients
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage patient profiles and account status.
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
            Add Patient
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
            Total Patients
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {patients.length}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active Patients
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {
              patients.filter(
                (patient) => patient.user?.isActive
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Inactive Patients
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {
              patients.filter(
                (patient) => !patient.user?.isActive
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(e.target.value)
              }
              className="h-10 appearance-none rounded-lg border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <UserRound className="h-10 w-10 text-muted-foreground" />

            <h3 className="mt-4 font-medium">
              No patients found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a patient profile for a user with the
              patient role.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium">
                    Patient
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Gender
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Date of Birth
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Blood Type
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {patient.user?.firstName}{" "}
                        {patient.user?.lastName}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {patient.user?.email}
                      </div>
                    </td>

                    <td className="px-4 py-4 capitalize">
                      {patient.gender || "Not provided"}
                    </td>

                    <td className="px-4 py-4">
                      {patient.dateOfBirth
                        ? new Date(
                            patient.dateOfBirth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </td>

                    <td className="px-4 py-4">
                      {patient.bloodType || "Not provided"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          patient.user?.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {patient.user?.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPatient(patient)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(patient)
                          }
                          disabled={actionLoading}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                        >
                          {patient.user?.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(patient)
                          }
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
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

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Patient Details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Patient profile information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Full Name
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.user?.firstName}{" "}
                  {selectedPatient.user?.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Email
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.user?.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Phone
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.user?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Date of Birth
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.dateOfBirth
                    ? new Date(
                        selectedPatient.dateOfBirth
                      ).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Gender
                </p>

                <p className="mt-1 font-medium capitalize">
                  {selectedPatient.gender || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Blood Type
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.bloodType || "Not provided"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Address
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.address || "Not provided"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Allergies
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.allergies?.length
                    ? selectedPatient.allergies.join(", ")
                    : "None recorded"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Medical History
                </p>

                <p className="mt-1 font-medium">
                  {selectedPatient.medicalHistory ||
                    "No medical history recorded"}
                </p>
              </div>

              {selectedPatient.emergencyContact && (
                <div className="sm:col-span-2 rounded-lg border p-4">
                  <p className="font-medium">
                    Emergency Contact
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Name
                      </p>
                      <p className="mt-1 text-sm">
                        {
                          selectedPatient.emergencyContact
                            .name
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Relationship
                      </p>
                      <p className="mt-1 text-sm">
                        {
                          selectedPatient.emergencyContact
                            .relationship
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Phone
                      </p>
                      <p className="mt-1 text-sm">
                        {
                          selectedPatient.emergencyContact
                            .phone
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Patient Profile
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a patient profile for a patient user.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-lg p-2 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePatient}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Patient User
                </label>

                <select
                  name="user"
                  value={form.user}
                  onChange={handleFormChange}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select patient user
                  </option>

                  {availablePatientUsers.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.firstName} {user.lastName} -{" "}
                      {user.email}
                    </option>
                  ))}
                </select>

                {availablePatientUsers.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    There are no patient-role users without a
                    Patient profile.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Blood Type
                </label>

                <select
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleFormChange}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    Select blood type
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Patient address"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Allergies
                </label>

                <input
                  name="allergies"
                  value={form.allergies}
                  onChange={handleFormChange}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Separate multiple allergies with commas.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Emergency Contact
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <input
                    name="emergencyName"
                    value={form.emergencyName}
                    onChange={handleFormChange}
                    placeholder="Name"
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <input
                    name="emergencyRelationship"
                    value={form.emergencyRelationship}
                    onChange={handleFormChange}
                    placeholder="Relationship"
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <input
                    name="emergencyPhone"
                    value={form.emergencyPhone}
                    onChange={handleFormChange}
                    placeholder="Phone"
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Medical History
                </label>

                <textarea
                  name="medicalHistory"
                  value={form.medicalHistory}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Relevant medical history..."
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
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
                    : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;