
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            await login(email, password);
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
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">AI Policy Navigator</p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
                            <div id="progressBarFill" className="h-full bg-gradient-to-r from-zuari-navy to-blue-500 progress-bar-fill"></div>
                        </div>
                        <p id="subStatus" className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Setting up secure session...</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="bg-grid"></div>
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

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
                    <div className="animate-up mb-6 px-5 py-1.5 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-100 dark:border-blue-800 rounded-full">
                        <span className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Corporate Internal Portal</span>
                    </div>

                    <h1 className="animate-up text-5xl md:text-7xl font-extrabold text-center mb-4 tracking-tight">Zuari EPG</h1>
                    <h2 className="animate-up text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 text-center text-balance">Employee Policy Gateway</h2>

                    <p className="animate-up text-gray-500 text-center max-w-xl text-lg mb-10 leading-relaxed text-balance">
                        Instant access to company guidelines, benefits, and HR procedures through our AI-powered Policy Navigator.
                    </p>

                    <div className="animate-up w-full max-w-md glass rounded-[32px] p-8 md:p-10 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Work Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 px-5 outline-none text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-current"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-xs px-2">{error}</div>
                            )}

                            <button type="submit" disabled={isLoading} className="w-full bg-zuari-navy hover:bg-[#122856] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
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
                    </div>
                </main>

                <footer className="w-full py-8 text-center text-[10px] font-medium text-gray-400 tracking-widest uppercase">
                    &copy; 2026 Zuari Industries Limited.
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
