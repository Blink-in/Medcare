import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/users/${id}/status`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, {
    role,
  });

  return response.data;
};