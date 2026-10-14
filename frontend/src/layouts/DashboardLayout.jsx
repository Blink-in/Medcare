
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Stethoscope,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import useAuthStore from "../store/authStore";

const navigation = {
  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Doctors",
      path: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      label: "Patients",
      path: "/admin/patients",
      icon: UserRound,
    },
    {
      label: "Departments",
      path: "/admin/departments",
      icon: Activity,
    },
    {
      label: "Appointments",
      path: "/admin/appointments",
      icon: CalendarDays,
    },
    {
      label: "Medical Records",
      path: "/admin/medical-records",
      icon: FileText,
    },
    {
      label: "Prescriptions",
      path: "/admin/prescriptions",
      icon: Pill,
    },
  ],

  doctor: [
    {
      label: "Dashboard",
      path: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Appointments",
      path: "/doctor/appointments",
      icon: CalendarDays,
    },
    {
      label: "Patients",
      path: "/doctor/patients",
      icon: Users,
    },
    {
      label: "Medical Records",
      path: "/doctor/medical-records",
      icon: FileText,
    },
    {
      label: "Prescriptions",
      path: "/doctor/prescriptions",
      icon: Pill,
    },
  ],

  patient: [
    {
      label: "Dashboard",
      path: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/patient/profile",
      icon: UserRound,
    },
    {
      label: "My Appointments",
      path: "/patient/appointments",
      icon: CalendarDays,
    },
    {
      label: "My Medical Records",
      path: "/patient/medical-records",
      icon: FileText,
    },
    {
      label: "My Prescriptions",
      path: "/patient/prescriptions",
      icon: Pill,
    },
  ],
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = user?.role || "patient";
  const navItems = navigation[userRole] || navigation.patient;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f6fbf8]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#dcebe4] bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[#e5eee9] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-[20px] font-bold leading-none text-[#12372b]">
                MedCare
              </h1>

              <p className="mt-1 text-[10px] font-medium text-[#789087]">
                Hospital Management
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#718078] hover:bg-[#f1f7f4] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9b94]">
            Main Menu
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#e8f7f0] text-primary"
                        : "text-[#60756c] hover:bg-[#f3f8f5] hover:text-[#174635]"
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#e5eee9] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#718078] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#dcebe4] bg-white/95 px-5 backdrop-blur-sm sm:px-8">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-[#5f746b] hover:bg-[#f1f7f4] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-semibold text-[#173d30]">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-[11px] capitalize text-[#7b8d85]">
                {userRole}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4e9] text-[13px] font-bold text-primary">
              {getInitials() || <UserRound className="h-4 w-4" />}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;