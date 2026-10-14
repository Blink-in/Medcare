
import { useCallback, useEffect, useState } from "react";
import { ClipboardList, RefreshCw, Search } from "lucide-react";
import api from "../../services/api";

const getItems = (data) => {
  if (Array.isArray(data)) return data;

  return (
    data?.medicalRecords ||
    data?.records ||
    data?.data?.medicalRecords ||
    data?.data?.records ||
    []
  );
};

const getPersonName = (person) => {
  const user = person?.user || person;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return name || "Not available";
};

const AdminMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/medical-records");
      setRecords(getItems(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load medical records. Check that the admin records endpoint is enabled."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = records.filter((record) => {
    const patient = getPersonName(record.patient);
    const doctor = getPersonName(record.doctor);
    const searchableText = [
      patient,
      doctor,
      record.diagnosis,
      record.symptoms,
      record.treatment,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase().trim());
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
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#12372b]">
            Medical Records
          </h1>
          <p className="mt-2 text-sm text-[#718078]">
            Review medical records created across the hospital.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRecords}
          className="flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d7957]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh records
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="rounded-2xl border border-[#dcebe4] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f0] text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-[#718078]">Total records</p>
          <p className="mt-1 text-3xl font-bold text-[#12372b]">
            {isLoading ? "..." : records.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#dcebe4] bg-white p-5">
          <label
            htmlFor="record-search"
            className="mb-2 block text-sm font-semibold text-[#40594f]"
          >
            Search medical records
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-[#dcebe4] px-4">
            <Search className="h-4 w-4 text-[#819089]" />
            <input
              id="record-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, doctor, diagnosis, treatment"
              className="w-full py-3 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchRecords}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#dcebe4] bg-white">
        <div className="border-b border-[#e7efeb] px-5 py-4">
          <h2 className="font-bold text-[#173d30]">Hospital Records</h2>
          <p className="mt-1 text-xs text-[#84938d]">
            Search and review recorded diagnoses and treatments.
          </p>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-sm text-[#718078]">
            Loading medical records...
          </p>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-[#a2b4ab]" />
            <p className="mt-3 text-sm font-semibold text-[#40594f]">
              No medical records found
            </p>
            <p className="mt-1 text-xs text-[#84938d]">
              Records will appear here when they are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f4faf7] text-xs uppercase text-[#718078]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Diagnosis</th>
                  <th className="px-5 py-3 font-semibold">Treatment</th>
                  <th className="px-5 py-3 font-semibold">Date recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2ef]">
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-5 py-4 font-semibold text-[#173d30]">
                      {getPersonName(record.patient)}
                    </td>
                    <td className="px-5 py-4 text-[#40594f]">
                      {getPersonName(record.doctor)}
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-[#40594f]">
                      {record.diagnosis || "Not provided"}
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-[#718078]">
                      {record.treatment || "Not provided"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#718078]">
                      {formatDate(record.createdAt || record.date)}
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

export default AdminMedicalRecords;
