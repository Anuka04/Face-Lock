import axios from "axios";

export const register = (newUser) => {
  return axios
    .post("http://localhost:5000/users/register", {
      username: newUser.username,
      email: newUser.email,
      account: newUser.account,
      password: newUser.password,
      facialRecognitionEnabled: newUser.facialRecognitionEnabled,
      threshold: newUser.threshold,
      encodings: newUser.encodings,
      locations: newUser.locations,
    })
    .then((response) => {
      console.log("Registered");
    });
};

export const login = (user) => {
  return axios
    .post("users/login", {
      username: user.username,
      password: user.password,
    })
    .then((response) => {
      localStorage.setItem("usertoken", response.data.token);
      return response.data.token;
    })
    .catch((err) => {
      console.log(err);
    });
};
