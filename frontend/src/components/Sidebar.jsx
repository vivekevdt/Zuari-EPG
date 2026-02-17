
import React from 'react';



const Sidebar = ({
    sessions,
    activeSessionId,
    user,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    onLogout,
    isOpen,
    toggleSidebar,
    onOpenCalendar,
    toggleDarkMode
}) => {


    return (
        <aside
            id="mainSidebar"
            className={`w-72 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-gray-100 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-70 transition-transform duration-300 md:relative ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari" className="h-10 w-auto brightness-100 dark:brightness-0 dark:invert" />
                </div>

                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-zuari-navy rounded-2xl text-[14px] font-bold text-white shadow-lg shadow-blue-900/10 hover:bg-[#122856] transition-all group active:scale-[0.98]"
                >
                    <svg className="w-4 h-4 text-white/80 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    New Discussion
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar">
                <div className="space-y-1">
                    <h4 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Recent Queries</h4>
                    <div className="space-y-1">
                        {sessions.length === 0 ? (
                            <div className="px-4 text-[11px] text-gray-400 italic">No recent history</div>
                        ) : (
                            sessions.slice(0, 5).map(session => (
                                <div
                                    key={session._id || session.id}
                                    onClick={() => onSelectSession(session._id || session.id)}
                                    className={`sidebar-item p-4 rounded-2xl cursor-pointer flex items-center justify-between gap-3 group/item ${activeSessionId === (session._id || session.id) ? 'sidebar-active text-[var(--text-main)] bg-blue-50/50 dark:bg-slate-800/50' : 'opacity-80 hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/50 dark:hover:bg-slate-800/30'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <svg className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === (session._id || session.id) ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                        <span className="text-[14px] font-semibold truncate">{session.title || 'New Conversation'}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session._id || session.id); }}
                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 text-gray-400 transition-opacity"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <p className="px-4 text-[9px] text-gray-400 mt-6 leading-tight uppercase font-bold tracking-tighter opacity-70">
                    Note: Only the most recent 5 chats will be visible in history.
                </p>
            </div>

            <div className="p-6 bg-blue-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-xl bg-zuari-navy flex items-center justify-center text-white text-xs font-bold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'EU'}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-[12px] font-black truncate leading-tight text-gray-900 dark:text-white">{user?.name || 'Employee User'}</div>
                    <button onClick={onLogout} className="text-[10px] text-red-500 font-bold uppercase tracking-tighter hover:text-red-700">Log Out</button>
                </div>
                {/* Dark Mode Toggle */}
                <button onClick={toggleDarkMode} className="p-2 ml-auto rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-700 transition-all text-gray-400 hover:text-zuari-navy dark:hover:text-blue-400 cursor-pointer">
                    <svg id="sunIcon" className="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
                    <svg id="moonIcon" className="w-4 h-4 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
                </button>
            </div>


        </aside>
    );
};

export default Sidebar;
