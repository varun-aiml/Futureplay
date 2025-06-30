import { useState } from 'react';
import { registerFranchise } from '../services/franchiseService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FranchiseModal = ({ setShowFranchiseModal }) => {
  const [formData, setFormData] = useState({
    franchiseName: '',
    ownerName: '',
    username: '',
    password: '',
    whatsappNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerFranchise(formData);
      toast.success('Franchise registration successful!');
      setShowFranchiseModal(false);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    setShowFranchiseModal(false);
    navigate('/franchise/login');
  };

  // Helper function to render required field label
  const renderLabel = (text, htmlFor) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            FRANCHISE REGISTRATION
          </h2>
          <button
            onClick={() => setShowFranchiseModal(false)}
            className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {renderLabel('Franchise Name', 'franchiseName')}
            <input
              type="text"
              id="franchiseName"
              name="franchiseName"
              value={formData.franchiseName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter franchise name"
            />
          </div>

          <div>
            {renderLabel('Owner Full Name', 'ownerName')}
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter owner's full name"
            />
          </div>

          <div>
            {renderLabel('Username', 'username')}
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter username for login"
            />
          </div>

          <div>
            {renderLabel('Password', 'password')}
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter password (min. 8 characters)"
            />
          </div>

          <div>
            {renderLabel('WhatsApp Number', 'whatsappNumber')}
            <input
              type="text"
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter WhatsApp number"
            />
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Register as Franchise Owner'}
            </button>
            
            <button
              type="button"
              onClick={handleLoginClick}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
            >
              Already Registered? Login
            </button>
          </div>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          By registering, you'll be able to login with your username and password to access your franchise dashboard.
        </p>
      </div>

      {/* Add global styles for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default FranchiseModal;