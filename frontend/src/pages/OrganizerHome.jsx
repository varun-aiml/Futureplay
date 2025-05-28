import { useAuth } from '../context/authContext';
import OrganizerLayout from '../components/OrganizerLayout';

function OrganizerHome() {
  const { user } = useAuth();

  return (
    <OrganizerLayout>
      <div className="bg-gray-900 min-h-screen p-8">
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ServeUp Dashboard!</h1>
          <p className="text-xl text-red-100">
            {user ? `Hello, ${user.name}!` : 'Hello, Organizer!'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all">
            <h2 className="text-xl font-semibold text-white mb-2">Upcoming Tournaments</h2>
            <p className="text-gray-400 mb-4">View and manage your upcoming tournaments.</p>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all">
            <h2 className="text-xl font-semibold text-white mb-2">Registered Players</h2>
            <p className="text-gray-400 mb-4">See who has registered for your events.</p>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all">
            <h2 className="text-xl font-semibold text-white mb-2">Quick Stats</h2>
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Active Tournaments</span>
              <span className="text-red-400 font-bold">3</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Total Players</span>
              <span className="text-red-400 font-bold">42</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Upcoming Events</span>
              <span className="text-red-400 font-bold">2</span>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all md:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-red-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">New tournament created</p>
                  <p className="text-gray-500 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-red-500 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">5 new players registered</p>
                  <p className="text-gray-500 text-sm">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg hover:shadow-red-500/20 transition-all">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md mb-3 transition duration-300">
              Create Tournament
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
              Manage Players
            </button>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}

export default OrganizerHome;