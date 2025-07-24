import { useEffect, useRef, useState } from 'react';

interface AnnouncementSoundProps {
    queueNumber: string;
    counterName: string;
    roomName?: string;
    autoPlay?: boolean;
    audioContextInitialized?: boolean;
    onComplete?: () => void;
}

const AnnouncementSound: React.FC<AnnouncementSoundProps> = ({
    queueNumber,
    counterName,
    roomName,
    autoPlay = true, // Default to true
    audioContextInitialized = false,
    onComplete
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const isProcessingRef = useRef(false);

    // Create announcement text
    const createAnnouncementText = () => {
        let text = `Nomor antrian ${queueNumber.split('').join(' ')}, `;
        text += `silakan menuju ${counterName}`;
        if (roomName) {
            text += ` di ${roomName}`;
        }
        text += '. Terima kasih.';
        return text;
    };

    const playBellSound = () => {
        return new Promise<void>((resolve) => {
            try {
                console.log('🔔 Playing bell sound...');
                
                // Create AudioContext
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContext) {
                    console.warn('⚠️ Web Audio API not supported');
                    resolve();
                    return;
                }
                
                const audioContext = new AudioContext();
                console.log('🎵 AudioContext state:', audioContext.state);
                
                // Handle suspended audio context
                const playSound = () => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Bell-like sound with higher volume
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
                    
                    gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1.0);

                    oscillator.onended = () => {
                        console.log('✅ Bell sound ended');
                        audioContext.close();
                        resolve();
                    };

                    // Fallback timeout
                    setTimeout(() => {
                        if (audioContext.state !== 'closed') {
                            audioContext.close();
                        }
                        resolve();
                    }, 1500);
                };
                
                // Resume audio context if suspended (required by browsers)
                if (audioContext.state === 'suspended') {
                    console.log('🔊 Resuming suspended AudioContext...');
                    audioContext.resume().then(() => {
                        console.log('✅ Audio context resumed');
                        playSound();
                    }).catch((error) => {
                        console.error('❌ Failed to resume audio context:', error);
                        resolve();
                    });
                } else {
                    playSound();
                }
                
            } catch (error) {
                console.error('❌ Error playing bell sound:', error);
                resolve();
            }
        });
    };

    const playTextToSpeech = (text: string) => {
        return new Promise<void>((resolve) => {
            try {
                console.log('Playing text to speech:', text);
                
                if (!('speechSynthesis' in window)) {
                    console.warn('Speech synthesis not supported');
                    resolve();
                    return;
                }

                // Cancel any existing speech
                window.speechSynthesis.cancel();
                
                // Wait for voices to be loaded
                const speak = () => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 0.9;
                    utterance.pitch = 1.1;
                    utterance.volume = 1.0;
                    utterance.lang = 'id-ID';

                    // Get available voices
                    const voices = window.speechSynthesis.getVoices();
                    console.log('Available voices:', voices.length);
                    
                    if (voices.length > 0) {
                        const indonesianVoice = voices.find(v => 
                            v.lang.toLowerCase().includes('id') || 
                            v.name.toLowerCase().includes('indonesia') ||
                            v.name.toLowerCase().includes('bahasa')
                        );
                        
                        if (indonesianVoice) {
                            utterance.voice = indonesianVoice;
                            console.log('Using voice:', indonesianVoice.name);
                        } else {
                            console.log('No Indonesian voice found, using default voice');
                            // Use first available voice if no Indonesian found
                            if (voices.length > 0) {
                                utterance.voice = voices[0];
                                console.log('Using fallback voice:', voices[0].name);
                            }
                        }
                    }

                    utterance.onstart = () => {
                        console.log('Speech started');
                    };

                    utterance.onend = () => {
                        console.log('Speech ended');
                        resolve();
                    };

                    utterance.onerror = (error) => {
                        console.error('Speech error:', error);
                        resolve();
                    };

                    // Ensure speech synthesis is ready
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }

                    console.log('Speaking text:', text);
                    window.speechSynthesis.speak(utterance);
                    
                    // Fallback timeout
                    setTimeout(() => {
                        console.log('Speech timeout, resolving...');
                        window.speechSynthesis.cancel();
                        resolve();
                    }, text.length * 150); // Dynamic timeout based on text length
                };

                // Wait for voices to load if not available yet
                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        window.speechSynthesis.onvoiceschanged = null;
                        setTimeout(speak, 100);
                    };
                } else {
                    setTimeout(speak, 100);
                }
                
            } catch (error) {
                console.error('Error in text to speech:', error);
                resolve();
            }
        });
    };

    const playAnnouncement = async () => {
        if (isPlaying || isProcessingRef.current) {
            console.log('⏸️ Already playing or processing, skipping...');
            return;
        }

        // Check if audio context needs initialization first
        if (!audioContextInitialized) {
            console.log('⚠️ Audio context not initialized yet, skipping audio announcement');
            console.log('ℹ️ User must interact with the page first (click Audio On button)');
            // Don't try to play audio if context isn't initialized
            if (onComplete) {
                onComplete();
            }
            return;
        }

        console.log('🎵 Starting announcement for queue:', queueNumber, 'at counter:', counterName);
        isProcessingRef.current = true;
        setIsPlaying(true);
        setCurrentStep(1);

        try {
            // Step 1: Play bell sound
            console.log('🔔 Step 1: Playing bell');
            await playBellSound();
            
            // Small pause between bell and speech
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Step 2: Play speech
            console.log('🎤 Step 2: Playing speech');
            setCurrentStep(2);
            
            // Play the announcement text
            const announcementText = createAnnouncementText();
            await playTextToSpeech(announcementText);

        } catch (error) {
            console.error('❌ Error in announcement:', error);
        } finally {
            setCurrentStep(3);
            setIsPlaying(false);
            isProcessingRef.current = false;
            console.log('✅ Announcement completed for queue:', queueNumber);
            
            // Call onComplete after a small delay
            setTimeout(() => {
                onComplete?.();
            }, 500);
        }
    };

    useEffect(() => {
        if (autoPlay && !isProcessingRef.current) {
            console.log('🔊 Auto-playing announcement...', {
                queueNumber,
                counterName,
                roomName,
                isProcessing: isProcessingRef.current
            });
            const timer = setTimeout(() => {
                playAnnouncement();
            }, 500);

            return () => clearTimeout(timer);
        } else {
            console.log('🔇 Announcement not triggered:', {
                autoPlay,
                isProcessing: isProcessingRef.current,
                queueNumber
            });
        }
    }, [autoPlay, queueNumber, counterName]);

    // Load voices when component mounts
    useEffect(() => {
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
    }, []);

    // Don't render anything - this is just for audio
    return null;
};

export default AnnouncementSound;
