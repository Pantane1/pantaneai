import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageLab from './components/ImageLab';
import FileAnalysis from './components/FileAnalysis';
import Settings from './components/Settings';
import AboutModal from './components/AboutModal';
import Auth from './components/auth/Auth';
import { Page, Message, ChatHistories, User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);
  const [isVoiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem('pantane_currentUser');
    if (loggedInUserEmail) {
      const allUsers = JSON.parse(localStorage.getItem('pantane_users') || '{}');
      const userData = allUsers[loggedInUserEmail];
      if (userData) {
        setCurrentUser(userData);
        const userChats = localStorage.getItem(`pantane_chats_${loggedInUserEmail}`);
        setChatHistories(userChats ? JSON.parse(userChats) : { chat: [], 'image-lab': [], 'file-analysis': [] });
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`pantane_chats_${currentUser.email}`, JSON.stringify(chatHistories));
    }
  }, [chatHistories, currentUser]);


  const handleLogin = (user: User) => {
    localStorage.setItem('pantane_currentUser', user.email);
    setCurrentUser(user);
    const userChats = localStorage.getItem(`pantane_chats_${user.email}`);
    setChatHistories(userChats ? JSON.parse(userChats) : { chat: [], 'image-lab': [], 'file-analysis': [] });
  };

  const handleLogout = () => {
    localStorage.removeItem('pantane_currentUser');
    setCurrentUser(null);
    setChatHistories({});
    setCurrentPage('chat');
  };

  const handleSetPage = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleOpenAbout = useCallback(() => {
    setAboutModalOpen(true);
  }, []);

  const handleCloseAbout = useCallback(() => {
    setAboutModalOpen(false);
  }, []);

  const handleToggleVoiceOutput = useCallback(() => {
    setVoiceOutputEnabled(prev => !prev);
  }, []);
  
  const handleNewChat = useCallback(() => {
    setChatHistories(prev => ({
        ...prev,
        [currentPage]: [],
    }));
  }, [currentPage]);

  const handleSetCurrentPageMessages = (updater: React.SetStateAction<Message[]>) => {
    setChatHistories(prev => ({
        ...prev,
        [currentPage]: typeof updater === 'function' ? updater(prev[currentPage] || []) : updater,
    }));
  };

  const renderPage = () => {
    const currentMessages = currentUser ? chatHistories[currentPage] || [] : [];

    switch (currentPage) {
      case 'chat':
        return <ChatView isVoiceOutputEnabled={isVoiceOutputEnabled} messages={currentMessages} setMessages={handleSetCurrentPageMessages} />;
      case 'image-lab':
        return <ImageLab messages={currentMessages} setMessages={handleSetCurrentPageMessages} />;
      case 'file-analysis':
        return <FileAnalysis messages={currentMessages} setMessages={handleSetCurrentPageMessages} />;
      case 'settings':
        return <Settings user={currentUser!} isVoiceOutputEnabled={isVoiceOutputEnabled} onToggleVoiceOutput={handleToggleVoiceOutput} />;
      default:
        return <ChatView isVoiceOutputEnabled={isVoiceOutputEnabled} messages={currentMessages} setMessages={handleSetCurrentPageMessages} />;
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
      <Sidebar 
        currentPage={currentPage} 
        onSetPage={handleSetPage} 
        onOpenAbout={handleOpenAbout}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
        <footer className="text-center p-2 text-xs text-gray-500 bg-gray-900/50 backdrop-blur-sm">
          Created by Pantane — Innovator & Builder.
        </footer>
      </main>
      {isAboutModalOpen && <AboutModal onClose={handleCloseAbout} />}
    </div>
  );
};

export default App;
