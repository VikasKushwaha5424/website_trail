import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none border-b border-gray-200 dark:border-strokedark">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        
        {/* --- LEFT SIDE: Hamburger & Logo --- */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle Button */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <span className="block h-5.5 w-5.5 cursor-pointer">
              <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!sidebarOpen ? '!w-full delay-300' : 'w-0'}`}></span>
              <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!sidebarOpen ? 'delay-400 !w-full' : 'w-0'}`}></span>
              <span className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!sidebarOpen ? '!w-full delay-500' : 'w-0'}`}></span>
            </span>
          </button>

          {/* Logo (Mobile Only) */}
          <Link className="block flex-shrink-0 lg:hidden" to="/">
             <span className="text-xl font-bold text-black dark:text-white">🎓</span>
          </Link>
        </div>

        {/* --- CENTER: Search Bar --- */}
        <div className="hidden sm:block">
          <form action="#" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill="" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill="" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>
        </div>

        {/* --- RIGHT SIDE: Actions & Profile --- */}
        <div className="flex items-center gap-3 2xl:gap-7">
          <ul className="flex items-center gap-2 2xl:gap-4">
            
            {/* Dark Mode Toggle (Simplified Placeholder) */}
            <li>
                <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                    🌙
                </button>
            </li>

            {/* Notification Bell (Simplified) */}
            <li>
              <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                 🔔
                 <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1"></span>
              </button>
            </li>
          </ul>

          {/* User Profile Area */}
          <div className="relative">
            <Link className="flex items-center gap-4" to="#">
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-black dark:text-white">
                  Admin User
                </span>
                <span className="block text-xs">Administrator</span>
              </span>
              <span className="h-12 w-12 rounded-full overflow-hidden">
                <img 
                    src="https://ui-avatars.com/api/?name=Admin+User&background=3C50E0&color=fff" 
                    alt="User" 
                />
              </span>
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;