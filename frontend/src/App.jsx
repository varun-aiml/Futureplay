import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import LandingPage from "./pages/LandingPage";
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerSignup from './pages/OrganizerSignup';
import OTPVerification from './pages/OTPVerification';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/signup" element={<OrganizerSignup />} />
          <Route
            path="/organizer/verify-otp"
            element={
              <PrivateRoute>
                <OTPVerification />
              </PrivateRoute>
            }
          />
          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;