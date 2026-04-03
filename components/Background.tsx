import React from 'react';
import { motion } from 'framer-motion';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 animate-gradient-xy"></div>
      
      {/* Soft floating orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-35 animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Subtle floating sparkles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(236, 72, 153, ${Math.random() * 0.3 + 0.1})`,
          }}
          initial={{
            y: "110vh",
            x: Math.random() * 100 + "vw",
            opacity: 0,
          }}
          animate={{
            y: "-10vh",
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * -20,
          }}
        />
      ))}
    </div>
  );
};

export default Background;