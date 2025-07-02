import { useState, useEffect } from 'react';
import { useFranchise } from '../context/franchiseContext';
import FranchiseLayout from '../components/FranchiseLayout';
import { getTournamentAuctions, getTodayAuctions, getUpcomingAuctions } from '../services/franchiseAuctionService';

function SuperAuction() {
  const { franchise } = useFranchise();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'upcoming'

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        let response;

        if (activeTab === 'all') {
          response = await getTournamentAuctions(franchise.tournament);
        } else if (activeTab === 'today') {
          response = await getTodayAuctions(franchise.tournament);
        } else if (activeTab === 'upcoming') {
          response = await getUpcomingAuctions(franchise.tournament);
        }

        setAuctions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setError('Failed to fetch auctions. Please try again later.');
        setLoading(false);
      }
    };

    if (franchise?.tournament) {
      fetchAuctions();
    }
  }, [franchise, activeTab]);

  return (
    <FranchiseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Super Auction</h1>
            <p className="text-gray-400 mt-1">View and participate in auctions for your tournament</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`${activeTab === 'all' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Auctions
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`${activeTab === 'today' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Today's Auctions
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${activeTab === 'upcoming' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upcoming Auctions
            </button>
          </nav>
        </div>

        {/* Auctions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-md">
              {error}
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No auctions found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <div key={auction._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{auction.tournamentName}</h3>
                    <div className="space-y-2 text-gray-400">
                      <p><span className="font-medium">Date:</span> {new Date(auction.auctionDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Time:</span> {auction.auctionTime}</p>
                      <p><span className="font-medium">Points:</span> {auction.numberOfPoints}</p>
                      <p><span className="font-medium">Players Per Team:</span> {auction.playersPerTeam}</p>
                    </div>
                    <div className="mt-4">
                      <button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={() => console.log('Join auction:', auction._id)}
                      >
                        Join Auction
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FranchiseLayout>
  );
}

export default SuperAuction;