import React, { useState } from 'react';

const AskHRLogo = () => (
    <div className="flex items-center gap-4 justify-center py-4">
        {/* Blue Rounded Square App Icon */}
        <div className="w-16 h-16 bg-blue-600 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white relative top-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="9.01" y2="10"></line>
                <line x1="12" y1="10" x2="12.01" y2="10"></line>
                <line x1="15" y1="10" x2="15.01" y2="10"></line>
            </svg>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-start pt-1">
            <span className="text-[42px] font-black text-slate-900 leading-none tracking-tight">AskHR</span>
            <span className="text-[12px] font-bold text-blue-600 uppercase tracking-widest mt-1">AI POLICY ASSISTANT</span>
        </div>
    </div>
);

const onboardingSteps = [
    {
        isIntro: true,
        title: "Welcome to AskHR",
        text: "Your intelligent HR assistant, ready to help you navigate policies, benefits, and more.",
        icon: <AskHRLogo />
    },
    { title: "Smart Policy Logic", text: "AskHR has indexed every handbook and benefit guide. Get clear answers in plain English.", icon: "📖" },
    { title: "Private & Secure", text: "Your data is anonymized. Ask sensitive questions about payroll or leave with complete confidence.", icon: "🛡️" },
    { title: "Seamless Updates", text: "Whenever company policy changes, the AI updates automatically in real-time.", icon: "⚡" }
];

const OnboardingModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = onboardingSteps[currentStep];

    const handleNext = () => {
        if (currentStep === onboardingSteps.length - 1) {
            onClose();
            // Reset for future if needed, though it shouldn't show again normally
            setTimeout(() => setCurrentStep(0), 300);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-[520px] max-h-[90%] rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-10 relative flex flex-col animate-modalScale">
                <div className="text-center min-h-[240px] flex flex-col justify-center">
                    {step.isIntro ? (
                        <div className="mb-6">{step.icon}</div>
                    ) : (
                        <div className="text-7xl mb-6 transform scale-110">{step.icon}</div>
                    )}
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{step.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto font-medium">{step.text}</p>
                </div>
                <div className="mt-12 flex items-center justify-between border-t border-slate-50 pt-8">
                    <div className="flex gap-2">
                        {onboardingSteps.map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${i === currentStep ? 'bg-blue-600 w-6' : 'bg-slate-200 w-2'}`}></div>
                        ))}
                    </div>
                    <button onClick={handleNext} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition shadow-xl shadow-slate-200">
                        {currentStep === 0 ? "Get Started" : currentStep === onboardingSteps.length - 1 ? "Finish Setup" : "Next Step"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
