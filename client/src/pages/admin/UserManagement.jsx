import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Edit, Trash, Plus } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("student"); // 'student' | 'faculty'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student",
    rollNumber: "", batchYear: "", // Student specific
    designation: "", qualification: "", departmentId: "" // Faculty specific
  });

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/admin/users?role=${roleFilter}&page=${page}&limit=10`);
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  // Handle Delete
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure? This will delete all related data.")) return;
    try {
      // Note: Delete request with body requires 'data' key in axios
      await api.delete("/admin/delete-user", { data: { userId } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // Handle Submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put("/admin/update-user", { ...formData, userId: formData._id });
      } else {
        await api.post("/admin/add-user", formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", password: "", role: roleFilter, rollNumber: "", batchYear: "", designation: "", qualification: "", departmentId: "" });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    // Populate form (User object structure might vary, adjust fields as necessary)
    setFormData({ ...user, password: "" }); // Don't show hash
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {["student", "faculty"].map((role) => (
          <button 
            key={role}
            onClick={() => { setRoleFilter(role); setPage(1); }}
            className={`px-4 py-2 capitalize ${roleFilter === role ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-500"}`}
          >
            {role}s
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4 uppercase text-xs font-bold text-gray-500">{user.role}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEditModal(user)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>

      {/* Modal (Simplified for Logic) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit" : "Add"} {roleFilter}</h3>
            
            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            {!isEditing && <input className="w-full border p-2 mb-2 rounded" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />}
            
            {/* Conditional Fields */}
            {roleFilter === "student" && (
              <>
                <input className="w-full border p-2 mb-2 rounded" placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                <input className="w-full border p-2 mb-2 rounded" placeholder="Batch Year (e.g. 2024)" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} />
              </>
            )}
            
            {roleFilter === "faculty" && (
              <>
                <input className="w-full border p-2 mb-2 rounded" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                <input className="w-full border p-2 mb-2 rounded" placeholder="Department ID/Code" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} required />
              </>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default UserManagement;