import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { Message, MessagePart } from '../types';
import { MessageBubble } from './MessageBubble';
import { useSpeech } from '../hooks/useSpeech';
import { ImageIcon } from './icons';

const AspectRatioButton: React.FC<{ aspect: string, selected: string, onSelect: (aspect: string) => void }> = ({ aspect, selected, onSelect }) => (
    <button
        onClick={() => onSelect(aspect)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border ${
            selected === aspect 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)]' 
            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
        }`}
    >
        {aspect}
    </button>
);

interface ImageLabProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ImageLab: React.FC<ImageLabProps> = ({ messages, setMessages }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [numImages, setNumImages] = useState(1);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { speak } = useSpeech(() => {}); // Not using transcript callback here

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleGenerate = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setError('Please enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setPrompt('');

        const userMessage: Message = {
            role: 'user',
            parts: [{ text: trimmedPrompt }],
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const images = await generateImage(trimmedPrompt, aspectRatio, numImages);
            const imageParts: MessagePart[] = images.map(imgB64 => ({
                inlineData: { mimeType: 'image/jpeg', data: imgB64 }
            }));
            
            const modelMessage: Message = {
                role: 'model',
                parts: imageParts,
                timestamp: new Date().toISOString(),
                prompt: trimmedPrompt,
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
             const errorMessage: Message = {
                role: 'model',
                parts: [{ text: 'Sorry, I was unable to generate the image.' }],
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, numImages, setMessages]);

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <div className="w-full max-w-4xl mx-auto text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Image Lab</h2>
                <p className="text-gray-400">Create stunning visuals with the power of AI.</p>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto pr-4 mb-4">
                 {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} onSpeak={speak} />
                ))}
                 {isLoading && (
                     <div className="flex justify-start mb-6">
                        <div className="max-w-2xl px-5 py-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                            <div className="flex flex-col items-center justify-center p-4">
                                <div 
                                    className={`
                                        relative w-80 max-w-full animate-pulse rounded-lg bg-gray-600
                                        ${aspectRatio === '1:1' ? 'aspect-square' : ''}
                                        ${aspectRatio === '16:9' ? 'aspect-video' : ''}
                                        ${aspectRatio === '9:16' ? 'aspect-[9/16]' : ''}
                                    `}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-400">Generating your masterpiece...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-gray-800/50 p-4 rounded-2xl shadow-lg border border-gray-700/50">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                        placeholder="A futuristic cityscape with flying cars, neon lights, detailed, 8k..."
                        rows={2}
                        className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all duration-300"
                    />
                    <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-400">Aspect Ratio:</span>
                                <AspectRatioButton aspect="1:1" selected={aspectRatio} onSelect={setAspectRatio} />
                                <AspectRatioButton aspect="16:9" selected={aspectRatio} onSelect={setAspectRatio} />
                                <AspectRatioButton aspect="9:16" selected={aspectRatio} onSelect={setAspectRatio} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="num-images" className="text-sm font-medium text-gray-400">Images:</label>
                                <input
                                    id="num-images"
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={numImages}
                                    onChange={(e) => setNumImages(Math.max(1, Math.min(4, parseInt(e.target.value, 10) || 1)))}
                                    className="w-16 px-2 py-1 bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {isLoading ? `Generating ${numImages} image${numImages > 1 ? 's' : ''}...` : 'Generate Image'}
                        </button>
                    </div>
                </div>
                 {error && <p className="text-red-400 text-center mt-2 text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default ImageLab;