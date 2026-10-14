import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  RefreshCw,
  Search,
  UserRound,
  CalendarDays,
  Stethoscope,
  Paperclip,
  FilePlus2,
} from "lucide-react";
import { getMyDoctorMedicalRecords } from "../../services/doctorService";

const getRecords = (response) => {
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.medicalRecords)) return response.medicalRecords;
  if (Array.isArray(response?.data?.records)) return response.data.records;
  if (Array.isArray(response?.data?.medicalRecords)) {
    return response.data.medicalRecords;
  }
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getPatientName = (record) => {
  const patient = record?.patient;
  const user = patient?.user || patient;

  const name = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Patient";
};

const formatDate = (date) => {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Date not available";

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyDoctorMedicalRecords();
      setRecords(getRecords(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load medical records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = records.filter((record) => {
    const patientName = getPatientName(record).toLowerCase();
    const diagnosis = (record.diagnosis || "").toLowerCase();
    const searchTerm = search.toLowerCase();

    return (
      patientName.includes(searchTerm) ||
      diagnosis.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Medical Records
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review medical records for patients under your care.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadRecords}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/doctor/medical-records/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            <FilePlus2 size={16} />
            Create Medical Record
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total records</p>
            <FileText size={20} className="text-green-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {records.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Patients recorded</p>
            <UserRound size={20} className="text-green-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {
              new Set(
                records
                  .map((record) => record.patient?._id)
                  .filter(Boolean)
              ).size
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient name or diagnosis..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading medical records...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <FileText size={40} className="mx-auto text-gray-300" />

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {records.length === 0
              ? "No medical records yet"
              : "No matching records"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {records.length === 0
              ? "Medical records you create for your patients will appear here."
              : "Try searching with a different patient name or diagnosis."}
          </p>

          {records.length === 0 && (
            <Link
              to="/doctor/medical-records/new"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
            >
              <FilePlus2 size={16} />
              Create Medical Record
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <article
              key={record._id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-50 p-3 text-green-700">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {record.diagnosis || "Diagnosis not provided"}
                    </h2>

                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <UserRound size={15} className="text-gray-400" />
                      {getPatientName(record)}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays size={15} />
                      {formatDate(record.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Medical record
                </span>
              </div>

              {Array.isArray(record.symptoms) &&
                record.symptoms.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Symptoms
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {record.symptoms.map((symptom, index) => (
                        <span
                          key={`${symptom}-${index}`}
                          className="rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-700"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {record.treatment && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Treatment
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {record.treatment}
                  </p>
                </div>
              )}

              {record.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Clinical notes
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {record.notes}
                  </p>
                </div>
              )}

              {record.appointment && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Stethoscope size={15} />
                    {record.appointment.type || "Appointment"}
                  </span>

                  {record.appointment.date && (
                    <span>
                      Appointment: {formatDate(record.appointment.date)}
                    </span>
                  )}
                </div>
              )}

              {Array.isArray(record.attachments) &&
                record.attachments.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Attachments
                    </h3>

                    <div className="mt-2 space-y-2">
                      {record.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.url}-${index}`}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-fit items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline"
                        >
                          <Paperclip size={15} />
                          {attachment.name || "View attachment"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
\n
