import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import minilogo from '../../assets/minilogo.png';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        {
            path: '/admin/dashboard', label: 'Dashboard', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            )
        },

        {
            path: '/admin/employees', label: 'Employees', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            )
        },
        {
            path: '/admin/interactions', label: 'Interactions', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            )
        },

        {
            path: '/admin/policies', label: 'Policy Hub', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            )
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`bg-zuari-navy text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} shadow-xl z-20`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className=" bg-white p-2 rounded-lg  flex justify-center w-full">
                            <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari" className="h-8 w-auto " />
                        </div>
                    ) : (
                        <div className="  bg-white p-2 rounded-lg mx-auto flex justify-center">
                            <img src={minilogo} alt="Zuari Admin" className="h-10 w-auto " />

                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`${location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            {isSidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-8 shadow-sm z-10">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-800 dark:text-white">{user?.name}</div>
                            <div className="text-xs text-blue-500 font-bold tracking-wider uppercase">Administrator</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
