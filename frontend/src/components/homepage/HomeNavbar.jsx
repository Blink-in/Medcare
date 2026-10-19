
import { Link } from "react-router-dom";
import { Activity, Menu, X, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import useAuthStore from "../../store/authStore.js";

const navigation = [
  { label: "Home", to: "/", id: "top" },
  { label: "Departments", to: "/#departments", id: "departments" },
  { label: "Our Doctors", to: "/#doctors", id: "doctors" },
  { label: "About Us", to: "/#about", id: "about" },
];

const dashboardPaths = {
  admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");
  const progressRef = useRef(null);

  const { user, isAuthenticated, isLoading } = useAuthStore();

  const closeMenu = () => setMenuOpen(false);

  const dashboardPath = dashboardPaths[user?.role] || "/patient/dashboard";
  const loggedIn = isAuthenticated && Boolean(user);

  useEffect(() => {
    let frame;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;

        setScrolled(window.scrollY > 16);

        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`;
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const ids = ["departments", "doctors", "about"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    const onTop = () => {
      if (window.scrollY < 200) setActive("top");
    };

    window.addEventListener("scroll", onTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  const authLinks = (
    <>
      {loggedIn ? (
        <Link
          to={dashboardPath}
          onClick={closeMenu}
          className="flex items-center justify-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            to="/login"
            onClick={closeMenu}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            onClick={closeMenu}
            className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            Get started
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="hm sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border transition-all duration-500 ${
          scrolled || menuOpen
            ? "border-slate-200/80 bg-white/85 shadow-[0_10px_40px_-12px_rgba(10,51,38,0.25)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="MedCare home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
              <Activity className="h-5 w-5" />
            </span>

            <span className="font-display text-xl font-semibold tracking-tight text-slate-900">
              Med<span className="text-green-700">Care</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === item.id
                    ? "bg-green-50 text-green-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-green-700"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isLoading ? (
              <div
                className="h-10 w-28 animate-pulse rounded-full bg-slate-100"
                aria-label="Loading account"
              />
            ) : (
              authLinks
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-out lg:hidden ${
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 px-4 pb-5 pt-3">
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <a
                    key={item.label}
                    href={item.to}
                    onClick={closeMenu}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active === item.id
                        ? "bg-green-50 text-green-800"
                        : "text-slate-700 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-4">
                {isLoading ? (
                  <div className="h-11 animate-pulse rounded-full bg-slate-100" />
                ) : (
                  authLinks
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="h-0.5 w-full bg-transparent">
          <div
            ref={progressRef}
            className="h-full origin-left bg-green-600"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
