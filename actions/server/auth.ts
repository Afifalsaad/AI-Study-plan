export const loginUser = (payload) => {
  const { email, password } = payload;
  const demoEmail = "example@gmail.com";
  const demoPassword = "password";

  if (demoEmail == email && demoPassword == password) {
    return { email, password };
  }
};
