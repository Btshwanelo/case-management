import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MoveLeft, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipBack, SkipForward, Settings, ChevronDown } from 'lucide-react';
import ReactPlayer from 'react-player';
import Logo from '@/assets/logo-black.png';
import BgImage from '@/assets/video-bg.jpg';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const userTypes = [
  {
    title: 'Student',
    video: 'https://assets.ezra360.com/Images/NSFAS/Videos/student.mp4',
    type: 's',
    description: 'Learn about the student accommodation application process',
  },
  {
    title: 'Accommodation Provider',
    video: 'https://assets.ezra360.com/Images/NSFAS/Videos/AccomodationProviderBedReservationProvider.mp4',
    type: 'p',
    description: 'Learn about managing your accommodation listings and applications',
  },
  {
    title: 'Institution',
    video: 'https://assets.ezra360.com/Images/NSFAS/Videos/StudentInstitutionRepresentative.mp4',
    type: 'i',
    description: 'Learn about institution representative features and responsibilities',
  },
];

const formatTime = (seconds: number) => {
  const pad = (num: number) => `0${num}`.slice(-2);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
};

const MobileControls = ({
  isPlaying,
  onPlayPause,
  played,
  duration,
  onSeek,
  playbackRate,
  onPlaybackRateChange,
  onToggleFullscreen,
}: any) => (
  <div className="flex flex-col gap-2 p-2" data-testid="mobile-controls">
    {/* Progress Bar */}
    <Slider value={[played]} max={1} step={0.001} onValueChange={onSeek} className="w-full" data-testid="mobile-progress-slider" />

    <div className="flex items-center justify-between" data-testid="mobile-controls-row">
      <div className="flex items-center gap-1" data-testid="mobile-playback-controls">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onPlayPause}
          data-testid="mobile-play-pause-btn"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="text-white text-xs" data-testid="mobile-time-display">
          {formatTime(played * duration)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-1" data-testid="mobile-secondary-controls">
        <Select value={playbackRate.toString()} onValueChange={onPlaybackRateChange}>
          <SelectTrigger className="w-16 h-8 text-white bg-transparent border-white/20" data-testid="mobile-playback-rate-select">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent data-testid="mobile-playback-rate-options">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <SelectItem key={rate} value={rate.toString()} data-testid={`mobile-playback-rate-${rate}`}>
                {rate}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onToggleFullscreen}
          data-testid="mobile-fullscreen-btn"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const DesktopControls = ({
  isPlaying,
  onPlayPause,
  played,
  duration,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  playbackRate,
  onPlaybackRateChange,
  onSkipBackward,
  onSkipForward,
  onToggleFullscreen,
}: any) => (
  <div className="flex flex-col gap-4 p-4" data-testid="desktop-controls">
    <Slider value={[played]} max={1} step={0.001} onValueChange={onSeek} className="w-full" data-testid="desktop-progress-slider" />

    <div className="flex items-center justify-between" data-testid="desktop-controls-row">
      <div className="flex items-center gap-2" data-testid="desktop-playback-controls">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onPlayPause}
          data-testid="desktop-play-pause-btn"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onSkipBackward}
          data-testid="desktop-skip-backward-btn"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onSkipForward}
          data-testid="desktop-skip-forward-btn"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <span className="text-white text-sm" data-testid="desktop-time-display">
          {formatTime(played * duration)} / {formatTime(duration)}
        </span>

        <div className="flex items-center gap-2 ml-4" data-testid="desktop-volume-controls">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onToggleMute}
            data-testid="desktop-mute-btn"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <div className="w-24">
            <Slider value={[volume]} max={1} step={0.1} onValueChange={onVolumeChange} data-testid="desktop-volume-slider" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2" data-testid="desktop-secondary-controls">
        <Select value={playbackRate.toString()} onValueChange={onPlaybackRateChange}>
          <SelectTrigger className="w-20 h-8 text-white bg-transparent border-white/20" data-testid="desktop-playback-rate-select">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent data-testid="desktop-playback-rate-options">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <SelectItem key={rate} value={rate.toString()} data-testid={`desktop-playback-rate-${rate}`}>
                {rate}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onToggleFullscreen}
          data-testid="desktop-fullscreen-btn"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
);

export default function VideoScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const entry = searchParams.get('type');
  const currentVideo = userTypes.find((type) => type.type === entry);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if entry is not valid
  if (!currentVideo) {
    return <Navigate to="/login" replace />;
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoClick = (event: React.MouseEvent) => {
    // Don't trigger play/pause if clicking on controls
    if (!(event.target as HTMLElement).closest('.controls-container')) {
      handlePlayPause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
    playerRef.current?.seekTo(value[0]);
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else if (containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const skipSeconds = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      player.seekTo(currentTime + seconds);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="video-screen-container">
      {/* Header */}
      <nav className="border-b bg-white border-orange-500" data-testid="navigation-header">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src={Logo} alt="NSFAS Logo" className="h-8 sm:h-12 cursor-pointer" onClick={() => navigate('/')} data-testid="logo-image" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-40 sm:h-52 bg-orange-600 text-white" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-600/90">
          <img
            src={BgImage}
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
            data-testid="hero-background-image"
          />
        </div>

        <div className="relative px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto" data-testid="hero-content">
          <div className="text-sm mb-2" data-testid="hero-breadcrumb">
            Knowledgebase
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4" data-testid="hero-title">
            {currentVideo.title}
          </h1>
          <p className="text-base sm:text-lg max-w-2xl" data-testid="hero-description">
            {currentVideo.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 mt-1" data-testid="main-content">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3" data-testid="back-button-container">
            <Button
              variant="link"
              className="pl-0 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/login')}
              data-testid="back-button"
            >
              <MoveLeft className="mr-2" /> Back
            </Button>
          </div>

          <Card className="overflow-hidden" data-testid="video-card">
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="relative aspect-video bg-black group cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowControls(true)}
                onClick={handleVideoClick}
                data-testid="video-container"
              >
                <ReactPlayer
                  ref={playerRef}
                  url={currentVideo.video}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  volume={volume}
                  muted={isMuted}
                  playbackRate={playbackRate}
                  onProgress={handleProgress}
                  onDuration={setDuration}
                  className="absolute top-0 left-0"
                  data-testid="video-player"
                />

                {/* Centered Play/Pause Icon */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                  data-testid="center-play-button"
                >
                  <div className="bg-black/50 rounded-full p-4">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>

                {/* Controls Container */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 transition-opacity duration-300 controls-container ${showControls ? 'opacity-100' : 'opacity-0'}`}
                  data-testid="video-controls-overlay"
                >
                  {isMobile ? (
                    <MobileControls
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      played={played}
                      duration={duration}
                      onSeek={handleSeekChange}
                      playbackRate={playbackRate}
                      onPlaybackRateChange={(value: any) => setPlaybackRate(parseFloat(value))}
                      onToggleFullscreen={handleFullscreen}
                    />
                  ) : (
                    <DesktopControls
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      played={played}
                      duration={duration}
                      onSeek={handleSeekChange}
                      volume={volume}
                      isMuted={isMuted}
                      onVolumeChange={handleVolumeChange}
                      onToggleMute={() => setIsMuted(!isMuted)}
                      playbackRate={playbackRate}
                      onPlaybackRateChange={(value: any) => setPlaybackRate(parseFloat(value))}
                      onSkipBackward={() => skipSeconds(-10)}
                      onSkipForward={() => skipSeconds(10)}
                      onToggleFullscreen={handleFullscreen}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
