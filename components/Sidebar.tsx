import React from 'react';
import { Page } from '../types';
import { PantaneLogo, ChatIcon, ImageIcon, FileIcon, InfoIcon, SettingsIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  onSetPage: (page: Page) => void;
  onOpenAbout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'bg-gray-700/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.6),0_0_5px_rgba(168,85,247,0.5)]';
  const inactiveClasses = 'text-gray-400 hover:bg-gray-700/30 hover:text-white';
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSetPage, onOpenAbout }) => {
  return (
    <nav className="w-64 h-full bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 p-4 flex flex-col">
      <div className="flex items-center mb-10 px-2">
        <PantaneLogo className="w-10 h-10" />
        <h1 className="ml-3 text-xl font-bold text-white tracking-wider">Pantane AI Hub</h1>
      </div>
      <div className="flex flex-col space-y-2">
        <NavItem
          icon={<ChatIcon />}
          label="Chat"
          isActive={currentPage === 'chat'}
          onClick={() => onSetPage('chat')}
        />
        <NavItem
          icon={<ImageIcon />}
          label="Image Lab"
          isActive={currentPage === 'image-lab'}
          onClick={() => onSetPage('image-lab')}
        />
        <NavItem
          icon={<FileIcon />}
          label="File Analysis"
          isActive={currentPage === 'file-analysis'}
          onClick={() => onSetPage('file-analysis')}
        />
        <NavItem
          icon={<SettingsIcon />}
          label="Settings"
          isActive={currentPage === 'settings'}
          onClick={() => onSetPage('settings')}
        />
      </div>
      <div className="mt-auto">
        <NavItem
          icon={<InfoIcon />}
          label="About"
          isActive={false}
          onClick={onOpenAbout}
        />
      </div>
    </nav>
  );
};

export default Sidebar;