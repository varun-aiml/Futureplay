import { useState, useEffect } from 'react';
import { registerFranchise } from '../services/franchiseService';
import { getAllTournaments } from '../services/tournamentService';
import { toast } from 'react-toastify';

const AddFranchiseModal = ({ isOpen, onClose, onSuccess }) => {
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

    if (isOpen) {
      fetchTournaments();
    }
  }, [isOpen]);

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
      if (!formData.tournament) {
        toast.error('Please select a tournament');
        setIsSubmitting(false);
        return;
      }

      await registerFranchise(formData);
      toast.success('Franchise created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        franchiseName: '',
        ownerName: '',
        username: '',
        password: '',
        whatsappNumber: '',
        tournament: ''
      });
    } catch (error) {
      console.error('Franchise creation error:', error);
      toast.error(error.response?.data?.message || 'Creation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg max-w-md w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Add New Franchise</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="franchiseName" className="block text-sm font-medium text-gray-300 mb-1">
                Franchise Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="franchiseName"
                name="franchiseName"
                value={formData.franchiseName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Enter franchise name"
              />
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300 mb-1">
                Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Enter owner name"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Enter password (min. 8 characters)"
              />
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-300 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="Enter WhatsApp number"
              />
            </div>

            <div>
              <label htmlFor="tournament" className="block text-sm font-medium text-gray-300 mb-1">
                Tournament <span className="text-red-500">*</span>
              </label>
              <select
                id="tournament"
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center ${(isSubmitting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Franchise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFranchiseModal;