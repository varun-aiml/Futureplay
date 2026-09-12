import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createUmpire, getOrganizerUmpires } from '../../services/authService';

const UmpiresView = ({ tournamentId }) => {
  const [umpires, setUmpires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const fetchUmpires = async () => {
    try {
      setLoading(true);
      const res = await getOrganizerUmpires(tournamentId);
      if (res && res.success) {
        setUmpires(res.umpires || []);
      }
    } catch (error) {
      console.error('Error fetching umpires:', error);
      toast.error('Failed to load umpire accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUmpires();
  }, [tournamentId]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateUmpire = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.warn('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.warn('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createUmpire({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (res.success) {
        toast.success(`Umpire ${res.umpire?.name || ''} created successfully!`);
        setFormData({ name: '', email: '', password: '' });
        setShowCreateModal(false);
        fetchUmpires();
      } else {
        toast.error(res.message || 'Failed to create umpire');
      }
    } catch (error) {
      console.error('Error creating umpire:', error);
      toast.error(error.response?.data?.message || 'Error creating umpire account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>🏸</span>
            <span>Umpire Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Provision and manage court umpire login accounts. Umpires use these credentials to log in at the mobile portal.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
        >
          <span>+</span>
          <span>Create Umpire Account</span>
        </button>
      </div>

      {/* Info Card with Mobile Login Link */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-300">
        <span className="text-lg">ℹ️</span>
        <div>
          <p className="font-bold text-white mb-0.5">Mobile Portal for Umpires</p>
          <p>
            Umpires can sign in directly from their smartphone at{' '}
            <span className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-200 font-bold">
              /umpire/login
            </span>
            . They will see their assigned court matches and can submit official scores in real time.
          </p>
        </div>
      </div>

      {/* Umpires List */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md">
        <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
          <span>Active Umpire Accounts ({umpires.length})</span>
          <button
            onClick={fetchUmpires}
            className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
          >
            <span>↻ Refresh</span>
          </button>
        </h3>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading umpires...</p>
          </div>
        ) : umpires.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center text-2xl">
              👤
            </div>
            <p className="text-base font-bold text-white">No Umpires Created Yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Click the "Create Umpire Account" button above to add court officials for this tournament.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {umpires.map(umpire => (
              <div
                key={umpire._id}
                className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 shadow-sm hover:border-gray-600 transition-all"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-gray-950 flex items-center justify-center font-black text-sm">
                    {umpire.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-white truncate">{umpire.name}</h4>
                    <span className="text-[11px] font-mono text-emerald-400 block truncate">
                      {umpire.email}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    ✓ Official Umpire
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    Created: {new Date(umpire.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Umpire Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🏸</span>
                <span>Create Umpire Account</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUmpire} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Umpire Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Login Username / Email *
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. umpire_ramesh or ramesh@futureplay.com"
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  The umpire will use this username/email to log in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Stored securely using password hashing.
                </p>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Create Umpire</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UmpiresView;
