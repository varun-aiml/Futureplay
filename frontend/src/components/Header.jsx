import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/icon.png';
// Remove the FranchiseModal import since we won't need it anymore
// import FranchiseModal from './FranchiseModal';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Remove the showFranchiseModal state since we won't need it anymore
  // const [showFranchiseModal, setShowFranchiseModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="rounded-lg mr-3">
              <img src={logo} alt="ServeUp Logo" className="h-10 w-10" />
            </div>
            <span className="text-3xl font-bold text-white">FuturePlay</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-white hover:text-red-400 transition duration-300 font-medium relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#features" className="text-white hover:text-red-400 transition duration-300 font-medium relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#upcoming-tournaments" className="text-white hover:text-red-400 transition duration-300 font-medium relative group">
              Tournaments
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-white hover:text-red-400 transition duration-300 font-medium relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-3">
            <Link 
              to="/franchise/login"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 shadow-md"
            >
              Franchise Owner
            </Link>
            <Link 
              to="/organizer/login" 
              className="bg-transparent border-2 border-red-500 text-white hover:bg-red-500 font-bold py-2 px-5 rounded-md transition duration-300 shadow-md"
            >
              Organizers
            </Link>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 shadow-md">
              Players
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden bg-gray-800/95 backdrop-blur-sm px-4 py-5 absolute w-full border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-white hover:text-red-400 transition duration-300 py-2 font-medium">Home</a>
              <a href="#features" className="text-white hover:text-red-400 transition duration-300 py-2 font-medium">Features</a>
              <a href="#upcoming-tournaments" className="text-white hover:text-red-400 transition duration-300 py-2 font-medium">Tournaments</a>
              <a href="#contact" className="text-white hover:text-red-400 transition duration-300 py-2 font-medium">Contact</a>
              
              <div className="flex flex-col space-y-3 pt-2">
                <Link 
                  to="/franchise/login"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 shadow-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Franchise Owner
                </Link>
                <Link 
                  to="/organizer/login" 
                  className="bg-transparent border-2 border-red-500 text-white hover:bg-red-500 font-bold py-2 px-5 rounded-md transition duration-300 shadow-md text-center"
                >
                  Organizers
                </Link>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 shadow-md">
                  Players
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Remove the Franchise Modal since we won't need it anymore */}
      {/* {showFranchiseModal && <FranchiseModal setShowFranchiseModal={setShowFranchiseModal} />} */}
    </>
  );
}

export default Header;