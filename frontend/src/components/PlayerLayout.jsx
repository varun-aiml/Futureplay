import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/icon.png";

export default function PlayerLayout({
  children,
  onSortChange,
  onFilterChange,
  sortBy,
  filterBy,
}) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsRightSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if the current route matches the link
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Handle sort option click
  const handleSortClick = (option) => {
    if (onSortChange) {
      onSortChange(option);
    }
  };

  // Handle filter option click
  const handleFilterClick = (option) => {
    if (onFilterChange) {
      onFilterChange(option);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 transition-all duration-300 flex flex-col border-r border-gray-700 ${
          isMobile && !isSidebarOpen ? "-ml-20" : ""
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-white">FuturePlay</span>
            </div>
          ) : (
            <img src={logo} alt="Logo" className="h-8 w-8 mx-auto" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <nav>
            <Link
              to="/tournaments"
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${
                isActiveRoute("/tournaments")
                  ? "bg-gray-700 text-red-400 border-l-4 border-red-500"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {isSidebarOpen && <span>Tournaments</span>}
            </Link>

            <Link
              to="/profile"
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${
                isActiveRoute("/profile")
                  ? "bg-gray-700 text-red-400 border-l-4 border-red-500"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
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
              {isSidebarOpen && <span>Profile</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
        {/* Mobile Header with Menu Button */}
        {isMobile && (
          <div className="bg-gray-800 p-4 flex items-center justify-between shadow-md">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-white">FuturePlay</span>
            </div>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>

      {/* Right Sidebar */}
      <div
        className={`${
          isRightSidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 transition-all duration-300 flex flex-col border-l border-gray-700 ${
          isMobile && !isRightSidebarOpen ? "-mr-20" : ""
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {isRightSidebarOpen ? (
            <span className="text-xl font-bold text-white">Options</span>
          ) : (
            <svg
              className="w-6 h-6 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          )}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            aria-label={
              isRightSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {isRightSidebarOpen ? (
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          {isRightSidebarOpen ? (
            <div className="px-4 space-y-6">

              {/* Sort By Section - Radio Buttons */}
              <div>
                <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2">
                  Sort By
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      checked={sortBy === "latest"}
                      onChange={() => handleSortClick("latest")}
                      className="form-radio h-4 w-4 text-red-500 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="text-gray-300 text-sm">
                      Latest to Oldest
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      checked={sortBy === "oldest"}
                      onChange={() => handleSortClick("oldest")}
                      className="form-radio h-4 w-4 text-red-500 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="text-gray-300 text-sm">
                      Oldest to Latest
                    </span>
                  </label>
                </div>
              </div>
              {/* Filters Section - Radio Buttons */}
              <div>
                <h3 className="text-white font-medium mb-3 border-b border-gray-700 pb-2">
                  Filters
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filterOption"
                      checked={filterBy === "upcoming"}
                      onChange={() => handleFilterClick("upcoming")}
                      className="form-radio h-4 w-4 text-red-500 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="text-gray-300 text-sm">Upcoming</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filterOption"
                      checked={filterBy === "completed"}
                      onChange={() => handleFilterClick("completed")}
                      className="form-radio h-4 w-4 text-red-500 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="text-gray-300 text-sm">Completed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filterOption"
                      checked={filterBy === "all"}
                      onChange={() => handleFilterClick("all")}
                      className="form-radio h-4 w-4 text-red-500 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="text-gray-300 text-sm">All</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 mt-4">
              <button
                onClick={() => setIsRightSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors duration-200"
                title="Sort By"
              >
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
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsRightSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors duration-200"
                title="Filters"
              >
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
