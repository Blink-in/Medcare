import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FilePlus2, LoaderCircle } from "lucide-react";
import {
  createMedicalRecord,
  getMyDoctorAppointments,
} from "../../services/doctorService";

const getItems = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.appointments)) return data.appointments;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

const getPatientName = (appointment) => {
  const patient = appointment?.patient;
  const user = patient?.user || patient;

  if (!user) return "Unknown patient";

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email || "Patient";
};

const getPatientId = (appointment) => {
  const patient = appointment?.patient;
  return patient?._id || patient?.id || "";
};

const getAppointmentId = (appointment) =>
  appointment?._id || appointment?.id || "";

export default function CreateMedicalRecord() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setError("");
        const response = await getMyDoctorAppointments();
        const items = getItems(response, "appointments");

        setAppointments(
          items.filter(
            (appointment) =>
              appointment.status?.toLowerCase() === "completed"
          )
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load your appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const selectedAppointment = appointments.find(
    (appointment) => getAppointmentId(appointment) === appointmentId
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!appointmentId) {
      setError("Please select a completed appointment.");
      return;
    }

    if (!diagnosis.trim()) {
      setError("Please enter the diagnosis.");
      return;
    }

    const patientId = getPatientId(selectedAppointment);

    if (!patientId) {
      setError(
        "The selected appointment does not contain a patient ID. Please check the appointment data."
      );
      return;
    }

    const recordData = {
      patient: patientId,
      appointment: appointmentId,
      symptoms: symptoms
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      notes: notes.trim(),
    };

    try {
      setSaving(true);
      await createMedicalRecord(recordData);
      setSuccess("Medical record created successfully.");

      setTimeout(() => {
        navigate("/doctor/medical-records");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create the medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          to="/doctor/medical-records"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Back to medical records
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">
          Create Medical Record
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Record the diagnosis and treatment for a completed appointment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-7"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div>
          <label
            htmlFor="appointment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Completed appointment <span className="text-red-500">*</span>
          </label>

          {loading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
              <LoaderCircle size={16} className="animate-spin" />
              Loading appointments...
            </div>
          ) : (
            <select
              id="appointment"
              value={appointmentId}
              onChange={(event) => setAppointmentId(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select a completed appointment</option>
              {appointments.map((appointment) => (
                <option
                  key={getAppointmentId(appointment)}
                  value={getAppointmentId(appointment)}
                >
                  {getPatientName(appointment)}
                  {appointment.date
                    ? ` | ${new Date(appointment.date).toLocaleDateString()}`
                    : ""}
                  {appointment.type ? ` | ${appointment.type}` : ""}
                </option>
              ))}
            </select>
          )}

          {!loading && appointments.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No completed appointments are available for medical records.
            </p>
          )}
        </div>

        {selectedAppointment && (
          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Patient:</span>{" "}
              {getPatientName(selectedAppointment)}
            </p>
            <p className="mt-1">
              <span className="font-medium text-gray-800">Status:</span>{" "}
              {selectedAppointment.status}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="symptoms"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Symptoms
          </label>
          <input
            id="symptoms"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="e.g. headache, fever, fatigue"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple symptoms with commas.
          </p>
        </div>

        <div>
          <label
            htmlFor="diagnosis"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Diagnosis <span className="text-red-500">*</span>
          </label>
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            required
            maxLength={1000}
            rows={3}
            placeholder="Enter the patient's diagnosis"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="treatment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Treatment and recommendations
          </label>
          <textarea
            id="treatment"
            value={treatment}
            onChange={(event) => setTreatment(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Describe the prescribed treatment and recommendations"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Additional notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={5000}
            rows={4}
            placeholder="Add any relevant clinical notes"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/doctor/medical-records"
            className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || saving || appointments.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FilePlus2 size={17} />
            {saving ? "Saving record..." : "Save Medical Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
