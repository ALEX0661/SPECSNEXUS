import React, { useEffect, useState } from 'react';
import { getClearance } from '../services/clearanceService';
import { getProfile } from '../services/userService';
import Layout from '../components/Layout';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [clearanceData, setClearanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const userProfile = await getProfile(token);
        setUser(userProfile);
        
        // After getting user profile, fetch clearance data
        if (userProfile && userProfile.id) {
          try {
            const data = await getClearance(userProfile.id, token);
            setClearanceData(data);
          } catch (err) {
            console.error('Failed to fetch clearance:', err);
            setError('Failed to load clearance data. Please try again later.');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [token]);

  if (loading) {
    return (
      <Layout user={{ full_name: 'Loading...', student_number: '...' }}>
        <div className="dashboard-page">
          <div className="loading-spinner">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={{ full_name: 'Error', student_number: '...' }}>
        <div className="dashboard-page">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="dashboard-page">
        <div className="about-us-card">
          <h2>About Us</h2>
          <p>
            The Society of Programming Enthusiasts in Computer Science (SPECS) is one of the three
            recognized organizations under the College of Computer Studies and the only organization
            under the Computer Science course. We aim to promote the skills, knowledge, and
            camaraderie among CS Students of Gordon College and establish leadership among the
            SPECS Officers and CS Students.
          </p>
        </div>
        
        <div className="dashboard-grid">
          <div className="clearance-card">
            <h3>Clearance for 2024 - 2025</h3>
            {clearanceData.length > 0 ? (
              <table className="clearance-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clearanceData.map((clearance) => (
                    <tr key={clearance.id}>
                      <td>{clearance.requirement}</td>
                      <td className={clearance.status === 'Cleared' ? 'status-cleared' : 'status-not-cleared'}>
                        {clearance.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No clearance records found.</p>
            )}
          </div>
          
          <div className="membership-card">
            <h3>Membership Fee Status Description</h3>
            <table className="membership-table">
              <thead>
                <tr>
                  <th>Membership Fee Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending</td>
                  <td>You have not yet paid the membership fee. Please settle the payment to proceed with clearance.</td>
                </tr>
                <tr>
                  <td>Processing</td>
                  <td>Your payment is being verified. Please wait for confirmation.</td>
                </tr>
                <tr>
                  <td>Cleared</td>
                  <td>Your membership fee has been successfully paid and verified. You are cleared.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
 
export default DashboardPage;