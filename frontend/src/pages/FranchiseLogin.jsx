import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginFranchise } from '../services/franchiseService';
import { useFranchise } from '../context/franchiseContext';
import { toast } from 'react-toastify';
import logo from '../assets/icon.png';

function FranchiseLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginFranchiseOwner } = useFranchise();

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
      const response = await loginFranchise(formData.username, formData.password);
      loginFranchiseOwner(response.franchise);
      toast.success('Login successful!');
      navigate('/franchise/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render required field label
  const renderLabel = (text, htmlFor) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-16 mb-4" />
          <h2 className="text-3xl font-bold text-white">FRANCHISE LOGIN</h2>
          <p className="text-gray-400 mt-2">Access your franchise dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your username"
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
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-4">
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
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account? <Link to="/" className="text-red-400 hover:text-red-300">Register as a franchise owner</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FranchiseLogin;