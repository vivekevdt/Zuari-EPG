import React, { useState, useEffect, useRef } from 'react';
import { getPolicies, playgroundChat } from '../api';

const Playground = () => {
    // Data State
    const [entities, setEntities] = useState([]);
    const [allPolicies, setAllPolicies] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [selectedPolicies, setSelectedPolicies] = useState([]);

    // UI State
    const [isEntityOpen, setIsEntityOpen] = useState(false);
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);
    const [input, setInput] = useState("Explain the medical benefits");

    const entityRef = useRef(null);
    const policyRef = useRef(null);

    // Hardcoded Entity List
    const AVAILABLE_ENTITIES = [
        { code: 'ZIL', name: 'Zuari Industries Ltd' },
        { code: 'ZIIL', name: 'Zuari Infraworld India Ltd' },
        { code: 'SIL', name: 'Simon India Ltd' },
        { code: 'ZIntL', name: 'Zuari International' },
        { code: 'ZFL', name: 'Zuari Finserv Ltd' },
        { code: 'ZIBL', name: 'Zuari Insurance Brokers Ltd' },
        { code: 'ZMSL', name: 'Zuari Management Services Ltd' },
        { code: 'FFPL', name: 'Forte Furniture Products India Pvt Ltd' },
        { code: 'IFPL', name: 'Indian Furniture Private Ltd' },
        { code: 'ZEBPL', name: 'Zuari Envien Bioenergy Pvt Ltd' }
    ];

    // Click Outside Handling
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (entityRef.current && !entityRef.current.contains(event.target)) {
                setIsEntityOpen(false);
            }
            if (policyRef.current && !policyRef.current.contains(event.target)) {
                setIsPolicyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Derived State: Available policies for the selected entity
    const availablePolicies = React.useMemo(() => {
        if (!selectedEntity || allPolicies.length === 0) return [];
        return allPolicies.filter(p => {
            // Policy entity logic: if policy has specific entity, match it. If 'all' or empty, it's global.
            // Assuming strict matching or global policies.
            const pEnt = p.entity ? p.entity.trim() : '';
            return (!pEnt || pEnt.toLowerCase() === 'all' || pEnt === selectedEntity.name);
        });
    }, [selectedEntity, allPolicies]);

    // Handlers
    const handleEntitySelect = async (entity) => {
        setSelectedEntity(entity);
        setSelectedPolicies([]); // Reset policies
        setIsEntityOpen(false);
        setLoading(true);

        try {
            // Fetch fresh policies list
            const policiesData = await getPolicies();
            if (Array.isArray(policiesData)) {
                setAllPolicies(policiesData);
            }
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setLoading(false);
        }
    };

    const togglePolicy = (policy) => {
        if (selectedPolicies.find(p => p._id === policy._id)) {
            setSelectedPolicies(selectedPolicies.filter(p => p._id !== policy._id));
        } else {
            setSelectedPolicies([...selectedPolicies, policy]);
        }
    };

    const removePolicy = (e, policyId) => {
        e.stopPropagation();
        setSelectedPolicies(selectedPolicies.filter(p => p._id !== policyId));
    };

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'ai', content: '<p>Environment initialized. I am ready to process queries using the selected policy logic.</p><p>How would you like to test the cross-policy enforcement today?</p>' }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSendMessage = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsThinking(true);

        try {
            const policyNames = selectedPolicies.map(p => p.title);
            const entityName = selectedEntity ? selectedEntity.name : null;

            // Call the NEW separate playground API
            const response = await playgroundChat(userMsg, entityName, policyNames);

            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            // Show toast for validation errors (400) or other API errors
            // Assuming we have a toast library or just using alert as fallback if not imported
            // But better to use the specific message from backend

            // Note: In a real app we'd use toast.error(error.message)
            // For now, I will simulate it or use alert as requested "toast" usually implies a UI element.
            // Since I cannot easily add a library without checking, I will use a simple window.alert 
            // OR if the user means "don't show in chat", I just won't add it to 'messages'.

            // However, the best approach is to check if we can simply use `alert` temporarily or if there is a global toast.
            // Let's assume standard `alert` is NOT what they mean by "toast".

            // Use a temporary custom toast logic or just `alert` for now to satisfy "not in chat response".
            // Actually, I'll use `toast` from `react-hot-toast` and add the import.
            // If it fails, I'll fix it.
            import('react-hot-toast').then(({ toast }) => {
                toast.error(error.message);
            }).catch(() => {
                alert(error.message);
            });

        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">

            {/* Top Control Bar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

                <div className="flex flex-col md:flex-row gap-6 w-full lg:w-auto flex-1">
                    {/* Entity Context */}
                    <div className="flex-1 min-w-[250px]" ref={entityRef}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            Entity Context
                        </label>
                        <div className="relative group">
                            <div
                                onClick={() => setIsEntityOpen(!isEntityOpen)}
                                className={`w-full bg-white border ${isEntityOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} rounded-xl px-4 py-3 flex items-center justify-between shadow-sm hover:border-blue-400 transition-all cursor-pointer`}
                            >
                                <span className={`font-semibold ${selectedEntity ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {selectedEntity ? selectedEntity.name : 'Select Entity...'}
                                </span>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isEntityOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>

                            {/* Dropdown Menu */}
                            {isEntityOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                                    {AVAILABLE_ENTITIES.map(entity => (
                                        <div
                                            key={entity.code}
                                            onClick={() => handleEntitySelect(entity)}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center justify-between ${selectedEntity?.code === entity.code ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <span>{entity.name}</span>
                                            {selectedEntity?.code === entity.code && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Target Policies */}
                    <div className="flex-[1.5] min-w-[300px]" ref={policyRef}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Target Policies (Multiple)
                        </label>
                        <div className="relative">
                            <div
                                onClick={() => !selectedEntity ? null : setIsPolicyOpen(!isPolicyOpen)}
                                className={`w-full bg-white border ${isPolicyOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} rounded-xl px-2 py-2 flex items-center justify-between shadow-sm min-h-[50px] transition-all ${!selectedEntity ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-blue-400'}`}
                            >
                                <div className="flex flex-wrap gap-2">
                                    {selectedPolicies.length > 0 ? (
                                        selectedPolicies.map(policy => (
                                            <span key={policy._id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
                                                {policy.title}
                                                <button
                                                    onClick={(e) => removePolicy(e, policy._id)}
                                                    className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 px-2 font-medium">
                                            {!selectedEntity ? 'Select an Entity first' : 'Select Policies...'}
                                        </span>
                                    )}
                                </div>
                                <svg className={`w-4 h-4 text-slate-400 mr-2 shrink-0 transition-transform ${isPolicyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>

                            {/* Dropdown Menu */}
                            {isPolicyOpen && selectedEntity && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                                    {loading ? (
                                        <div className="p-4 text-center text-xs text-slate-400">Loading Policies...</div>
                                    ) : availablePolicies.length > 0 ? (
                                        availablePolicies.map(policy => {
                                            const isSelected = selectedPolicies.some(p => p._id === policy._id);
                                            return (
                                                <div
                                                    key={policy._id}
                                                    onClick={() => togglePolicy(policy)}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    <span>{policy.title}</span>
                                                    {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">No policies found for this entity</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sandbox Active Badge */}
                <div className="shrink-0 bg-blue-50 border border-blue-100 text-blue-600 px-6 py-3 rounded-xl flex items-center gap-2.5 font-bold text-xs tracking-wider shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    SANDBOX ACTIVE
                </div>
            </div>

            {/* Main Chat Card */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col min-h-[650px]">

                {/* Header */}
                <div className="p-6 md:px-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Policy Expert AI</h2>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                                {selectedEntity ? selectedEntity.name : 'NO CONTEXT'} • {selectedPolicies.length > 0 ? `${selectedPolicies.length} POLICIES ACTIVE` : 'NO POLICIES'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-300 hover:text-red-400 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Export Logs
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-8 bg-white overflow-y-auto max-h-[600px]">

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-4 max-w-3xl mb-6 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                {msg.role === 'user' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                )}
                            </div>
                            <div className="space-y-2 max-w-[80%]">
                                <div className={`p-6 rounded-2xl leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-50 border border-slate-100 rounded-tl-none text-slate-800'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p>{msg.content}</p>
                                    ) : (
                                        <div
                                            className="prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-4 prose-p:mb-2 prose-headings:font-bold prose-headings:text-slate-800"
                                            dangerouslySetInnerHTML={{ __html: msg.content }}
                                        />
                                    )}
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest pl-2 ${msg.role === 'user' ? 'text-right text-slate-300' : 'text-slate-300'}`}>
                                    {msg.role === 'user' ? 'You' : 'Policy Expert AI'}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex gap-4 max-w-3xl mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                <svg className="w-5 h-5 text-slate-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-6 text-slate-600 shadow-sm flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">Analyzing Policy Documents...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Footer Input Area */}
                <div className="p-8 bg-white border-t border-slate-50 mt-auto">
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {[
                            { label: 'Annual Leave', icon: '🏖️' },
                            { label: 'Hybrid Work', icon: '🏠' },
                            { label: 'Probation Rules', icon: '⏳' },
                            { label: 'Medical Plan', icon: '🏥' }
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(`Tell me about ${item.label}`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 hover:border-blue-200 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 transition-all"
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isThinking}
                            className={`w-full bg-slate-50 border ${isThinking ? 'border-slate-300 bg-slate-100 cursor-not-allowed' : 'border-slate-200 hover:border-blue-200 focus:border-blue-500'} rounded-full py-4 pl-6 pr-16 outline-none transition-all shadow-inner text-slate-700 font-medium placeholder-slate-400`}
                            placeholder={isThinking ? "Thinking..." : "Ask a question about your policies..."}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isThinking}
                            className={`absolute right-2 top-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${!input.trim() || isThinking ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            <svg className={`w-3 h-3 ${isThinking ? 'text-blue-500 animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Document Retrieval: {isThinking ? 'SEARCHING' : 'ACTIVE'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Playground;
