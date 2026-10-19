import { useEffect, useState } from "react";
import { ArrowUpRight, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { getDoctors } from "../../services/doctorService";
import HomeReveal from "./HomeReveal";
import HomeSectionHeading from "./HomeSectionHeading";

const getDoctorName = (doctor) =>
  `${doctor.user?.firstName || ""} ${doctor.user?.lastName || ""}`.trim() ||
  "Medical professional";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const DoctorSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
    <div className="h-64 bg-slate-100" />
    <div className="p-6">
      <div className="h-5 w-2/3 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
      <div className="mt-6 h-11 rounded-full bg-slate-100" />
    </div>
  </div>
);

const HomeDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDoctors();
        const items = data.doctors || data.data?.doctors || [];

        if (active) {
          setDoctors(
            items.filter(
              (doctor) =>
                doctor.isActive !== false &&
                doctor.user?.isActive !== false &&
                doctor.isVerified !== false
            )
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "We couldn't load doctor profiles right now."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="doctors" className="hm scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <HomeSectionHeading
          eyebrow="Meet our professionals"
          title="Healthcare professionals"
          description="Get to know the doctors listed on MedCare and explore their specialties."
        />

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <DoctorSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-200 bg-slate-50 px-6 py-12 text-center">
            <Stethoscope className="mx-auto h-9 w-9 text-amber-600" />
            <p className="mt-3 font-semibold text-slate-900">
              Doctor profiles are temporarily unavailable
            </p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-900">
              Doctor profiles coming soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              There are no public doctor profiles available to display yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((doctor, index) => {
              const name = getDoctorName(doctor);
              const avatar = doctor.user?.avatar;

              return (
                <HomeReveal key={doctor._id} delay={index * 90}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(10,51,38,0.4)]">
                    <div className="img-zoom relative h-64 overflow-hidden bg-gradient-to-br from-green-100 via-green-50 to-white">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-display text-7xl font-semibold text-green-800/80">
                            {getInitials(name) || (
                              <Stethoscope className="h-14 w-14" />
                            )}
                          </span>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-green-800 backdrop-blur">
                        {doctor.department?.name || "MedCare"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
                        {name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-green-700">
                        {doctor.specialization || "Medical professional"}
                      </p>

                      {Array.isArray(doctor.qualification) &&
                        doctor.qualification.length > 0 && (
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            {doctor.qualification.slice(0, 2).join(", ")}
                          </p>
                        )}

                      <Link
                        to="/signup"
                        className="mt-auto flex items-center justify-between rounded-full border border-green-200 bg-green-50 py-1.5 pl-5 pr-1.5 pt-1.5 text-sm font-semibold text-green-900 transition-colors duration-300 hover:bg-green-700 hover:text-white group-hover:border-green-700"
                        style={{ marginTop: "1.5rem" }}
                      >
                        Book an appointment
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white transition-transform duration-300 group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  </article>
                </HomeReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeDoctors;
