import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "./myurl";
import { useUsername } from "./UsernameContext";

const UserDetailsContext = createContext(null);

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const { username } = useUsername();
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken || !username) {
          console.warn("Access token or username is missing.");
          return;
        }

        const response = await axios.get(
        `${API_URL}/${username}/user-details/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setUserDetails(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          console.error("User details not found. Please check the username or endpoint.");
        } else {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [username]);


  return (
    <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (context === null) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
};
