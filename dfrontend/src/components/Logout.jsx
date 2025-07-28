import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../context/myurl";

const Logout = () => {
  useEffect(() => {
    const logout = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        window.location.href = "/";
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/logout/`,
          { refresh_token: localStorage.getItem("refresh_token"), logout_source: "web"},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        console.log("Logout successful", response);

        // Clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      } catch (error) {
        if (error.response) {
          console.error("Logout failed:", error.response.data);
        } else if (error.request) {
          console.error("No response from server:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      }
    };

    logout();
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;
