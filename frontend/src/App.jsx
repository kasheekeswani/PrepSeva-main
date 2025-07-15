import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Shared
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin
import Dashboard from "./pages/Dashboard";
import PdfManager from "./pages/PdfManager";
import QuestionManager from "./pages/QuestionManager";
import TestManager from "./pages/TestManager";
import NotificationManager from "./pages/NotificationManager";
import UserStats from "./pages/UserStats";
import AdminTestAttempts from "./pages/AdminTestAttempts";

// User
import UserDashboard from "./pages/UserDashboard";
import PDFLibrary from "./pages/PDFLibrary";
import TestList from "./pages/TestList";
import TestTaker from "./pages/TestTaker";
import TestResults from "./pages/TestResults";
import Bookmarks from "./pages/Bookmarks";
import UserNotifications from "./pages/UserNotifications";
import UserProfile from "./pages/UserProfile";
import FAQManager from "./pages/FAQManager";
import FAQFloatingButton from "./components/FAQFloatingButton";

// Affiliate
import CourseMarketplace from "./pages/CourseMarketplace";
import AddCourse from "./pages/AddCourse";
import AffiliateLeaderboard from "./pages/AffiliateLeaderboard";
import CourseDetails from "./pages/CourseDetails";
import AffiliateLinks from "./pages/AffiliateLinks";
import AffiliateStats from "./pages/AffiliateStats";

const ProtectedRoute = ({ element, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return element;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/dashboard' : '/user/dashboard'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<CourseMarketplace />} />
        <Route path="/courses/:id" element={<CourseDetails />} />

        {/* Admin */}
        <Route path="/dashboard" element={<ProtectedRoute role="admin" element={<Dashboard />} />} />
        <Route path="/pdfs" element={<ProtectedRoute role="admin" element={<PdfManager />} />} />
        <Route path="/questions" element={<ProtectedRoute role="admin" element={<QuestionManager />} />} />
        <Route path="/tests" element={<ProtectedRoute role="admin" element={<TestManager />} />} />
        <Route path="/notifications/manage" element={<ProtectedRoute role="admin" element={<NotificationManager />} />} />
        <Route path="/users" element={<ProtectedRoute role="admin" element={<UserStats />} />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/leaderboard" element={<AffiliateLeaderboard />} />
        <Route path="/affiliate-links" element={<ProtectedRoute role="admin" element={<AffiliateLinks />} />} />
        <Route path="/affiliate-stats" element={<ProtectedRoute role="admin" element={<AffiliateStats />} />} />
        <Route path="/admin/attempts" element={<ProtectedRoute role="admin" element={<AdminTestAttempts />} />} />

        {/* User */}
        <Route path="/user/dashboard" element={<ProtectedRoute role="user" element={<UserDashboard />} />} />
        <Route path="/pdf-library" element={<ProtectedRoute role="user" element={<PDFLibrary />} />} />
        <Route path="/tests/list" element={<ProtectedRoute role="user" element={<TestList />} />} />
        <Route path="/tests/:testId" element={<ProtectedRoute role="user" element={<TestTaker />} />} />
        <Route path="/results" element={<ProtectedRoute role="user" element={<TestResults />} />} />
        <Route path="/bookmarks" element={<ProtectedRoute role="user" element={<Bookmarks />} />} />
        <Route path="/notifications" element={<ProtectedRoute role="user" element={<UserNotifications />} />} />
        <Route path="/profile" element={<ProtectedRoute role="user" element={<UserProfile />} />} />
        <Route path="/faq-manager" element={<ProtectedRoute role="user" element={<FAQManager />} />} />
      </Routes>

      {/* Floating FAQ Button (Visible on all pages) */}
      <FAQFloatingButton />

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
