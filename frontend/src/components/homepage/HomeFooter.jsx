import { Link } from "react-router-dom";
import { Activity, ArrowUpRight } from "lucide-react";

const HomeFooter = () => {
  return (
    <footer className="hm relative overflow-hidden bg-[#0a3326] text-green-100/80">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-20 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-[#0a3326]">
              <Activity className="h-6 w-6" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              Med<span className="text-green-400">Care</span>
            </span>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7">
            Your healthcare journey, made simpler. Explore medical
            departments, learn about our doctors, and manage your
            appointments in one place.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Explore
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="/#departments" className="transition hover:text-white">
                Departments
              </a>
            </li>
            <li>
              <a href="/#doctors" className="transition hover:text-white">
                Our doctors
              </a>
            </li>
            <li>
              <a href="/#about" className="transition hover:text-white">
                About MedCare
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Your account
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link to="/login" className="transition hover:text-white">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/signup" className="transition hover:text-white">
                Create an account
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 transition hover:text-white"
              >
                Book an appointment
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="footer-word font-display pointer-events-none select-none text-center text-[22vw] font-semibold leading-[0.8] tracking-tighter lg:text-[17rem]"
      >
        MedCare
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-green-100/60 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} MedCare. All rights reserved.</p>
          <p>Healthcare management made simpler.</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
