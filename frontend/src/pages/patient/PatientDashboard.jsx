import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  UserRound,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Pill,
} from "lucide-react";

import useAuthStore from "../../store/authStore";
import { getMyAppointments } from "../../services/appointmentService";
import { getMyMedicalRecords } from "../../services/medicalRecordService";
import { getMyPrescriptions } from "../../services/prescriptionService";

const getItems = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const PatientDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");
  const [recordsError, setRecordsError] = useState("");
  const [prescriptionsError, setPrescriptionsError] = useState("");

  const firstName = user?.firstName || "Patient";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Patient";

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setAppointmentError("");
    setRecordsError("");
    setPrescriptionsError("");

    const [appointmentResult, recordsResult, prescriptionsResult] =
      await Promise.allSettled([
        getMyAppointments(),
        getMyMedicalRecords(),
        getMyPrescriptions(),
      ]);

    if (appointmentResult.status === "fulfilled") {
      setAppointments(
        getItems(appointmentResult.value, [
          "appointments",
          "myAppointments",
        ])
      );
    } else {
      setAppointments([]);
      setAppointmentError(
        appointmentResult.reason?.response?.data?.message ||
          "Unable to load your appointments."
      );
    }

    if (recordsResult.status === "fulfilled") {
      setMedicalRecords(
        getItems(recordsResult.value, ["records", "medicalRecords"])
      );
    } else {
      setMedicalRecords([]);
      setRecordsError(
        recordsResult.reason?.response?.data?.message ||
          "Unable to load your medical records."
      );
    }

    if (prescriptionsResult.status === "fulfilled") {
      setPrescriptions(
        getItems(prescriptionsResult.value, ["prescriptions"])
      );
    } else {
      setPrescriptions([]);
      setPrescriptionsError(
        prescriptionsResult.reason?.response?.data?.message ||
          "Unable to load your prescriptions."
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const quickActions = [
    {
      title: "Book an Appointment",
      description: "View your appointments and arrange a visit.",
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-600",
      to: "/patient/appointments",
      action: "View appointments",
    },
    {
      title: "Medical Records",
      description: "View your medical history and records.",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      to: "/patient/medical-records",
      action: "View medical records",
    },
    {
      title: "Prescriptions",
      description: "View medications and instructions prescribed by your doctors.",
      icon: ClipboardList,
      color: "bg-purple-50 text-purple-600",
      to: "/patient/prescriptions",
      action: "View prescriptions",
    },
  ];

  const hasErrors =
    appointmentError || recordsError || prescriptionsError;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-emerald-700 p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-emerald-100">
              Patient Dashboard
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome, {firstName}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
              Manage your healthcare in one place. Review your
              appointments, access your medical records, view prescriptions,
              and keep your patient profile up to date.
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl bg-white/15 sm:self-center">
            <HeartPulse size={42} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              A quick look at your healthcare information.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <OverviewCard
            title="Appointments"
            description="Appointments on your account"
            count={appointments.length}
            loading={loading}
            error={appointmentError}
            icon={CalendarDays}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            to="/patient/appointments"
          />

          <OverviewCard
            title="Medical Records"
            description="Your available medical records"
            count={medicalRecords.length}
            loading={loading}
            error={recordsError}
            icon={FileText}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            to="/patient/medical-records"
          />

          <OverviewCard
            title="Prescriptions"
            description="Prescriptions issued to you"
            count={prescriptions.length}
            loading={loading}
            error={prescriptionsError}
            icon={Pill}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            to="/patient/prescriptions"
          />
        </div>

        {hasErrors && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>
                Some dashboard information could not be loaded. Use Refresh
                to try again.
              </p>
              {prescriptionsError && (
                <p className="mt-1">
                  Prescriptions: {prescriptionsError}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Access your healthcare services.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                >
                  <Icon size={24} />
                </div>

                <h3 className="font-semibold text-gray-900">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {action.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                  {action.action}
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}

          <Link
            to="/patient/profile"
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserRound size={24} />
            </div>

            <h3 className="font-semibold text-gray-900">
              My Patient Profile
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              View and update your personal information and medical details.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              Manage profile
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserRound size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900">Your Patient Profile</h2>

            <p className="mt-1 text-sm text-gray-500">
              Make sure your personal information is up to date.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField label="Full Name" value={fullName} />
              <ProfileField
                label="Email Address"
                value={user?.email || "Not provided"}
              />
              <ProfileField
                label="Phone Number"
                value={user?.phone || "Not provided"}
              />
              <ProfileField
                label="Account Role"
                value={user?.role || "Patient"}
              />
            </div>

            <Link
              to="/patient/profile"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Edit patient profile
              <ArrowRight size={16} />
            </Link>

            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
              <Activity size={16} className="text-emerald-600" />
              Your account is ready to use.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const OverviewCard = ({
  title,
  description,
  count,
  loading,
  error,
  icon: Icon,
  iconColor,
  iconBg,
  to,
}) => {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <p className="mt-3 text-lg font-semibold text-gray-800">
          {loading
            ? "Loading..."
            : error
              ? "Unable to load"
              : `${count} ${count === 1 ? "record" : "records"}`}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {error || description}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        <Icon size={22} />
      </div>
    </div>
  );

  return (
    <Link
      to={to}
      className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      {content}
    </Link>
  );
};

const ProfileField = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-medium capitalize text-gray-800">
      {value}
    </p>
  </div>
);

export default PatientDashboard;