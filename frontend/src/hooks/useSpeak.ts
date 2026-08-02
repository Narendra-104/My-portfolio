import { useState, useEffect, useCallback } from 'react';

export const useSpeak = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Load available speech synthesis voices asynchronously
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speak = useCallback(
    (textToSpeak: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Text-to-speech is not supported in this browser.');
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      if (!textToSpeak || !textToSpeak.trim()) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // 1. Detect Devanagari Script (Hindi & Marathi)
      const isDevanagari = /[\u0900-\u097F]/.test(textToSpeak);

      let targetLang = 'en-US';

      if (isDevanagari) {
        // Differentiate Marathi from Hindi using key Marathi vocabulary
        const marathiKeywords = /\b(आहे|नाही|बद्दल|करा|माझे|तुमचे|आहेत|झाले|तुमच्या|सांगा|प्रोजेक्ट्स)\b/i;

        if (marathiKeywords.test(textToSpeak)) {
          targetLang = 'mr-IN'; // 🇮🇳 Marathi
        } else {
          targetLang = 'hi-IN'; // 🇮🇳 Hindi
        }
      }

      utterance.lang = targetLang;

      // 2. Find matching voice installed in the browser
      const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      const matchedVoice = currentVoices.find(
        (voice) =>
          voice.lang === targetLang ||
          voice.lang.startsWith(targetLang.split('-')[0]) ||
          voice.name.toLowerCase().includes(
            targetLang === 'hi-IN' ? 'hindi' : targetLang === 'mr-IN' ? 'marathi' : 'english'
          )
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Voice adjustments
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Event listeners for state tracking
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voices]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, voices };
};