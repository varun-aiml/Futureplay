import { useFranchise } from "../context/franchiseContext";
import FranchiseLayout from "../components/FranchiseLayout";
import TeamsListView from "../components/franchise/TeamsListView";
import ErrorBoundary from "../components/ErrorBoundary";

function FranchiseDashboard() {
  const { franchise } = useFranchise();
  
  return (
    <FranchiseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome, {franchise?.ownerName || 'Owner'}!</h1>
            <p className="text-gray-400 mt-1">{franchise?.franchiseName || 'Your Franchise'} Dashboard</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-400">Today's Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Teams List View */}
        <ErrorBoundary>
          <TeamsListView />
        </ErrorBoundary>
      </div>
    </FranchiseLayout>
  );
}

export default FranchiseDashboard;