
import { useEffect, useState } from "react";
import {
  UserRound,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from "../../services/patientService";

const emptyForm = {

  dateOfBirth: "",
  gender: "",
  bloodType: "unknown",
  address: "",
  allergies: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
};

const PatientProfile = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");

        const result = await getMyPatientProfile();
        const profile = result.patient;

        setPatient(profile);

        setFormData({

          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: profile.gender || "",
          bloodType: profile.bloodType || "unknown",
          address: profile.address || "",
          allergies: (profile.allergies || []).join(", "),
          emergencyContactName: profile.emergencyContact?.name || "",
          emergencyContactRelationship:
            profile.emergencyContact?.relationship || "",
          emergencyContactPhone: profile.emergencyContact?.phone || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your patient profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    const allergies = formData.allergies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const profileData = {

      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodType: formData.bloodType,
      address: formData.address.trim(),
      allergies,
      emergencyContact: {
        name: formData.emergencyContactName.trim(),
        relationship: formData.emergencyContactRelationship.trim(),
        phone: formData.emergencyContactPhone.trim(),
      },
    };

    try {
      const result = await updateMyPatientProfile(profileData);

      setPatient(result.patient);
      setSuccess(result.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const fullName = [
    patient?.user?.firstName,
    patient?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/patient/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-emerald-700"
      >
        <ArrowLeft size={17} />
        Back to dashboard
      </Link>

      <section className="rounded-2xl bg-emerald-700 p-6 text-white sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <UserRound size={30} />
          </div>

          <div>
            <p className="text-sm text-emerald-100">Personal Information</p>
            <h1 className="mt-1 text-2xl font-bold">My Patient Profile</h1>
            <p className="mt-1 text-sm text-emerald-50">
              {fullName || "Patient"} · Keep your details up to date.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Account Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your account identity is managed separately from your patient
              details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ReadOnlyField label="First Name" value={patient?.user?.firstName} />
            <ReadOnlyField label="Last Name" value={patient?.user?.lastName} />
            <ReadOnlyField label="Email Address" value={patient?.user?.email} />
            <ReadOnlyField label="Phone Number" value={patient?.user?.phone} />

          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Personal and Medical Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete the information you know. You can leave fields blank
              and update them later.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Date of Birth" htmlFor="dateOfBirth">
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Gender" htmlFor="gender">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Prefer not to specify</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>

            <FormField label="Blood Type" htmlFor="bloodType">
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="unknown">Not known</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </FormField>

            <FormField label="Home Address" htmlFor="address">
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength={200}
                placeholder="Enter your address"
                className={inputClass}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Known Allergies" htmlFor="allergies">
                <input
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. penicillin, peanuts, pollen"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Separate multiple allergies with commas. Leave blank if none
                  are known.
                </p>
              </FormField>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Emergency Contact
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add someone who can be contacted in an emergency. All fields are
              optional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Contact Name" htmlFor="emergencyContactName">
              <input
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                maxLength={100}
                placeholder="Full name"
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Relationship"
              htmlFor="emergencyContactRelationship"
            >
              <input
                id="emergencyContactRelationship"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Parent, spouse, sibling"
                className={inputClass}
              />
            </FormField>

            <FormField label="Contact Phone" htmlFor="emergencyContactPhone">
              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                maxLength={100}
                placeholder="Phone number"
                className={inputClass}
              />
            </FormField>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const FormField = ({ label, htmlFor, children }) => (
  <div className="space-y-2">
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    {children}
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
      {value || "Not provided"}
    </div>
  </div>
);

export default PatientProfile;