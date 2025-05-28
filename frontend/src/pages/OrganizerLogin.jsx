import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/icon.png";
import { login } from "../services/authService";
import { useAuth } from "../context/authContext";

function OrganizerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Validation Functions
  const validateEmail = (value) => {
    if (value.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePassword = (value) => {
    if (value === "") {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  // Input Change Handlers
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const response = await login(email, password);
      loginUser(response.user);
      navigate("/organizer/home");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.message?.includes("not found")) {
        setFieldErrors((prev) => ({ ...prev, email: "Email not registered" }));
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-10 w-10 mr-3" />
            <span className="text-3xl font-bold text-white">FuturePlay</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Organizer Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Manage your tournaments with ServeUp
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
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.email ? "border-red-500" : "border-gray-600"
                } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.password ? "border-red-500" : "border-gray-600"
                } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me and Signup Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/organizer/signup" className="text-sm text-red-500 hover:text-red-400">
                Don’t have an account?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">Or continue with</span>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 hover:bg-gray-600 text-white font-medium transition"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.64 30.73 0 24 0 14.82 0 6.71 5.8 2.69 14.09l7.98 6.2C12.13 13.09 17.61 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.53 2.87-2.13 5.3-4.54 6.94l7.02 5.46C43.98 37.18 46.1 31.34 46.1 24.55z" />
                  <path fill="#FBBC05" d="M9.67 28.29a14.5 14.5 0 010-8.58l-7.98-6.2a24 24 0 000 21.03l7.98-6.25z" />
                  <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.15 15.88-5.85l-7.02-5.46c-2.02 1.35-4.6 2.16-8.86 2.16-6.39 0-11.87-3.59-14.33-8.78l-7.98 6.25C6.71 42.2 14.82 48 24 48z" />
                </g>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerLogin;
