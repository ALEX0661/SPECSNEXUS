import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import { getMemberships } from '../services/membershipService';
import Layout from '../components/Layout';
import MembershipModal from '../components/MembershipModal';
import '../styles/MembershipPage.css';

const MembershipPage = () => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      async function fetchMemberships() {
        try {
          const membershipsData = await getMemberships(user.id, token);
          setMemberships(membershipsData);
        } catch (error) {
          console.error("Failed to fetch membership info:", error);
        }
      }
      fetchMemberships();
    }
  }, [user, token]);

  const handleReceiptUploaded = async (updatedMembership) => {
    try {
      const updatedMemberships = await getMemberships(user.id, token);
      setMemberships(updatedMemberships);
      setSelectedMembership(null);
    } catch (error) {
      console.error("Failed to update membership records:", error);
    }
  };

  const getProgressData = (status) => {
    const lower = status ? status.trim().toLowerCase() : "";
    let progressPercentage = 0;
    let progressColor = "#ccc";
    if (lower === "not paid") {
      progressPercentage = 0;
      progressColor = "#ccc";
    } else if (lower === "verifying") {
      progressPercentage = 50;
      progressColor = "#28a745";
    } else if (lower === "paid") {
      progressPercentage = 100;
      progressColor = "#28a745";
    }
    return { progressPercentage, progressColor, displayStatus: status };
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user}>
      <div className="membership-page">
        <h1>My Membership Requirements</h1>
        <div className="memberships-grid">
          {memberships.length > 0 ? (
            memberships.map((membership) => {
              const status = membership.payment_status || "";
              const { progressPercentage, progressColor, displayStatus } = getProgressData(status);
              return (
                <div key={membership.id} className="membership-card">
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
                  {status.trim().toLowerCase() === "not paid" && (
                    <button
                      className="register-btn"
                      onClick={() => setSelectedMembership(membership)}
                    >
                      Register Membership
                    </button>
                  )}
                  {status.trim().toLowerCase() === "verifying" && (
                    <button
                      className="edit-btn"
                      onClick={() => setSelectedMembership(membership)}
                    >
                      Edit Uploaded Files
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p>No membership records found.</p>
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
    </Layout>
  );
};

export default MembershipPage;
