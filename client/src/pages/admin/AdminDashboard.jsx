import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';

// --- Internal Component: Stat Card (Updated for Pastel/Clean Look) ---
const CardDataStats = ({ title, total, children }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white py-6 px-7 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
        {/* The 'text-primary' class here ensures the SVG inside uses your pastel color */}
        {children}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-2xl font-bold text-slate-800">{total}</h4>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <DefaultLayout>
      {/* --- Page Header --- */}
      <div className="mb-8 flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-slate-800">
          Dashboard Overview
        </h2>
        <p className="text-slate-500">Welcome back, Administrator.</p>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        
        {/* Card 1: Students */}
        <CardDataStats title="Total Students" total="3,456">
           <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </CardDataStats>

        {/* Card 2: Faculty */}
        <CardDataStats title="Total Faculty" total="45">
           <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>
        </CardDataStats>

        {/* Card 3: Courses */}
        <CardDataStats title="Active Courses" total="12">
           <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 18H6v-6h6v6zm6 0h-6v-6h6v6zm0-8H6V4h12v8z"/></svg>
        </CardDataStats>

        {/* Card 4: Departments */}
        <CardDataStats title="Departments" total="5">
           <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg>
        </CardDataStats>
      </div>

      {/* --- Main Section (Recent Activity) --- */}
      <div className="mt-8 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8 rounded-xl border border-slate-200 bg-white px-6 pt-7.5 pb-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
                Recent Activity
            </h3>
            <div className="border-t border-slate-100 py-4">
                <p className="text-slate-600">Admin logged in successfully.</p>
                <span className="text-xs text-slate-400">Just now</span>
            </div>
            {/* Add more activity items here later */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminDashboard;