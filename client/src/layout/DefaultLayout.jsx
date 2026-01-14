// File: client/src/layout/DefaultLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// --- SIMPLE SIDEBAR COMPONENT (Internal for now to save you trouble) ---
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <aside className={`absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/admin/dashboard" className="text-2xl text-white font-bold mt-4">
          🎓 COLLEGE PORTAL
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden text-white">
          X
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <h3 className="mb-4 ml-4 text-sm font-semibold text-slate-400">ADMIN MENU</h3>
          <ul className="mb-6 flex flex-col gap-1.5">
            
            {/* Dashboard Link */}
            <li>
              <Link to="/admin/dashboard" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-slate-200 duration-300 ease-in-out hover:bg-slate-700 ${pathname.includes('dashboard') && 'bg-slate-700'}`}>
                Dashboard
              </Link>
            </li>

            {/* Students Link */}
            <li>
              <Link to="/admin/students" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-slate-200 duration-300 ease-in-out hover:bg-slate-700 ${pathname.includes('students') && 'bg-slate-700'}`}>
                Manage Students
              </Link>
            </li>

            {/* Faculty Link */}
            <li>
              <Link to="/admin/faculty" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-slate-200 duration-300 ease-in-out hover:bg-slate-700 ${pathname.includes('faculty') && 'bg-slate-700'}`}>
                Manage Faculty
              </Link>
            </li>

          </ul>
        </nav>
      </div>
    </aside>
  );
};

// --- SIMPLE HEADER COMPONENT ---
const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none border-b border-slate-200">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        
        {/* Hamburger Toggle (Visible on Mobile) */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            className="block rounded-sm border border-stroke bg-white p-1.5 shadow-sm"
          >
            <span className="block h-5.5 w-5.5 cursor-pointer">☰</span>
          </button>
        </div>

        {/* Header Right Side */}
        <div className="flex w-full justify-end gap-3 2xl:gap-7">
          <div className="flex items-center gap-4">
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-black">Admin User</span>
              <span className="block text-xs text-slate-500">Administrator</span>
            </span>
            <div className="h-10 w-10 rounded-full bg-slate-300 overflow-hidden">
               {/* Avatar Placeholder */}
               <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark bg-slate-100 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Page Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};

export default DefaultLayout;