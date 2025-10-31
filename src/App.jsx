import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Dashboard as DashboardLayout } from "@/layouts";
import AuthLanding from "@/pages/AuthLanding";
import FoodLogDashboard from "@/pages/FoodLogDashboard";
import Profile from "@/pages/Profile";
import { Tables } from "@/pages/dashboard";
import Processing from "@/pages/Processing";
import Result from "@/pages/Result";
import { isAuthenticated } from "@/utils/auth";

const DashboardShell = () =>
  isAuthenticated() ? <DashboardLayout /> : <Navigate to="/" replace />;

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/" replace />;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthLanding />} />

        <Route element={<DashboardShell />}>
          <Route path="/dashboard/home" element={<FoodLogDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/tables" element={<Tables />} />
          <Route
            path="/processing"
            element={<ProtectedRoute><Processing /></ProtectedRoute>}
          />
          <Route
            path="/result"
            element={<ProtectedRoute><Result /></ProtectedRoute>}
          />
        </Route>

        <Route
          path="*"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard/home" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

