import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { getAllFranchises, registerFranchise } from "../services/franchiseService";
import { getAllTournaments } from "../services/tournamentService";
import OrganizerLayout from "../components/OrganizerLayout";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router-dom";

// Add Franchise Modal Component
const AddFranchiseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    franchiseName: "",
    ownerName: "",
    username: "",
    password: "",
    whatsappNumber: "",
    tournament: "",
  });
  const [tournaments, setTournaments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const response = await getAllTournaments();
        setTournaments(response.data.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        toast.error("Failed to load tournaments. Please try again later.");
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTournaments();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.tournament) {
        toast.error("Please select a tournament");
        setIsSubmitting(false);
        return;
      }

      await registerFranchise(formData);
      toast.success("Franchise added successfully!");
      onSuccess(); // Refresh franchises list
      onClose(); // Close modal
      // Reset form
      setFormData({
        franchiseName: "",
        ownerName: "",
        username: "",
        password: "",
        whatsappNumber: "",
        tournament: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render required field label
  const renderLabel = (text, htmlFor) => (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {text} <span className="text-red-500">*</span>
    </label>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            ADD NEW FRANCHISE
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {renderLabel("Franchise Name", "franchiseName")}
            <input
              type="text"
              id="franchiseName"
              name="franchiseName"
              value={formData.franchiseName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter franchise name"
            />
          </div>

          <div>
            {renderLabel("Owner Full Name", "ownerName")}
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter owner's full name"
            />
          </div>

          <div>
            {renderLabel("Username", "username")}
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter username for login"
            />
          </div>

          <div>
            {renderLabel("Password", "password")}
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter password (min. 8 characters)"
            />
          </div>

          <div>
            {renderLabel("WhatsApp Number", "whatsappNumber")}
            <input
              type="text"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter WhatsApp number"
            />
          </div>

          <div>
            {renderLabel("Tournament", "tournament")}
            <select
              id="tournament"
              name="tournament"
              value={formData.tournament}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              disabled={isLoading}
            >
              <option value="">Select a tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name}
                </option>
              ))}
            </select>
            {isLoading && (
              <div className="mt-2 text-sm text-gray-400">
                Loading tournaments...
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center ${isSubmitting || isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Add Franchise"
              )}
            </button>
          </div>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          The franchise owner will be able to login with the username and
          password to access their dashboard.
        </p>
      </div>

      {/* Add global styles for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        `}
      </style>
    </div>
  );
};

function OrganizerHome() {
  const { user, loginUser } = useAuth();
  const [chartHeight, setChartHeight] = useState(300);
  const [showAddFranchiseModal, setShowAddFranchiseModal] = useState(false);

  // Dummy data for tournaments
  const tournaments = [
    {
      id: 1,
      name: "Summer Tennis Open 2023",
      date: "2023-07-15",
      status: "Completed",
      players: 64,
      categories: 8,
    },
    {
      id: 2,
      name: "Fall Championship",
      date: "2023-10-22",
      status: "Active",
      players: 48,
      categories: 6,
    },
    {
      id: 3,
      name: "Winter Indoor Series",
      date: "2024-01-10",
      status: "Upcoming",
      players: 32,
      categories: 4,
    },
    {
      id: 4,
      name: "Spring Junior Tournament",
      date: "2024-04-05",
      status: "Upcoming",
      players: 24,
      categories: 3,
    },
  ];

  // Dummy data for player categories
  const categoryData = [
    { name: "Under 9 Girls Singles", players: 18, fill: "#FF0000" }, // Bright red
    { name: "Under 9 Boys Singles", players: 24, fill: "#DC2626" }, // Red-600
    { name: "Under 12 Girls Singles", players: 16, fill: "#B91C1C" }, // Red-700
    { name: "Under 12 Boys Singles", players: 22, fill: "#991B1B" }, // Red-800
    { name: "Under 15 Girls Singles", players: 14, fill: "#7F1D1D" }, // Red-900
    { name: "Under 15 Boys Singles", players: 20, fill: "#EF4444" }, // Red-500
  ];

  // Dummy data for monthly registrations
  const monthlyData = [
    { name: "Jan", registrations: 12 },
    { name: "Feb", registrations: 19 },
    { name: "Mar", registrations: 25 },
    { name: "Apr", registrations: 18 },
    { name: "May", registrations: 29 },
    { name: "Jun", registrations: 35 },
  ];

  // Stats summary
  const stats = {
    activeTournaments: 1,
    upcomingTournaments: 2,
    completedTournaments: 1,
    totalPlayers: 168,
    totalRevenue: 8400,
    averagePlayersPerTournament: 42,
  };

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

        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [location, loginUser]);

  // Responsive chart height
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) setChartHeight(350);
      else if (width >= 768) setChartHeight(300);
      else setChartHeight(250);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-md shadow-lg">
          <p className="text-gray-300 font-medium">{`${label}`}</p>
          <p className="text-red-400 font-bold">
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };
  const [franchises, setFranchises] = useState([]);
  const [loadingFranchises, setLoadingFranchises] = useState(false);

  // Function to fetch franchises
  const fetchFranchises = async () => {
    setLoadingFranchises(true);
    try {
      const response = await getAllFranchises();
      // Transform the data to match the expected structure
      const transformedFranchises = response.franchises.map(franchise => ({
        id: franchise._id,
        name: franchise.franchiseName,
        owner: franchise.ownerName,
        location: franchise.whatsappNumber, // Using whatsappNumber as location
        status: 'Active' // Default status since it doesn't exist in the model
      }));
      setFranchises(transformedFranchises);
    } catch (error) {
      console.error("Error fetching franchises:", error);
      toast.error("Failed to load franchises");
    } finally {
      setLoadingFranchises(false);
    }
  };

  // Fetch franchises on component mount
  useEffect(() => {
    fetchFranchises();
  }, []);

  return (
    <OrganizerLayout>
      <div className="bg-gray-900 min-h-screen p-4 md:p-6 lg:p-8">
        {/* Enhanced Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-8 rounded-xl shadow-2xl mb-8 transition-all duration-300 hover:shadow-red-500/30 border border-red-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-800 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-white/10 p-2 rounded-lg mr-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Welcome to <span className="text-red-300">FuturePlay</span>{" "}
                Dashboard
              </h1>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl text-red-100 font-light ml-14">
                  {user
                    ? `Hello, ${user.name}! Ready to manage your tournaments?`
                    : "Hello, Organizer! Ready to manage your tournaments?"}
                </p>
                <p className="text-sm text-red-200/70 ml-14 mt-2">
                  Today is{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="hidden md:block">
                <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 backdrop-blur-sm">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Active Tournaments</p>
                <h3 className="text-2xl font-bold text-white">
                  {stats.activeTournaments}
                </h3>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-green-500 text-sm font-medium">+12%</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
          </div>

          <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-blue-500 shadow-lg hover:shadow-blue-500/20 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Players</p>
                <h3 className="text-2xl font-bold text-white">
                  {stats.totalPlayers}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-green-500 text-sm font-medium">+24%</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
          </div>

          <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-green-500 shadow-lg hover:shadow-green-500/20 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <h3 className="text-2xl font-bold text-white">
                  ${stats.totalRevenue}
                </h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-green-500 text-sm font-medium">+8%</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
          </div>

          <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-purple-500 shadow-lg hover:shadow-purple-500/20 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Tournaments</p>
                <h3 className="text-2xl font-bold text-white">
                  {stats.upcomingTournaments}
                </h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-yellow-500 text-sm font-medium">Same</span>
              <span className="text-gray-400 text-sm"> as last month</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Player Categories Chart - Now with Horizontal Bar Chart using red color palette */}
          <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Players by Category
            </h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" tick={{ fill: "#9CA3AF" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "#9CA3AF" }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Bar
                  dataKey="players"
                  name="Number of Players"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Registrations Chart */}
          <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Monthly Registrations
            </h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} />
                <YAxis tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  name="Player Registrations"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Franchise Owners Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Franchise Owners
            </h3>
            <button 
              onClick={() => setShowAddFranchiseModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Franchise
            </button>
          </div>
          
          {loadingFranchises ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-2"></div>
              <p className="text-gray-400">Loading franchise data...</p>
            </div>
          ) : franchises && franchises.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {franchises.map((franchise) => (
                    <tr
                    key={franchise.id} // Changed from _id to id
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {franchise.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {franchise.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {franchise.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        {franchise.status}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-gray-400 text-lg">No franchises found</p>
              <p className="text-gray-500 mt-1">
                Add your first franchise to get started
              </p>
              <button 
                onClick={() => setShowAddFranchiseModal(true)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create First Franchise
              </button>
            </div>
          )}
        </div>

        {/* Tournaments Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">
              Recent Tournaments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Players
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categories
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tournaments.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {tournament.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tournament.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          tournament.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : tournament.status === "Completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tournament.players}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tournament.categories}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/organizer/tournaments/create"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
              >
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Tournament
                </button>
              </Link>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Manage Players
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Reports
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 p-5 rounded-xl shadow-lg md:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-red-500 p-2 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white">
                    New tournament created:{" "}
                    <span className="text-red-400">Fall Championship</span>
                  </p>
                  <p className="text-gray-500 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white">
                    <span className="text-blue-400">5 new players</span>{" "}
                    registered for Winter Indoor Series
                  </p>
                  <p className="text-gray-500 text-sm">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white">
                    Tournament{" "}
                    <span className="text-green-400">
                      Summer Tennis Open 2023
                    </span>{" "}
                    completed
                  </p>
                  <p className="text-gray-500 text-sm">3 days ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-yellow-500 p-2 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white">
                    Payment of <span className="text-yellow-400">$1,200</span>{" "}
                    received
                  </p>
                  <p className="text-gray-500 text-sm">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Franchise Modal */}
      <AddFranchiseModal 
        isOpen={showAddFranchiseModal} 
        onClose={() => setShowAddFranchiseModal(false)} 
        onSuccess={fetchFranchises}
      />
    </OrganizerLayout>
  );
}

export default OrganizerHome;