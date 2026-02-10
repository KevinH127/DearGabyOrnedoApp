import React, { useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  shouldPlay: boolean;
  videoId: string;
  volume?: number;
  startTime?: number;
  forcePlayTrigger?: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ shouldPlay, videoId, volume = 20, startTime = 0, forcePlayTrigger = 0 }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  const sendCommand = (command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      console.log(`[MusicPlayer] Sending command: ${command}`, args);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: args
        }),
        '*'
      );
    }
  };

  // Helper to set volume
  const setPlayerVolume = (vol: number) => {
    sendCommand('setVolume', [vol]);
  };

  // Handle Play/Pause based on props and user mute state
  useEffect(() => {
    if (!iframeReady) return;

    if (shouldPlay) {
      if (!userMuted) {
        sendCommand('playVideo');
        setPlayerVolume(volume);
        setIsPlaying(true);
      }
    } else {
      sendCommand('pauseVideo');
      setIsPlaying(false);
    }
  }, [shouldPlay, iframeReady, userMuted, forcePlayTrigger]); // Added forcePlayTrigger to re-evaluate play state

  // Handle Volume updates
  useEffect(() => {
    if (iframeReady) {
      setPlayerVolume(volume);
    }
  }, [volume, iframeReady]);


  // Handle Toggle Mute / toggle Play
  const toggleMute = () => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
      setUserMuted(true);
    } else {
      sendCommand('playVideo');
      setPlayerVolume(volume);
      setIsPlaying(true);
      setUserMuted(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div className="fixed -top-full opacity-0 pointer-events-none">
        <iframe
          ref={iframeRef}
          width="560"
          height="315"
          // We include start parameter in src to ensure new video loads at correct time if ID changes
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&loop=1&playlist=${videoId}&start=${startTime}`}
          title="Background Music"
          allow="autoplay; encrypted-media"
          onLoad={() => {
            console.log("[MusicPlayer] Iframe loaded");
            setIframeReady(true);
            // If we are supposed to be playing, start playing immediately on load
            if (shouldPlay && !userMuted) {
              // Small timeout to ensure API is ready, but keep it snappy
              setTimeout(() => {
                console.log("[MusicPlayer] Attempting initial play");
                sendCommand('playVideo');
                sendCommand('setVolume', [volume]);
              }, 100);
            }
          }}
        />
      </div>
      <button
        onClick={toggleMute}
        className="bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-full hover:bg-white/50 transition-all shadow-lg text-valentine-800"
      >
        {isPlaying ? <Music size={24} className="animate-pulse" /> : <VolumeX size={24} />}
      </button>
    </div>
  );
};

export default MusicPlayer;