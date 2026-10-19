import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import Signup from "./pages/auth/Signup";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientMedicalRecords from "./pages/patient/PatientMedicalRecords";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorMedicalRecords from "./pages/doctor/DoctorMedicalRecords";
import CreateMedicalRecord from "./pages/doctor/CreateMedicalRecord";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import CreatePrescription from "./pages/doctor/CreatePrescription";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import AdminPrescriptions from "./pages/admin/AdminPrescriptions";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import AdminMedicalRecords from "./pages/admin/AdminMedicalRecords";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminTrash from "./pages/admin/AdminTrash";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/appointments"
                element={<AdminAppointments />}
              />
              <Route path="/admin/users" element={<AdminUsers />} />

               <Route path="/admin/doctors" element={<AdminDoctors />} />

               <Route path="/admin/patients" element={<AdminPatients />} />

               <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />

               <Route path="/admin/medical-records" element={<AdminMedicalRecords />} />

               <Route path="/admin/departments" element={<AdminDepartments />} />
               
               <Route path="/admin/trash" element={<AdminTrash />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/medical-records" element={<DoctorMedicalRecords />} />
              <Route path="/doctor/medical-records/new" element={<CreateMedicalRecord />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/prescriptions/new" element={<CreatePrescription />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["patient"]} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />

            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;