import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

const MusicPlayer = ({ trackUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const soundRef = useRef(null);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [trackUrl],
      html5: true,
      volume: volume,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
      onload: () => console.log('Track loaded')
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [trackUrl]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <button onClick={togglePlay} className="p-2">
          {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
        </button>
        
        <div className="flex-1 mx-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            className="w-full" 
          />
        </div>
        
        <div className="flex items-center">
          <FaVolumeUp className="mr-2" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume} 
            onChange={(e) => {
              setVolume(e.target.value);
              soundRef.current.volume(e.target.value);
            }}
            className="w-24" 
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;