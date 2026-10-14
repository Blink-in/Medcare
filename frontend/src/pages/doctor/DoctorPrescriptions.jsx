
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  CalendarDays,
} from "lucide-react";
import { getMyDoctorPrescriptions } from "../../services/prescriptionService";

const getPrescriptions = (response) => {
  if (Array.isArray(response?.prescriptions)) return response.prescriptions;
  if (Array.isArray(response?.data?.prescriptions)) {
    return response.data.prescriptions;
  }
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getPatientName = (prescription) => {
  const user = prescription?.patient?.user || prescription?.patient;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || user?.email || "Patient";
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusClasses = {
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyDoctorPrescriptions();
      setPrescriptions(getPrescriptions(response));
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

  const filtered = prescriptions.filter((prescription) => {
    const patientName = getPatientName(prescription).toLowerCase();
    const medicationNames = (prescription.medications || [])
      .map((medication) => medication.name)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      patientName.includes(search.toLowerCase()) ||
      medicationNames.includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || prescription.status === status;

    return matchesSearch && matchesStatus;
  });

  const activeCount = prescriptions.filter(
    (prescription) => prescription.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and review prescriptions for your patients.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadPrescriptions}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to="/doctor/prescriptions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={16} />
            Create prescription
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total prescriptions</p>
            <FileText size={20} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {prescriptions.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active prescriptions</p>
            <FileText size={20} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{activeCount}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient or medication..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading prescriptions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <FileText size={40} className="mx-auto text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {prescriptions.length === 0
              ? "No prescriptions yet"
              : "No matching prescriptions"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {prescriptions.length === 0
              ? "Prescriptions you create will appear here."
              : "Try another search or status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((prescription) => (
            <article
              key={prescription._id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                    <UserRound size={18} className="text-green-700" />
                    {getPatientName(prescription)}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays size={15} />
                    Created {formatDate(prescription.createdAt)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    statusClasses[prescription.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {prescription.status || "Unknown"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {(prescription.medications || []).map((medication, index) => (
                  <div
                    key={`${medication.name}-${index}`}
                    className="rounded-lg bg-gray-50 p-4"
                  >
                    <h3 className="font-medium text-gray-900">
                      {medication.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {medication.dosage} | {medication.frequency} |{" "}
                      {medication.duration}
                    </p>
                    {medication.instructions && (
                      <p className="mt-2 text-sm text-gray-500">
                        {medication.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {prescription.instructions && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    General instructions
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {prescription.instructions}
                  </p>
                </div>
              )}

              {prescription.notes && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Clinical notes
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
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
}
