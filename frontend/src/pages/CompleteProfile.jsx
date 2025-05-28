import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { completeGoogleSignup } from "../services/authService";
import { useAuth } from "../context/authContext";
import logo from "../assets/react.svg";

function CompleteProfile() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  useEffect(() => {
    // Parse user data from URL query params
    const queryParams = new URLSearchParams(location.search);
    const userData = queryParams.get("data");
    
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        // Store token and user data
        localStorage.setItem("token", parsedData.token);
        localStorage.setItem("user", JSON.stringify(parsedData.user));
        // Update auth context
        loginUser(parsedData.user);
      } catch (err) {
        console.error("Error parsing user data:", err);
        setError("Authentication failed. Please try again.");
      }
    } else {
      navigate("/organizer/login");
    }
  }, [location, loginUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await completeGoogleSignup({ phone });
      // Update user in local storage
      localStorage.setItem("user", JSON.stringify(response.user));
      // Redirect to home page
      navigate("/organizer/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Profile completion failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-600 p-2 rounded-lg shadow-md">
            <img src={logo} alt="ServeUp Logo" className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Just one more step to get started with ServeUp
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-700">
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300"
              >
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white sm:text-sm"
                  placeholder="+1 (123) 456-7890"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;