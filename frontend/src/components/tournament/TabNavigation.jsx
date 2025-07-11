const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-700 mb-6">
      <button
        onClick={() => setActiveTab("details")}
        className={`py-2 px-4 font-medium ${activeTab === "details" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Details
      </button>
      <button
        onClick={() => setActiveTab("events")}
        className={`py-2 px-4 font-medium ${activeTab === "events" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Events
      </button>
      <button
        onClick={() => setActiveTab("teams")}
        className={`py-2 px-4 font-medium ${activeTab === "teams" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Teams
      </button>
      <button
        onClick={() => setActiveTab("fixtures")}
        className={`py-2 px-4 font-medium ${activeTab === "fixtures" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Fixtures
      </button>
      <button
        onClick={() => setActiveTab("results")}
        className={`py-2 px-4 font-medium ${activeTab === "results" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Results
      </button>
      <button
        onClick={() => setActiveTab("franchiseOwners")}
        className={`py-2 px-4 font-medium ${activeTab === "franchiseOwners" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
      >
        Franchise Owners
      </button>
    </div>
  );
};

export default TabNavigation;