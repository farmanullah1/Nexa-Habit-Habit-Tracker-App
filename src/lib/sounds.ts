const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playPop = () => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playSuccess = () => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  oscillator.frequency.linearRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
  oscillator.frequency.linearRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
};
