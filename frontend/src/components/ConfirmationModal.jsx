import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDanger = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
                <div className="p-6 text-center">
                    <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
