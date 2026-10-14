import api from "./api";

export const getMyMedicalRecords = async () => {
const response = await api.get("/medical-records/me");
return response.data;
};

export const getMedicalRecord = async (id) => {
const response = await api.get(`/medical-records/${id}`);
return response.data;
};
export const createMedicalRecord = async (recordData) => {
  const response = await api.post("/medical-records", recordData);
  return response.data;
};