import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-valentine-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-valentine-200 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-valentine-300 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2 animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="inline-block mb-8"
                >
                    <div className="bg-white p-6 rounded-full shadow-xl shadow-valentine-200/50">
                        <Heart className="w-16 h-16 text-valentine-500 fill-current" />
                    </div>
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-script text-valentine-800 mb-6 drop-shadow-sm">
                    Dear Gaby Ornedo
                </h1>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-md mx-auto border border-white/50 shadow-sm">
                    <p className="text-lg md:text-xl text-valentine-600 font-medium tracking-wide">
                        Something special is coming... <br />
                        Stay tuned! ✨
                    </p>
                </div>

                <p className="mt-8 text-valentine-400 text-sm font-bold uppercase tracking-widest opacity-80">
                    Loading Future Memories...
                </p>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
