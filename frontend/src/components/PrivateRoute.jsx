import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/organizer/login" replace />;
  }

  return children;
}

export default PrivateRoute;