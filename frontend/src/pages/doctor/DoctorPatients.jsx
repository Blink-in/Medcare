
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";
import { getMyDoctorAppointments } from "../../services/doctorService";

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  return data?.appointments || data?.data?.appointments || [];
};

const getPatientName = (patient) => {
  const user = patient?.user || patient;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || "Unknown patient";
};

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getMyDoctorAppointments();
      const appointments = getItems(response);
      const uniquePatients = new Map();

      appointments.forEach((appointment) => {
        const patient = appointment.patient;
        if (!patient) return;

        const patientId = patient._id || patient.id;
        if (!patientId) return;

        if (!uniquePatients.has(patientId)) {
          uniquePatients.set(patientId, {
            ...patient,
            appointmentCount: 1,
            latestAppointment: appointment.date,
          });
        } else {
          const existing = uniquePatients.get(patientId);
          existing.appointmentCount += 1;

          if (
            appointment.date &&
            (!existing.latestAppointment ||
              new Date(appointment.date) > new Date(existing.latestAppointment))
          ) {
            existing.latestAppointment = appointment.date;
          }
        }
      });

      setPatients(Array.from(uniquePatients.values()));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your patient list."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((patient) => {
    const name = getPatientName(patient).toLowerCase();
    const email = (patient.user?.email || patient.email || "").toLowerCase();
    const query = search.toLowerCase().trim();

    return name.includes(query) || email.includes(query);
  });

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Doctor Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#12372b]">
            My Patients
          </h1>
          <p className="mt-2 text-sm text-[#718078]">
            Patients linked to your appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPatients}
          className="flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d7957]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="rounded-2xl border border-[#dcebe4] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f0] text-primary">
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-[#718078]">Unique patients</p>
          <p className="mt-1 text-3xl font-bold text-[#12372b]">
            {isLoading ? "..." : patients.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#dcebe4] bg-white p-5">
          <label
            htmlFor="patient-search"
            className="mb-2 block text-sm font-semibold text-[#40594f]"
          >
            Search patients
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-[#dcebe4] px-4">
            <Search className="h-4 w-4 text-[#819089]" />
            <input
              id="patient-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="w-full py-3 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            type="button"
            onClick={fetchPatients}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#dcebe4] bg-white">
        <div className="border-b border-[#e7efeb] px-5 py-4">
          <h2 className="font-bold text-[#173d30]">Patient Directory</h2>
          <p className="mt-1 text-xs text-[#84938d]">
            Patients found through your appointment history.
          </p>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-sm text-[#718078]">
            Loading patients...
          </p>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-[#a2b4ab]" />
            <p className="mt-3 text-sm font-semibold text-[#40594f]">
              No patients found
            </p>
            <p className="mt-1 text-xs text-[#84938d]">
              Patients will appear here when they have appointments with you.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-[#f4faf7] text-xs uppercase text-[#718078]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Appointments</th>
                  <th className="px-5 py-3 font-semibold">Latest appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2ef]">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id || patient.id}>
                    <td className="px-5 py-4 font-semibold text-[#173d30]">
                      {getPatientName(patient)}
                    </td>
                    <td className="px-5 py-4 text-[#718078]">
                      {patient.user?.email || patient.email || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-[#40594f]">
                      {patient.appointmentCount}
                    </td>
                    <td className="px-5 py-4 text-[#718078]">
                      {formatDate(patient.latestAppointment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorPatients;
