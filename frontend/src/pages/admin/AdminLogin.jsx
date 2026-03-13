import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, LayoutDashboard, Mail, Lock } from 'lucide-react';
import { login } from '../../api';

const AdminLogin = () => {
    const { user, finalizeLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && (user.roles?.includes('admin') || user.roles?.includes('superAdmin'))) {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            setIsLoading(true);
            const userData = await login(email, password);
            finalizeLogin(userData);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A101D] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
            </div>

            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2 transition-colors z-10 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="relative z-10 w-full max-w-[420px] rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl bg-white/5 p-10">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 border border-white/10">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-[28px] font-bold text-white tracking-tight mb-2">Admin Portal</h2>
                    <p className="text-white/40 text-[14px]">Secure access for administrators</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/70 ml-1">Admin Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="admin@zuari.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-white/70 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-bold text-white text-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Secure Login'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-white/30 text-xs text-center leading-relaxed px-4">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Protected Area. Authorized personnel only. Access is monitored.</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
