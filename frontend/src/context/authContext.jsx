import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        // First check URL parameters (for Google OAuth redirect)
        const queryParams = new URLSearchParams(window.location.search);
        const userData = queryParams.get("data");

        if (userData) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(userData));
            // Store token and user data
            localStorage.setItem("token", parsedData.token);
            localStorage.setItem("user", JSON.stringify(parsedData.user));

            setUser(parsedData.user);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          } catch (err) {
            console.error("Error parsing user data from URL:", err);
          }
        }

        // Then check localStorage
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
