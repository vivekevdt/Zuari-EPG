import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_MS_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MS_TENANT_ID}`,
        redirectUri: import.meta.env.VITE_MS_REDIRECT_URI,
        postLogoutRedirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        // Must be false — prevents MSAL from navigating back to the page
        // where loginRedirect was triggered (the homepage modal).
        navigateToLoginRequestUrl: false,
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (!containsPii && import.meta.env.DEV && level <= LogLevel.Warning) {
                    console.warn('[MSAL]', message);
                }
            },
        },
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);
