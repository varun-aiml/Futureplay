import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { FranchiseProvider } from "./context/franchiseContext";
import LandingPage from "./pages/LandingPage";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerSignup from "./pages/OrganizerSignup";
import OTPVerification from "./pages/OTPVerification";
import CompleteProfile from "./pages/CompleteProfile";
import PrivateRoute from "./components/PrivateRoute";
import FranchisePrivateRoute from "./components/FranchisePrivateRoute";
import OrganizerHome from "./pages/OrganizerHome";
import Tournaments from "./pages/Tournaments";
import CreateTournament from "./pages/CreateTournament";
import TournamentDetail from "./pages/TournamentDetail";
import PlayerTournaments from "./pages/PlayerTournaments";
import FranchiseLogin from "./pages/FranchiseLogin";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlayerTournamentDetails from "./pages/PlayerTournamentDetails";
import Players from "./pages/Players";
import FranchiseRegistration from "./pages/FranchiseRegistration";
import Auctions from "./pages/Auctions";
import SuperAuction from "./pages/SuperAuction";

function App() {
  return (
    <AuthProvider>
      <FranchiseProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/organizer/login" element={<OrganizerLogin />} />
            <Route path="/organizer/signup" element={<OrganizerSignup />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            {/* Player routes (public) */}
            <Route path="/tournaments" element={<PlayerTournaments />} />
            <Route path="/tournament/:id" element={<PlayerTournamentDetails />} />
            <Route
              path="/organizer/verify-otp"
              element={
                <PrivateRoute>
                  <OTPVerification />
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/home"
              element={
                <PrivateRoute>
                  <OrganizerHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizer/tournaments"
              element={
                <PrivateRoute>
                  <Tournaments />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizer/tournaments/create"
              element={
                <PrivateRoute>
                  <CreateTournament />
                </PrivateRoute>
              }
            />
            {/* Add this new route for tournament details */}
            <Route
              path="/organizer/tournaments/:id"
              element={
                <PrivateRoute>
                  <TournamentDetail />
                </PrivateRoute>
              }
            />
            {/* Add this new route for editing tournaments */}
            <Route
              path="/organizer/tournaments/edit/:id"
              element={
                <PrivateRoute>
                  <CreateTournament />
                </PrivateRoute>
              }
            />

<Route
  path="/organizer/players"
  element={
    <PrivateRoute>
      <Players />
    </PrivateRoute>
  }
/>
<Route
              path="/organizer/auctions"
              element={
                <PrivateRoute>
                  <Auctions />
                </PrivateRoute>
              }
            />
            
            {/* Franchise routes */}
            <Route path="/franchise/registration" element={<FranchiseRegistration />} />
            <Route path="/franchise/login" element={<FranchiseLogin />} />
            <Route
              path="/franchise/dashboard"
              element={
                <FranchisePrivateRoute>
                  <FranchiseDashboard />
                </FranchisePrivateRoute>
              }
            />
            <Route
              path="/franchise/super-auction"
              element={
                <FranchisePrivateRoute>
                  <SuperAuction />
                </FranchisePrivateRoute>
              }
            />
            
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </FranchiseProvider>
    </AuthProvider>
  );
}

export default App;