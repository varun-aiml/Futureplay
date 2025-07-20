import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerFranchise } from '../services/franchiseService';
import { getAllTournaments } from '../services/tournamentService';
import { toast } from 'react-toastify';
import logo from '../assets/icon.png';

function FranchiseRegistration() {
  const [formData, setFormData] = useState({
    franchiseName: '',
    ownerName: '',
    username: '',
    password: '',
    whatsappNumber: '',
    tournament: ''
  });
  const [tournaments, setTournaments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();

  // Fetch available tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const response = await getAllTournaments();
        setTournaments(response.data.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        toast.error('Failed to load tournaments. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.tournament) {
        toast.error('Please select a tournament');
        setIsSubmitting(false);
        return;
      }

      // Add logo to form data if selected
      const dataToSubmit = {
        ...formData,
        logo: logoFile
      };

      await registerFranchise(dataToSubmit);
      toast.success('Franchise registration successful!');
      // Change this line to redirect to organizer home instead of franchise login
      navigate('/organizer/home');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLabel = (label, id) => (
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
  );

  const handleBackToOrganizer = () => {
    navigate('/organizer/home');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-4 text-center">
    <button
      onClick={handleBackToOrganizer}
      className="text-gray-400 hover:text-white transition-colors"
    >
      ← Back to Organizer Dashboard
    </button>
  </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-16 w-auto" src={logo} alt="ServeUp Logo" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Add New Franchise</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              {renderLabel('Owner Name', 'ownerName')}
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Enter owner name"
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
                placeholder="Choose a username"
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

            <div>
              {renderLabel('Tournament', 'tournament')}
              <select
                id="tournament"
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                disabled={isLoading}
              >
                <option value="">Select a tournament</option>
                {tournaments.map((tournament) => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
              {isLoading && (
                <div className="mt-2 text-sm text-gray-400">
                  Loading tournaments...
                </div>
              )}
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
                Franchise Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleLogoChange}
                    accept="image/jpeg,image/png,image/gif"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-400">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                </div>
                {logoPreview && (
                  <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-600">
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center ${(isSubmitting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Add New Franchise'}
              </button>
              
              {/* <Link
                to="/franchise/login"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
              >
                Already Registered? Login
              </Link> */}
            </div>
          </form>

          <p className="text-gray-400 text-sm mt-6 text-center">
            By registering, you'll be able to login with your username and password to access your franchise dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FranchiseRegistration;