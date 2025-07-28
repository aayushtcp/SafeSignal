import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "./myurl";
import { useUsername } from "./UsernameContext";

const DisastersContext = createContext(null);

export const DisastersProvider = ({ children }) => {
  const [disastersbycontext, setDisasters] = useState([]);
  const { username } = useUsername();

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        let url = `${API_URL}/disaster-list/`;
        let headers = { "Content-Type": "application/json" };

        if (accessToken && username) {
          url = `${API_URL}/${username}/filtered-disasters/`;
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await axios.get(url, { headers });
        setDisasters(response.data);
      } catch (error) {
        console.error("Error fetching disasters:", error);
      }
    };

    fetchDisasters();
  }, [username]);

  return (
    <DisastersContext.Provider value={{ disastersbycontext, setDisasters }}>
      {children}
    </DisastersContext.Provider>
  );
};

export const useDisasters = () => {
  const context = useContext(DisastersContext);
  if (context === null) {
    throw new Error("useDisasters must be used within a DisastersProvider");
  }
  return context;
};
