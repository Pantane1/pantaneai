
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
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

const ImageLab: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await generateImage(prompt, aspectRatio);
            setGeneratedImages(images);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);

    return (
        <div className="p-4 md:p-8 h-full flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Image Lab</h2>
                    <p className="text-gray-400">Create stunning visuals with the power of AI.</p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic cityscape with flying cars, neon lights, detailed, 8k..."
                        rows={3}
                        className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all duration-300"
                    />
                    <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-400">Aspect Ratio:</span>
                            <AspectRatioButton aspect="1:1" selected={aspectRatio} onSelect={setAspectRatio} />
                            <AspectRatioButton aspect="16:9" selected={aspectRatio} onSelect={setAspectRatio} />
                            <AspectRatioButton aspect="9:16" selected={aspectRatio} onSelect={setAspectRatio} />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-center mt-4">{error}</p>}

                <div className="mt-8 flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                             <ImageIcon className="w-16 h-16 text-indigo-400 animate-pulse"/>
                             <p className="mt-4 text-gray-400">Your vision is materializing...</p>
                        </div>
                    )}
                    {generatedImages.length > 0 && (
                        <div className="grid grid-cols-1 gap-4">
                            {generatedImages.map((imgB64, index) => (
                                <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                    <img src={`data:image/jpeg;base64,${imgB64}`} alt={`Generated art ${index + 1}`} className="w-full h-auto object-contain" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageLab;
