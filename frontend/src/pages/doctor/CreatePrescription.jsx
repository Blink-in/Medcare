
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FilePlus2,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createPrescription,
} from "../../services/prescriptionService";
import { getMyDoctorAppointments } from "../../services/doctorService";

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.appointments)) return data.appointments;
  if (Array.isArray(data?.data?.appointments)) return data.data.appointments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getAppointmentId = (appointment) =>
  appointment?._id || appointment?.id || "";

const getPatientId = (appointment) => {
  const patient = appointment?.patient;
  return patient?._id || patient?.id || "";
};

const getPatientName = (appointment) => {
  const patient = appointment?.patient;
  const user = patient?.user || patient;

  const name = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return name || user?.email || "Unknown patient";
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

const emptyMedication = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export default function CreatePrescription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState(
    searchParams.get("appointmentId") || ""
  );
  const [medications, setMedications] = useState([emptyMedication()]);
  const [instructions, setInstructions] = useState("");
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
        const completed = getItems(response).filter(
          (appointment) =>
            appointment.status?.toLowerCase() === "completed"
        );

        setAppointments(completed);

        const requestedId = searchParams.get("appointmentId");
        const requestedAppointment = completed.find(
          (appointment) => getAppointmentId(appointment) === requestedId
        );

        if (requestedAppointment) {
          setAppointmentId(requestedId);
        } else if (requestedId) {
          setError(
            "The requested appointment was not found among your completed appointments. Please select an appointment below."
          );
          setAppointmentId("");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load completed appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [searchParams]);

  const selectedAppointment = appointments.find(
    (appointment) => getAppointmentId(appointment) === appointmentId
  );

  const updateMedication = (index, field, value) => {
    setMedications((current) =>
      current.map((medication, medicationIndex) =>
        medicationIndex === index
          ? { ...medication, [field]: value }
          : medication
      )
    );
  };

  const addMedication = () => {
    setMedications((current) => [...current, emptyMedication()]);
  };

  const removeMedication = (index) => {
    setMedications((current) =>
      current.length === 1
        ? current
        : current.filter((_, medicationIndex) => medicationIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedAppointment) {
      setError("Please select a completed appointment.");
      return;
    }

    if (!getPatientId(selectedAppointment)) {
      setError("The selected appointment does not contain a patient ID.");
      return;
    }

    const cleanedMedications = medications.map((medication) => ({
      name: medication.name.trim(),
      dosage: medication.dosage.trim(),
      frequency: medication.frequency.trim(),
      duration: medication.duration.trim(),
      instructions: medication.instructions.trim(),
    }));

    const invalidMedication = cleanedMedications.some(
      (medication) =>
        !medication.name ||
        !medication.dosage ||
        !medication.frequency ||
        !medication.duration
    );

    if (invalidMedication) {
      setError(
        "Complete the name, dosage, frequency, and duration for every medication."
      );
      return;
    }

    if (instructions.length > 2000 || notes.length > 2000) {
      setError("Instructions and notes cannot exceed 2000 characters.");
      return;
    }

    const prescriptionData = {
      patient: getPatientId(selectedAppointment),
      appointment: getAppointmentId(selectedAppointment),
      medications: cleanedMedications,
      instructions: instructions.trim(),
      notes: notes.trim(),
    };

    try {
      setSaving(true);
      await createPrescription(prescriptionData);
      setSuccess("Prescription created successfully.");

      navigate("/doctor/prescriptions");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create the prescription."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          to="/doctor/prescriptions"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Back to prescriptions
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">
          Create Prescription
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Prescribe medications for a completed appointment.
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

        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Appointment and patient
          </h2>

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
                  {getPatientName(appointment)} |{" "}
                  {formatDate(appointment.date)}
                  {appointment.type ? ` | ${appointment.type}` : ""}
                </option>
              ))}
            </select>
          )}

          {!loading && appointments.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No completed appointments are available for prescriptions.
            </p>
          )}

          {selectedAppointment && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Patient:</span>{" "}
                {getPatientName(selectedAppointment)}
              </p>
              <p className="mt-1">
                <span className="font-medium text-gray-800">Date:</span>{" "}
                {formatDate(selectedAppointment.date)}
              </p>
              <p className="mt-1">
                <span className="font-medium text-gray-800">Status:</span>{" "}
                {selectedAppointment.status}
              </p>
            </div>
          )}
        </section>

        <section className="border-t border-gray-100 pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Medications
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Add each medication separately.
              </p>
            </div>

            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              <Plus size={16} />
              Add medication
            </button>
          </div>

          <div className="space-y-5">
            {medications.map((medication, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">
                    Medication {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    disabled={medications.length === 1}
                    aria-label={`Remove medication ${index + 1}`}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`medication-name-${index}`}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Medication name *
                  </label>
                  <input
                    id={`medication-name-${index}`}
                    value={medication.name}
                    onChange={(event) =>
                      updateMedication(index, "name", event.target.value)
                    }
                    maxLength={150}
                    required
                    placeholder="Enter medication name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`medication-dosage-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Dosage *
                    </label>
                    <input
                      id={`medication-dosage-${index}`}
                      value={medication.dosage}
                      onChange={(event) =>
                        updateMedication(index, "dosage", event.target.value)
                      }
                      maxLength={100}
                      required
                      placeholder="e.g. 500 mg"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`medication-frequency-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Frequency *
                    </label>
                    <input
                      id={`medication-frequency-${index}`}
                      value={medication.frequency}
                      onChange={(event) =>
                        updateMedication(index, "frequency", event.target.value)
                      }
                      maxLength={100}
                      required
                      placeholder="e.g. Twice daily"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`medication-duration-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Duration *
                    </label>
                    <input
                      id={`medication-duration-${index}`}
                      value={medication.duration}
                      onChange={(event) =>
                        updateMedication(index, "duration", event.target.value)
                      }
                      maxLength={100}
                      required
                      placeholder="e.g. 5 days"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`medication-instructions-${index}`}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Medication instructions
                  </label>
                  <textarea
                    id={`medication-instructions-${index}`}
                    value={medication.instructions}
                    onChange={(event) =>
                      updateMedication(
                        index,
                        "instructions",
                        event.target.value
                      )
                    }
                    maxLength={500}
                    rows={2}
                    placeholder="e.g. Take with food"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-5">
          <div>
            <label
              htmlFor="general-instructions"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              General instructions
            </label>
            <textarea
              id="general-instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Additional instructions for the patient"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="prescription-notes"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Clinical notes
            </label>
            <textarea
              id="prescription-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Internal or relevant clinical notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/doctor/prescriptions"
            className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || saving || appointments.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <FilePlus2 size={17} />
            )}
            {saving ? "Saving prescription..." : "Save prescription"}
          </button>
        </div>
      </form>
    </div>
  );
}
