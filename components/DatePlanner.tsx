import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Calendar, Utensils, Coffee, Activity, Heart, Send } from 'lucide-react';
import emailjs from 'emailjs-com';
import html2canvas from 'html2canvas';

interface DatePlannerProps {
    onComplete: () => void;
}

interface Step {
    id: number;
    title: string;
    field: string;
    type: 'selection' | 'time';
    options?: string[];
    icon: React.ReactNode;
}

const DatePlanner: React.FC<DatePlannerProps> = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        time: '',
        food1: '',
        activity1: '',
        food2: '',
        dessert: '',
    });
    const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    const handleEdit = () => setStep(5); // Return to dessert step to allow full backward navigation

    const handleSelection = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (value !== 'Other') {
            const newOtherInputs = { ...otherInputs };
            delete newOtherInputs[field];
            setOtherInputs(newOtherInputs);
        }
    };

    const handleOtherInputChange = (field: string, value: string) => {
        setOtherInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirm = () => {
        setShowConfirmation(true);
    };

    const handleSendEmail = async () => {
        if (!summaryRef.current) return;

        setIsSending(true);
        try {
            const canvas = await html2canvas(summaryRef.current);
            const imageData = canvas.toDataURL('image/png');

            const templateParams = {
                to_name: "My Valentine",
                from_name: "Kevin Huang",
                message: "Here is our date plan!",
                // date_plan_image: imageData, // Commented out to test if image size is the issue
                // Or simpler: send text summary
                summary: `
          Time: ${getDisplayValue('time')}
          First Meal: ${getDisplayValue('food1')}
          Activity: ${getDisplayValue('activity1')}
          Dinner: ${getDisplayValue('food2')}
          Dessert: ${getDisplayValue('dessert')}
        `
            };

            // REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
            // Service ID, Template ID, Public Key (User ID)
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setEmailSent(true);
            setShowConfirmation(false);
            // alert("Date plan sent! (Check console if using placeholder keys)"); // Removed alert, UI handles it
        } catch (error: any) {
            // console.error('Failed to send email:', error); // Removed per user request
            const errorMessage = error?.text || error?.message || "Unknown error";
            alert(`Failed to send email: ${errorMessage}\n\nPlease take a screenshot!`);
        } finally {
            setIsSending(false);
        }
    };

    const getDisplayValue = (field: string) => {
        const val = formData[field as keyof typeof formData];
        if (val === 'Your Choice') return 'Surpriseee! 🤫';
        if (val === 'Other') return otherInputs[field] || 'Mystery';
        return val;
    };

    // Generate time slots from 9am to 2pm
    const timeSlots = [];
    for (let hour = 9; hour <= 14; hour++) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        timeSlots.push(`${displayHour}:00 ${period}`);
        if (hour !== 14) {
            timeSlots.push(`${displayHour}:30 ${period}`);
        }
    }

    const steps: Step[] = [
        {
            id: 1,
            title: "What time should we meet?",
            field: "time",
            type: 'time',
            options: timeSlots,
            icon: <Calendar className="w-8 h-8 text-valentine-500" />
        },
        {
            id: 2,
            title: "What should we eat first?",
            field: "food1",
            type: 'selection',
            options: ["McDonald's", "Pho", "Sushi", "Tacos", "Burgers", "Pasta", "Pizza", "Your Choice", "Other"],
            icon: <Utensils className="w-8 h-8 text-valentine-500" />
        },
        {
            id: 3,
            title: "What should we do?",
            field: "activity1",
            type: 'selection',
            options: ["Movie", "Puppy Yoga", "Skating", "Escape Room", "Your Choice", "Other"],
            icon: <Activity className="w-8 h-8 text-valentine-500" />
        },
        {
            id: 4,
            title: "What do you want to eat for dinner?",
            field: "food2",
            type: 'selection',
            options: ["McDonald's", "Pho", "Sushi", "Tacos", "Burgers", "Pasta", "Pizza", "Your Choice", "Other"],
            icon: <Utensils className="w-8 h-8 text-valentine-500" />
        },
        {
            id: 5,
            title: "Dessert time?",
            field: "dessert",
            type: 'selection',
            options: ["Ice Cream", "Drink", "Nahhh its ok", "Your Choice", "Other"],
            icon: <Coffee className="w-8 h-8 text-valentine-500" />
        }
    ];

    const currentStep = steps.find(s => s.id === step);

    const renderStepContent = () => {
        if (!currentStep) return null;
        const currentValue = formData[currentStep.field as keyof typeof formData];
        const isOtherSelected = currentValue === 'Other';

        return (
            <motion.div
                key={step}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
            >
                <div className="bg-valentine-100 p-4 rounded-full mb-4 ring-4 ring-valentine-50">
                    {currentStep.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-valentine-800 text-center mb-8">
                    {currentStep.title}
                </h2>

                <div className="w-full grid grid-cols-2 gap-3 mb-6 max-h-[40vh] overflow-y-auto p-1">
                    {currentStep.options?.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelection(currentStep.field, option)}
                            className={`p-3 rounded-xl transition-all font-medium text-sm md:text-base shadow-sm border-2 ${currentValue === option
                                ? 'bg-valentine-500 text-white border-valentine-500 shadow-md scale-[1.02]'
                                : 'bg-white text-valentine-700 border-valentine-100 hover:border-valentine-300 hover:bg-valentine-50'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {/* Other text input */}
                <AnimatePresence>
                    {isOtherSelected && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full mb-6 overflow-hidden"
                        >
                            <input
                                type="text"
                                placeholder="Type your answer here..."
                                value={otherInputs[currentStep.field] || ''}
                                onChange={(e) => handleOtherInputChange(currentStep.field, e.target.value)}
                                className="w-full bg-white border-2 border-valentine-300 rounded-xl px-4 py-3 text-valentine-800 focus:outline-none focus:border-valentine-500"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-4 w-full mt-4">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                        >
                            <ArrowLeft size={20} /> Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!currentValue || (currentValue === 'Other' && !otherInputs[currentStep.field])}
                        className="flex-[2] bg-valentine-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-valentine-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        Next <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        );
    };

    // Summary View
    if (step > steps.length) {
        return (
            <div className="w-full max-w-lg mx-auto px-4 z-20">
                <motion.div
                    ref={summaryRef}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-white mx-auto max-h-[85vh] flex flex-col relative w-full"
                >
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="text-center mb-6">
                            <div className="inline-block p-3 bg-red-100 rounded-full mb-3">
                                <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-script text-valentine-600 mb-1">Our Perfect Date ❤️</h2>
                        </div>

                        <div className="space-y-4 mb-2">
                            <SummaryItem icon={<Calendar />} label="Time" value={getDisplayValue('time')} />
                            <SummaryItem icon={<Utensils />} label="First Meal" value={getDisplayValue('food1')} />
                            <SummaryItem icon={<Activity />} label="Activity" value={getDisplayValue('activity1')} />
                            <SummaryItem icon={<Utensils />} label="Dinner" value={getDisplayValue('food2')} />
                            <SummaryItem icon={<Coffee />} label="Dessert" value={getDisplayValue('dessert')} />
                        </div>
                    </div>

                    <div className="p-8 pt-0 flex-shrink-0">
                        {!emailSent ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-gradient-to-r from-valentine-500 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    Confirm & Send! <Send size={20} />
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Wait, I need to change something
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-green-100 rounded-xl text-green-700 font-bold mb-4">
                                Sent! I can't wait! 🥰
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {showConfirmation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                            >
                                <h3 className="text-2xl font-bold text-valentine-800 mb-4">Are you sure?</h3>
                                <p className="text-valentine-600 mb-8">Once you confirm, I'll get an email with our date plan!</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={isSending}
                                        className="flex-1 py-3 rounded-xl bg-valentine-500 font-bold text-white hover:bg-valentine-600 shadow-lg disabled:opacity-50"
                                    >
                                        {isSending ? 'Sending...' : 'Yes, I\'m sure!'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto px-4 z-20">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 border border-white/60 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1.5 bg-valentine-100 w-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-valentine-400 to-valentine-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step - 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="mt-2 mb-2 text-center text-valentine-300 text-xs font-bold uppercase tracking-wider">
                    Step {step} of {steps.length}
                </div>

                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SummaryItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-4 bg-white/60 p-3 rounded-2xl border border-valentine-100/50">
        <div className="bg-valentine-100 p-2.5 rounded-full text-valentine-500">
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <div className="text-left">
            <p className="text-[10px] text-valentine-400 uppercase font-extrabold tracking-wide">{label}</p>
            <p className="text-lg text-valentine-800 font-semibold leading-tight">{value}</p>
        </div>
    </div>
)

export default DatePlanner;
