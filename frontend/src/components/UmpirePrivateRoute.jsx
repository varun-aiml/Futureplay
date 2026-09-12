import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function UmpirePrivateRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/umpire/login" replace />;
  }

  if (user.role !== 'umpire') {
    return <Navigate to="/umpire/login" replace />;
  }

  return children;
}

export default UmpirePrivateRoute;
