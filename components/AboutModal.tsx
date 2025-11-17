
import React from 'react';
import { CloseIcon, PantaneLogo } from './icons';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl shadow-indigo-500/10 w-full max-w-md m-4 p-8 relative transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <PantaneLogo className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Pantane AI</h2>
          <p className="text-gray-400 mb-6">Innovator & Builder</p>

          <div className="w-full text-left space-y-4">
             <div>
                <h3 className="font-semibold text-indigo-400 mb-1">Contact Information</h3>
                <p className="text-gray-300">
                  Email: <a href="mailto:pantane254@gmail.com" className="text-purple-400 hover:underline">pantane254@gmail.com</a>
                </p>
                <p className="text-gray-300">
                  WhatsApp: <a href="https://wa.me/254740312402" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">wa.me/254740312402</a>
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;