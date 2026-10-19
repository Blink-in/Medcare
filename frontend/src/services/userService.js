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

export const getTrashedUsers = async () => {
  const response = await api.get("/users/trash");
  return response.data;
};

export const restoreUser = async (id) => {
  const response = await api.patch(`/users/trash/${id}/restore`);
  return response.data;
};

export const permanentlyDeleteUser = async (id) => {
  const response = await api.delete(`/users/trash/${id}/permanent`);
  return response.data;
};
