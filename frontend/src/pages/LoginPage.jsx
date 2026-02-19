import React, { useState, useEffect } from 'react';
import { activateAccount, forgotPassword } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import backgroundVideo from '../assets/background_image.mp4';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showActivation, setShowActivation] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initializing Workspace...");
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Apply theme for the body to match login design
        document.body.className = "h-screen flex flex-col relative transition-colors duration-500 overflow-hidden";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userData = await login(email, password);

            // Check if account needs activation (first time login)
            if (userData && userData.is_account_activated === false) {
                setShowActivation(true);
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            setShowLoader(true);

            // Simulating the loading sequence from the HTML design
            const statusMessages = ["Authenticating Credentials...", "Syncing Policy Database...", "Finalizing AI Environment..."];
            let idx = 0;
            const statusInterval = setInterval(() => {
                idx++;
                if (idx < statusMessages.length) setLoadingMessage(statusMessages[idx]);
                else clearInterval(statusInterval);
            }, 1000);

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleActivation = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            await activateAccount(email, password, newPassword);

            // Re-login with new password to update context/token
            await login(email, newPassword);

            setShowActivation(false);
            setIsLoading(false);
            setShowLoader(true);

            const statusMessages = ["Updating Credentials...", "Activating Account...", "Logging In..."];
            let idx = 0;
            const statusInterval = setInterval(() => {
                idx++;
                if (idx < statusMessages.length) setLoadingMessage(statusMessages[idx]);
                else clearInterval(statusInterval);
            }, 1000);

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message || "Activation failed");
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await forgotPassword(email);
            setIsLoading(false);
            toast.success("Email sent! Please check your inbox.");
            setShowForgotPassword(false);
        } catch (err) {
            setError(err.message || "Failed to send reset email");
            setIsLoading(false);
            toast.error(err.message || "Failed to send reset email");
        }
    };

    if (showLoader) {
        return (
            <>
                <div className="bg-grid"></div>
                <div className="ambient-glow glow-1"></div>
                <div className="ambient-glow glow-2"></div>

                {/* Ambient Glow */}
                <div className="fixed w-[500px] h-[500px] bg-zuari-navy rounded-full blur-[80px] z-[-1] opacity-10 top-[-100px] right-[-100px] animate-pulse"></div>
                <div className="fixed w-[400px] h-[400px] bg-zuari-blue rounded-full blur-[80px] z-[-1] opacity-10 bottom-[-50px] left-[-100px] animate-pulse delay-700"></div>

                <div id="loadingInterface" className="flex-1 flex flex-col items-center justify-center animate-up px-6 h-screen">
                    <div className="w-full max-w-sm text-center">
                        <div className="relative w-24 h-24 mx-auto mb-10">
                            <div className="absolute inset-0 bg-zuari-navy/10 rounded-full animate-ping"></div>
                            <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full shadow-xl">
                                <svg className="w-10 h-10 text-zuari-navy dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h3 id="loadStatus" className="text-lg font-bold tracking-tight transition-all duration-300">{loadingMessage}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">AskHR</p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
                            <div id="progressBarFill" className="h-full bg-linear-to-r from-zuari-navy to-blue-500 progress-bar-fill"></div>
                        </div>
                        <p id="subStatus" className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Setting up secure session...</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover opacity-40"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
                {/* Overlay to ensure text readability */}
                {/* Overlay removed as requested */}
            </div>

            <div className="bg-grid absolute inset-0 z-0 opacity-10"></div>
            <div className="ambient-glow glow-1 opacity-50"></div>
            <div className="ambient-glow glow-2 opacity-50"></div>

            {/* 1. LOGIN INTERFACE */}
            <div id="loginInterface" className="flex flex-col h-full transition-opacity duration-500">
                <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-start z-50">
                    <div className="logo-capsule">
                        <img src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png" alt="Zuari" className="h-8 w-auto" />
                    </div>
                    <div className="logo-capsule">
                        <img src="https://www.zuariindustries.in/assets/web/img/logo/adventz.png" alt="Adventz" className="h-8 w-auto" />
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-12 relative z-10">
                    <div>
                        <div className="animate-up mb-8 flex gap-4 ">
                            <h1 className="animate-up text-5xl md:text-7xl font-extrabold text-center mb-4 tracking-tight">AskHR</h1>
                            <div className="w-24 h-24 mx-auto bg-linear-to-br from-zuari-navy to-blue-600 rounded-[2rem] shadow-2xl shadow-blue-900/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                            </div>
                        </div>
                    </div>
                    <h2 className="animate-up text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 text-center text-balance">Your HR Assistant</h2>

                    <p className="animate-up text-gray-500 text-center max-w-xl text-lg mb-10 leading-relaxed text-balance">
                        Instant access to company guidelines, benefits, and HR procedures through AskHR.
                    </p>

                    <div className="animate-up w-full max-w-md bg-transparent border border-white/20 shadow-2xl rounded-[32px] p-8 md:p-10 mb-8">
                        {showActivation ? (
                            <form onSubmit={handleActivation} className="space-y-6 animate-up">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-zuari-navy dark:text-white">Activate Account</h3>
                                    <p className="text-xs text-zuari-navy/80 mt-2">Please set a new password to activate your account.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        disabled
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-xs px-2">{error}</div>
                                )}

                                <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-green-900/20">
                                    {isLoading ? (
                                        <>
                                            <span>Activating...</span>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </>
                                    ) : (
                                        <span>Activate & Login</span>
                                    )}
                                </button>
                            </form>
                        ) : showForgotPassword ? (
                            <form onSubmit={handleForgotPassword} className="space-y-6 animate-up">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-zuari-navy dark:text-white">Reset Password</h3>
                                    <p className="text-xs text-zuari-navy/80 mt-2">Enter your email to receive a temporary password.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-xs px-2">{error}</div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotPassword(false); setError(''); }}
                                        className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-4 bg-zuari-navy hover:bg-[#122856] text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Email'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                    />
                                </div>

                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotPassword(true); setError(''); }}
                                        className="text-[10px] font-bold uppercase tracking-widest text-zuari-navy hover:text-blue-700 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {error && (
                                    <div className="text-red-400 text-xs px-2 font-semibold">{error}</div>
                                )}

                                <button type="submit" disabled={isLoading} className="w-full bg-zuari-navy hover:bg-[#122856] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 border border-transparent hover:border-blue-400">
                                    {isLoading ? (
                                        <>
                                            <span>Authenticating...</span>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </>
                                    ) : (
                                        <span>Log In to Dashboard</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </main>

                <footer className="w-full py-8 text-center text-[10px] font-medium text-white/60 tracking-widest uppercase relative z-10">
                    &copy; 2026 Zuari Industries Limited.
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
