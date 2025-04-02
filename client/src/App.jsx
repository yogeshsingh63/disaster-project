import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// Layout components
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerificationPending from './pages/auth/VerificationPending';
import Profile from './pages/common/Profile';
import NotFound from './pages/common/NotFound';

// Public pages
import Home from './pages/public/Home';

// Dashboard pages
import AdminDashboard from './pages/admin/Dashboard';
import NGODashboard from './pages/ngo/Dashboard';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import AffectedDashboard from './pages/affected/Dashboard';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import DisasterManagement from './pages/admin/DisasterManagement';

// NGO pages
import ResourceManagement from './pages/ngo/ResourceManagement';

// Affected Individual pages
import RequestHelp from './pages/affected/RequestHelp';
import MyRequests from './pages/affected/MyRequests';

// Protected route component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole, loading, user } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Check if user is verified (for NGO and Volunteer roles)
  if ((user?.role === 'NGO' || user?.role === 'Volunteer') && !user?.isVerified) {
    return <Navigate to="/verification-pending" />;
  }
  
  if (roles && !roles.some(role => hasRole(role))) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'Admin') {
      return <Navigate to="/dashboard/admin" />;
    } else if (user?.role === 'NGO') {
      return <Navigate to="/dashboard/ngo" />;
    } else if (user?.role === 'Volunteer') {
      return <Navigate to="/dashboard/volunteer" />;
    } else if (user?.role === 'AffectedIndividual') {
      return <Navigate to="/dashboard/affected" />;
    }
    return <Navigate to="/" />;
  }
  
  return children;
};

// App component with routing
function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Admin routes */}
              <Route path="admin" element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute roles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/disasters" element={
                <ProtectedRoute roles={['Admin']}>
                  <DisasterManagement />
                </ProtectedRoute>
              } />
              
              {/* NGO routes */}
              <Route path="ngo" element={
                <ProtectedRoute roles={['NGO']}>
                  <NGODashboard />
                </ProtectedRoute>
              } />
              <Route path="ngo/resources" element={
                <ProtectedRoute roles={['NGO']}>
                  <ResourceManagement />
                </ProtectedRoute>
              } />
              
              {/* Volunteer routes */}
              <Route path="volunteer" element={
                <ProtectedRoute roles={['Volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Affected Individual routes */}
              <Route path="affected" element={
                <ProtectedRoute roles={['AffectedIndividual']}>
                  <AffectedDashboard />
                </ProtectedRoute>
              } />
              <Route path="affected/request-help" element={
                <ProtectedRoute roles={['AffectedIndividual']}>
                  <RequestHelp />
                </ProtectedRoute>
              } />
              <Route path="affected/my-requests" element={
                <ProtectedRoute roles={['AffectedIndividual']}>
                  <MyRequests />
                </ProtectedRoute>
              } />
              
              {/* Common routes */}
              <Route path="profile" element={<Profile />} />
              
              {/* Not found route */}
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Global catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
