
import api from "./api";

export const getAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get("/appointments/me");
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post("/appointments", appointmentData);
  return response.data;
};

export const updateMyAppointment = async (id, appointmentData) => {
  const response = await api.patch(
    `/appointments/${id}/edit`,
    appointmentData
  );
  return response.data;
};

export const cancelMyAppointment = async (id, cancelReason = "") => {
  const response = await api.patch(`/appointments/${id}/cancel`, {
    cancelReason,
  });
  return response.data;
};
