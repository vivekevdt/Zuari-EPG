
import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

const ChatArea = ({ messages, isLoading, onSendMessage, user, toggleSidebar, toggleDarkMode }) => {
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
        }
    };

    const handleSuggestion = (text) => {
        onSendMessage(text);
    };

    const homeView = (
        <div id="homeView" className="w-full max-w-5xl mx-auto px-6 mb-4 animate-up">
            <div className="mb-8 text-center sm:text-left">
                <h2 id="dynamicGreeting" className="text-4xl font-black mb-2 tracking-tight text-[var(--text-main)]">
                    Hello, <span className="text-blue-600">{user?.name || 'Employee'}</span>.
                </h2>
                <p className="text-gray-400 font-medium text-lg">How can I assist you with company policies today?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <button onClick={() => handleSuggestion('What is the annual leave policy?')} className="chat-pill text-left p-5 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="font-bold text-[16px] text-[var(--text-main)]">Annual Leave</span>
                    </div>
                    <div className="text-[14px] text-[var(--text-muted)] pl-11">View entitlement and application rules.</div>
                </button>


                <button onClick={() => handleSuggestion('Tell me about health insurance benefits.')} className="chat-pill text-left p-5 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <span className="font-bold text-[16px] text-[var(--text-main)]">Medical Coverage</span>
                    </div>
                    <div className="text-[14px] text-[var(--text-muted)] pl-11">Claims, family coverage & network.</div>
                </button>


                <button onClick={() => handleSuggestion('What are the IT security guidelines for remote work?')} className="chat-pill text-left p-5 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <span className="font-bold text-[16px] text-[var(--text-main)]">IT Security</span>
                    </div>
                    <div className="text-[14px] text-[var(--text-muted)] pl-11">Remote work protocols and VPN access.</div>
                </button>


                <button onClick={() => handleSuggestion('Show me the expense reimbursement procedure.')} className="chat-pill text-left p-5 rounded-[24px]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="font-bold text-[16px] text-[var(--text-main)]">Reimbursements</span>
                    </div>
                    <div className="text-[14px] text-[var(--text-muted)] pl-11">Travel, meals, and business expenses.</div>
                </button>

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
            <div id="chatHistory" className={`flex-1 overflow-y-auto custom-scrollbar pt-8 pb-4 ${messages.length === 0 ? 'flex flex-col justify-center' : ''}`} ref={scrollRef}>
                {messages.length === 0 ? homeView : (
                    <div className="max-w-6xl mx-auto px-6 space-y-8 pb-4 w-full">
                        {messages.map((msg) => (
                            <div key={msg._id || msg.id} className={`flex gap-6 animate-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-[14px] ${msg.role === 'ai' || msg.role === 'assistant' ? 'bg-zuari-navy shadow-lg' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm'} shrink-0 flex items-center justify-center`}>
                                    {msg.role === 'ai' || msg.role === 'assistant' ? (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    ) : (
                                        <span className="text-[10px] font-black text-gray-400">YOU</span>
                                    )}
                                </div>
                                <div className="space-y-4 pt-1 max-w-[85%]">
                                    <div className={`p-6 rounded-[24px] ${msg.role === 'ai' || msg.role === 'assistant' ? 'glass text-[var(--text-main)]' : 'bg-zuari-navy text-white shadow-xl'}`}>
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
                            <div className="flex gap-6 animate-up">
                                <div className="w-10 h-10 rounded-[14px] bg-zuari-navy flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
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
            <div className="w-full px-6 pb-10">
                <div className="max-w-6xl mx-auto relative">
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask the Policy Navigator anything..."
                            className="w-full bg-[var(--input-bg)] backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 rounded-[28px] py-6 pl-8 pr-20 outline-none text-base focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-[var(--text-main)]"
                        />
                        <button
                            type="submit"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-14 h-14 bg-zuari-navy text-white rounded-[22px] flex items-center justify-center hover:bg-[#122856] transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        </button>
                    </form>
                    <p className="text-[9px] text-gray-400 text-center mt-5 uppercase tracking-[0.4em] font-black opacity-40">
                        Internal Support System &bull; Zuari Industries Limited
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
