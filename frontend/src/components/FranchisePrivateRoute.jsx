import { Navigate } from 'react-router-dom';
import { useFranchise } from '../context/franchiseContext';

function FranchisePrivateRoute({ children }) {
  const { isAuthenticated, loading } = useFranchise();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/franchise/login" replace />;
  }

  return children;
}

export default FranchisePrivateRoute;