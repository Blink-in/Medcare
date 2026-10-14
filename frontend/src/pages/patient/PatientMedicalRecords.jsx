import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
Activity,
CalendarDays,
ClipboardList,
FileText,
RefreshCw,
Stethoscope,
} from "lucide-react";
import { getMyMedicalRecords } from "../../services/medicalRecordService";

const getItems = (data) => {
if (Array.isArray(data)) return data;
if (Array.isArray(data?.medicalRecords)) return data.medicalRecords;
if (Array.isArray(data?.records)) return data.records;
if (Array.isArray(data?.data)) return data.data;
return [];
};

const getPersonName = (person) => {
if (!person) return "Not specified";
if (typeof person === "string") return person;

const user = person.user || person;
const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

return name || person.name || person.fullName || "Not specified";
};

const formatDate = (value) => {
if (!value) return "Date not specified";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return String(value);

return date.toLocaleDateString(undefined, {
day: "numeric",
month: "long",
year: "numeric",
});
};

const displayValue = (value) => {
if (value === null || value === undefined || value === "") {
return "Not provided";
}

if (Array.isArray(value)) {
return value.length ? value.join(", ") : "Not provided";
}

if (typeof value === "object") {
return value.name || value.title || "Not available";
}

return String(value);
};

const cardClass =
"rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function PatientMedicalRecords() {
const [records, setRecords] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const loadRecords = useCallback(async () => {
setLoading(true);
setError("");

try {
  const response = await getMyMedicalRecords();
  setRecords(getItems(response));
} catch (requestError) {
  setError(
    requestError.response?.data?.message ||
      "Could not load your medical records. Please try again."
  );
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
loadRecords();
}, [loadRecords]);

return ( <div className="space-y-8"> <section className="rounded-2xl  bg-emerald-700 p-6 text-white sm:p-8"> <div className="flex items-start gap-4"> <div className="rounded-xl bg-white/15 p-3"> <FileText size={28} /> </div>

      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          My Medical Records
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">
          View medical information recorded by your healthcare team.
          Your records are private to your authorized account.
        </p>
      </div>
    </div>
  </section>

  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Medical history
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {records.length} {records.length === 1 ? "record" : "records"} found
      </p>
    </div>

    <button
      type="button"
      onClick={loadRecords}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw size={16} />
      Refresh
    </button>
  </div>

  {error && (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {error}
    </div>
  )}

  {loading ? (
    <div className={cardClass}>
      <p className="text-sm text-slate-500">
        Loading your medical records...
      </p>
    </div>
  ) : error && records.length === 0 ? (
    <div className={`${cardClass} text-center`}>
      <p className="text-slate-600">
        Your medical records could not be retrieved.
      </p>
      <button
        type="button"
        onClick={loadRecords}
        className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Try again
      </button>
    </div>
  ) : records.length === 0 ? (
    <div className={`${cardClass} py-12 text-center`}>
      <ClipboardList
        size={40}
        className="mx-auto text-slate-400"
      />
      <h3 className="mt-4 font-semibold text-slate-900">
        No medical records yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        When your healthcare team adds a medical record to your profile,
        it will appear here.
      </p>
    </div>
  ) : (
    <div className="space-y-5">
      {records.map((record, index) => {
        const id = record._id || record.id || `record-${index}`;
        const doctor = record.doctor;
        const department =
  record.doctor?.department?.name ||
  record.doctor?.department?.name ||
  record.department?.name ||
  record.department ||
  "Not provided";
        return (
          <article key={id} className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <Activity size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {displayValue(
                    record.diagnosis || record.title || record.recordType
                  )}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    {formatDate(
                      record.recordDate ||
                        record.date ||
                        record.createdAt
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Stethoscope size={15} />
                    {getPersonName(doctor)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Department
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {displayValue(department)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Diagnosis
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {displayValue(record.diagnosis)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Symptoms
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {displayValue(record.symptoms)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Treatment
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {displayValue(record.treatment)}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Medical notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {displayValue(record.notes || record.description)}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  )}

  <p className="text-sm text-slate-500">
    Need to review an appointment?{" "}
    <Link
      to="/patient/appointments"
      className="font-semibold text-teal-700 hover:underline"
    >
      Go to appointments
    </Link>
    .
  </p>
</div>

);
}

export default PatientMedicalRecords;
