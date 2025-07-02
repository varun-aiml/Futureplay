import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFranchise } from '../context/franchiseContext';
import logo from '../assets/icon.png';

export default function FranchiseLayout({ children }) {
  const { franchise, logoutFranchiseOwner } = useFranchise();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logoutFranchiseOwner();
    navigate('/franchise/login');
  };

  // Check if the current route matches the link
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 transition-all duration-300 flex flex-col border-r border-gray-700 ${isMobile && !isSidebarOpen ? '-ml-20' : ''}`}
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          <nav>
            <Link 
              to="/franchise/dashboard" 
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${isActiveRoute('/franchise/dashboard') ? 'bg-gray-700 text-red-400 border-l-4 border-red-500' : ''}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>

            <Link 
              to="/franchise/bookings" 
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${isActiveRoute('/franchise/bookings') ? 'bg-gray-700 text-red-400 border-l-4 border-red-500' : ''}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isSidebarOpen && <span>Bookings</span>}
            </Link>

            <Link 
  to="/franchise/super-auction" 
  className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${isActiveRoute('/franchise/super-auction') ? 'bg-gray-700 text-red-400 border-l-4 border-red-500' : ''}`}
>
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  {isSidebarOpen && <span>Super Auction</span>}
</Link>

            <Link 
              to="/franchise/profile" 
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200 ${isActiveRoute('/franchise/profile') ? 'bg-gray-700 text-red-400 border-l-4 border-red-500' : ''}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {isSidebarOpen && <span>Profile</span>}
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shadow-lg">
              {franchise?.ownerName?.charAt(0) || 'F'}
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{franchise?.ownerName || 'Franchise Owner'}</p>
                <p className="text-xs text-gray-400">{franchise?.franchiseName || ''}</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-red-500 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-bold text-white">
              {isActiveRoute('/franchise/dashboard') && 'Dashboard'}
              {isActiveRoute('/franchise/bookings') && 'Bookings'}
              {isActiveRoute('/franchise/profile') && 'Profile'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">            
            <div className="relative group">
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-300">
                {franchise?.ownerName?.charAt(0) || 'F'}
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-700">
                <Link to="/franchise/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400">
                  Your Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}