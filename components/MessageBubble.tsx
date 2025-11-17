import React, { useState } from 'react';
import { marked } from 'marked';
import { Message } from '../types';
import { SpeakerIcon, CopyIcon, ClipboardIcon } from './icons';

interface MessageBubbleProps {
    message: Message;
    onSpeak: (text: string) => void;
}

const base64ToBlob = (base64: string, mimeType: string): Promise<Blob> => {
    return fetch(`data:${mimeType};base64,${base64}`).then(res => res.blob());
};


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
    const [copyStatus, setCopyStatus] = useState<{ [key: number]: string }>({});
    const [promptCopyStatus, setPromptCopyStatus] = useState<{ [key: number]: string }>({});

    const textParts = message.parts.filter(p => p.text);
    const imageParts = message.parts.filter(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));

    const combinedText = textParts.map(p => p.text).join('\n');
    const htmlContent = marked.parse(combinedText) as string;

    const handleSpeak = () => {
        if (combinedText) {
            onSpeak(combinedText);
        }
    };

    const handleCopyImage = async (index: number, mimeType: string, data: string) => {
        if (!navigator.clipboard?.write) {
            console.error('Clipboard API not available');
            setCopyStatus(prev => ({ ...prev, [index]: 'Error' }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: '' })), 2000);
            return;
        }

        try {
            const blob = await base64ToBlob(data, mimeType);
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            setCopyStatus(prev => ({ ...prev, [index]: 'Copied!' }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: '' })), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
            setCopyStatus(prev => ({ ...prev, [index]: 'Failed' }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: '' })), 2000);
        }
    };

    const handleCopyPrompt = async (index: number) => {
        if (!message.prompt) return;

        try {
            await navigator.clipboard.writeText(message.prompt);
            setPromptCopyStatus(prev => ({ ...prev, [index]: 'Copied!' }));
            setTimeout(() => setPromptCopyStatus(prev => ({ ...prev, [index]: '' })), 2000);
        } catch (error) {
            console.error('Failed to copy prompt:', error);
            setPromptCopyStatus(prev => ({ ...prev, [index]: 'Failed' }));
            setTimeout(() => setPromptCopyStatus(prev => ({ ...prev, [index]: '' })), 2000);
        }
    };


  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-2xl px-5 py-3 rounded-2xl ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        {imageParts.length > 0 && (
            <div className={`grid gap-2 my-2 ${imageParts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {imageParts.map((part, index) => (
                    <div key={index} className="relative group">
                        <img 
                            src={`data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`} 
                            alt={message.role === 'user' ? "Uploaded content" : "Generated content"}
                            className="rounded-lg w-full h-full object-cover"
                        />
                        {message.role === 'model' && part.inlineData!.mimeType.startsWith('image/') && (
                            <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {message.prompt && (
                                    <button 
                                        onClick={() => handleCopyPrompt(index)}
                                        className="bg-gray-800/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-label="Copy prompt"
                                    >
                                        {promptCopyStatus[index] ? 
                                            <span className="text-xs px-1">{promptCopyStatus[index]}</span> : 
                                            <ClipboardIcon className="w-5 h-5" />
                                        }
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleCopyImage(index, part.inlineData!.mimeType, part.inlineData!.data)}
                                    className="bg-gray-800/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Copy image"
                                >
                                    {copyStatus[index] ? 
                                        <span className="text-xs px-1">{copyStatus[index]}</span> : 
                                        <CopyIcon className="w-5 h-5" />
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
        
        {htmlContent.trim() && (
            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        )}

        {message.role === 'model' && combinedText && (
            <button onClick={handleSpeak} className="mt-2 text-gray-400 hover:text-white transition-colors">
                <SpeakerIcon />
            </button>
         )}
      </div>
    </div>
  );
};