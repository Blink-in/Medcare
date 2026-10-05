import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { getDashboardStats } from "../../services/dashboardService";
import { getAppointments } from "../../services/appointmentService";

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getDashboardStats();
      setStatistics(data.statistics);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      const data = await getAppointments();
      setAppointments(data.appointments || []);
    } catch (error) {
      setAppointmentsError(
        error.response?.data?.message ||
          "Failed to load appointments."
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchAppointments();
  }, [fetchStatistics, fetchAppointments]);

  const stats = [
    {
      title: "Total Patients",
      value: statistics?.patients?.total ?? 0,
      description: "Registered patients",
      icon: Users,
    },
    {
      title: "Total Doctors",
      value: statistics?.doctors?.total ?? 0,
      description: `${statistics?.doctors?.active ?? 0} active doctors`,
      icon: Stethoscope,
    },
    {
      title: "Appointments",
      value: statistics?.appointments?.total ?? 0,
      description: `${statistics?.appointments?.pending ?? 0} pending`,
      icon: CalendarDays,
    },
    {
      title: "Departments",
      value: statistics?.departments?.total ?? 0,
      description: `${statistics?.departments?.active ?? 0} active departments`,
      icon: Activity,
    },
  ];

  const getPatientName = (appointment) => {
    const user = appointment.patient?.user;

    if (!user) return "Unknown patient";

    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  };

  const getDoctorName = (appointment) => {
    const user = appointment.doctor?.user;

    if (!user) return "Doctor unavailable";

    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");

    return name ? `Dr. ${name}` : "Doctor unavailable";
  };

  const formatAppointmentDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    const styles = {
      confirmed: "bg-[#e8f7f0] text-[#168c65]",
      pending: "bg-amber-50 text-amber-600",
      completed: "bg-blue-50 text-blue-600",
      cancelled: "bg-red-50 text-red-600",
    };

    return (
      styles[status] || "bg-gray-100 text-gray-600"
    );
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          Admin Dashboard
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#12372b] sm:text-[32px]">
              Welcome back, Admin
            </h1>

            <p className="mt-2 text-[14px] text-[#718078]">
              Here's what's happening across your hospital today.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            className="flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0d7957]"
          >
            <CalendarDays className="h-4 w-4" />
            Refresh appointments
          </button>
        </div>
      </section>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-[#dcebe4] bg-white px-5 py-4 text-[13px] text-[#60756c]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading dashboard statistics...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-600"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchStatistics}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#dcebe4] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f7f0] text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-[#91a39b]" />
              </div>

              <p className="mt-5 text-[12px] font-medium text-[#718078]">
                {stat.title}
              </p>

              <div className="mt-1 flex flex-wrap items-end gap-2">
                <p className="text-[25px] font-bold tracking-tight text-[#12372b]">
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>

              <p className="mt-1 text-[11px] text-[#8a9791]">
                {isLoading ? "Fetching data..." : stat.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[#dcebe4] bg-white">
          <div className="flex items-center justify-between border-b border-[#e7efeb] px-5 py-5">
            <div>
              <h2 className="text-[16px] font-bold text-[#173d30]">
                Recent Appointments
              </h2>

              <p className="mt-1 text-[12px] text-[#84938d]">
                Latest appointments across the hospital
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              className="text-[12px] font-semibold text-primary hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-[#edf2ef]">
            {appointmentsLoading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-10 text-[13px] text-[#718078]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading appointments...
              </div>
            ) : appointmentsError ? (
              <div className="space-y-3 px-5 py-8 text-center">
                <p className="text-[13px] text-red-600">
                  {appointmentsError}
                </p>

                <button
                  type="button"
                  onClick={fetchAppointments}
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : appointments.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-[#a2b4ab]" />

                <p className="mt-3 text-[13px] font-medium text-[#40594f]">
                  No appointments yet
                </p>

                <p className="mt-1 text-[12px] text-[#84938d]">
                  Appointments will appear here when they are booked.
                </p>
              </div>
            ) : (
              appointments.slice(0, 4).map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f7f0] text-primary">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-[#173d30]">
                        {getPatientName(appointment)}
                      </p>

                      <p className="mt-1 text-[11px] text-[#819089]">
                        {getDoctorName(appointment)}
                        {" · "}
                        {appointment.department?.name ||
                          "Department unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:text-right">
                    <div>
                      <p className="text-[11px] font-medium text-[#5f746b]">
                        {formatAppointmentDate(appointment.date)}
                      </p>

                      <p className="mt-1 text-[10px] text-[#91a09a]">
                        {appointment.startTime || "--:--"}
                        {" - "}
                        {appointment.endTime || "--:--"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      {formatStatus(appointment.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dcebe4] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f0] text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#173d30]">
                Quick Actions
              </h2>

              <p className="mt-1 text-[11px] text-[#84938d]">
                Common administrative tasks
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[
              "Add new doctor",
              "Add department",
              "View all patients",
              "Manage users",
            ].map((action) => (
              <button
                key={action}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-[#e1ebe6] px-4 py-3 text-left transition-colors hover:bg-[#f4faf7]"
              >
                <span className="text-[12px] font-medium text-[#40594f]">
                  {action}
                </span>

                <ArrowUpRight className="h-4 w-4 text-[#8ba098]" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;