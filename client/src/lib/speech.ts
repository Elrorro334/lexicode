export function speakEnglish(text: string, rate = 0.96, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('natural')) ||
    voices.find((v) => v.lang.startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en'));
  if (preferred) {
    utterance.voice = preferred;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognition(
  onTranscript: (finalText: string, interimText: string) => void,
  onError: (message: string) => void,
  onEnd: () => void
) {
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalAccumulated = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalAccumulated += piece + ' ';
      } else {
        interim += piece;
      }
    }
    onTranscript(finalAccumulated.trim(), interim.trim());
  };

  recognition.onerror = (ev: any) => {
    onError(ev.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
