import api from "./api";

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const getDepartment = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await api.post("/departments", departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

export const toggleDepartmentStatus = async (id) => {
  const response = await api.patch(`/departments/${id}/status`);
  return response.data;
};

export const getPublicDepartments = async () => {
  const response = await api.get("/departments/public");
  return response.data;
};
