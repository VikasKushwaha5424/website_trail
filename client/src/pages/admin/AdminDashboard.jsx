import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user?.name} (Roll: {user?.rollNumber})</p>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};
export default StudentDashboard;