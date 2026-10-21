import api from "./api";

export const getDoctors = async () => {
  const response = await api.get("/doctors");
  return response.data;
};

export const getPublicDoctors = async () => {
  const response = await api.get("/doctors/public");
  return response.data;
};

export const getDoctor = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const createDoctor = async (doctorData) => {
  const response = await api.post("/doctors", doctorData);
  return response.data;
};

export const updateDoctor = async (id, doctorData) => {
  const response = await api.put(`/doctors/${id}`, doctorData);
  return response.data;
};

export const toggleDoctorStatus = async (id) => {
  const response = await api.patch(`/doctors/${id}/status`);
  return response.data;
};

export const verifyDoctor = async (id) => {
  const response = await api.patch(`/doctors/${id}/verify`);
  return response.data;
};


export const getMyDoctorProfile = async () => {
const response = await api.get("/doctors/me/profile");
return response.data;
};

export const getMyDoctorAppointments = async () => {
const response = await api.get("/appointments/doctor/me");
return response.data;
};

export const getMyDoctorMedicalRecords = async () => {
const response = await api.get("/medical-records/doctor/me");
return response.data;
};
export const createMedicalRecord = async (recordData) => {
  const response = await api.post("/medical-records", recordData);
  return response.data;
};


export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/status`, {
    status,
  });


  return response.data;
};
