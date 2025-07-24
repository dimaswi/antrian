import { useEffect, useRef } from 'react';

interface TTSProps {
    text: string;
    autoPlay?: boolean;
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export default function TextToSpeech({
    text,
    autoPlay = false,
    voice = 'id-ID',
    rate = 0.9,
    pitch = 1,
    volume = 0.8,
    onStart,
    onEnd,
    onError
}: TTSProps) {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isPlayingRef = useRef(false);

    const speak = () => {
        if ('speechSynthesis' in window && !isPlayingRef.current) {
            try {
                // Stop any current speech
                window.speechSynthesis.cancel();
                
                // Wait a bit for cancellation to complete
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = rate;
                    utterance.pitch = pitch;
                    utterance.volume = volume;
                    utterance.lang = 'id-ID'; // Set Indonesian language

                    // Get voices and try to find Indonesian voice
                    const voices = window.speechSynthesis.getVoices();
                    console.log('Available voices:', voices);
                    
                    const indonesianVoice = voices.find(v => 
                        v.lang.toLowerCase().includes('id') || 
                        v.name.toLowerCase().includes('indonesia') ||
                        v.name.toLowerCase().includes('bahasa')
                    );
                    
                    if (indonesianVoice) {
                        utterance.voice = indonesianVoice;
                        console.log('Using Indonesian voice:', indonesianVoice.name);
                    } else {
                        console.log('No Indonesian voice found, using default');
                    }

                    utterance.onstart = () => {
                        isPlayingRef.current = true;
                        console.log('Speech started');
                        onStart?.();
                    };

                    utterance.onend = () => {
                        isPlayingRef.current = false;
                        console.log('Speech ended');
                        onEnd?.();
                    };

                    utterance.onerror = (error) => {
                        isPlayingRef.current = false;
                        console.error('Speech synthesis error:', error);
                        onError?.(error);
                    };

                    utteranceRef.current = utterance;
                    
                    // Ensure speech synthesis is ready
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }
                    
                    console.log('Starting speech:', text);
                    window.speechSynthesis.speak(utterance);
                }, 100);
                
            } catch (error) {
                console.error('Error in speak function:', error);
                onError?.(error);
            }
        } else {
            console.warn('Speech synthesis not supported or already playing');
            if (!('speechSynthesis' in window)) {
                onError?.('Speech synthesis not supported');
            }
        }
    };

    const stop = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isPlayingRef.current = false;
        }
    };

    useEffect(() => {
        if (autoPlay && text) {
            // Delay to ensure voices are loaded and component is ready
            const timer = setTimeout(() => {
                speak();
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [text, autoPlay]);

    useEffect(() => {
        // Load voices when component mounts
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                console.log('Voices loaded:', voices.length);
            };
            
            // Load voices immediately
            loadVoices();
            
            // Also load when voices change (some browsers load asynchronously)
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup on unmount
        return () => {
            stop();
        };
    }, []);

    return {
        speak,
        stop,
        isSupported: 'speechSynthesis' in window,
        isPlaying: isPlayingRef.current
    };
}
