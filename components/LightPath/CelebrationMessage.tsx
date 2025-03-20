import React from 'react';
import { colors } from '@/constants/light-path';

interface CelebrationMessageProps {
  message: string;
  isVisible: boolean;
}

const CelebrationMessage: React.FC<CelebrationMessageProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 py-5 px-8 rounded-xl shadow-2xl text-center max-w-md animate-fadeIn"
      style={{
        backgroundColor: 'white',
        borderLeft: `4px solid ${colors.primary}`,
        boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)`,
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{
          background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
        }}
      />
      <h3
        className="text-xl font-bold"
        style={{ color: colors.dark }}
      >
        {message}
      </h3>
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); }
          100% { opacity: 1; transform: translate(-50%, -50%); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}
      </style>
    </div>
  );
};

export default CelebrationMessage;
