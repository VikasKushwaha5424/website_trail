import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;

  const isActive = (path) => pathname.includes(path);

  return (
    <aside
      className={`absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-800 duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-6">
        <Link to="/admin/dashboard" className="flex items-center gap-3 text-2xl font-bold text-white">
           {/* Your Primary Color Icon */}
           <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-slate-900">
             🎓
           </div>
           <span>COLLEGE</span>
        </Link>

        <button onClick={() => setSidebarOpen(false)} className="block lg:hidden text-white">
          ✕
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <h3 className="mb-4 ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</h3>
          <ul className="mb-6 flex flex-col gap-2">

            {/* Link Item */}
            <li>
              <Link
                to="/admin/dashboard"
                className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out ${
                  isActive('/admin/dashboard') 
                    ? 'bg-primary text-slate-900 shadow-md'  /* Active: Pastel BG + Dark Text */
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                📊 Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/admin/students"
                className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out ${
                  isActive('/admin/students') 
                    ? 'bg-primary text-slate-900 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                👨‍🎓 Students
              </Link>
            </li>

            <li>
              <Link
                to="/admin/faculty"
                className={`group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out ${
                  isActive('/admin/faculty') 
                    ? 'bg-primary text-slate-900 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                👩‍🏫 Faculty
              </Link>
            </li>

          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;