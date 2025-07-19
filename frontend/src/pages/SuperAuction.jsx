import { useState, useEffect } from 'react';
import { useFranchise } from '../context/franchiseContext';
import FranchiseLayout from '../components/FranchiseLayout';
import FixturesView from '../components/franchise/FixturesView';
import ResultsView from '../components/tournament/ResultsView';
import { 
  getTournamentAuctions, 
  getTodayAuctions, 
  getUpcomingAuctions,
  getTournamentFranchises,
  getTournamentPlayers 
} from '../services/franchiseAuctionService';
import { getTournamentById } from '../services/tournamentService';

function SuperAuction() {
  const { franchise } = useFranchise();
  const [auctions, setAuctions] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'upcoming', 'franchises', 'players', 'fixtures', 'results'
  const [auctionView, setAuctionView] = useState(true); // true for auction tabs, false for franchises/players/fixtures/results tabs
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;

        // Fetch tournament events for Results view
        if (!auctionView && (activeTab === 'fixtures' || activeTab === 'results')) {
          try {
            const tournamentResponse = await getTournamentById(franchise.tournament);
            if (tournamentResponse.data && tournamentResponse.data.data) {
              setEvents(tournamentResponse.data.data.events || []);
            }
          } catch (err) {
            console.error('Error fetching tournament events:', err);
          }
        }

        if (auctionView) {
          // Auction tabs
          if (activeTab === 'all') {
            response = await getTournamentAuctions(franchise.tournament);
            setAuctions(response.data);
          } else if (activeTab === 'today') {
            response = await getTodayAuctions(franchise.tournament);
            setAuctions(response.data);
          } else if (activeTab === 'upcoming') {
            response = await getUpcomingAuctions(franchise.tournament);
            setAuctions(response.data);
          }
        } else {
          // Franchises/Players/Fixtures/Results tabs
          if (activeTab === 'franchises') {
            response = await getTournamentFranchises(franchise.tournament);
            setFranchises(response.data);
          } else if (activeTab === 'players') {
            response = await getTournamentPlayers(franchise.tournament);
            setPlayers(response.data);
          }
          // No need to fetch data for fixtures tab as it loads from localStorage
          // No need to fetch data for results tab as ResultsView handles its own data fetching
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    if (franchise?.tournament) {
      fetchData();
    }
  }, [franchise, activeTab, auctionView]);

  const handleJoinAuction = (auction) => {
    setSelectedAuction(auction);
    setAuctionView(false);
    setActiveTab('franchises');
  };

  const handleBackToAuctions = () => {
    setSelectedAuction(null);
    setAuctionView(true);
    setActiveTab('all');
  };

  return (
    <FranchiseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Super Auction</h1>
            <p className="text-gray-400 mt-1">
              {selectedAuction ? `Auction: ${selectedAuction.tournamentName}` : 'View and participate in auctions for your tournament'}
            </p>
          </div>
          {selectedAuction && (
            <button
              onClick={handleBackToAuctions}
              className="mt-4 md:mt-0 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Auctions
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {auctionView ? (
              // Auction tabs
              <>
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
              </>
            ) : (
              // Franchises/Players/Fixtures/Results tabs
              <>
                <button
                  onClick={() => setActiveTab('franchises')}
                  className={`${activeTab === 'franchises' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Franchises
                </button>
                <button
                  onClick={() => setActiveTab('players')}
                  className={`${activeTab === 'players' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Players
                </button>
                <button
                  onClick={() => setActiveTab('fixtures')}
                  className={`${activeTab === 'fixtures' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Fixtures
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`${activeTab === 'results' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Results
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-md">
              {error}
            </div>
          ) : auctionView ? (
            // Auctions View
            auctions.length === 0 ? (
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
                          onClick={() => handleJoinAuction(auction)}
                        >
                          Join Auction
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'franchises' ? (
            // Franchises View
            franchises.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">No franchises found for this tournament.</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Logo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Franchise Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {franchises.map((franchise) => (
                      <tr key={franchise._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {franchise.logoUrl ? (
                            <img 
                              src={franchise.logoUrl} 
                              alt={`${franchise.franchiseName} logo`} 
                              className="h-10 w-10 rounded-full object-cover border border-gray-600"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                              {franchise.franchiseName.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{franchise.franchiseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{franchise.ownerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{franchise.whatsappNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'players' ? (
            // Players View
            players.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">No players found for this tournament.</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Franchise</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gender</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">T-Shirt Size</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {players.map((player) => (
                      <tr key={player._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{player.playerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {player.franchise ? player.franchise.franchiseName : 'Not Assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.tShirtSize}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${player.status === 'Confirmed' ? 'bg-green-100 text-green-800' : player.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {player.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'results' ? (
            // Results View
            <ResultsView tournamentId={franchise.tournament} events={events} />
          ) : (
            // Fixtures View
            <FixturesView />
          )}
        </div>
      </div>
    </FranchiseLayout>
  );
}

export default SuperAuction;