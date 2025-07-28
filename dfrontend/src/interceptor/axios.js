import axios from "axios";
import { API_URL } from "../context/myurl";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/token/refresh/`,
          { refresh: localStorage.getItem("refresh_token") },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

        processQueue(null, data.access);

        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
