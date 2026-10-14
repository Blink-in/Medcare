
import api from "./api";

export const getMyPrescriptions = async () => {
  const response = await api.get("/prescriptions/me");
  return response.data;
};

export const getMyDoctorPrescriptions = async () => {
  const response = await api.get("/prescriptions/doctor/me");
  return response.data;
};

export const getPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data;
};

export const getPrescription = async (id) => {
  const response = await api.get(`/prescriptions/${id}`);
  return response.data;
};

export const createPrescription = async (prescriptionData) => {
  const response = await api.post("/prescriptions", prescriptionData);
  return response.data;
};

export const updatePrescription = async (id, prescriptionData) => {
  const response = await api.put(`/prescriptions/${id}`, prescriptionData);
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await api.delete(`/prescriptions/${id}`);
  return response.data;
};
