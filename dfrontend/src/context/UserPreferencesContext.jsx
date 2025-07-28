import { useContext, createContext, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "./myurl";
import { useUsername } from "./UsernameContext";
import { use } from "react";

const userPreferencesContext = createContext(null);

export const UserPreferencesProvider = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState(null);
  const { username } = useUsername();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.warn("Access token is missing.");
        return;
      }

      if (!username) {
        console.warn("Username is missing.");
        return;
      }

      // console.log("Fetching preferences for username:", username);

      try {
        const response = await axios.get(
          `${API_URL}/${username}/preferences/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data) {
          setUserPreferences(response.data);
        } else {
          console.warn("No data received from the API.");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.error(
            "User preferences not found. Please check the username or endpoint."
          );
        } else {
          console.error("Error fetching user preferences:", error);
        }
      }
    };

    fetchUserPreferences();
  }, [username]);
  console.log(userPreferences);

  return (
    <userPreferencesContext.Provider
      value={{ userPreferences, setUserPreferences }}
    >
      {children}
    </userPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(userPreferencesContext);
  if (context === null) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
