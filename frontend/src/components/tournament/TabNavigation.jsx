const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full border-b border-gray-700 mb-6 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "details"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "events"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "teams"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Teams
        </button>
        <button
          onClick={() => setActiveTab("fixtures")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "fixtures"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Fixtures
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "results"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab("umpires")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "umpires"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Umpires
        </button>
        <button
          onClick={() => setActiveTab("franchiseOwners")}
          className={`py-2 px-3 sm:px-4 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "franchiseOwners"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Franchise Owners
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;