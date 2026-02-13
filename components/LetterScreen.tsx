import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LetterScreenProps {
    onPlanDate: () => void;
}

const LetterScreen: React.FC<LetterScreenProps> = ({ onPlanDate }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl border-2 border-white relative overflow-hidden"
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-valentine-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-valentine-300/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-center">
                    <div className="mb-6 inline-block bg-valentine-100 p-3 rounded-full">
                        <Heart className="w-8 h-8 text-valentine-500 fill-current" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-valentine-800 mb-6 font-serif italic">
                        Dear Gaby,
                    </h2>

                    <div className="text-left space-y-4 text-valentine-700 text-lg leading-relaxed mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p>
                            Happy 10 Months!! I am so happy to be able to have spent 10 months and I look forward to spending many more. 
                        </p>
                        <p>
                            Every moment with you is awesome, and I love the time we spend together.
                            Whether its just staying in, going out, doing nothing, or just talking, I love just being around you, you make me so happy. 
                            You are my favorite person, my best friend, my girlfriend, and now... my Valentine! YAYY!
                        </p>
                        <p>
                            I wanted to do something special to ask you, but I didn't know what to do because of the distance.
                            So I wanted to try something different and something a little interesting.
                            Sorry for asking a little late, I hope you liked this little project I made.
                            Thank you for being you, and for always supporting me. Happy 10 Months Gaby.
                        </p>
                        <p className="font-bold text-right mt-4">
                            - Kevin
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={onPlanDate}
                            className="w-full md:w-auto bg-gradient-to-r from-valentine-500 to-valentine-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            Plan Our Date! ✨
                        </button>
                        <p className="text-sm text-valentine-500 font-medium opacity-70 animate-pulse">
                            or stay and listen for a little longer 🎵
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LetterScreen;
