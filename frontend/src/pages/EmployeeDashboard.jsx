
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CalendarModal from '../components/CalendarModal';
import { getConversations, getMessages, createConversation, sendMessage, deleteConversation } from '../api';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
    const { user: contextUser, logout } = useAuth();
    const user = {
        name: contextUser?.name || "Employee",
        email: contextUser?.email,
        avatar: contextUser?.avatar || null
    };

    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
        const fetchSessions = async () => {
            try {
                const data = await getConversations();
                setSessions(data);
                // We default to NO active session to show Home View
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            }
        };
        fetchSessions();
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
