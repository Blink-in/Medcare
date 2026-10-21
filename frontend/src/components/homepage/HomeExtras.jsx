import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  FileHeart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import HomeReveal from "./HomeReveal";
import HomeSectionHeading from "./HomeSectionHeading";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified care team",
    description:
      "Discover active, verified professionals and the departments they support.",
  },
  {
    icon: CalendarClock,
    title: "Appointments made simple",
    description:
      "Request and keep track of visits from one easy to use patient account.",
  },
  {
    icon: ShieldCheck,
    title: "Your information, protected",
    description:
      "Medical information is available only to the authorized people on your care team.",
  },
  {
    icon: HeartHandshake,
    title: "Care centred on you",
    description:
      "Stay informed, prepared and connected at every stage of your care.",
  },
];

const testimonials = [
  {
    quote:
      "The appointment information was clear and easy to find when I needed it.",
    name: "Patient feedback",
    care: "Sample experience",
  },
  {
    quote:
      "I like having my healthcare details organized in one place instead of searching through messages.",
    name: "Patient feedback",
    care: "Sample experience",
  },
  {
    quote:
      "Finding a department and understanding the next step felt straightforward from the start.",
    name: "Patient feedback",
    care: "Sample experience",
  },
];

const resources = [
  {
    icon: FileHeart,
    label: "Preventive care",
    title: "Make time for your routine health checks",
    description:
      "Small, regular check ins can help you ask the right questions about your wellbeing.",
  },
  {
    icon: HeartHandshake,
    label: "Family health",
    title: "Prepare for your child’s next visit",
    description:
      "Keep notes on symptoms, questions and medicines so your consultation is more productive.",
  },
  {
    icon: Stethoscope,
    label: "Your appointment",
    title: "Get more from time with your doctor",
    description:
      "Bring your questions and relevant health information to make every appointment count.",
  },
];

const faqs = [
  {
    question: "Do I need an account to explore MedCare?",
    answer:
      "No. Anyone can browse the public departments and clinician directory. Create a patient account when you are ready to use appointment and care-management features.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Create or sign in to a patient account, then select the department, clinician and a suitable appointment time from your dashboard.",
  },
  {
    question: "Can I view my medical information online?",
    answer:
      "Authorized patients can access available appointments, records and prescriptions through their secure MedCare account.",
  },
  {
    question: "How do I find the right department?",
    answer:
      "Browse the department directory to see the care areas available, then create an account to continue with appointment options.",
  },
];

const HomeExtras = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section className="hm bg-[#f6faf6] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <HomeSectionHeading
            eyebrow="Why MedCare"
            title="Thoughtful support for every step of care"
            description="Everything is designed to help you feel more prepared, informed and in control of your healthcare journey."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <HomeReveal key={benefit.title} delay={index * 80}>
                  <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(10,51,38,0.45)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="font-display mt-7 text-xl font-semibold tracking-tight text-slate-900">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {benefit.description}
                    </p>
                  </article>
                </HomeReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hm bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
          <HomeReveal variant="left">
            <div className="rounded-[2.25rem] bg-[#0a3326] p-8 text-white sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-[#0a3326]">
                <CalendarClock className="h-7 w-7" />
              </span>
              <p className="mt-8 text-sm font-semibold text-green-300">
                Your next visit, simplified
              </p>
              <p className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Find care when you are ready.
              </p>
              <div className="mt-8 space-y-4 border-t border-white/10 pt-7 text-sm leading-6 text-green-100/75">
                <p>01 · Choose a department that fits your needs</p>
                <p>02 · Create an account or log in securely</p>
                <p>03 · Request and manage your appointment</p>
              </div>
            </div>
          </HomeReveal>

          <HomeReveal variant="right" delay={100}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <span className="h-1.5 w-6 rounded-full bg-green-600" />
              Book with confidence
            </p>
            <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              A clear path from searching to seeing a doctor.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Start by exploring the public directory. When you are ready,
              sign in to choose a department and doctor, then keep your visit
              details organised in your dashboard.
            </p>
            <Link
              to="/signup"
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-green-700 py-3.5 pl-6 pr-3.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Create a patient account
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-800 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </HomeReveal>
        </div>
      </section>

      <section className="hm bg-[#f6faf6] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <HomeSectionHeading
            eyebrow="Patient perspective"
            title="Care should feel clear and connected"
            description="These sample comments show the kind of simple, supported experience MedCare is built to provide."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <HomeReveal key={index} delay={index * 100}>
                <figure className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7">
                  <div className="flex gap-1 text-amber-400" aria-label="Five star sample rating">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="font-display mt-6 text-xl font-medium leading-8 tracking-tight text-slate-800">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 pt-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                      MC
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.care}</p>
                    </div>
                  </figcaption>
                </figure>
              </HomeReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="hm bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <HomeSectionHeading
            eyebrow="Health resources"
            title="Helpful prompts for healthier visits"
            description="A few practical starting points to help you prepare for conversations about your health."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {resources.map((resource, index) => {
              const Icon = resource.icon;

              return (
                <HomeReveal key={resource.title} delay={index * 90}>
                  <article className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-7 transition duration-300 hover:border-green-200 hover:shadow-[0_24px_50px_-32px_rgba(10,51,38,0.45)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                      {resource.label}
                    </p>
                    <h3 className="font-display mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-900">
                      {resource.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{resource.description}</p>
                    <Link
                      to="/signup"
                      className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition group-hover:gap-3"
                    >
                      Prepare for your care <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </article>
                </HomeReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="hm scroll-mt-20 bg-[#f6faf6] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-10">
          <HomeReveal variant="left">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <span className="h-1.5 w-6 rounded-full bg-green-600" />
              Frequently asked questions
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Answers before you get started.
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-slate-600">
              Still need help? Create an account to explore the care options available to you.
            </p>
          </HomeReveal>

          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 sm:px-8">
            {faqs.map((faq, index) => {
              const open = openFaq === index;

              return (
                <HomeReveal key={faq.question} delay={index * 50}>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-display text-lg font-semibold text-slate-900">
                        {faq.question}
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-green-700 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && <p className="max-w-2xl pb-6 text-sm leading-7 text-slate-600">{faq.answer}</p>}
                  </div>
                </HomeReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hm bg-white px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <HomeReveal variant="zoom">
          <div className="relative mx-auto overflow-hidden rounded-[2.5rem] bg-[#0a3326] px-6 py-16 text-center sm:max-w-7xl sm:px-12 sm:py-20">
         
            <h2 className="font-display mx-auto mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Ready to take the next step in your care?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-green-100/80 sm:text-lg">
              Explore the care available, then create your MedCare account when you are ready to manage your health in one place.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="group inline-flex items-center gap-2.5 rounded-full bg-green-500 py-3.5 pl-6 pr-3.5 text-sm font-semibold text-[#0a3326] transition hover:bg-green-400">
                Get started
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a3326] text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <a href="#departments" className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore departments
              </a>
            </div>
          </div>
        </HomeReveal>
      </section>
    </>
  );
};

export default HomeExtras;
