import { useState, useEffect, useRef, useCallback } from 'react';

// FIX: Add type definition for SpeechRecognition to resolve "Cannot find name 'SpeechRecognition'" error.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// Polyfill for webkitSpeechRecognition
// FIX: Cast window to any to access vendor-prefixed APIs and rename to avoid shadowing the global type.
const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeech = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionImpl) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      onTranscript(finalTranscript || interimTranscript);
    };
    
    recognition.onend = () => {
        if (isListening) {
            recognition.start(); // Restart if it was meant to be listening
        }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis API not supported in this browser.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    speak,
    hasSpeechSupport: !!SpeechRecognitionImpl,
  };
};
