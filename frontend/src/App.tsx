import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GuestAITools from './pages/GuestAITools';
import Dashboard from './pages/Dashboard';
import AITools from './pages/AITools';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ProjectProvider } from './context/ProjectContext';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LoadingProvider } from './context/LoadingContext';
import ToastContainer from './components/ToastContainer';
import Loader from './components/Loader';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <LoadingProvider>
            <UserProvider>
              <ProjectProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/try" element={<GuestAITools />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="ai" element={<AITools />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/new" element={<CreateProject />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProjectProvider>
              <ToastContainer />
              <Loader type="fullscreen" />
            </UserProvider>
          </LoadingProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
