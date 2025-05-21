import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import OfficerSidebar from '../components/OfficerSidebar';
import {
  getOfficerMemberships,
  createOfficerMembership,
  verifyOfficerMembership,
  getOfficerRequirements,
  updateOfficerRequirement,
  deleteOfficerRequirement,
  uploadOfficerQRCode,
  getQRCode,
  createOfficerRequirement
} from '../services/officerMembershipService';
import OfficerMembershipModal from '../components/OfficerMembershipModal';
import OfficerDenialReasonModal from '../components/OfficerDenialReasonModal';
import '../styles/OfficerManageMembershipPage.css';

const OfficerManageMembershipPage = () => {
  const [officer, setOfficer] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showQRManagementModal, setShowQRManagementModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [showDenialReasonModal, setShowDenialReasonModal] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterRequirement, setFilterRequirement] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('officerAccessToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/officer-login');
      return;
    }

    async function fetchOfficerInfo() {
      try {
        const storedOfficer = localStorage.getItem('officerInfo');
        if (storedOfficer) {
          setOfficer(JSON.parse(storedOfficer));
        } else {
          navigate('/officer-login');
        }
      } catch (error) {
        console.error("Failed to load officer info:", error);
        navigate('/officer-login');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOfficerInfo();
  }, [token, navigate]);

  useEffect(() => {
    if (!token || isLoading) return;

    async function fetchMemberships() {
      try {
        const data = await getOfficerMemberships(token);
        setMemberships(data);
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
        }
      }
    }
    fetchMemberships();
  }, [token, isLoading, navigate]);

  useEffect(() => {
    if (!token || isLoading) return;

    async function fetchRequirements() {
      try {
        const data = await getOfficerRequirements(token);
        setRequirements(data);
      } catch (error) {
        console.error("Failed to fetch requirements:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
        }
      }
    }
    fetchRequirements();
  }, [token, isLoading, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleVerifyAction = async (membershipId, action) => {
    if (action === 'deny') {
      setSelectedMembershipId(membershipId);
      setShowDenialReasonModal(true);
    } else {
      try {
        await verifyOfficerMembership(membershipId, action, null, token);
        const updated = await getOfficerMemberships(token);
        setMemberships(updated);
        alert(`Membership ${action}d successfully!`);
      } catch (error) {
        console.error("Error updating membership verification:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
        } else {
          alert(`Error ${action}ing membership: ${error.response?.data?.detail || 'Unknown error'}`);
        }
      }
    }
  };

  const handleDenialReasonSubmit = async (denialReason) => {
    try {
      await verifyOfficerMembership(selectedMembershipId, 'deny', denialReason, token);
      const updated = await getOfficerMemberships(token);
      setMemberships(updated);
      alert("Membership denied successfully!");
      setShowDenialReasonModal(false);
      setSelectedMembershipId(null);
    } catch (error) {
      console.error("Error denying membership:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        alert(`Error denying membership: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  };

  const handleSave = async (formData, membershipId) => {
    try {
      if (membershipId) {
        alert("Membership update not supported in this version.");
      } else {
        await createOfficerMembership(formData, token);
        alert("Membership created successfully!");
      }
      setShowModal(false);
      const updated = await getOfficerMemberships(token);
      setMemberships(updated);
    } catch (error) {
      console.error("Error saving membership:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        alert(`Error saving membership: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  };

  const handleQRUpload = async (paymentType, file) => {
    try {
      await uploadOfficerQRCode(paymentType, file, token);
      alert("QR Code uploaded successfully!");
      setShowQRManagementModal(false);
    } catch (error) {
      console.error("Failed to upload QR code:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        alert(`Error uploading QR code: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  };

  const handleRequirementUpdate = async (amount) => {
    if (!selectedRequirement || !selectedRequirement.requirement) return;
    try {
      await updateOfficerRequirement(selectedRequirement.requirement, { amount }, token);
      alert("Requirement updated successfully!");
      const updated = await getOfficerRequirements(token);
      setRequirements(updated);
      setShowRequirementModal(false);
      setSelectedRequirement(null);
    } catch (error) {
      console.error("Error updating requirement:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        alert(`Error updating requirement: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  };

  const handleRequirementArchive = async (requirement) => {
    if (!window.confirm("Are you sure you want to archive this requirement?")) return;
    try {
      await deleteOfficerRequirement(requirement, token);
      alert("Requirement archived successfully!");
      const updated = await getOfficerRequirements(token);
      setRequirements(updated);
    } catch (error) {
      console.error("Error archiving requirement:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        alert(`Error archiving requirement: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
  };

  const openReceiptImage = (url) => {
    window.open(url, '_blank');
  };

  const filteredMemberships = memberships.filter((m) => {
    let statusMatch = true;
    if (activeTab === 'all') {
      statusMatch = true;
    } else if (activeTab === 'verifying') {
      statusMatch =
        (m.payment_status && m.payment_status.toLowerCase() === "verifying") ||
        (m.status && m.status.toLowerCase() === "processing");
    }
    const blockMatch = filterBlock === 'All' ? true : (m.user?.block === filterBlock);
    const yearMatch = filterYear === 'All' ? true : (m.user?.year === filterYear);
    const reqMatch = filterRequirement === 'All' ? true : (m.requirement === filterRequirement);
    const nameMatch = searchName === '' ? true : m.user?.full_name.toLowerCase().includes(searchName.toLowerCase());
    return statusMatch && blockMatch && yearMatch && reqMatch && nameMatch;
  });

  if (isLoading) {
    return <div>Loading Officer Info...</div>;
  }

  if (!officer) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="officer-manage-membership-layout">
      <OfficerSidebar 
        officer={officer} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        className="officer-membership-sidebar"
      />
      <div className="officer-manage-membership-page">
        <div className="dashboard-header">
          <div className="dashboard-left">
            <button className="sidebar-toggle-inside" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
            </button>
            <h1 className="dashboard-title">Manage Membership</h1>
          </div>
        </div>
              
        <div className="events-grid">
          <div className="membership-tabs">
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => handleTabChange('all')}>
              Members
            </button>
            <button className={activeTab === 'verifying' ? 'active' : ''} onClick={() => handleTabChange('verifying')}>
              Verifying
            </button>
          </div>
        </div>

        <div className="additional-filters">
          <div className="filter-item">
            <label>Block:</label>
            <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
              <option value="All">All</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Year:</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="All">All</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Requirement:</label>
            <select value={filterRequirement} onChange={(e) => setFilterRequirement(e.target.value)}>
              <option value="All">All</option>
              <option value="1st Semester Membership">1st Semester Membership</option>
              <option value="2nd Semester Membership">2nd Semester Membership</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Search Name:</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter full name..."
            />
          </div>
        </div>

        <table className="membership-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Block</th>
              <th>Year</th>
              <th>Requirement</th>
              {activeTab === 'verifying' && <th>Receipt Image</th>}
              <th>Status</th>
              {activeTab === 'verifying' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMemberships.map((m) => (
              <tr key={m.id}>
                <td>{m.user?.full_name || '-'}</td>
                <td>{m.user?.block || '-'}</td>
                <td>{m.user?.year || '-'}</td>
                <td>{m.requirement || '-'}</td>
                {activeTab === 'verifying' && (
                  <td>
                    {m.receipt_path ? (
                      <img
                        src={m.receipt_path}
                        alt="Receipt"
                        width="50"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openReceiptImage(m.receipt_path)}
                        onError={() => console.error(`Failed to load receipt image: ${m.receipt_path}`)}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                )}
                <td>{activeTab === 'verifying' ? (m.status || m.payment_status || '-') : m.payment_status || '-'}</td>
                {activeTab === 'verifying' && (
                  <td>
                    <button onClick={() => handleVerifyAction(m.id, 'approve')}>Approve</button>
                    <button onClick={() => handleVerifyAction(m.id, 'deny')}>Deny</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="requirement-section">
          <h2>Membership Requirements</h2>
          <table className="membership-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((r) => (
                <tr key={`req-${r.id}`}>
                  <td>{r.requirement || '-'}</td>
                  <td>
                    <input
                      type="number"
                      value={r.amount || ''}
                      onChange={(e) =>
                        setSelectedRequirement({ ...r, amount: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => { setSelectedRequirement(r); setShowRequirementModal(true); }}>
                      Edit Price
                    </button>
                    <button onClick={() => handleRequirementArchive(r.requirement)}>
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="requirement-management">
            <button
              className="manage-qr-code-btn"
              onClick={() => setShowQRManagementModal(true)}
            >
              Manage QR Code
            </button>
            <button
              className="add-requirement-btn"
              onClick={() => setShowAddRequirementModal(true)}
            >
              Add Requirement
            </button>
          </div>
        </div>

        <OfficerMembershipModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />

        {showRequirementModal && selectedRequirement && (
          <OfficerRequirementModal
            show={showRequirementModal}
            requirementData={selectedRequirement}
            onClose={() => { setShowRequirementModal(false); setSelectedRequirement(null); }}
            onSave={(newAmount) => handleRequirementUpdate(newAmount)}
          />
        )}

        {showQRManagementModal && (
          <OfficerQRManagementModal
            show={showQRManagementModal}
            onClose={() => setShowQRManagementModal(false)}
            onQRUpload={handleQRUpload}
          />
        )}

        {showAddRequirementModal && (
          <OfficerAddRequirementModal
            show={showAddRequirementModal}
            onClose={() => setShowAddRequirementModal(false)}
            onSave={async (newReq) => {
              try {
                await createOfficerRequirement(newReq, token);
                alert("Requirement added successfully!");
                const updated = await getOfficerRequirements(token);
                setRequirements(updated);
                setShowAddRequirementModal(false);
              } catch (error) {
                console.error("Error adding requirement:", error);
                if (error.response?.status === 401) {
                  localStorage.removeItem('officerAccessToken');
                  localStorage.removeItem('officerInfo');
                  navigate('/officer-login');
                } else {
                  alert(`Error adding requirement: ${error.response?.data?.detail || 'Unknown error'}`);
                }
              }
            }}
          />
        )}

        {showDenialReasonModal && (
          <OfficerDenialReasonModal
            show={showDenialReasonModal}
            onClose={() => { setShowDenialReasonModal(false); setSelectedMembershipId(null); }}
            onSubmit={handleDenialReasonSubmit}
          />
        )}
      </div>
    </div>
  );
};

const OfficerRequirementModal = ({ show, requirementData, onClose, onSave }) => {
  const [amount, setAmount] = useState(requirementData.amount || '');

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(amount);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Edit Requirement: {requirementData.requirement}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Price:</label>
            <input type="number" value={amount} onChange={handleChange} required />
          </div>
          <button type="submit">Save Price</button>
        </form>
      </div>
    </div>
  );
};

const OfficerQRManagementModal = ({ show, onClose, onQRUpload }) => {
  const token = localStorage.getItem('officerAccessToken');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState("paymaya");
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQRCodeData = async () => {
    setIsLoading(true);
    setQrError(null);
    try {
      const data = await getQRCode(selectedType, token);
      if (data && data.qr_code_url) {
        setQrPreviewUrl(data.qr_code_url);
      } else {
        setQrPreviewUrl(null);
        setQrError(`No QR code available for ${selectedType}.`);
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      setQrPreviewUrl(null);
      setQrError(error.response?.data?.detail || `Failed to load QR code for ${selectedType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !show) return;
    fetchQRCodeData();
  }, [selectedType, token, show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setQrError("Please select an image file.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setQrError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setQrError("No file selected.");
      return;
    }
    setIsLoading(true);
    try {
      await onQRUpload(selectedType, selectedFile);
      setSelectedFile(null);
      setQrError(null);
      // Refresh QR code preview
      await fetchQRCodeData();
    } catch (error) {
      setQrError(`Failed to upload QR code: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Manage QR Code</h2>
        <div className="qr-code-preview">
          {isLoading ? (
            <p>Loading QR code...</p>
          ) : qrError ? (
            <p className="qr-error">{qrError}</p>
          ) : qrPreviewUrl ? (
            <img 
              src={qrPreviewUrl} 
              alt="QR Code Preview" 
              onError={() => setQrError("Failed to load QR code image. The image may be inaccessible.")} 
            />
          ) : (
            <p>No QR Code Uploaded</p>
          )}
        </div>
        <div className="form-field">
          <label>Select Payment Type:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="paymaya">PayMaya</option>
            <option value="gcash">GCash</option>
          </select>
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={isLoading}
          />
          <button type="submit" disabled={!selectedFile || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload New QR Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

const OfficerAddRequirementModal = ({ show, onClose, onSave }) => {
  const [requirement, setRequirement] = useState("1st Semester Membership");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    await onSave({ requirement, amount });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Add Requirement</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Requirement:</label>
            <select value={requirement} onChange={(e) => setRequirement(e.target.value)}>
              <option value="1st Semester Membership">1st Semester Membership</option>
              <option value="2nd Semester Membership">2nd Semester Membership</option>
            </select>
          </div>
          <div className="form-field">
            <label>Amount:</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Add Requirement</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerManageMembershipPage;
