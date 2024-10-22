import { useEffect, useState } from 'react';
import axios from "axios";
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", phone: "", status: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const usersPerPage = 5;

  // Fetch all users
  const getAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    filterUsers(filterStatus, searchText);
  };

  // Handle filter change for status
  const handleFilterStatusChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    filterUsers(status, "");
  };

  // Filter users based on status and search input
  const filterUsers = (status, searchText) => {
    let filtered = users;

    // Apply status filter
    if (status === "active") {
      filtered = users.filter(user => user.status === true);
    } else if (status === "inactive") {
      filtered = users.filter(user => user.status === false);
    }

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText)
      );
    }

    setFilteredUsers(filtered);
  };

  // Handle delete user
  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure you want to delete this user?");
    if (isConfirm) {
      try {
        await axios.delete(`http://localhost:8000/users/${id}`);
        console.log("User deleted successfully");
        getAllUsers(); // Refresh the user list after deletion
      } catch (error) {
        console.error("Error deleting user", error);
      }
    }
  };

  // Add new user
  const handleAddRecord = () => {
    setUserData({ name: "", email: "", phone: "", status: true });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    getAllUsers(); // Refresh the user list when modal closes
  };

  // Handle input changes
  const handleData = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: name === "status" ? (value === "true") : value // Convert string to boolean for status
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.name || !userData.email || !userData.phone) {
      alert("All fields are required.");
      return;
    }

    try {
      if (userData.id) {
        // Update existing user
        const response = await axios.patch(`http://localhost:8000/users/${userData.id}`, userData);
        console.log("User updated:", response.data);
      } else {
        // Add new user
        const response = await axios.post("http://localhost:8000/users", userData);
        console.log("User added:", response.data);
      }
      closeModal(); // Close modal and refresh user list
    } catch (error) {
      console.error("Error saving user data", error);
    }
  };

  // Update user function
  const handleUpdateRecord = (user) => {
    setUserData(user);
    setIsModalOpen(true);
  };

  // Handle pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className="container">
        <h3>User Management Dashboard</h3>

        <div className="input-search">
          <input type="search" placeholder='Search here' onChange={handleSearchChange} />

          {/* Status filter dropdown */}
          <select onChange={handleFilterStatusChange} value={filterStatus}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className='btn green' onClick={handleAddRecord}>Add Record</button>
        </div>

        <table className='table'>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers && currentUsers.map((user, index) => (
              <tr key={user.id}>
                {/* Updated S.No calculation */}
                <td>{(currentPage - 1) * usersPerPage + index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.status ? "Active" : "Inactive"}</td>
                <td>
                  <button className='btn green' onClick={() => handleUpdateRecord(user)}>Edit</button>
                </td>
                <td>
                  <button className='btn red' onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
          <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}>Next</button>
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className='modal'>
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>{userData.id ? "Edit" : "Add"} User</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" value={userData.name} onChange={handleData} name='name' id='name' required />
                </div>
                <div className='input-group'>
                  <label htmlFor="email">E-Mail</label>
                  <input type="email" value={userData.email} onChange={handleData} name='email' id='email' required />
                </div>
                <div className='input-group'>
                  <label htmlFor="phone">Phone Number</label>
                  <input type="number" value={userData.phone} onChange={handleData} name='phone' id='phone' required />
                </div>
                <div className='input-group'>
                  <label htmlFor="status">Status</label>
                  <select name="status" id="status" value={userData.status} onChange={handleData}>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <button className="btn green" type="submit">{userData.id ? "Update" : "Add"} User</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
