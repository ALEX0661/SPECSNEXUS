import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import { getMemberships } from '../services/membershipService';
import Sidebar from '../components/Sidebar';
import MembershipModal from '../components/MembershipModal';
import { FaBars } from 'react-icons/fa';
import '../styles/MembershipPage.css';

const MembershipPage = () => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      async function fetchMemberships() {
        try {
          setLoadingMemberships(true);
          const membershipsData = await getMemberships(user.id, token);
          setMemberships(membershipsData);
        } catch (error) {
          console.error("Failed to fetch membership info:", error);
        } finally {
          setLoadingMemberships(false);
        }
      }
      fetchMemberships();
    }
  }, [user, token]);

  const handleReceiptUploaded = async () => {
    try {
      const updatedMemberships = await getMemberships(user.id, token);
      setMemberships(updatedMemberships);
      setSelectedMembership(null);
    } catch (error) {
      console.error("Failed to update membership records:", error);
    }
  };

  const getProgressData = (status, denialReason) => {
    const lower = status ? status.trim().toLowerCase() : "";
    let progressPercentage = 0;
    let progressColor = "#ccc";
    let displayStatus = status;
    if (lower === "not paid") {
      if (denialReason) {
        progressPercentage = 0;
        progressColor = "#dc3545";
        displayStatus = "Denied";
      } else {
        progressPercentage = 0;
        progressColor = "#ccc";
      }
    } else if (lower === "verifying") {
      progressPercentage = 50;
      progressColor = "#28a745";
    } else if (lower === "paid") {
      progressPercentage = 100;
      progressColor = "#28a745";
    }
    return { progressPercentage, progressColor, displayStatus };
  };

  if (isLoading) {
    return <div className="loading">Loading Membership Information...</div>;
  }

  if (!user) {
    return <div className="error-message">Unable to load user data. Please try again later.</div>;
  }

  const notPaidOrDeniedMemberships = memberships.filter(
    (m) => m.payment_status?.trim().toLowerCase() === "not paid"
  );

  const verifyingMemberships = memberships.filter(
    (m) => m.payment_status?.trim().toLowerCase() === "verifying"
  );

  const paidMemberships = memberships.filter(
    (m) => m.payment_status?.trim().toLowerCase() === "paid"
  );

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar user={user} isOpen={isSidebarOpen} />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-left">
            <button className="sidebar-toggle-inside" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
            </button>
            <h1>My Membership Requirements</h1>
          </div>
        </div>

        {/* Not Paid or Denied Section */}
        <div className="membership-section">
          <h2>Not Paid / Denied Memberships</h2>
          {loadingMemberships ? (
            <div className="membership-loading">
              <div className="loading-indicator">Loading membership data...</div>
            </div>
          ) : notPaidOrDeniedMemberships.length > 0 ? (
            <div className="memberships-grid">
              {notPaidOrDeniedMemberships.map((membership) => {
                const status = membership.payment_status || "";
                const { progressPercentage, progressColor, displayStatus } = getProgressData(status, membership.denial_reason);
                return (
                  <div
                    key={membership.id}
                    className="membership-card"
                    onClick={() => setSelectedMembership(membership)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                      >
                        {displayStatus}
                      </div>
                    </div>
                    <div className="membership-details">
                      <p><strong>Requirement:</strong> {membership.requirement || "N/A"}</p>
                      <p><strong>Amount:</strong> ₱{membership.amount || "0"}</p>
                      <p><strong>Membership ID:</strong> {membership.id}</p>
                      {membership.denial_reason && (
                        <p><strong>Denial Reason:</strong> {membership.denial_reason}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No not paid or denied memberships.</p>
          )}
        </div>

        {/* Verifying Section */}
        <div className="membership-section">
          <h2>Verifying Memberships</h2>
          {loadingMemberships ? (
            <div className="membership-loading">
              <div className="loading-indicator">Loading membership data...</div>
            </div>
          ) : verifyingMemberships.length > 0 ? (
            <div className="memberships-grid">
              {verifyingMemberships.map((membership) => {
                const { progressPercentage, progressColor, displayStatus } = getProgressData(membership.payment_status, membership.denial_reason);
                return (
                  <div
                    key={membership.id}
                    className="membership-card"
                    onClick={() => setSelectedMembership(membership)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                      >
                        {displayStatus}
                      </div>
                    </div>
                    <div className="membership-details">
                      <p><strong>Requirement:</strong> {membership.requirement || "N/A"}</p>
                      <p><strong>Amount:</strong> ₱{membership.amount || "0"}</p>
                      <p><strong>Membership ID:</strong> {membership.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No memberships in verifying status.</p>
          )}
        </div>

        {/* Paid Section */}
        <div className="membership-section">
          <h2>Paid Memberships</h2>
          {loadingMemberships ? (
            <div className="membership-loading">
              <div className="loading-indicator">Loading membership data...</div>
            </div>
          ) : paidMemberships.length > 0 ? (
            <div className="memberships-grid">
              {paidMemberships.map((membership) => {
                const { progressPercentage, progressColor, displayStatus } = getProgressData(membership.payment_status, membership.denial_reason);
                return (
                  <div
                    key={membership.id}
                    className="membership-card"
                    onClick={() => setSelectedMembership(membership)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                      >
                        {displayStatus}
                      </div>
                    </div>
                    <div className="membership-details">
                      <p><strong>Requirement:</strong> {membership.requirement || "N/A"}</p>
                      <p><strong>Amount:</strong> ₱{membership.amount || "0"}</p>
                      <p><strong>Membership ID:</strong> {membership.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No paid memberships yet.</p>
          )}
        </div>

        {selectedMembership && (
          <MembershipModal
            membership={selectedMembership}
            onClose={() => setSelectedMembership(null)}
            onReceiptUploaded={handleReceiptUploaded}
          />
        )}
      </div>
    </div>
  );
};

export default MembershipPage;