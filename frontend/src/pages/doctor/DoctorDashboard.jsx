import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Stethoscope,
  Users,
  FilePlus2,
} from "lucide-react";
import {
  getMyDoctorAppointments,
  getMyDoctorMedicalRecords,
  getMyDoctorProfile,
} from "../../services/doctorService";

const getItems = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data?.records)) return response.data.records;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getName = (profile) => {
  const user = profile?.user || profile;
  const name = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Doctor";
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (appointment) =>
  String(appointment?.status || "pending").toLowerCase();

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  scheduled: "bg-green-50 text-green-700",
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
};

function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getMyDoctorProfile(),
      getMyDoctorAppointments(),
      getMyDoctorMedicalRecords(),
    ]);

    const [profileResult, appointmentsResult, recordsResult] = results;

    if (profileResult.status === "fulfilled") {
      const data = profileResult.value;
      setProfile(
        data?.doctor ||
          data?.profile ||
          data?.data?.doctor ||
          data?.data?.profile ||
          data?.data ||
          data
      );
    }

    if (appointmentsResult.status === "fulfilled") {
      setAppointments(
        getItems(appointmentsResult.value, "appointments")
      );
    }

    if (recordsResult.status === "fulfilled") {
      setRecords(getItems(recordsResult.value, "medicalRecords"));
    }

    const failedRequest = results.find(
      (result) => result.status === "rejected"
    );

    if (failedRequest) {
      setError(
        failedRequest.reason?.response?.data?.message ||
          "Some dashboard information could not be loaded. Try refreshing."
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const pendingCount = appointments.filter((appointment) =>
    ["pending", "scheduled", "confirmed"].includes(
      getStatus(appointment)
    )
  ).length;

  const completedCount = appointments.filter(
    (appointment) => getStatus(appointment) === "completed"
  ).length;

  const stats = [
    {
      label: "Total appointments",
      value: appointments.length,
      icon: CalendarDays,
    },
    {
      label: "Upcoming or pending",
      value: pendingCount,
      icon: Users,
    },
    {
      label: "Completed appointments",
      value: completedCount,
      icon: Stethoscope,
    },
    {
      label: "Medical records",
      value: records.length,
      icon: ClipboardList,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-green-700 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-100">
              Doctor workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Welcome, Dr. {getName(profile)}
            </h1>

            <p className="mt-2 text-sm leading-6 text-green-50">
              Manage your appointments and patient medical records.
            </p>

            {profile?.specialization && (
              <p className="mt-3 text-sm font-medium">
                {profile.specialization}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3 text-green-700">
                  <Icon size={21} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Appointments
              </h2>
              <p className="text-sm text-gray-500">
                Review your patient bookings.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            View appointment details and manage your visits.
          </p>

          <Link
            to="/doctor/appointments"
            className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            View appointments
          </Link>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Medical records
              </h2>
              <p className="text-sm text-gray-500">
                Access your patient records.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            Review existing records or create a record after a completed appointment.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/doctor/medical-records"
              className="inline-flex rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              View records
            </Link>

            <Link
              to="/doctor/medical-records/new"
              className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              <FilePlus2 size={16} />
              Create record
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Recent appointments
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest appointment activity.
          </p>
        </div>

        {loading ? (
          <p className="py-6 text-sm text-gray-500">
            Loading appointments...
          </p>
        ) : appointments.length === 0 ? (
          <div className="rounded-lg bg-gray-50 px-4 py-8 text-center">
            <CalendarDays
              size={30}
              className="mx-auto text-gray-400"
            />

            <p className="mt-3 font-semibold text-gray-800">
              No appointments yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Patient bookings assigned to you will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment, index) => {
              const id = appointment._id || appointment.id || index;
              const patient = appointment.patient;
              const user = patient?.user || patient;

              const patientName = [
                user?.firstName,
                user?.lastName,
              ]
                .filter(Boolean)
                .join(" ");

              const status = getStatus(appointment);

              return (
                <div
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {patientName || "Patient"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(appointment.date)}
                      {appointment.startTime
                        ? ` at ${appointment.startTime}`
                        : ""}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {status.replaceAll("_", " ")}
                  </span>
                </div>
              );
            })}

            <Link
              to="/doctor/appointments"
              className="inline-flex pt-2 text-sm font-semibold text-green-700 hover:underline"
            >
              View all appointments
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorDashboard;