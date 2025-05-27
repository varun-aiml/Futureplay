import { useAuth } from '../context/authContext';

function OrganizerHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to ServeUp!</h1>
        <p className="text-lg text-gray-300 mb-2">
          {user ? `Hello, ${user.name}!` : 'Hello, Organizer!'}
        </p>
        <p className="text-gray-400">This is your demo home page after login or signup.</p>
      </div>
    </div>
  );
}

export default OrganizerHome;