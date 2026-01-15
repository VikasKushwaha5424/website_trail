import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Assuming you have this utility based on file list

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-8 text-center">No profile found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-l-4 border-blue-600">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
          {profile.firstName?.[0]}{profile.lastName?.[0]}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-500 font-medium">{profile.rollNumber}</p>
          <span className={`inline-block px-3 py-1 mt-2 text-xs font-semibold rounded-full 
            ${profile.currentStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {profile.currentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Academic Information</h2>
          <div className="space-y-3">
            <InfoRow label="Department" value={profile.departmentId?.name || 'N/A'} />
            <InfoRow label="Department Code" value={profile.departmentId?.code || 'N/A'} />
            <InfoRow label="Batch Year" value={profile.batchYear} />
            <InfoRow label="Current Semester" value={`Semester ${profile.currentSemester}`} />
          </div>
        </div>

        {/* Contact & Guardian Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Contact & Personal</h2>
          <div className="space-y-3">
            <InfoRow label="Email" value={profile.userId?.email} />
            <InfoRow label="Guardian Name" value={profile.guardianDetails?.name || 'Not Provided'} />
            <InfoRow label="Guardian Phone" value={profile.guardianDetails?.phone || 'Not Provided'} />
            <InfoRow label="Updated At" value={new Date(profile.updatedAt).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for consistent rows
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-100 py-2 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-800 font-medium text-sm text-right">{value}</span>
  </div>
);

export default StudentProfile;