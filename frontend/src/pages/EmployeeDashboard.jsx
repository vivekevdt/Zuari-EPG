
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CalendarModal from '../components/CalendarModal';
import OnboardingModal from '../components/OnboardingModal';
import PeriodicFeedbackModal from '../components/PeriodicFeedbackModal';
import { getConversations, getMessages, createConversation, sendMessage, deleteConversation, getAvailableEmployeePolicies, getDynamicFAQs, submitFeedback } from '../api';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
    const { user: contextUser, logout } = useAuth();
    const navigate = useNavigate();
    const user = {
        name: contextUser?.name || 'Employee',
        email: contextUser?.email,
        gender: contextUser?.gender,
        avatar: contextUser?.avatar || null
    };
    const isAlsoAdmin = contextUser?.roles?.includes('admin') || contextUser?.roles?.includes('superAdmin');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
    const [availablePolicies, setAvailablePolicies] = useState([]);
    const [dynamicFaqs, setDynamicFaqs] = useState([]);
    const [isFaqLoading, setIsFaqLoading] = useState(true);
    const [selectedPolicyTitle, setSelectedPolicyTitle] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showPeriodicFeedback, setShowPeriodicFeedback] = useState(false);

    // Get user email safely for storage keys
    const getUserEmail = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? (JSON.parse(userInfo).email || 'default') : 'default';
        } catch (e) {
            return 'default';
        }
    };

    useEffect(() => {
        const userEmail = getUserEmail();
        const visitKey = `dashboard_visits_${userEmail}`;
        const sessionVisitKey = `session_active_${userEmail}`;
        const onboardingKey = `onboarding_completed_${userEmail}`;

        const hasIncrementedSession = sessionStorage.getItem(sessionVisitKey);
        let visits = parseInt(localStorage.getItem(visitKey) || '0', 10);

        // Increment visit count only once per browser tab session
        if (!hasIncrementedSession) {
            visits += 1;
            localStorage.setItem(visitKey, visits.toString());
            sessionStorage.setItem(sessionVisitKey, 'true');
        }
        console.log(hasIncrementedSession)

        const onboardingCompleted = localStorage.getItem(onboardingKey);
        const feedbackCompletedKey = `feedback_completed_visit_${visits}_${userEmail}`;
        const feedbackCompletedForThisVisit = localStorage.getItem(feedbackCompletedKey);

        console.log(visits)

        if (!onboardingCompleted && visits === 1) {
            setShowOnboarding(true);
        } else if (visits > 1 && visits % 3 === 0 && !feedbackCompletedForThisVisit) {
            setShowPeriodicFeedback(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        const userEmail = getUserEmail();
        localStorage.setItem(`onboarding_completed_${userEmail}`, 'true');
        setShowOnboarding(false);
    };

    const handlePeriodicFeedbackSubmit = async (feedbackData) => {
        const userEmail = getUserEmail();
        const visits = parseInt(localStorage.getItem(`dashboard_visits_${userEmail}`) || '0', 10);
        localStorage.setItem(`feedback_completed_visit_${visits}_${userEmail}`, 'true');

        try {
            await submitFeedback({
                userQuestion: "Periodic Experience Rating",
                aiResponse: `Rating: ${feedbackData.rating}/5. Success: ${feedbackData.successAreas.join(', ')}. Improve: ${feedbackData.improvementAreas.join(', ')}`,
                thumbs: feedbackData.rating >= 4 ? 'up' : 'down',
                description: feedbackData.suggestions || "No specific suggestions."
            });
        } catch (error) {
            console.error("Failed to submit periodic feedback:", error);
        }
        setShowPeriodicFeedback(false);
    };

    useEffect(() => {
        // Apply dashboard-specific body classes on mount
        document.body.className = "h-screen flex flex-col relative transition-colors duration-500";
        // Check for theme in localStorage
        const theme = localStorage.getItem('zuari-theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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

                if (policiesData && policiesData.length > 0) {
                    const firstPolicy = policiesData[0].title;
                    setSelectedPolicyTitle(firstPolicy);
                } else {
                    setIsFaqLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch initial Dashboard data:", error);
                setIsFaqLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchFaqs = async () => {
            if (!selectedPolicyTitle) return;
            setIsFaqLoading(true);
            try {
                const faqs = await getDynamicFAQs([selectedPolicyTitle]);
                setDynamicFaqs(faqs);
            } catch (faqError) {
                console.error("Failed to load dynamic FAQs:", faqError);
            } finally {
                setIsFaqLoading(false);
            }
        };
        fetchFaqs();
    }, [selectedPolicyTitle]);

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
            const response = await sendMessage(sessionId, content, selectedPolicyTitle);
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

            <div id="main-chat-interface" className={`flex w-full h-[100dvh] absolute inset-0 transition-all duration-500 ${(showOnboarding || showPeriodicFeedback) ? 'content-blurred' : ''}`}>

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
                    onLogout={handleLogout}
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onOpenCalendar={() => { setIsCalendarOpen(true); setIsSidebarOpen(false); }}
                    toggleDarkMode={toggleDarkMode}
                    policies={availablePolicies}
                    selectedPolicyTitle={selectedPolicyTitle}
                    onSelectPolicy={setSelectedPolicyTitle}
                    onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
                />
            

                <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleDarkMode={toggleDarkMode}
                    dynamicFaqs={dynamicFaqs}
                    isFaqLoading={isFaqLoading}
                    selectedPolicyTitle={selectedPolicyTitle}
                    setSelectedPolicyTitle={setSelectedPolicyTitle}
                    availablePolicies={availablePolicies}
                />

                <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
            </div>

            <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingComplete} />
            <PeriodicFeedbackModal isOpen={showPeriodicFeedback} onSubmitFeedback={handlePeriodicFeedbackSubmit} onClose={() => setShowPeriodicFeedback(false)} />

            {/* Policies Information Modal */}
            {isPoliciesModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Policy Information
                            </h2>
                            <button
                                onClick={() => setIsPoliciesModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {availablePolicies.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No policies are available for your profile.
                                </div>
                            ) : (
                                availablePolicies.map((policy) => (
                                    <div key={policy._id || policy.id} className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors shadow-sm">
                                        <h3 className="text-[16px] font-bold text-gray-900 dark:text-blue-100 mb-2 flex items-start gap-2">
                                            <svg className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            {policy.title}
                                        </h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                                            {policy.description || 'No detailed description provided for this policy.'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
