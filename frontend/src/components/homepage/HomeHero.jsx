import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import CountUp from "./CountUp";
import HomeEcg from "./HomeEcg";
import useHomeStats from "./useHomeStats";

const marqueeItems = [
  "Patient focused care",
  "Simple appointments",
  "Organized healthcare",
  "Medical departments",
  "Trusted doctors",
  "Medical records",
  "Prescriptions",
  "Patient accounts",
];

const HomeHero = () => {
  const { departments, doctors } = useHomeStats();

  const stats = [
    departments > 0 && { value: departments, label: "Medical departments" },
    doctors > 0 && { value: doctors, label: "Doctors on MedCare" },
    { value: 3, label: "Steps to get started" },
    { value: 1, label: "Place for all your care" },
  ].filter(Boolean);

  return (
    <>
      <section className="hm relative overflow-hidden bg-[#f6faf6]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-8 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:px-10 lg:pb-32 lg:pt-14">
          <div>
            <span
              className="hero-in inline-flex items-center gap-2.5 rounded-full border border-green-200 bg-white py-2 pl-3 pr-4 text-sm font-medium text-green-900"
              style={{ "--d": "100ms" }}
            >
              <span className="live-dot relative h-2 w-2 rounded-full bg-green-600" />
              A simpler way to manage your healthcare
            </span>

            <h1
              className="hero-in font-display mt-7 max-w-2xl text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl lg:text-[4.4rem]"
              style={{ "--d": "250ms" }}
            >
              Better healthcare starts with better access.
            </h1>

            <p
              className="hero-in mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg"
              style={{ "--d": "400ms" }}
            >
              Discover medical departments, connect with healthcare
              professionals, and keep your appointments and medical
              information organized with MedCare.
            </p>

            <div
              className="hero-in mt-9 flex flex-wrap items-center gap-3"
              style={{ "--d": "550ms" }}
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2.5 rounded-full bg-green-700 py-3.5 pl-6 pr-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Get started
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-800 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>

              <a
                href="#departments"
                className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-green-600 hover:text-green-800"
              >
                Explore departments
              </a>
            </div>

            <div
              className="hero-in mt-8 flex items-center gap-2 text-sm text-slate-500"
              style={{ "--d": "700ms" }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" />
              Create a patient account to manage your care
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="hero-mask relative overflow-hidden rounded-[3rem] bg-green-100">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1200&q=85"
                alt="Healthcare professional in a clinical setting"
                className="hero-zoom h-[420px] w-full object-cover sm:h-[560px] lg:h-[620px]"
                fetchPriority="high"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a3326]/35 via-transparent to-transparent" />
            </div>

            <div className="hero-notch hero-in" style={{ "--d": "1100ms" }}>
              <div className="w-60 rounded-3xl bg-green-50 p-4 sm:w-72 sm:p-5">
                <p className="text-xs font-semibold text-green-800">
                  MedCare patient portal
                </p>
                <p className="font-display mt-1.5 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                  Your care, organized
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-xs leading-5 text-slate-600">
                    Appointments and records in one place
                  </p>
                  <Link
                    to="/signup"
                    aria-label="Create your patient account"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition hover:scale-105 hover:bg-green-800"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="hero-in absolute -left-3 bottom-10 sm:-left-8 sm:bottom-14"
              style={{ "--d": "1300ms" }}
            >
              <div className="hero-bob w-64 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-green-950/20 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Simple appointments
                    </p>
                    <p className="text-xs text-slate-500">
                      Manage visits in one place
                    </p>
                  </div>
                </div>
                <HomeEcg className="mt-3 h-8 w-full text-green-600" stroke="#15803d" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-5 pb-16 sm:px-8 lg:-mt-20 lg:px-10 lg:pb-20">
          <div
            className="hero-in grid grid-cols-2 gap-y-6 rounded-[2rem] border border-slate-200 bg-white px-4 py-7 shadow-[0_30px_60px_-30px_rgba(10,51,38,0.35)] sm:px-8 lg:grid-flow-col lg:auto-cols-fr"
            style={{ "--d": "1500ms" }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-3 text-center lg:border-l lg:border-slate-200 lg:first:border-l-0"
              >
                <p className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  <CountUp to={stat.value} />
                </p>
                <p className="mt-1.5 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="hm marquee overflow-hidden bg-[#0a3326] py-5"
        aria-label="What MedCare offers"
      >
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-8 pr-8"
              aria-hidden={index >= marqueeItems.length}
            >
              <span className="font-display whitespace-nowrap text-xl font-medium text-green-50 sm:text-2xl">
                {item}
              </span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeHero;
