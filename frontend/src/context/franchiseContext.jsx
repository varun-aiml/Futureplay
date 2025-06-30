import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentFranchise, logoutFranchise } from "../services/franchiseService";

const FranchiseContext = createContext();

export const FranchiseProvider = ({ children }) => {
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if franchise owner is logged in
    const checkLoggedIn = async () => {
      try {
        const currentFranchise = getCurrentFranchise();
        if (currentFranchise) {
          setFranchise(currentFranchise);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Franchise authentication check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const loginFranchiseOwner = (franchiseData) => {
    setFranchise(franchiseData);
    setIsAuthenticated(true);
  };

  const logoutFranchiseOwner = () => {
    logoutFranchise();
    setFranchise(null);
    setIsAuthenticated(false);
  };

  return (
    <FranchiseContext.Provider
      value={{
        franchise,
        loading,
        isAuthenticated,
        loginFranchiseOwner,
        logoutFranchiseOwner,
      }}
    >
      {children}
    </FranchiseContext.Provider>
  );
};

export const useFranchise = () => useContext(FranchiseContext);