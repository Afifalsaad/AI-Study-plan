"use server";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ name: string; email: string; password: string } | null> => {
  const { name, email, password } = payload;
  console.log("SERVER ACTION RUNNING", payload);

  return null;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{ id: string; email: string; password: string } | null> => {
  const { email, password } = payload;
  const demoEmail = "example@gmail.com";
  const demoPassword = "password";

  if (demoEmail == email && demoPassword == password) {
    return { id: "1", email, password };
  }
  return null;
};
