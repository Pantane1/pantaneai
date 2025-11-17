
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { Message } from '../types';
import { analyzeFileContent } from '../services/geminiService';
import { FileIcon, SendIcon } from './icons';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const htmlContent = marked.parse(message.parts.map(p => p.text || '').join('\n')) as string;
    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-2xl px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
};


const FileAnalysis: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                setFileContent(e.target?.result as string);
                setMessages([]);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleSend = useCallback(async () => {
        if (!input.trim() || !fileContent) return;

        setIsLoading(true);
        const userMessage: Message = { role: 'user', parts: [{ text: input }], timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const stream = await analyzeFileContent(fileContent, input);
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
        } catch (error) {
            console.error(error);
             const errorMessage: Message = {
                role: 'model',
                parts: [{ text: 'Sorry, something went wrong during analysis.' }],
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, fileContent]);
    
    return (
        <div className="p-4 md:p-8 h-full flex flex-col items-center">
             <div className="w-full max-w-4xl flex flex-col h-full">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">File Analysis</h2>
                    <p className="text-gray-400">Upload a .txt file and ask questions about its content.</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">TXT files only</p>
                        </div>
                        <input id="file-upload" type="file" className="hidden" accept=".txt" onChange={handleFileChange} />
                    </label>
                    {file && <p className="text-center text-sm text-indigo-400 mt-2">Loaded: {file.name}</p>}
                </div>

                <div className="flex-1 bg-gray-800/50 rounded-lg p-4 flex flex-col overflow-hidden border border-gray-700/50">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2">
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                {fileContent ? 'Ask a question about the document to begin.' : 'Upload a document to start the analysis.'}
                            </div>
                        )}
                        {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex justify-start mb-4">
                                <div className="px-4 py-2 rounded-lg bg-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                            placeholder={fileContent ? "Ask about the document..." : "Please upload a file first"}
                            disabled={!fileContent || isLoading}
                            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        />
                        <button onClick={handleSend} disabled={!fileContent || isLoading} className="ml-3 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50">
                           <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileAnalysis;
