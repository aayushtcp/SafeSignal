import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "./myurl";

const UsernameContext = createContext(null);

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const { data } = await axios.get(
          `${API_URL}/home/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setUsername(data.user);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  return (
    <UsernameContext.Provider value={{ username, setUsername }}>
      {children}
    </UsernameContext.Provider>
  );
};

export const useUsername = () => useContext(UsernameContext);
