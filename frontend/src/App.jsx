import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
              <Route
                path="/doctor/dashboard"
                element={<div>Doctor Dashboard</div>}
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={["patient"]} />}>
              <Route
                path="/patient/dashboard"
                element={<div>Patient Dashboard</div>}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;