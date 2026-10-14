import { useCallback, useEffect, useState } from "react";
import { FileText, Pill, RefreshCw, Search } from "lucide-react";
import { getMyPrescriptions } from "../../services/prescriptionService";

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

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyPrescriptions();
      setPrescriptions(getItems(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your prescriptions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const doctorName = getPersonName(prescription.doctor).toLowerCase();
    const medications = (prescription.medications || [])
      .map((medication) => medication.name || "")
      .join(" ")
      .toLowerCase();

    const query = search.trim().toLowerCase();
    return doctorName.includes(query) || medications.includes(query);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-green-700">Patient Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-[#173d30]">
            My Prescriptions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View medications and instructions prescribed by your doctors.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPrescriptions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total prescriptions</p>
              <p className="text-2xl font-bold text-[#173d30]">
                {prescriptions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-700">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active prescriptions</p>
              <p className="text-2xl font-bold text-[#173d30]">
                {prescriptions.filter((item) => item.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-white px-4">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by doctor or medication..."
          className="w-full bg-transparent py-3 text-sm outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={loadPrescriptions}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-green-100 bg-white p-10 text-center text-gray-500">
          Loading your prescriptions...
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="rounded-2xl border border-green-100 bg-white px-6 py-12 text-center">
          <Pill className="mx-auto h-10 w-10 text-green-700" />
          <h2 className="mt-4 font-semibold text-[#173d30]">
            {search ? "No matching prescriptions" : "No prescriptions yet"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {search
              ? "Try searching with another doctor or medication name."
              : "Prescriptions issued to you will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPrescriptions.map((prescription) => (
            <article
              key={prescription._id}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-[#173d30]">
                    Prescription
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Prescribed by Dr. {getPersonName(prescription.doctor)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Appointment date:{" "}
             {formatDate(prescription.appointment?.date)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusStyle[prescription.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {prescription.status || "Unknown"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#173d30]">
                  Prescribed medications
                </h3>

                {(prescription.medications || []).map((medication, index) => (
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
                ))}
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

export default PatientPrescriptions;