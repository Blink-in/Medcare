import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    }

    return <Navigate to="/patient/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;