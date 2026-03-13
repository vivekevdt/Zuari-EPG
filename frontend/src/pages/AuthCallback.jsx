import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading page shown while AuthContext processes the Microsoft redirect result.
// AuthContext calls window.location.href once the backend responds, replacing this page.
const AuthCallback = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const done = useRef(false);
    const [timedOut, setTimedOut] = useState(false);

    // If AuthContext already set the user (fast path), navigate immediately
    useEffect(() => {
        if (user && !done.current) {
            done.current = true;
            if (user.roles?.includes('superAdmin')) navigate('/super-admin/dashboard', { replace: true });
            else if (user.roles?.includes('admin')) navigate('/admin/dashboard', { replace: true });
            else navigate('/chat', { replace: true });
        }
    }, [user, navigate]);

    // Safety fallback — go home if nothing happens in 12s
    useEffect(() => {
        const t = setTimeout(() => { if (!done.current) setTimedOut(true); }, 12000);
        return () => clearTimeout(t);
    }, []);

    if (timedOut) {
        return (
            <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center p-4">
                <div className="bg-[#333745] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-2">Login Timed Out</h2>
                    <p className="text-white/60 text-sm mb-6">Could not complete sign-in. Please try again.</p>
                    <button onClick={() => navigate('/', { replace: true })}
                        className="bg-[#203a70] hover:bg-[#152b54] text-white font-bold py-3 px-8 rounded-xl transition-all">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
            <div className="bg-[#333745] rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl border border-white/5">
                <svg width="48" height="48" viewBox="0 0 21 21" className="mx-auto mb-6" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#0078d4] rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-lg font-bold text-white mb-1">Signing you in…</h2>
                <p className="text-white/50 text-sm">Verifying your Microsoft credentials</p>
            </div>
        </div>
    );
};

export default AuthCallback;
