import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FieldVisitLog from './components/FieldVisitLog';
import ReportApproval from './components/ReportApproval';
import CreateAccount from './components/CreateAccount';
import ProtectedRoute from './components/ProtectedRoute';
import PostVisit from './components/PostVisit';
import FieldVisitReport from './components/FieldVisitReport';
import TotalVisits from './components/TotalVisits';
import PendingApprovals from './components/PendingApprovals';
import ApprovedReports from './components/ApprovedReports';
import VisitDetails from './components/VisitDetails';
import RepostRequests from './components/RepostRequests'; // Adjust the path as needed
import EditProfile from './components/EditProfile'; // Adjust path if needed

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
          <Route path="/log-visit" element={<FieldVisitLog onLogout={handleLogout}/>} />
          <Route path="/approve-reports" element={<ReportApproval onLogout={handleLogout}/>} />
          <Route path="/post-visit" element={<PostVisit onLogout={handleLogout}/>} />
          <Route path="/field-visit-report/:visitId" element={<FieldVisitReport onLogout={handleLogout} />} />
          <Route path="/total-visits" element={<TotalVisits onLogout={handleLogout}/>} />
          <Route path="/pending-approvals" element={<PendingApprovals onLogout={handleLogout}/>} />
          <Route path="/approved-reports" element={<ApprovedReports onLogout={handleLogout}/>} />
          <Route path="/visit-details/:id" element={<VisitDetails />} />
          <Route path="/repost-requests" element={<RepostRequests />} />
          <Route path="/Editprofile" element={<EditProfile />} />

        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
