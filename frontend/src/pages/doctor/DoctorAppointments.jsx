import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
  UserRound,
  CheckCircle2,
  XCircle,
  FileText,
  Stethoscope,
} from "lucide-react";
import {
  getMyDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/doctorService";

const getItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.appointments)) return response.appointments;
  if (Array.isArray(response?.data?.appointments)) {
    return response.data.appointments;
  }
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getPatientName = (appointment) => {
  const patient = appointment?.patient;
  const user = patient?.user || patient;

  const name = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Patient";
};

const getDepartmentName = (appointment) => {
  const department =
    appointment?.department ||
    appointment?.doctor?.department;

  if (typeof department === "string") return department;
  return department?.name || department?.title || "Not provided";
};

const formatDate = (date) => {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return String(date);

  return parsedDate.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  "no-show": "bg-gray-100 text-gray-700",
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyDoctorAppointments();
      setAppointments(getItems(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusUpdate = async (id, status) => {
    if (!id) {
      setError("This appointment has no valid ID.");
      return;
    }

    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await updateAppointmentStatus(id, status);

      setSuccess(
        response?.message || `Appointment marked as ${status}.`
      );

      await loadAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update appointment status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const counts = useMemo(() => {
    const result = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((appointment) => {
      const status = appointment.status?.toLowerCase();

      if (status === "pending") result.pending += 1;
      if (status === "confirmed") result.confirmed += 1;
      if (status === "completed") result.completed += 1;

      if (["cancelled", "rejected"].includes(status)) {
        result.cancelled += 1;
      }
    });

    return result;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const patientName = getPatientName(appointment).toLowerCase();
      const reason = (appointment.reasonForVisit || "").toLowerCase();
      const department = getDepartmentName(appointment).toLowerCase();

      const matchesSearch =
        patientName.includes(searchTerm) ||
        reason.includes(searchTerm) ||
        department.includes(searchTerm);

      const status = appointment.status?.toLowerCase() || "pending";

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const getAvailableActions = (status = "") => {
    const currentStatus = status.toLowerCase();

    if (currentStatus === "pending") {
      return [
        { label: "Confirm", status: "confirmed" },
        { label: "Cancel", status: "cancelled" },
      ];
    }

    if (currentStatus === "confirmed") {
      return [
        { label: "Complete", status: "completed" },
        { label: "Cancel", status: "cancelled" },
      ];
    }

    return [];
  };

  const summaryCards = [
    {
      title: "Total appointments",
      count: counts.total,
      icon: CalendarDays,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Pending",
      count: counts.pending,
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Confirmed",
      count: counts.confirmed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      background: "bg-emerald-50",
    },
    {
      title: "Completed",
      count: counts.completed,
      icon: FileText,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review patient bookings and manage their appointment status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">{card.title}</p>
                <div className={`rounded-lg p-2 ${card.background} ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {loading ? "..." : card.count}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient, reason, or department..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
          <option value="no-show">No-show</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <CalendarDays size={40} className="mx-auto text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {appointments.length === 0
              ? "No appointments yet"
              : "No matching appointments"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {appointments.length === 0
              ? "Patient bookings assigned to you will appear here."
              : "Try changing your search or status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const id = appointment._id || appointment.id;
            const status = appointment.status?.toLowerCase() || "pending";
            const actions = getAvailableActions(status);

            return (
              <article
                key={id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                      <UserRound size={22} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {getPatientName(appointment)}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {appointment.reasonForVisit ||
                          appointment.type ||
                          "General consultation"}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Department:</span>{" "}
                        {getDepartmentName(appointment)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(appointment.date)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Time:</span>{" "}
                        {appointment.startTime || "Not set"}
                        {appointment.endTime
                          ? ` - ${appointment.endTime}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {status.replaceAll("-", " ")}
                  </span>
                </div>

                {appointment.notes && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Patient notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {actions.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={updatingId === id}
                      onClick={() => handleStatusUpdate(id, action.status)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                        action.status === "cancelled"
                          ? "border border-red-200 text-red-700 hover:bg-red-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {updatingId === id ? "Updating..." : action.label}
                    </button>
                  ))}

                  {status === "completed" && (
                    <Link
                      to="/doctor/medical-records/new"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                    >
                      <FileText size={16} />
                      Create medical record
                    </Link>
                  )}

                  {status === "completed" && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      <Stethoscope size={16} />
                      Appointment completed
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;