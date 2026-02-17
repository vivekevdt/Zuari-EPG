
import React from 'react';
import { ICONS, FAQ_DATA } from '../constants';

const FAQModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div id="faqModal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
            <div className="absolute inset-0 bg-zuari-dark/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 glass rounded-[32px] overflow-hidden flex flex-col shadow-2xl max-h-[85vh]">

                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-500">
                            <ICONS.QuestionMark />
                        </div>
                        <div>
                            <h3 className="font-bold text-zuari-navy dark:text-white">Help Center</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Common Questions</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                    {FAQ_DATA.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group shadow-sm">
                            <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <span className="text-blue-500 font-black opacity-70 group-hover:opacity-100 transition-opacity">Q.</span>
                                {faq.question}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed pl-6 border-l-2 border-gray-100 dark:border-slate-700 ml-1">
                                {faq.answer}
                            </p>
                        </div>
                    ))}

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-500 shadow-sm">
                            <ICONS.Bot />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-zuari-navy dark:text-blue-300">Still have questions?</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Start a new chat session to ask specific questions about any policy.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQModal;
