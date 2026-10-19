import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  HeartHandshake,
  UserRound,
} from "lucide-react";
import HomeEcg from "./HomeEcg";
import HomeReveal from "./HomeReveal";
import HomeSectionHeading from "./HomeSectionHeading";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your account",
    description: "Register as a patient to access your healthcare dashboard.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Arrange your appointment",
    description:
      "Sign in to access the appointment features available to you.",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "Manage your care",
    description:
      "Keep track of your appointments, medical records, and prescriptions.",
  },
];

const features = [
  {
    icon: CalendarCheck,
    title: "Appointment management",
    description: "Access your appointment information through your account.",
  },
  {
    icon: ClipboardList,
    title: "Medical information",
    description: "Access available medical records and prescriptions securely.",
  },
];

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

const HomeInfoSections = () => {
  return (
    <>
      <section id="about" className="hm scroll-mt-20 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <HomeReveal variant="left">
            <div className="relative mx-auto max-w-xl pb-12 pr-8 sm:pr-14">
              <div className="img-zoom overflow-hidden rounded-[2.5rem] rounded-bl-[6rem] bg-green-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85"
                  alt="Doctor ready to meet a patient"
                  loading="lazy"
                  onError={hideBrokenImage}
                  className="h-[380px] w-full object-cover sm:h-[480px]"
                />
              </div>

              <div className="img-zoom absolute bottom-0 right-0 w-44 overflow-hidden rounded-[2rem] border-[6px] border-white bg-green-200 shadow-xl sm:w-56">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=85"
                  alt="Hospital corridor"
                  loading="lazy"
                  onError={hideBrokenImage}
                  className="h-40 w-full object-cover sm:h-48"
                />
              </div>

              <div className="absolute left-4 top-8 w-52 rounded-3xl bg-[#0a3326] p-5 text-white shadow-2xl shadow-green-950/30 sm:-left-6">
                <HeartHandshake className="h-6 w-6 text-green-300" />
                <p className="font-display mt-3 text-lg font-semibold leading-snug">
                  Care that puts your needs first
                </p>
                <HomeEcg className="mt-3 h-6 w-full" stroke="#4ade80" />
              </div>
            </div>
          </HomeReveal>

          <HomeReveal variant="right" delay={100}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <span className="h-1.5 w-6 rounded-full bg-green-600" />
              About MedCare
            </p>

            <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Healthcare information, organized around you.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              MedCare brings key healthcare management features together in
              one place. Patients can manage their appointments and view
              available medical information, while authorized healthcare
              professionals can manage clinical workflows according to their
              roles.
            </p>

            <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <li key={feature.title} className="flex items-start gap-4 py-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/signup"
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-green-700 py-3 pl-6 pr-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Join MedCare
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-800 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </HomeReveal>
        </div>
      </section>

      <section className="hm relative overflow-hidden bg-[#0a3326] py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 opacity-[0.07]">
          <HomeEcg className="h-24 w-full" stroke="#ffffff" animate={false} />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <HomeSectionHeading
            tone="dark"
            align="center"
            eyebrow="Getting started"
            title="Your healthcare journey in three steps"
            description="Get started with MedCare and access the healthcare management features available to your account."
          />

          <div className="relative grid gap-5 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[17%] right-[17%] top-[3.4rem] hidden border-t border-dashed border-white/25 md:block" />

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <HomeReveal key={step.number} delay={index * 120}>
                  <article className="relative h-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors duration-500 hover:bg-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-[#0a3326]">
                        <Icon className="h-7 w-7" />
                      </span>
                      <span className="font-display text-4xl font-semibold text-white/25">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-display mt-8 text-2xl font-semibold tracking-tight text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-green-100/75">
                      {step.description}
                    </p>
                  </article>
                </HomeReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hm bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <HomeReveal variant="zoom">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-green-700 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-x-0 bottom-8 text-white/20">
              <HomeEcg className="h-16 w-full" stroke="currentColor" />
            </div>

            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-20 -top-10 h-56 w-56 rounded-full border border-white/10" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
                Ready to keep your care in one place?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-green-50/90 sm:text-lg">
                Create a patient account to manage your appointments, medical
                records, and prescriptions.
              </p>

              <Link
                to="/signup"
                className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-white py-3.5 pl-7 pr-3.5 text-sm font-semibold text-green-900 shadow-xl shadow-green-950/20 transition hover:bg-green-50"
              >
                Create your patient account
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </HomeReveal>
      </section>
    </>
  );
};

export default HomeInfoSections;
