import React from 'react';
import { Page, User } from '../types';
import { PantaneLogo, ChatIcon, ImageIcon, FileIcon, InfoIcon, SettingsIcon, UserIcon, LogoutIcon, PlusIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  currentUser: User;
  onSetPage: (page: Page) => void;
  onOpenAbout: () => void;
  onLogout: () => void;
  onNewChat: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentPage, currentUser, onSetPage, onOpenAbout, onLogout, onNewChat }) => {
  return (
    <nav className="w-64 h-full bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 p-4 flex flex-col">
      <div className="flex items-center mb-6 px-2">
        <PantaneLogo className="w-10 h-10" />
        <h1 className="ml-3 text-xl font-bold text-white tracking-wider">Pantane AI</h1>
      </div>
      
      <div className="px-1 mb-4">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center w-full px-4 py-2 rounded-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Chat
        </button>
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
      <div className="mt-auto border-t border-gray-700/50 pt-4">
        <div className="px-4 py-3 flex items-center">
            {currentUser.profilePicture ? (
              <img src={currentUser.profilePicture} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-400"/>
              </div>
            )}
            <span className="ml-3 font-medium text-white truncate">{currentUser.fullName}</span>
        </div>
         <NavItem
          icon={<InfoIcon />}
          label="About"
          isActive={false}
          onClick={onOpenAbout}
        />
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
            <LogoutIcon className="w-6 h-6" />
            <span className="ml-4 font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
