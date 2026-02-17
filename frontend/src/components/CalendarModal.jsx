import React from 'react';

const CalendarModal = ({ isOpen, onClose }) => {
    return (
        <div
            id="calendarModal"
            className={`fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`}
        >
            <div className="absolute inset-0 bg-zuari-dark/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-5xl h-[85vh] glass rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-zuari-navy dark:text-white">Holiday Calendar 2024</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Resource Center</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {/* PDF Viewer */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                    <iframe
                        id="pdfFrame"
                        src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                        className="w-full h-full border-none"
                        title="Holiday Calendar PDF"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
