import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageLab from './components/ImageLab';
import FileAnalysis from './components/FileAnalysis';
import Settings from './components/Settings';
import AboutModal from './components/AboutModal';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);
  const [isVoiceOutputEnabled, setVoiceOutputEnabled] = useState(false);

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

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatView isVoiceOutputEnabled={isVoiceOutputEnabled} />;
      case 'image-lab':
        return <ImageLab />;
      case 'file-analysis':
        return <FileAnalysis />;
      case 'settings':
        return <Settings isVoiceOutputEnabled={isVoiceOutputEnabled} onToggleVoiceOutput={handleToggleVoiceOutput} />;
      default:
        return <ChatView isVoiceOutputEnabled={isVoiceOutputEnabled} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
      <Sidebar currentPage={currentPage} onSetPage={handleSetPage} onOpenAbout={handleOpenAbout} />
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