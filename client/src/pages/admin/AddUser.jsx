import React, { useState } from 'react';
import { adminAPI } from '../../api/admin.api';
import './AddUser.css'; // We will create this CSS next

const AddUser = () => {
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  
  // Single State object for all form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    departmentId: 'CSE', // Default to first dept
    batch: '',
    qualification: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pass 'role' along with the form data
      await adminAPI.addUser({ ...formData, role });
      alert("✅ User Created Successfully!");
      
      // Reset Form
      setFormData({
        name: '', email: '', password: '', rollNumber: '',
        departmentId: 'CSE', batch: '', qualification: ''
      });
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Add New User</h2>
        <p>Create credentials for Students or Faculty</p>

        {/* Role Toggles */}
        <div className="role-toggle">
          <button 
            className={role === 'Student' ? 'active' : ''} 
            onClick={() => setRole('Student')}
          >
            Student
          </button>
          <button 
            className={role === 'Faculty' ? 'active' : ''} 
            onClick={() => setRole('Faculty')}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* --- Common Fields --- */}
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="rahul@college.edu" />
          </div>

          <div className="form-group">
            <label>Login ID / Roll No</label>
            <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder={role === 'Student' ? "e.g. 21CSE101" : "e.g. FAC001"} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="******" />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select name="departmentId" value={formData.departmentId} onChange={handleChange}>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="MECH">Mechanical</option>
            </select>
          </div>

          {/* --- Dynamic Fields --- */}
          {role === 'Student' ? (
            <div className="form-group fade-in">
              <label>Batch Year</label>
              <input type="number" name="batch" value={formData.batch} onChange={handleChange} placeholder="e.g. 2024" />
            </div>
          ) : (
            <div className="form-group fade-in">
              <label>Qualification</label>
              <input name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. M.Tech, PhD" />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : `Create ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;