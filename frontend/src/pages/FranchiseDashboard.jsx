import { useState, useEffect } from "react";
import { useFranchise } from "../context/franchiseContext";
import FranchiseLayout from "../components/FranchiseLayout";
import TeamsListView from "../components/franchise/TeamsListView";

function FranchiseDashboard() {
  const { franchise } = useFranchise();
  
  // You can add state and effects for dashboard data here
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    revenue: 0
  });

  useEffect(() => {
    // Fetch dashboard data here
    // For now, using dummy data
    setStats({
      totalBookings: 24,
      pendingBookings: 5,
      completedBookings: 19,
      revenue: 12500
    });
  }, []);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalBookings}</h3>
              </div>
              <div className="bg-red-500 bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Bookings</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.pendingBookings}</h3>
              </div>
              <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Bookings</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.completedBookings}</h3>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold text-white mt-1">₹{stats.revenue}</h3>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Teams List View */}
        <TeamsListView />

        {/* Recent Bookings */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Sample booking data - replace with actual data */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#BK001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">2023-07-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">18:00 - 20:00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₹500</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#BK002</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Jane Smith</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">2023-07-16</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">16:00 - 18:00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₹500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FranchiseLayout>
  );
}

export default FranchiseDashboard;