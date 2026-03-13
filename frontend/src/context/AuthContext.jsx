import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { microsoftLogin as microsoftLoginAPI } from '../api';
import { useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { instance } = useMsal();
    const msHandled = useRef(false);

    // Restore user from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (!parsed.roles && parsed.role) parsed.roles = [parsed.role];
                setUser(parsed);
            }
        } catch { /* ignore corrupt data */ }
    }, []);

    // Handle Microsoft SSO redirect result
    useEffect(() => {
        const handleMicrosoftResult = async (result) => {
            if (msHandled.current || !result?.idToken) return;
            msHandled.current = true;

            try {
                const userData = await microsoftLoginAPI(result.idToken);
                localStorage.setItem('userInfo', JSON.stringify(userData));
                setUser(userData);

                if (userData.roles?.includes('superAdmin')) window.location.href = '/super-admin/dashboard';
                else if (userData.roles?.includes('admin')) window.location.href = '/admin/dashboard';
                else window.location.href = '/chat';
            } catch (err) {
                msHandled.current = false;
                toast.error('You do not have access to this application. Please contact HR.', {
                    duration: 6000, position: 'top-center'
                });
                setLoading(false);
            }
        };

        instance.handleRedirectPromise()
            .then(handleMicrosoftResult)
            .catch(console.error)
            .finally(() => {
                if (!msHandled.current) setLoading(false);
            });

        const id = instance.addEventCallback(async ({ eventType, payload }) => {
            if (eventType === EventType.LOGIN_SUCCESS) await handleMicrosoftResult(payload);
        });

        return () => instance.removeEventCallback(id);
    }, [instance]);

    const logout = () => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const { email } = JSON.parse(stored);
                if (email) sessionStorage.removeItem(`session_active_${email}`);
            }
        } catch { /* ignore */ }
        localStorage.removeItem('userInfo');
        msHandled.current = false;
        setUser(null);
    };

    const finalizeLogin = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
    };

    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#0078d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, finalizeLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
