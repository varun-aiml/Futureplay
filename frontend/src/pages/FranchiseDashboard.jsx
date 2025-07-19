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
          <div className="flex items-center">
            {franchise?.logoUrl ? (
              <img 
                src={franchise.logoUrl} 
                alt={`${franchise.franchiseName} logo`} 
                className="h-16 w-16 rounded-full object-cover border border-gray-600 mr-4"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                {franchise?.franchiseName?.charAt(0) || 'F'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {franchise?.ownerName || 'Owner'}!</h1>
              <p className="text-gray-400 mt-1">{franchise?.franchiseName || 'Your Franchise'} Dashboard</p>
            </div>
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