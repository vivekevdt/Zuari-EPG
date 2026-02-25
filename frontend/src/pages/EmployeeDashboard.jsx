
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CalendarModal from '../components/CalendarModal';
import { getConversations, getMessages, createConversation, sendMessage, deleteConversation, getAvailableEmployeePolicies } from '../api';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
    const { user: contextUser, logout } = useAuth();
    const navigate = useNavigate();
    const user = {
        name: contextUser?.name || 'Employee',
        email: contextUser?.email,
        avatar: contextUser?.avatar || null
    };
    const isAlsoAdmin = contextUser?.roles?.includes('admin') || contextUser?.roles?.includes('superAdmin');

    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [availablePolicies, setAvailablePolicies] = useState([]);

    useEffect(() => {
        // Apply dashboard-specific body classes on mount
        document.body.className = "h-screen flex flex-col relative transition-colors duration-500";
        // Check for theme in localStorage
        if (localStorage.getItem('zuari-theme') === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            // Default to light if not set
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('zuari-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [sessionsData, policiesData] = await Promise.all([
                    getConversations(),
                    getAvailableEmployeePolicies()
                ]);
                setSessions(sessionsData);
                setAvailablePolicies(policiesData);
                // We default to NO active session to show Home View
            } catch (error) {
                console.error("Failed to fetch initial Dashboard data:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!activeSessionId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const data = await getMessages(activeSessionId);
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };
        fetchMessages();
    }, [activeSessionId]);

    const handleSendMessage = async (content) => {
        if (!activeSessionId) {
            try {
                const newSession = await createConversation(content.substring(0, 30) + "...");
                setSessions([newSession, ...sessions]);
                setActiveSessionId(newSession._id);
                // Send subsequent message
                await sendMsgAPI(newSession._id, content);
            } catch (err) {
                console.error("Error creating session:", err);
            }
            return;
        }
        await sendMsgAPI(activeSessionId, content);
    };

    const sendMsgAPI = async (sessionId, content) => {
        const tempUserMsg = {
            _id: Date.now().toString(),
            role: 'user',
            content,
            updatedAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMsg]);
        setIsLoading(true);

        try {
            const response = await sendMessage(sessionId, content);
            const { botMessage } = response;
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleSelectSession = (id) => {
        setActiveSessionId(id);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleDeleteSession = async (id) => {
        setSessions(prev => prev.filter(s => (s._id || s.id) !== id));
        if (activeSessionId === id) {
            setActiveSessionId(null);
            setMessages([]);
        }
        try {
            await deleteConversation(id);
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    return (
        <div className="flex h-screen w-full relative overflow-hidden">
            <div className="bg-grid"></div>
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            {/* Switch to Admin View — fixed pill, only for dual-role users */}
            {isAlsoAdmin && (
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="fixed top-4 right-4 z-100 flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-zuari-navy/90 hover:bg-zuari-navy text-white text-sm font-bold
                               shadow-lg shadow-blue-900/30 backdrop-blur-md border border-white/10
                               transition-all hover:scale-105 active:scale-95"
                    title="Switch to Admin Dashboard"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Admin View
                </button>
            )}

            {/* Mobile Overlay */}
            <div
                id="mobileOverlay"
                className={`fixed inset-0 bg-black/20 z-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                user={user}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={handleDeleteSession}
                onLogout={logout}
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onOpenCalendar={() => { setIsCalendarOpen(true); setIsSidebarOpen(false); }}
                toggleDarkMode={toggleDarkMode}
                policies={availablePolicies}
            />

            <ChatArea
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                user={user}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                toggleDarkMode={toggleDarkMode}
            />

            <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
        </div>
    );
};

export default EmployeeDashboard;
