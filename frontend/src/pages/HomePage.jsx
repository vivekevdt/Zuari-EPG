import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    // The employee dashboard sets overflow:hidden on body — we need to allow scrolling on this page
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevClassName = document.body.className;
        document.body.style.overflow = 'auto';
        document.body.className = '';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.className = prevClassName;
        };
    }, []);

    const handleStart = () => {
        if (user) {
            if (user.roles?.includes('superAdmin')) navigate('/super-admin/dashboard');
            else if (user.roles?.includes('admin')) navigate('/admin/dashboard');
            else navigate('/chat');
        } else {
            navigate('/login');
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
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-zuari-navy p-2 rounded-lg">
                                <MessageSquare className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zuari-navy">AskHR</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-10">
                            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">Features</a>
                            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">How it Works</a>
                            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-zuari-blue">FAQ</a>
                            {user ? (
                                <div
                                    className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={handleStart}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zuari-blue flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {getInitials(user.name)}
                                    </div>
                                    <span className="text-sm font-bold text-zuari-navy">Go to Dashboard</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-zuari-navy text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-lg absolute w-full left-0 mt-20 z-50">
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
                                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
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
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 border-t border-slate-100">
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
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-zuari-navy text-white overflow-hidden">
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
                                <div className="bg-white/10 border border-white/20 rounded-3xl p-8 space-y-5">
                                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
                                        <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-200 font-semibold uppercase tracking-widest">Policy Selected</p>
                                            <p className="text-white font-bold text-sm">Leave &amp; Attendance Policy</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-xs text-blue-300 font-semibold mb-2">Employee Question</p>
                                        <p className="text-white text-sm leading-relaxed">"How many casual leaves am I entitled to in a calendar year?"</p>
                                    </div>
                                    <div className="p-4 bg-blue-600/30 border border-blue-500/30 rounded-2xl">
                                        <p className="text-xs text-blue-300 font-semibold mb-2">AI Response</p>
                                        <p className="text-white text-sm leading-relaxed">As per the Leave Policy (Section 3.1), all permanent employees are entitled to <span className="text-blue-300 font-bold">12 casual leaves</span> per calendar year, credited on a pro-rata basis.</p>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-500/10 blur-[80px] -z-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-white">
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
            </section>
        </div>
    );
};

export default HomePage;
