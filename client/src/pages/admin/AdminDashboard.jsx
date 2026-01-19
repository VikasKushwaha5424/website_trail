import { useState, useEffect } from "react";
import { fetchUsersList, deleteUser, addUser, updateUser } from "../../services/adminService";
import { Edit, Trash, Plus, Search } from "lucide-react"; 
import { ROLES } from "../../constants/roles";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(ROLES.STUDENT);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", 
    role: ROLES.STUDENT, 
    rollNumber: "", batchYear: "", 
    designation: "", qualification: "", departmentId: "" 
  });

  const loadUsers = async () => {
    try {
      const data = await fetchUsersList(roleFilter, page, 10, searchTerm);
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (message) {
      console.error(message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { loadUsers(); }, 500);
    return () => clearTimeout(timer);
  }, [roleFilter, page, searchTerm]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure? This will delete all related data.")) return;
    try {
      await deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (message) {
      alert(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await updateUser({ ...formData, userId: formData._id });
        setUsers(prevUsers => prevUsers.map(u => u._id === response.user._id ? response.user : u));
      } else {
        const response = await addUser(formData);
        setUsers(prevUsers => [response.user, ...prevUsers]);
      }
      setShowModal(false);
    } catch (message) {
      alert(message);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ 
      name: "", email: "", password: "", 
      role: roleFilter, 
      rollNumber: "", batchYear: "", 
      designation: "", qualification: "", departmentId: "" 
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({ ...user, password: "" });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 border-b overflow-x-auto">
        {[ROLES.STUDENT, ROLES.FACULTY].map((role) => (
          <button 
            key={role}
            onClick={() => { setRoleFilter(role); setPage(1); setSearchTerm(""); }}
            className={`px-4 py-2 capitalize whitespace-nowrap ${roleFilter === role ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-500"}`}
          >
            {role}s
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 uppercase text-xs font-bold text-gray-500">{user.role}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEditModal(user)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={16}/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  {searchTerm ? "No users found matching your search." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition">Prev</button>
        <span className="text-gray-700">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition">Next</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit" : "Add"} {roleFilter}</h3>
            
            <div className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="w-full border p-2 rounded" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              {!isEditing && <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />}
              
              {roleFilter === ROLES.STUDENT && (
                <>
                  <input className="w-full border p-2 rounded" placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                  <input className="w-full border p-2 rounded" placeholder="Batch Year (e.g. 2024)" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} />
                </>
              )}
              
              {/* FACULTY SECTION FIX */}
              {roleFilter === ROLES.FACULTY && (
                <>
                  <input 
                    className="w-full border p-2 rounded" 
                    placeholder="Designation (e.g. Assistant Professor)" 
                    value={formData.designation} 
                    onChange={e => setFormData({...formData, designation: e.target.value})} 
                  />
                  {/* Qualification is now REQUIRED */}
                  <input 
                    className="w-full border p-2 rounded" 
                    placeholder="Qualification (e.g. Ph.D, M.Tech)" 
                    value={formData.qualification} 
                    onChange={e => setFormData({...formData, qualification: e.target.value})} 
                    required 
                  />
                  {/* Department is now REQUIRED */}
                  <input 
                    className="w-full border p-2 rounded" 
                    placeholder="Department ID (or Code)" 
                    value={formData.departmentId} 
                    onChange={e => setFormData({...formData, departmentId: e.target.value})} 
                    required 
                  />
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default UserManagement;