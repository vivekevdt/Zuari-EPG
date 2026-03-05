import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import manImg from '../assets/man.png';
import womanImg from '../assets/woman.png';

const ChatArea = ({
    messages, isLoading, onSendMessage, user, toggleSidebar,
    toggleDarkMode, dynamicFaqs, isFaqLoading,
    selectedPolicyTitle, setSelectedPolicyTitle, availablePolicies
}) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
            // Reset textarea height after sending message
            const textarea = e.target.tagName === 'TEXTAREA' ? e.target : e.target.querySelector('textarea');
            if (textarea) textarea.style.height = '56px';
        }
    };

    const handleSuggestion = (text) => {
        onSendMessage(text);
    };

    const displayFaqs = dynamicFaqs?.length > 0 ? dynamicFaqs.slice(0, 8) : [];

    const faqStyles = [
        {
            bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        },
        {
            bg: 'bg-green-50 dark:bg-green-900/30 text-green-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        },
        {
            bg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        },
        {
            bg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        }
    ];

    const homeView = (
        <div id="homeView" className="w-full max-w-5xl mx-auto px-8 mb-4 animate-up h-full flex flex-col justify-center">
            <div className="text-left w-full flex flex-col items-start">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#1d52d9] shadow-lg shadow-blue-900/10 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none mb-1">AskHR</h1>
                        <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest">AI Policy Assistant</span>
                    </div>
                </div>

                <h2 id="dynamicGreeting" className="text-4xl font-black mb-3 tracking-tight text-[var(--text-main)]">
                    Hello, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Employee'}</span>.
                </h2>
                <p className="text-gray-400 font-medium text-lg max-w-xl">How can I assist you with company policies today?</p>

                <div className="mt-6 inline-flex items-center gap-2 bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-xl text-sm font-semibold border border-blue-100 dark:border-blue-800/30 shadow-sm">
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                    <span>Please choose a policy from the left sidebar to chat with!</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
            {/* Header */}
            {/* Header Removed */}
            <div className="absolute top-4 left-4 z-50 md:hidden">
                <button onClick={toggleSidebar} className="p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            {/* Chat History / Home View */}
            <div id="chatHistory" className={`flex-1 overflow-y-auto custom-scrollbar pt-16 md:pt-8 pb-4 ${messages.length === 0 ? 'flex flex-col justify-center' : ''}`} ref={scrollRef}>
                {messages.length === 0 ? homeView : (
                    <div className="max-w-6xl mx-auto px-3 md:px-6 space-y-6 md:space-y-8 pb-4 w-full">
                        {messages.map((msg) => (
                            <div key={msg._id || msg.id} className={`flex gap-3 md:gap-6 animate-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg ${msg.role === 'ai' || msg.role === 'assistant' ? 'bg-zuari-navy shadow-lg' : (user?.gender === 'Female' || user?.gender === 'Male' ? '' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm')} shrink-0 flex items-center justify-center`}>
                                    {msg.role === 'ai' || msg.role === 'assistant' ? (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    ) : (
                                        user?.gender === 'Female' ? (
                                            <img src={womanImg} alt="User Avatar" className="w-full h-full object-cover rounded-lg" />
                                        ) : user?.gender === 'Male' ? (
                                            <img src={manImg} alt="User Avatar" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-[9px] font-black text-gray-400">YOU</span>
                                        )
                                    )}
                                </div>
                                <div className="space-y-4 pt-1 max-w-[calc(100%-3rem)] md:max-w-[85%] min-w-0">
                                    <div className={`p-4 rounded-2xl overflow-x-auto custom-scrollbar ${msg.role === 'ai' || msg.role === 'assistant' ? 'glass text-[var(--text-main)] border border-gray-100 dark:border-slate-800' : 'bg-zuari-navy text-white shadow-md'}`}>
                                        <div className={` ${msg.role === 'user' ? 'text-right' : 'font-medium'}`}>
                                            <div
                                                className={`prose prose-sm max-w-none
                                                ${msg.role === 'user' ? 'text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-li:text-white' : 'prose-p:text-[var(--text-main)] prose-headings:text-[var(--text-main)] prose-strong:text-[var(--text-main)] prose-ul:text-[var(--text-main)] prose-li:text-[var(--text-main)]'}
                                                prose-li:marker:text-[var(--text-muted)]
                                                prose-p:my-1 prose-headings:my-2 prose-ul:my-2 prose-li:my-0.5
                                                dark:prose-invert`}
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.content
                                                }} />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 md:gap-6 animate-up">
                                <div className="w-8 h-8 rounded-lg bg-zuari-navy flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <div className="pt-3 thinking-dots text-gray-400">
                                    <span className="bg-current"></span>
                                    <span className="bg-current"></span>
                                    <span className="bg-current"></span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="w-full px-4 md:px-6 pb-6 md:pb-10">
                <div className="max-w-6xl mx-auto relative">
                    {messages.length === 0 && (
                        <div className="mb-4">
                            {isFaqLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-800/60 rounded-xl p-4 flex items-center gap-3 border border-transparent">
                                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                displayFaqs.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {displayFaqs.map((faq, index) => {
                                            const style = faqStyles[index % faqStyles.length];
                                            return (
                                                <button key={index} onClick={() => handleSuggestion(faq.question)} className="relative flex items-center text-left p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-blue-100 dark:hover:border-slate-700 transition-all group backdrop-blur-sm">
                                                    <div className={`p-2 rounded-lg shrink-0 ${style.bg} group-hover:scale-110 transition-transform`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {style.icon}
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-[13px] text-[var(--text-main)] ml-3 leading-snug ">{faq.question}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative group flex items-end">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto'; // Reset height to recalculate exactly
                                const scrollHeight = e.target.scrollHeight;
                                e.target.style.height = Math.max(56, Math.min(scrollHeight, 140)) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask your HR Assistant anything..."
                            className="w-full bg-[var(--input-bg)] backdrop-blur-xl shadow-sm border border-gray-200 dark:border-slate-700 rounded-2xl py-[16px] pl-[24px] pr-[60px] outline-none text-[15px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-[var(--text-main)] resize-none custom-scrollbar leading-[24px]"
                            style={{ height: '56px' }}
                        />
                        <button
                            type="submit"
                            className="absolute right-[8px] bottom-[8px] w-[40px] h-[40px] bg-zuari-navy text-white rounded-[12px] flex items-center justify-center hover:bg-[#122856] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path></svg>
                        </button>
                    </form>
                    <p className="text-[11px] text-gray-500 text-center mt-3 font-semibold opacity-60">
                        AskHR can make mistakes. Check with corporate Hr team for more info.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
