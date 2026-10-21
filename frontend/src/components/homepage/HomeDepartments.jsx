import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bone,
  Brain,
  Building2,
  Eye,
  HeartPulse,
  Microscope,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicDepartments } from "../../services/departmentService";
import HomeReveal from "./HomeReveal";
import HomeSectionHeading from "./HomeSectionHeading";

const departmentIcons = [
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Microscope,
  Stethoscope,
  Activity,
  UsersRound,
];

// On large screens the grid has 4 columns. These cards span 2 columns
// so a full set of 8 departments fills every row.
const wideCards = [0, 5, 6, 7];

// Representative clinical spaces for the public directory cards. These are
// intentionally presented as stock visuals, not photographs of MedCare sites.
const departmentImages = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1000&q=85",
];

const DepartmentSkeleton = () => (
  <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6">
    <div className="h-12 w-12 rounded-2xl bg-slate-100" />
    <div className="mt-8 h-5 w-3/4 rounded bg-slate-100" />
    <div className="mt-3 h-3 w-full rounded bg-slate-100" />
    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
  </div>
);

const HomeDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicDepartments();
        const items = data.departments || data.data?.departments || [];

        if (active) {
          setDepartments(
            items.filter((department) => department.isActive !== false)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "We couldn't load departments right now."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDepartments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="departments"
      className="hm scroll-mt-20 bg-[#f6faf6] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <HomeSectionHeading
          eyebrow="Explore our care"
          title="Medical departments"
          description="Explore the departments available through MedCare and learn more about the areas of healthcare they support."
        >
          {departments.length > 8 && (
            <Link
              to="/signup"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-green-700 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-700 hover:text-white"
            >
              Explore MedCare
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </HomeSectionHeading>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <DepartmentSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-200 bg-white px-6 py-12 text-center">
            <Building2 className="mx-auto h-9 w-9 text-amber-600" />
            <p className="mt-3 font-semibold text-slate-900">
              Departments are temporarily unavailable
            </p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-900">
              No departments to display yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Please check back later for available departments.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4">
            {departments.slice(0, 8).map((department, index) => {
              const Icon = departmentIcons[index % departmentIcons.length];
              const featured = index === 0;
              const wide = wideCards.includes(index);
              const image = departmentImages[index % departmentImages.length];

              return (
                <HomeReveal
                  key={department._id}
                  delay={(index % 4) * 70}
                  className={wide ? "lg:col-span-2" : ""}
                >
                  <article
                    className={`group relative flex h-full min-h-[16rem] flex-col justify-between overflow-hidden rounded-3xl border p-7 ${
                      featured
                        ? "border-transparent bg-[#0a3326]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#0a3326]/95 via-green-800/75 to-green-700/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex items-start justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500 ${
                          featured
                            ? "bg-white/10 text-green-300"
                            : "bg-green-50 text-green-700"
                        } group-hover:bg-white/15 group-hover:text-white`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 group-hover:rotate-45 group-hover:border-white/40 group-hover:text-white ${
                          featured
                            ? "border-white/20 text-white/70"
                            : "border-slate-200 text-slate-400"
                        }`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="relative mt-10">
                      <h3
                        className={`font-display text-2xl font-semibold tracking-tight transition-colors duration-500 group-hover:text-white ${
                          featured ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {department.name}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 transition-colors duration-500 group-hover:text-green-50 ${
                          featured ? "text-green-100/75" : "text-slate-600"
                        }`}
                      >
                        {department.description ||
                          `Explore care and services offered by our ${department.name} department.`}
                      </p>

                      {department.location && (
                        <p
                          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors duration-500 group-hover:bg-white/15 group-hover:text-white ${
                            featured
                              ? "bg-white/10 text-green-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {department.location}
                        </p>
                      )}
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

export default HomeDepartments;
