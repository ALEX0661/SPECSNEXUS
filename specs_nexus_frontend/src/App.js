import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MembershipPage from './pages/MembershipPage';
import OfficerLoginPage from './pages/OfficerLoginPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import OfficerManageEventsPage from './pages/OfficerManageEventsPage';
import OfficerManageAnnouncementsPage from './pages/OfficerManageAnnouncementsPage';
import OfficerManageMembershipPage from './pages/OfficerManageMembershipPage';
import AdminManageOfficerPage from './pages/AdminManageOfficerPage';
import UserAuthGuard from './components/UserAuthGuard';
import OfficerAuthGuard from './components/OfficerAuthGuard';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/officer-login" element={<OfficerLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <UserAuthGuard>
              <DashboardPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <UserAuthGuard>
              <ProfilePage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/events"
          element={
            <UserAuthGuard>
              <EventsPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/announcements"
          element={
            <UserAuthGuard>
              <AnnouncementsPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/membership"
          element={
            <UserAuthGuard>
              <MembershipPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/officer-dashboard"
          element={
            <OfficerAuthGuard>
              <OfficerDashboardPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-events"
          element={
            <OfficerAuthGuard>
              <OfficerManageEventsPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-announcements"
          element={
            <OfficerAuthGuard>
              <OfficerManageAnnouncementsPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-membership"
          element={
            <OfficerAuthGuard>
              <OfficerManageMembershipPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/admin-manage-officers"
          element={
            <OfficerAuthGuard>
              <AdminManageOfficerPage />
            </OfficerAuthGuard>
          }
        />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
