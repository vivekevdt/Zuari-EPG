import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    ShieldCheck,
    Search,
    LogIn,
    Menu,
    X,
    FileText,
    ChevronDown,
    BookOpen,
    Cpu,
    Lock,
    ArrowRight,
    CheckCircle2,
    List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMsal as useMsalHook } from '@azure/msal-react';
import toast, { Toaster } from 'react-hot-toast';
import womanImg from '../assets/woman.png';
import minilogo from '../assets/minilogo.png';

const MsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
);

const LoginModal = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { instance } = useMsalHook();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleMicrosoftLogin = async () => {
        try {
            setIsLoading(true);
            await instance.loginRedirect({
                scopes: ['openid', 'profile', 'User.Read'],
                redirectUri: import.meta.env.VITE_MS_REDIRECT_URI,
                prompt: 'select_account',
            });
        } catch (err) {
            setError('Could not start Microsoft login. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[380px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl"
                style={{ background: 'rgba(15, 22, 35, 0.65)' }}>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-[24px] font-bold text-white leading-tight">Welcome back</h2>
                            <p className="text-white/40 text-[13px] mt-1">Sign in to access your dashboard</p>
                        </div>
                        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors mt-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <MessageSquare className="text-white w-6 h-6" />
                            </div>
                            <span className="text-[28px] font-bold tracking-tight text-white">AskHR</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>
                    )}

                    {/* Microsoft SSO button */}
                    <button
                        onClick={handleMicrosoftLogin}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-[#1A3673] to-[#3B82F6] hover:from-[#152b54] hover:to-[#2563eb] transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <MsIcon />
                        )}
                        {isLoading ? 'Redirecting to Microsoft…' : 'Continue with Microsoft'}
                    </button>

                    <p className="text-white/25 text-[11px] text-center mt-4">
                        Only authorised Zuari employees can sign in
                    </p>
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {


    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // The employee dashboard sets overflow:hidden on body — we need to allow scrolling on this page
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevClassName = document.body.className;
        document.body.style.overflow = showLoginModal ? 'hidden' : 'auto';
        document.body.className = '';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.className = prevClassName;
        };
    }, [showLoginModal]);

    const handleStart = () => {
        if (user) {
            if (user.roles?.includes('superAdmin')) navigate('/super-admin/dashboard');
            else if (user.roles?.includes('admin')) navigate('/admin/dashboard');
            else navigate('/chat');
        } else {
            setShowLoginModal(true);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    const features = [
        {
            icon: <BookOpen className="w-6 h-6 text-zuari-blue" />,
            title: "Indexed Library",
            description: "Instantly search across all company handbooks, travel policies, and benefit summaries in one place."
        },
        {
            icon: <Cpu className="w-6 h-6 text-zuari-blue" />,
            title: "Contextual AI",
            description: "Get answers in plain language. Our AI understands the context of your question, not just keywords."
        },
        {
            icon: <Lock className="w-6 h-6 text-zuari-blue" />,
            title: "Secure & Private",
            description: "Designed strictly for internal use. Your queries are never shared outside the organization's secure network."
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Select Policy Source",
            description: "Browse the indexed library and view detailed descriptions for each policy. Choose the specific handbook or document you want to query for the most relevant results."
        },
        {
            number: "02",
            title: "Ask a Question",
            description: "Type any policy-related question into the chat interface, from 'How many leave days am I entitled to?' to 'How does leave carry-forward work?'"
        },
        {
            number: "03",
            title: "AI Analysis",
            description: "The system scans thousands of pages of verified internal documents to find the exact clause relevant to your role and location."
        },
        {
            number: "04",
            title: "Verified Response",
            description: "Receive a concise summary with citations to the original document, ensuring 100% accuracy and compliance."
        }
    ];

    const faqs = [
        {
            question: "Is AskHR connected to my personal payroll or leave balance?",
            answer: "No. AskHR is an information-only tool dedicated to policy documents. It cannot access your individual payroll data or leave balances. For personal data, please visit the HR Employee Portal."
        },
        {
            question: "How accurate is the information provided?",
            answer: "The chatbot is indexed exclusively on our latest approved company documents. Every response includes a reference to the specific document version used for the answer."
        },
        {
            question: "What should I do if the bot can't find an answer?",
            answer: "If your query isn't covered by current policy documents, the bot will provide the contact information for the specific HR department that can assist you further."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="w-full px-2 sm:px-4">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
                            <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari" className="h-12 w-auto mix-blend-multiply hidden sm:block" />
                            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>
                            <div className="flex items-center gap-2">
                                <div className="bg-zuari-navy p-2 rounded-lg">
                                    <MessageSquare className="text-white w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-zuari-navy">AskHR</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-10">
                                <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">Features</a>
                                <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">How it Works</a>
                                <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">FAQ</a>
                                {user ? (
                                    <div
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={handleStart}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-zuari-blue flex items-center justify-center text-xs font-bold text-white uppercase">
                                            {getInitials(user.name)}
                                        </div>
                                        <span className="text-sm font-bold text-zuari-navy">Go to Dashboard</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="bg-zuari-navy text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>

                            <div className="hidden sm:flex border-l border-slate-200 pl-4 h-10 items-center">
                                <img src="https://www.zuariindustries.in/assets/web/img/logo/adventz.png" alt="Adventz" className="h-12 w-auto mix-blend-multiply" />
                            </div>

                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                                    {isMenuOpen ? <X /> : <Menu />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-lg absolute w-full left-0 mt-20 z-50">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 justify-center">
                            <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari" className="h-6 w-auto mix-blend-multiply" />
                            <img src="https://www.zuariindustries.in/assets/web/img/logo/adventz.png" alt="Adventz" className="h-6 w-auto mix-blend-multiply" />
                        </div>
                        <a href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 text-slate-600 font-bold hover:text-zuari-blue">Features</a>
                        <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block py-2 text-slate-600 font-bold hover:text-zuari-blue">How it Works</a>
                        <a href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 text-slate-600 font-bold hover:text-zuari-blue">FAQ</a>
                        {user ? (
                            <button
                                onClick={handleStart}
                                className="w-full bg-zuari-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }}
                                className="w-full bg-zuari-navy text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-4 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-zuari-blue px-4 py-1.5 rounded-full text-xs font-bold mb-8 border border-blue-100 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        Internal Policy Assistant
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-zuari-navy mb-6 tracking-tight">
                        Stop Searching Handbooks.<br />
                        <span className="text-zuari-blue">Start Getting Answers.</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        AskHR is our centralized intelligence tool that understands all internal policies, allowing you to find the information you need in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleStart}
                            className="w-full sm:w-auto bg-zuari-blue text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-100/50 flex items-center justify-center gap-2"
                        >
                            Start Chatting <ArrowRight className="w-5 h-5" />
                        </button>

                    </div>
                </div>

                {/* How it Works Section (Interactive Tabs) Below Hero */}
                <div className="max-w-7xl mx-auto px-4 mt-20 pb-10">
                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12 relative z-20">
                        {[
                            "ENTERPRISE SEARCH",
                            "PERSONALIZATION",
                            "DOCUMENTS",
                            "TRUSTED SOURCES",
                            "FOLLOW-UP QUESTIONS"
                        ].map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all relative overflow-hidden ${activeTab === idx
                                    ? "text-zuari-navy border-2 border-zuari-blue/30 bg-blue-50"
                                    : "text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                {activeTab === idx && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 bg-blue-200/40"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 block whitespace-nowrap">{tab}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Area */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-8 lg:p-16 min-h-[500px] flex items-center relative overflow-visible shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),0_0_40px_-10px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-slate-900/5 backdrop-blur-sm relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col lg:flex-row gap-16 w-full items-center"
                            >
                                {/* Left Side: Text Content */}
                                <div className="lg:w-1/2 space-y-6">
                                    <h2 className="text-sm font-bold text-red-600">
                                        {activeTab === 0 && "Enterprise Search"}
                                        {activeTab === 1 && "Personalization"}
                                        {activeTab === 2 && "Documents"}
                                        {activeTab === 3 && "Trusted Sources"}
                                        {activeTab === 4 && "Follow-up Questions"}
                                    </h2>
                                    <h3 className="text-4xl font-bold text-zuari-navy leading-tight">
                                        {activeTab === 0 && "Deliver instant answers"}
                                        {activeTab === 1 && "Keep conversations relevant"}
                                        {activeTab === 2 && "Search for answers across formats"}
                                        {activeTab === 3 && "Build trust and clarity"}
                                        {activeTab === 4 && "Guide employees to clarity"}
                                    </h3>
                                    <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                                        {activeTab === 0 && 'Employees ask questions in plain language, like "How can i avail sick leave?", and AskHR provides accurate, contextual responses in seconds, reducing confusion and wait times.'}
                                        {activeTab === 1 && "AskHR remembers the employee's role and previous queries, tailoring responses so every answer feels personal and on point."}
                                        {activeTab === 2 && "From PDF and Word formats, AskHR searches across every policy document, ensuring employees get accurate information quickly, every time."}
                                        {activeTab === 3 && "Each response links to the authoritative source of truth, helping employees feel confident they're following official policies, processes, and guidelines without second-guessing."}
                                        {activeTab === 4 && "Employees can manually ask follow-up questions to dive deeper into policies, ensuring complete understanding and resolution without frustration."}
                                    </p>
                                </div>

                                {/* Right Side: Dynamic UI Card Mockups */}
                                <div className="lg:w-1/2 w-full flex items-center justify-center relative">
                                    {/* Mockup Container depending on tab */}
                                    <div className="w-full max-w-[500px] relative z-10 lg:-translate-x-12 transition-all duration-500">

                                        {/* Tab 0: Enterprise Search (MS Teams-like) */}
                                        {activeTab === 0 && (
                                            <>
                                                <div className="bg-[#f0f0f0] min-h-[300px] flex flex-col rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                                                    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center">
                                                            <MessageSquare className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-zuari-navy font-bold text-lg">AskHR</span>
                                                    </div>
                                                    <div className="flex-1 p-6 space-y-6 flex flex-col">
                                                        {/* User Message */}
                                                        <div className="flex gap-3 relative z-10 w-[95%]">
                                                            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden shrink-0"><img src={womanImg} className="w-full h-full object-cover" alt="" /></div>
                                                            <div className="bg-white p-3 rounded-lg rounded-tl-sm shadow-sm border border-slate-100 max-w-full text-sm text-slate-700">
                                                                What is the holiday list for the year?
                                                            </div>
                                                        </div>
                                                        {/* Bot Message */}
                                                        <div className="flex gap-3 self-end flex-row-reverse relative z-10 w-[95%]">
                                                            <div className="w-8 h-8 rounded-lg bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#EBEBFC] p-3 rounded-lg rounded-tr-sm shadow-sm max-w-full text-sm text-slate-800">
                                                                Sharon, you can find the 2025 holiday calendar for your location <span className="text-[#5558AF] underline font-medium cursor-pointer">here.</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Floating Badges */}
                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.3 }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
                                                    className="absolute -left-[140px] xl:-left-[180px] top-12 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-red-100/50 z-10 relative">UNDERSTANDS<br />NATURAL LANGUAGE</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -right-6 top-10 z-0 pointer-events-none">
                                                        <path d="M5 5 Q 30 5, 45 35" />
                                                        <path d="M30 35 L 45 35 L 42 20" />
                                                    </svg>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.5 }, opacity: { delay: 0.5 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 } }}
                                                    className="absolute -right-[140px] xl:-right-[180px] bottom-6 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-red-100/50 whitespace-nowrap z-10 relative">INSTANT<br />ANSWERS</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -left-6 top-2 z-0 pointer-events-none">
                                                        <path d="M48 40 Q 20 40, 5 10" />
                                                        <path d="M20 10 L 5 10 L 8 20" />
                                                    </svg>
                                                </motion.div>
                                            </>
                                        )}

                                        {/* Tab 1: Personalization (WhatsApp-like) */}
                                        {activeTab === 1 && (
                                            <>
                                                <div className="bg-[#EFEAE2] min-h-[300px] flex flex-col rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                                                    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center">
                                                            <MessageSquare className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-zuari-navy font-bold text-lg">AskHR</span>
                                                    </div>
                                                    <div className="flex-1 p-6 space-y-6 flex flex-col">
                                                        {/* User */}
                                                        <div className="flex gap-3 relative z-10 w-[95%]">
                                                            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden shrink-0"><img src={womanImg} className="w-full h-full object-cover" alt="" /></div>
                                                            <div className="bg-white py-2 px-3 rounded-xl rounded-tl-sm shadow-sm max-w-full text-sm text-slate-800">
                                                                What is my travel allowance?
                                                            </div>
                                                        </div>
                                                        {/* Bot */}
                                                        <div className="flex gap-3 self-end flex-row-reverse w-full max-w-[95%] relative z-10">
                                                            <div className="w-8 h-8 rounded-lg bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#DCF8C6] py-3 px-4 rounded-xl rounded-tr-sm shadow-sm text-sm text-slate-800 w-full relative">
                                                                As a Grade 6 Sales Manager in the Seattle office, your daily travel allowance is $200.<br />
                                                                <span className="text-[#075E54] underline font-medium block mt-1">See the full policy here.</span>
                                                                <div className="mt-2 pt-2 border-t border-green-200/50 text-[10px] text-green-700/70 flex items-center gap-1 justify-end">
                                                                    ✨ Generated and personalized for you by AI
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.3 }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.3 } }}
                                                    className="absolute -right-[140px] xl:-right-[180px] bottom-12 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-red-100/50 whitespace-nowrap z-10 relative">ROLE-SPECIFIC<br />ANSWERS</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -left-6 top-2 z-0 pointer-events-none">
                                                        <path d="M48 40 Q 20 40, 5 10" />
                                                        <path d="M20 10 L 5 10 L 8 20" />
                                                    </svg>
                                                </motion.div>
                                            </>
                                        )}

                                        {/* Tab 2: Documents */}
                                        {activeTab === 2 && (
                                            <>
                                                <div className="bg-[#f8fbff] min-h-[300px] flex flex-col border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
                                                    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center">
                                                            <MessageSquare className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-zuari-navy font-bold text-lg">AskHR</span>
                                                    </div>
                                                    <div className="flex-1 p-5 space-y-4 flex flex-col text-sm">
                                                        <div className="flex gap-2 relative z-10 w-[95%]">
                                                            <img src={womanImg} className="w-6 h-6 rounded-full" alt="" />
                                                            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-slate-700 max-w-full">How do I calculate overtime?</div>
                                                        </div>
                                                        <div className="flex gap-2 self-end flex-row-reverse relative z-10 w-[95%]">
                                                            <div className="w-6 h-6 rounded bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#E5F1FF] p-2.5 rounded-lg text-slate-800 text-right max-w-full">
                                                                Here's the relevant section explaining overtime calculation.<br />
                                                                <span className="text-[#001D4A] font-bold underline cursor-pointer">View PDF Document 📄</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 relative z-10 w-[95%]">
                                                            <img src={womanImg} className="w-6 h-6 rounded-full" alt="" />
                                                            <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-slate-700 max-w-full">Got it.</div>
                                                        </div>
                                                        <div className="flex gap-2 self-end flex-row-reverse relative z-10 w-[95%]">
                                                            <div className="w-6 h-6 rounded bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#E5F1FF] p-2.5 rounded-lg text-slate-800 max-w-full">
                                                                Anything else I can help you with?
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.3 }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
                                                    className="absolute -left-[140px] xl:-left-[180px] bottom-16 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-red-100/50 whitespace-nowrap z-10 relative">HANDLES<br />CASUAL<br />MESSAGES</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -right-6 top-0 z-0 pointer-events-none">
                                                        <path d="M5 35 Q 30 35, 45 15" />
                                                        <path d="M30 15 L 45 15 L 42 30" />
                                                    </svg>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.5 }, opacity: { delay: 0.5 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 } }}
                                                    className="absolute -right-[140px] xl:-right-[180px] top-16 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-red-100/50 whitespace-nowrap z-10 relative">ACCURATE<br />ANSWERS</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -left-6 top-8 z-0 pointer-events-none">
                                                        <path d="M48 5 Q 20 5, 5 35" />
                                                        <path d="M20 35 L 5 35 L 8 20" />
                                                    </svg>
                                                </motion.div>
                                            </>
                                        )}

                                        {/* Tab 3: Trusted Sources */}
                                        {activeTab === 3 && (
                                            <>
                                                <div className="bg-white min-h-[300px] flex flex-col rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                                                    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center">
                                                            <MessageSquare className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-zuari-navy font-bold text-lg">AskHR</span>
                                                    </div>
                                                    <div className="flex-1 p-6 space-y-6 flex flex-col">
                                                        <div className="flex gap-3 relative z-10 w-[95%]">
                                                            <img src={womanImg} className="w-8 h-8 rounded-full" alt="" />
                                                            <div className="bg-[#f4f4f4] py-2 px-3 rounded-lg text-sm text-slate-800 max-w-full">What is the performance bonus policy?</div>
                                                        </div>
                                                        <div className="flex gap-3 self-end flex-row-reverse w-full max-w-[95%] relative z-10">
                                                            <div className="w-8 h-8 rounded-lg bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#F4EDE4] py-4 px-5 rounded-lg text-sm text-slate-800 w-full relative shadow-sm text-right border border-[#4A154B]/10">
                                                                <p>The performance bonus is 15% of annual CTC, as per the official <span className="font-semibold">Rewards Policy</span>.</p>
                                                                <div className="mt-3 pt-3 border-t border-[#4A154B]/10 text-[10px] text-[#4A154B]/60 flex flex-col items-end gap-1">
                                                                    <span className="flex items-center gap-1">✨ Generated and personalized for you by AI</span>
                                                                    <span className="underline font-bold text-[#4A154B] cursor-pointer">View Source</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.3 }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.3 } }}
                                                    className="absolute -right-[140px] xl:-right-[180px] bottom-16 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg whitespace-nowrap border border-red-100/50 z-10 relative">View<br />SOURCE</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -left-6 top-4 z-0 pointer-events-none">
                                                        <path d="M48 35 Q 20 35, 5 15" />
                                                        <path d="M20 15 L 5 15 L 8 25" />
                                                    </svg>
                                                </motion.div>
                                            </>
                                        )}

                                        {/* Tab 4: Follow-up Questions */}
                                        {activeTab === 4 && (
                                            <>
                                                <div className="bg-[#F8F9FA] min-h-[300px] flex flex-col rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                                                    <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center">
                                                            <MessageSquare className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-zuari-navy font-bold text-lg">AskHR</span>
                                                    </div>
                                                    <div className="flex-1 p-5 space-y-4 flex flex-col pt-10">
                                                        <div className="flex gap-2 relative z-10 w-[95%]">
                                                            <img src={womanImg} className="w-8 h-8 rounded-full" alt="" />
                                                            <div className="bg-white py-2 px-3 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-700 max-w-full">Medical cover?</div>
                                                        </div>
                                                        <div className="flex gap-2 self-end flex-row-reverse flex-wrap justify-end relative z-10 w-[95%]">
                                                            <div className="w-8 h-8 rounded-lg bg-zuari-navy shadow-sm shrink-0 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                            </div>
                                                            <div className="bg-[#CEE0F5] py-3 px-4 rounded-lg text-sm text-[#0F2040] shadow-sm max-w-full text-left self-end">
                                                                You're covered for ₹5,00,000 under the company's group medical insurance.
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-5 pb-5 mt-auto relative z-10">
                                                        <div className="w-full bg-white border border-slate-300 rounded-full flex items-center px-4 py-2 mt-4 shadow-sm">
                                                            <div className="flex-1 outline-none text-sm text-slate-400 bg-transparent flex items-center overflow-hidden whitespace-nowrap">Type a follow-up question...</div>
                                                            <div className="w-8 h-8 bg-zuari-blue rounded-full flex items-center justify-center shrink-0 ml-2 shadow-sm">
                                                                <ArrowRight className="w-4 h-4 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                                    transition={{ x: { delay: 0.3 }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.3 } }}
                                                    className="absolute -right-[140px] xl:-right-[180px] bottom-14 font-['Caveat',cursive] text-red-600 text-[18px] leading-tight flex flex-col items-center z-30 hidden md:flex"
                                                >
                                                    <span className="bg-white/95 px-4 py-2 rounded-xl shadow-lg whitespace-nowrap border border-red-100/50 z-10 relative">FOLLOW-UP<br />QUESTIONS</span>
                                                    <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 absolute -left-6 top-5 z-0 pointer-events-none">
                                                        <path d="M48 35 Q 20 35, 5 15" />
                                                        <path d="M20 15 L 5 15 L 8 25" />
                                                    </svg>
                                                </motion.div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            < section id="features" className="py-24 border-t border-slate-100" >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold text-zuari-blue uppercase tracking-[0.2em] mb-3">Capabilities</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-zuari-navy">Purpose-Built for HR Policies</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-zuari-blue group-hover:text-white transition-all text-zuari-blue">
                                    {React.cloneElement(feature.icon, { className: "w-6 h-6 currentColor text-inherit" })}
                                </div>
                                <h4 className="text-xl font-bold mb-4 text-zuari-navy">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* How it Works Section */}
            < section id="how-it-works" className="py-24 bg-zuari-navy text-white overflow-hidden" >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Simple Retrieval</h2>
                            <h3 className="text-4xl font-bold mb-12 text-center lg:text-left">How AskHR Works</h3>
                            <div className="space-y-10">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="text-4xl font-black text-white/10">{step.number}</div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                                            <p className="text-blue-100/70 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 flex items-center justify-center">
                            <div className="relative w-full max-w-md">
                                <img
                                    src="/login-image2.jpg"
                                    alt="How AskHR Works"
                                    className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10 relative z-10"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-500/10 blur-[80px] -z-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* FAQ Section */}
            < section id="faq" className="py-24 bg-white" >
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold text-zuari-blue uppercase tracking-[0.2em] mb-3">Clarifications</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-zuari-navy">FAQ</h3>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`border rounded-2xl transition-all duration-300 ${activeFaq === i ? 'border-zuari-blue bg-blue-50/30' : 'border-slate-200 bg-white'}`}
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-zuari-navy">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180 text-zuari-blue' : ''}`} />
                                </button>
                                {activeFaq === i && (
                                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section >
        </div >
    );
};

export default HomePage;
