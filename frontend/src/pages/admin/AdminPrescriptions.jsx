import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Pill,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  deletePrescription,
  getPrescriptions,
  updatePrescription,
} from "../../services/prescriptionService";

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.prescriptions)) return data.prescriptions;
  if (Array.isArray(data?.data?.prescriptions)) return data.data.prescriptions;
  return [];
};

const getPersonName = (person) => {
  const user = person?.user || person;
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || "Not provided";
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString();
};

const statusStyle = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPrescriptions();
      setPrescriptions(getItems(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load prescriptions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const counts = useMemo(
    () => ({
      total: prescriptions.length,
      active: prescriptions.filter((item) => item.status === "active").length,
      completed: prescriptions.filter((item) => item.status === "completed")
        .length,
      cancelled: prescriptions.filter((item) => item.status === "cancelled")
        .length,
    }),
    [prescriptions]
  );

  const filteredPrescriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const patientName = getPersonName(prescription.patient).toLowerCase();
      const doctorName = getPersonName(prescription.doctor).toLowerCase();
      const medications = (prescription.medications || [])
        .map((medication) => medication.name || "")
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        patientName.includes(query) ||
        doctorName.includes(query) ||
        medications.includes(query);

      const matchesStatus =
        statusFilter === "all" || prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const handleStatusChange = async (prescription, status) => {
    if (status === prescription.status) return;

    setActionId(prescription._id);
    setError("");
    setSuccess("");

    try {
      const response = await updatePrescription(prescription._id, { status });
      const updatedPrescription =
        response?.prescription || response?.data?.prescription;

      setPrescriptions((current) =>
        current.map((item) =>
          item._id === prescription._id
            ? { ...item, ...(updatedPrescription || {}), status }
            : item
        )
      );

      setSuccess("Prescription status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update the prescription status."
      );
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (prescription) => {
    const confirmed = window.confirm(
      "Permanently delete this prescription? This action cannot be undone."
    );

    if (!confirmed) return;

    setActionId(prescription._id);
    setError("");
    setSuccess("");

    try {
      await deletePrescription(prescription._id);

      setPrescriptions((current) =>
        current.filter((item) => item._id !== prescription._id)
      );

      setSuccess("Prescription deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the prescription."
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-green-700">Administration</p>
          <h1 className="mt-1 text-2xl font-bold text-[#173d30]">
            Prescriptions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review prescriptions, track their status, and manage records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPrescriptions}
          disabled={loading || Boolean(actionId)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total prescriptions", value: counts.total },
          { label: "Active", value: counts.active },
          { label: "Completed", value: counts.completed },
          { label: "Cancelled", value: counts.cancelled },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-green-100 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#173d30]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-green-100 bg-white p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient, doctor, or medication..."
            className="w-full py-3 text-sm outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-green-100 bg-white p-10 text-center text-gray-500">
          Loading prescriptions...
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="rounded-2xl border border-green-100 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-green-700" />
          <h2 className="mt-4 font-semibold text-[#173d30]">
            No prescriptions found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPrescriptions.map((prescription) => (
            <article
              key={prescription._id}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-start">
                <div>
                  <h2 className="text-lg font-bold text-[#173d30]">
                    {getPersonName(prescription.patient)}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Prescribed by Dr. {getPersonName(prescription.doctor)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Appointment date:{" "}
                   {formatDate(prescription.appointment?.date)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Prescription ID: {prescription._id}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyle[prescription.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {prescription.status || "Unknown"}
                  </span>

                  <select
                    aria-label="Update prescription status"
                    value={prescription.status || "active"}
                    disabled={Boolean(actionId)}
                    onChange={(event) =>
                      handleStatusChange(prescription, event.target.value)
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 disabled:opacity-60"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(prescription)}
                    disabled={Boolean(actionId)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {actionId === prescription._id ? "Working..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#173d30]">
                  Medications
                </h3>

                {(prescription.medications || []).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No medication details available.
                  </p>
                ) : (
                  prescription.medications.map((medication, index) => (
                    <div
                      key={`${prescription._id}-${index}`}
                      className="rounded-xl bg-[#f6fbf8] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-white p-2 text-green-700">
                          <Pill className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#173d30]">
                            {medication.name}
                          </p>

                          <div className="mt-2 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                            <p>
                              <span className="font-medium">Dosage:</span>{" "}
                              {medication.dosage}
                            </p>
                            <p>
                              <span className="font-medium">Frequency:</span>{" "}
                              {medication.frequency}
                            </p>
                            <p>
                              <span className="font-medium">Duration:</span>{" "}
                              {medication.duration}
                            </p>
                          </div>

                          {medication.instructions && (
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Medication notes:</span>{" "}
                              {medication.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {prescription.instructions && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#173d30]">
                    General instructions
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {prescription.instructions}
                  </p>
                </div>
              )}

              {prescription.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#173d30]">
                    Additional notes
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {prescription.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;