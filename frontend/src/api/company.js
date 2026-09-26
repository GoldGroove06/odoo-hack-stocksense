import api from "./axios";

export const createCompany = async (data) => {
  const response = await api.post("/company", data);
  return response.data;
};

export const getMyCompany = async () => {
  const response = await api.get("/company/me");
  return response.data;
};

export const inviteMember = async (data) => {
  const response = await api.post("/company/members", data);
  return response.data;
};

export const updateMember = async (userId, data) => {
  const response = await api.patch(`/company/members/${userId}`, data);
  return response.data;
};

export const removeMember = async (userId) => {
  const response = await api.delete(`/company/members/${userId}`);
  return response.data;
};
