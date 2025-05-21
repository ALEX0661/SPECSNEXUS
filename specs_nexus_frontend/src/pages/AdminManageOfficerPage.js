import React, { useEffect, useState } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficers,
  getUsers,
  createOfficersBulk,
  createOfficer,
  updateOfficer,
  deleteOfficer,
} from '../services/officerService';
import OfficerModal from '../components/OfficerModal';
import '../styles/AdminManageOfficerPage.css';

const AdminManageOfficerPage = () => {
  const [officers, setOfficers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOfficers();
    fetchUsers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const data = await getOfficers();
      setOfficers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNewOfficer = () => {
    setSelectedOfficer(null);
    setShowModal(true);
  };

  const handleAddFromUsers = () => {
    setShowUserModal(true);
  };

  const handleEdit = (officer) => {
    setSelectedOfficer(officer);
    setShowModal(true);
  };

  const handleDelete = async (officerId) => {
    if (!window.confirm("Are you sure you want to delete this officer?")) return;
    try {
      await deleteOfficer(officerId);
      fetchOfficers();
    } catch (error) {
      console.error(error);
      alert("Error deleting officer");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOfficerIds.length === 0) {
      alert("No officers selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected officers?")) return;
    try {
      await Promise.all(selectedOfficerIds.map((id) => deleteOfficer(id)));
      alert("Selected officers deleted successfully!");
      fetchOfficers();
      setSelectedOfficerIds([]);
    } catch (error) {
      console.error(error);
      alert("Error deleting selected officers");
    }
  };

  const handleCheckboxChange = (officerId, isChecked) => {
    if (isChecked) {
      setSelectedOfficerIds(prev => [...prev, officerId]);
    } else {
      setSelectedOfficerIds(prev => prev.filter(id => id !== officerId));
    }
  };

  const handleUserCheckboxChange = (userId, isChecked) => {
    if (isChecked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = officers.map(o => o.id);
      setSelectedOfficerIds(allIds);
    } else {
      setSelectedOfficerIds([]);
    }
  };

  const handleSelectAllUsers = (isChecked) => {
    if (isChecked) {
      const filteredUsers = users.filter(user =>
        (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.student_number || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      const allIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUserIds([]);
    setSearchQuery('');
  };

  const handleSave = async (formData, officerId) => {
    try {
      if (officerId) {
        await updateOfficer(officerId, formData);
        alert("Officer updated successfully!");
      } else {
        await createOfficer(formData);
        alert("Officer added successfully!");
      }
      setShowModal(false);
      fetchOfficers();
    } catch (error) {
      console.error(error);
      alert("Error saving officer");
    }
  };

  const handleSaveUsers = async () => {
    if (selectedUserIds.length === 0) {
      alert("No users selected.");
      return;
    }
    try {
      await createOfficersBulk(selectedUserIds, "Officer");
      alert("Officers added successfully!");
      setShowUserModal(false);
      setSelectedUserIds([]);
      setSearchQuery('');
      fetchOfficers();
    } catch (error) {
      console.error(error);
      alert("Error adding officers");
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.student_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OfficerLayout>
      <div className="officer-manage-officers-page">
        <h1>Manage Officers</h1>
        <div className="top-actions">
          <button className="add-officer-btn" onClick={handleAddNewOfficer}>
            ADD NEW OFFICER
          </button>
          <button className="add-from-users-btn" onClick={handleAddFromUsers}>
            ADD FROM USERS
          </button>
          <button className="delete-selected-btn" onClick={handleBulkDelete}>
            Delete Selected
          </button>
        </div>
        <div className="officers-table-container">
          <table className="officers-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={e => handleSelectAll(e.target.checked)}
                    checked={selectedOfficerIds.length === officers.length && officers.length > 0}
                  />
                </th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Block</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOfficerIds.includes(officer.id)}
                      onChange={e => handleCheckboxChange(officer.id, e.target.checked)}
                    />
                  </td>
                  <td>{officer.full_name ? `${officer.full_name} (${officer.student_number || '-'})` : '-'}</td>
                  <td>{officer.email || '-'}</td>
                  <td>{officer.year || '-'}</td>
                  <td>{officer.block || '-'}</td>
                  <td>{officer.position || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(officer)}>Edit</button>
                    <button onClick={() => handleDelete(officer.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <OfficerModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialOfficer={selectedOfficer}
        />
      )}
      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Users as Officers</h2>
            <input
              type="text"
              className="search-bar"
              placeholder="Search by name or student number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={e => handleSelectAllUsers(e.target.checked)}
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                      />
                    </th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Year</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={e => handleUserCheckboxChange(user.id, e.target.checked)}
                        />
                      </td>
                      <td>{user.full_name ? `${user.full_name} (${user.student_number || '-'})` : '-'}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.year || '-'}</td>
                      <td>{user.block || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveUsers}>Add Officers</button>
              <button onClick={handleCloseUserModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default AdminManageOfficerPage;