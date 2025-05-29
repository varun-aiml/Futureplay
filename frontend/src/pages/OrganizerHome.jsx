import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import OrganizerLayout from '../components/OrganizerLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

function OrganizerHome() {
  const { user } = useAuth();
  const [chartHeight, setChartHeight] = useState(300);
  
  // Dummy data for tournaments
  const tournaments = [
    { id: 1, name: 'Summer Tennis Open 2023', date: '2023-07-15', status: 'Completed', players: 64, categories: 8 },
    { id: 2, name: 'Fall Championship', date: '2023-10-22', status: 'Active', players: 48, categories: 6 },
    { id: 3, name: 'Winter Indoor Series', date: '2024-01-10', status: 'Upcoming', players: 32, categories: 4 },
    { id: 4, name: 'Spring Junior Tournament', date: '2024-04-05', status: 'Upcoming', players: 24, categories: 3 },
  ];

  // Dummy data for player categories
  const categoryData = [
    { name: 'Under 9 Girls Singles', players: 18, fill: '#FF0000' },  // Bright red
    { name: 'Under 9 Boys Singles', players: 24, fill: '#DC2626' },    // Red-600
    { name: 'Under 12 Girls Singles', players: 16, fill: '#B91C1C' },  // Red-700
    { name: 'Under 12 Boys Singles', players: 22, fill: '#991B1B' },   // Red-800
    { name: 'Under 15 Girls Singles', players: 14, fill: '#7F1D1D' },  // Red-900
    { name: 'Under 15 Boys Singles', players: 20, fill: '#EF4444' },   // Red-500
  ];
  
  // Dummy data for monthly registrations
  const monthlyData = [
    { name: 'Jan', registrations: 12 },
    { name: 'Feb', registrations: 19 },
    { name: 'Mar', registrations: 25 },
    { name: 'Apr', registrations: 18 },
    { name: 'May', registrations: 29 },
    { name: 'Jun', registrations: 35 },
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

  // Responsive chart height
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) setChartHeight(350);
      else if (width >= 768) setChartHeight(300);
      else setChartHeight(250);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    
    return () => window.removeEventListener('resize', handleResize);
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
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome to <span className="text-red-300">FuturePlay</span> Dashboard</h1>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl text-red-100 font-light ml-14">
                  {user ? `Hello, ${user.name}! Ready to manage your tournaments?` : 'Hello, Organizer! Ready to manage your tournaments?'}
                </p>
                <p className="text-sm text-red-200/70 ml-14 mt-2">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                <h3 className="text-2xl font-bold text-white">{stats.activeTournaments}</h3>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <h3 className="text-2xl font-bold text-white">{stats.totalPlayers}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <h3 className="text-2xl font-bold text-white">${stats.totalRevenue}</h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <h3 className="text-2xl font-bold text-white">{stats.upcomingTournaments}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            <h3 className="text-xl font-semibold text-white mb-4">Players by Category</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart 
                data={categoryData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#9CA3AF' }} 
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                />
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
            <h3 className="text-xl font-semibold text-white mb-4">Monthly Registrations</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
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

        {/* Tournaments Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Recent Tournaments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Players</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tournament.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tournament.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tournament.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          tournament.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tournament.players}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tournament.categories}</td>
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
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Tournament
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Players
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Reports
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 p-5 rounded-xl shadow-lg md:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-red-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">New tournament created: <span className="text-red-400">Fall Championship</span></p>
                  <p className="text-gray-500 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white"><span className="text-blue-400">5 new players</span> registered for Winter Indoor Series</p>
                  <p className="text-gray-500 text-sm">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">Tournament <span className="text-green-400">Summer Tennis Open 2023</span> completed</p>
                  <p className="text-gray-500 text-sm">3 days ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-yellow-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">Payment of <span className="text-yellow-400">$1,200</span> received</p>
                  <p className="text-gray-500 text-sm">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}

export default OrganizerHome;