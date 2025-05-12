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
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
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
        } finally {
          setLoading(false);
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

  return (
    <Layout user={user}>
      <div className="membership-page">

        {loading ? (
          <div className="membership-loading">
            {/* You can replace this with any spinner component you have */}
            <p>Loading memberships…</p>
          </div>
        ) : (
          <>
            <div className="membership-list">
              {memberships.map(membership => (
                <div key={membership.id} className="membership-card">
                  <div className="membership-status">
                    <h3>Membership Status</h3>
                    <div className="status-progress">
                      <div className="progress-steps">
                        <div className={`progress-step ${membership.payment_status?.toLowerCase() === 'not paid' ? 'active' : ''}`}>
                          <div className="step-dot"></div>
                          <div className="step-label">Not Paid</div>
                        </div>
                        <div className={`progress-step ${['verifying','processing'].includes(membership.payment_status?.toLowerCase()) ? 'active' : ''}`}>
                          <div className="step-dot"></div>
                          <div className="step-label">Processing</div>
                        </div>
                        <div className={`progress-step ${membership.payment_status?.toLowerCase() === 'paid' ? 'active' : ''}`}>
                          <div className="step-dot"></div>
                          <div className="step-label">Paid</div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: membership.payment_status?.toLowerCase() === 'not paid' ? '0%' : 
                                  ['verifying','processing'].includes(membership.payment_status?.toLowerCase()) ? '50%' : '100%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="membership-fee">
                    <h3>Membership Fee Amount</h3>
                    <div className="fee-amount">
                      <span className="currency">₱</span>
                      <span className="amount">{membership.amount || "50"}</span>
                    </div>
                  </div>

                  <div className="membership-description">
                    <h3>Description</h3>
                    <div className="description-content">
                      {membership.requirement || "Membership fee payment is required for active status."}
                    </div>
                    {membership.payment_status?.toLowerCase() === 'not paid' && (
                      <button 
                        className="register-btn"
                        onClick={() => setSelectedMembership(membership)}
                      >
                        Register Membership
                      </button>
                    )}
                    {membership.payment_status?.toLowerCase() === 'verifying' && (
                      <button 
                        className="edit-btn"
                        onClick={() => setSelectedMembership(membership)}
                      >
                        Edit Uploaded Files
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedMembership && (
              <MembershipModal
                membership={selectedMembership}
                onClose={() => setSelectedMembership(null)}
                onReceiptUploaded={handleReceiptUploaded}
              />
            )}
          </>
        )}

      </div>
    </Layout>
  );
};

export default MembershipPage;
