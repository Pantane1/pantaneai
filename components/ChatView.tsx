import React, { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { Message, UploadedFile, MessagePart } from '../types';
import { getChatStream } from '../services/geminiService';
import { useSpeech } from '../hooks/useSpeech';
import { SendIcon, MicIcon, PlusIcon, CloseIcon, SpeakerIcon } from './icons';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const WelcomeCard: React.FC = () => (
  <div className="text-center p-8">
    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-2">
      Pantane AI Hub
    </h1>
    <p className="text-gray-400">Powered by Pantane.</p>
  </div>
);

const MessageBubble: React.FC<{ message: Message; onSpeak: (text: string) => void; }> = ({ message, onSpeak }) => {
    const combinedText = message.parts.map(p => p.text || '').join('\n');
    const htmlContent = marked.parse(combinedText) as string;

    const handleSpeak = () => {
        if (combinedText) {
            onSpeak(combinedText);
        }
    };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-2xl px-5 py-3 rounded-2xl ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        {message.parts.map((part, index) => (
          <div key={index}>
            {part.inlineData && (
              <img src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="uploaded content" className="rounded-lg max-w-xs my-2"/>
            )}
          </div>
        ))}
         <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: htmlContent }} />
         {message.role === 'model' && combinedText && (
            <button onClick={handleSpeak} className="mt-2 text-gray-400 hover:text-white transition-colors">
                <SpeakerIcon />
            </button>
         )}
      </div>
    </div>
  );
};

interface ChatViewProps {
    isVoiceOutputEnabled: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ isVoiceOutputEnabled }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploads, setUploads] = useState<UploadedFile[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasStartedChat = messages.length > 0;
    
    const { isListening, startListening, stopListening, speak, hasSpeechSupport } = useSpeech(setInput);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newUploads = await Promise.all(
                files.map(async (file: File) => ({
                    name: file.name,
                    type: file.type,
                    base64: await fileToBase64(file),
                }))
            );
            setUploads((prev) => [...prev, ...newUploads]);
        }
    };
    
    const removeUpload = (index: number) => {
        setUploads(uploads.filter((_, i) => i !== index));
    };

    const handleSend = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput && uploads.length === 0) return;

        setIsLoading(true);
        setInput('');
        setUploads([]);

        const userMessageParts: MessagePart[] = uploads.map(upload => ({
            inlineData: { mimeType: upload.type, data: upload.base64 }
        }));
        if(trimmedInput) {
            userMessageParts.push({ text: trimmedInput });
        }

        const userMessage: Message = {
            role: 'user',
            parts: userMessageParts,
            timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        try {
            const stream = await getChatStream(newMessages.slice(0, -1), userMessage);
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }], timestamp: new Date().toISOString() }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    modelResponse += chunkText;
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg && lastMsg.role === 'model') {
                            const updatedParts = [{ ...lastMsg.parts[0], text: modelResponse }];
                            return [...prev.slice(0, -1), { ...lastMsg, parts: updatedParts }];
                        }
                        return prev;
                    });
                }
            }
             if (modelResponse && isVoiceOutputEnabled) {
                speak(modelResponse);
            }

        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                role: 'model',
                parts: [{ text: 'Sorry, something went wrong. Please try again.' }],
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, uploads, messages, speak, isVoiceOutputEnabled]);
    
    return (
        <div className={`flex flex-col h-full w-full p-4 md:p-6 transition-all duration-500 ${hasStartedChat ? 'justify-between' : 'justify-center items-center'}`}>
            {!hasStartedChat && <WelcomeCard />}
            <div ref={chatContainerRef} className={`w-full h-full overflow-y-auto pr-4 ${hasStartedChat ? 'block' : 'hidden'}`}>
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} onSpeak={speak} />
                ))}
                {isLoading && messages[messages.length-1]?.role === 'user' && (
                     <div className="flex justify-start mb-6">
                        <div className="max-w-2xl px-5 py-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className={`w-full max-w-3xl mx-auto pt-4 transition-all duration-500`}>
                 {uploads.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-800 rounded-lg">
                        {uploads.map((file, index) => (
                            <div key={index} className="relative group">
                                <img src={`data:${file.type};base64,${file.base64}`} alt={file.name} className="h-16 w-16 object-cover rounded-md"/>
                                <button onClick={() => removeUpload(index)} className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloseIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                 )}
                 <div className="relative flex items-center">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3 p-2 rounded-full bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                       <PlusIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*" />
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Ask Pantane AI..."
                        rows={1}
                        className="w-full pl-14 pr-24 py-3 bg-gray-800 text-gray-200 rounded-full border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] focus:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                    />
                    <div className="absolute right-3 flex items-center space-x-2">
                        {hasSpeechSupport && (
                            <button onClick={isListening ? stopListening : startListening} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                <MicIcon />
                            </button>
                        )}
                        <button onClick={handleSend} disabled={isLoading} className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 disabled:bg-indigo-800 disabled:cursor-not-allowed">
                            <SendIcon />
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ChatView;