import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "./myurl";

const HelpsContext = createContext(null);

export const HelpsProvider = ({ children }) => {
  const [helpsbycontext, setHelps] = useState([]);
  useEffect(() => {
    const fetchHelps = async () => {
      try {
        
        const response = await axios.get(`${API_URL}/helprequests/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setHelps(response.data);
        console.log("The helps c are: ", response.data);
      } catch (error) {
        console.error("Error fetching helps:", error);
      }
    };

    fetchHelps();
  }, []);

  return (
    <HelpsContext.Provider value={{ helpsbycontext, setHelps }}>
      {children}
    </HelpsContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpsContext);
  if (context === null) {
    throw new Error("useHelp must be used within a HelpsProvider");
  }
  return context;
};

