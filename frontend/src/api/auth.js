import api from "./axios";

export const signupUser = async (data) => {
  const response = await api.post("/auth/signup", data);
  console.log("oh yeah")
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};
