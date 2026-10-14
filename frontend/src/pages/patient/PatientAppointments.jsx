import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Plus,
  RefreshCw,
  Stethoscope,
  XCircle,
  Pencil,
  Save,
} from "lucide-react";

import api from "../../services/api";
import {
  cancelMyAppointment,
  createAppointment,
  getMyAppointments,
  updateMyAppointment,
} from "../../services/appointmentService";

const appointmentTypes = [
  { value: "consultation", label: "Consultation" },
  { value: "follow-up", label: "Follow-up" },
  { value: "routine-checkup", label: "Routine checkup" },
  { value: "emergency", label: "Emergency" },
];

const timeSlots = Array.from({ length: 16 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const getItems = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getId = (item) => {
  if (item && typeof item === "object") {
    return item._id || item.id || "";
  }

  return item || "";
};

const getDoctorName = (doctor) => {
  const user = doctor?.user;

  if (user && typeof user === "object") {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name ? `Dr. ${name}` : "Doctor";
  }

  return doctor?.name || doctor?.fullName || "Doctor";
};

const getDepartmentId = (doctor) => getId(doctor?.department);

const getDepartmentName = (department) =>
  department?.name || department?.title || "Department";

const getDateInputValue = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time || !time.includes(":")) {
    return time || "Time unavailable";
  }

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

const emptyForm = () => ({
  department: "",
  doctor: "",
  date: "",
  startTime: "",
  type: "consultation",
  reasonForVisit: "",
  notes: "",
});

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [editingId, setEditingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);

  const minimumDate = useMemo(() => {
    return getDateInputValue(new Date());
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) =>
        getDepartmentId(doctor) === form.department &&
        doctor.isActive !== false
    );
  }, [doctors, form.department]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getMyAppointments();
      setAppointments(getItems(data, "appointments"));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load your appointments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);

    try {
      const [departmentResponse, doctorResponse] = await Promise.all([
        api.get("/departments"),
        api.get("/doctors"),
      ]);

      setDepartments(
        getItems(departmentResponse.data, "departments")
      );

      setDoctors(getItems(doctorResponse.data, "doctors"));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load departments and doctors. Please refresh the page."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
    loadAppointments();
  }, [loadOptions, loadAppointments]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "department" ? { doctor: "" } : {}),
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.department || !form.doctor) {
      setError("Please select a department and doctor.");
      return;
    }

    if (!form.date || !form.startTime) {
      setError("Please select an appointment date and time.");
      return;
    }

    if (form.date < minimumDate) {
      setError("Appointment date cannot be in the past.");
      return;
    }

    if (!form.reasonForVisit.trim()) {
      setError("Please enter the reason for your visit.");
      return;
    }

    if (form.reasonForVisit.trim().length > 500) {
      setError("Reason for visit cannot exceed 500 characters.");
      return;
    }

    if (form.notes.length > 1000) {
      setError("Additional notes cannot exceed 1000 characters.");
      return;
    }

    const [hours, minutes] = form.startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + 30;

    if (endMinutes > 24 * 60) {
      setError("Please choose an earlier start time.");
      return;
    }

    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const appointmentData = {
      doctor: form.doctor,
      department: form.department,
      date: form.date,
      startTime: form.startTime,
      type: form.type,
      reasonForVisit: form.reasonForVisit.trim(),
      notes: form.notes.trim(),
    };

    const wasEditing = Boolean(editingId);
    setSubmitting(true);

    try {
      let response;

      if (wasEditing) {
        response = await updateMyAppointment(editingId, appointmentData);
      } else {
        response = await createAppointment({
          ...appointmentData,
          endTime,
        });
      }

      setSuccess(
        response.message ||
          (wasEditing
            ? "Appointment updated successfully."
            : "Appointment booked successfully.")
      );

      setEditingId("");
      setForm(emptyForm());

      await loadAppointments();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (wasEditing
            ? "Could not update the appointment. Please try again."
            : "Could not book the appointment. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (appointment) => {
    if (appointment.status !== "pending") {
      setError("Only pending appointments can be edited.");
      return;
    }

    const id = getId(appointment);

    if (!id) {
      setError("This appointment does not have a valid ID.");
      return;
    }

    const departmentId =
      getId(appointment.department) ||
      getDepartmentId(appointment.doctor);

    const doctorId = getId(appointment.doctor);

    setEditingId(id);
    setError("");
    setSuccess("");

    setForm({
      department: departmentId,
      doctor: doctorId,
      date: getDateInputValue(appointment.date),
      startTime: appointment.startTime || "",
      type: appointment.type || "consultation",
      reasonForVisit: appointment.reasonForVisit || "",
      notes: appointment.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiscardEdit = () => {
    setEditingId("");
    setForm(emptyForm());
    setError("");
    setSuccess("");
  };

  const handleCancel = async (appointment) => {
    const id = getId(appointment);

    if (!id) {
      setError("This appointment does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setCancellingId(id);

    try {
      const response = await cancelMyAppointment(id);

      setSuccess(
        response.message || "Appointment cancelled successfully."
      );

      await loadAppointments();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not cancel this appointment."
      );
    } finally {
      setCancellingId("");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <CalendarDays size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              My Appointments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">
              Book a visit with a doctor and keep track of your appointments
              from one place.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
            {editingId ? <Pencil size={22} /> : <Plus size={22} />}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit appointment" : "Book an appointment"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update your appointment details before it is confirmed."
                : "Appointment requests are submitted for confirmation."}
            </p>
          </div>
        </div>

        {loadingOptions ? (
          <p className="py-6 text-sm text-slate-500">
            Loading doctors and departments...
          </p>
        ) : departments.length === 0 || doctors.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Departments or doctors could not be found. Make sure active
            departments and doctor profiles exist.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="department">
                  Department
                </label>

                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select department</option>

                  {departments
                    .filter((department) => department.isActive !== false)
                    .map((department) => (
                      <option
                        key={getId(department)}
                        value={getId(department)}
                      >
                        {getDepartmentName(department)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="doctor">
                  Doctor
                </label>

                <select
                  id="doctor"
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={!form.department}
                  required
                >
                  <option value="">
                    {form.department
                      ? "Select doctor"
                      : "Select a department first"}
                  </option>

                  {filteredDoctors.map((doctor) => (
                    <option key={getId(doctor)} value={getId(doctor)}>
                      {getDoctorName(doctor)}
                      {doctor.specialization
                        ? ` · ${doctor.specialization}`
                        : ""}
                    </option>
                  ))}
                </select>

                {form.department && filteredDoctors.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No active doctors are listed for this department.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="date">
                  Appointment date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  min={minimumDate}
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="startTime">
                  Start time
                </label>

                <select
                  id="startTime"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select time</option>

                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  The requested duration is 30 minutes. Doctor availability
                  and scheduling conflicts are checked by the server.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="type">
                  Appointment type
                </label>

                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="reasonForVisit">
                  Reason for visit
                </label>

                <input
                  id="reasonForVisit"
                  name="reasonForVisit"
                  value={form.reasonForVisit}
                  onChange={handleChange}
                  maxLength={500}
                  className={inputClass}
                  placeholder="Briefly describe why you need a visit"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="notes">
                Additional notes{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                className={inputClass}
                placeholder="Anything else the doctor should know?"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting || loadingOptions}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {editingId ? <Save size={18} /> : <CalendarDays size={18} />}

                {submitting
                  ? editingId
                    ? "Saving changes..."
                    : "Booking..."
                  : editingId
                    ? "Save changes"
                    : "Request appointment"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleDiscardEdit}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Discard changes
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Appointment history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your requests and appointment status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <CalendarDays
              className="mx-auto text-slate-400"
              size={36}
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No appointments yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Use the form above to request your first appointment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => {
              const doctor = appointment.doctor;
              const department = appointment.department;
              const status = appointment.status || "pending";
              const id = getId(appointment);
              const canEdit = status === "pending";
              const canCancel = !["completed", "cancelled"].includes(status);

              return (
                <article
                  key={id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                        <Stethoscope size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {getDoctorName(doctor)}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {doctor?.specialization || "Medical appointment"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {typeof department === "object"
                            ? getDepartmentName(department)
                            : "Department"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusStyles[status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays size={17} className="text-teal-700" />
                      {formatDate(appointment.date)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={17} className="text-teal-700" />
                      {formatTime(appointment.startTime)} to{" "}
                      {formatTime(appointment.endTime)}
                    </div>

                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">
                        Type:
                      </span>{" "}
                      {appointmentTypes.find(
                        (type) => type.value === appointment.type
                      )?.label ||
                        appointment.type ||
                        "Consultation"}
                    </div>

                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">
                        Reason:
                      </span>{" "}
                      {appointment.reasonForVisit || "Not provided"}
                    </div>
                  </div>

                  {appointment.cancelReason && (
                    <p className="mt-3 text-sm text-red-700">
                      Cancellation reason: {appointment.cancelReason}
                    </p>
                  )}

                  {(canEdit || canCancel) && (
                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEdit(appointment)}
                          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
                        >
                          <Pencil size={16} />
                          Edit appointment
                        </button>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancel(appointment)}
                          disabled={cancellingId === id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {cancellingId === id
                            ? "Cancelling..."
                            : "Cancel appointment"}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-sm text-slate-500">
        Need to update your personal details?{" "}
        <Link
          to="/patient/profile"
          className="font-semibold text-teal-700 hover:underline"
        >
          Go to your profile
        </Link>
        .
      </p>
    </div>
  );
}

export default PatientAppointments;