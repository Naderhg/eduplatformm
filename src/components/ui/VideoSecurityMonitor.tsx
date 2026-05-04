import React, { useEffect, useRef } from 'react';

interface VideoSecurityMonitorProps {
  children: React.ReactNode;
  isStudent?: boolean;
}

export const VideoSecurityMonitor: React.FC<VideoSecurityMonitorProps> = ({ 
  children, 
  isStudent = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStudent) return; // Only apply to students

    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common download shortcuts
      const downloadShortcuts = [
        (e.ctrlKey && e.key === 's'), // Ctrl+S
        (e.ctrlKey && e.shiftKey && e.key === 'S'), // Ctrl+Shift+S
        (e.ctrlKey && e.key === 'u'), // Ctrl+U (view source)
        (e.ctrlKey && e.shiftKey && e.key === 'I'), // Ctrl+Shift+I (dev tools)
        (e.key === 'F12'), // F12 (dev tools)
        (e.metaKey && e.key === 's'), // Cmd+S (Mac)
        (e.metaKey && e.shiftKey && e.key === 'S'), // Cmd+Shift+S (Mac)
        (e.metaKey && e.altKey && e.key === 'u'), // Cmd+Alt+U (Mac view source)
      ];

      if (downloadShortcuts.some(shortcut => shortcut)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const container = containerRef.current;
    if (!container) return;

    // Add event listeners to container
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    container.addEventListener('copy', handleCopy);

    // Add global keyboard shortcuts prevention
    document.addEventListener('keydown', handleKeyDown);

    // Prevent text selection globally when video is playing
    const style = document.createElement('style');
    style.textContent = `
      .video-security-active {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('video-security-active');

    // Monitor for dev tools opening
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Optionally redirect or show warning
          console.log('Dev tools detected');
        }
      } else {
        devtools.open = false;
      }
    };

    const devToolsInterval = setInterval(checkDevTools, 500);

    return () => {
      // Cleanup
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
      container.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('video-security-active');
      document.head.removeChild(style);
      clearInterval(devToolsInterval);
    };
  }, [isStudent]);

  return (
    <div ref={containerRef} className="video-security-container">
      {children}
    </div>
  );
};
