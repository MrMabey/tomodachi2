import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './FloAvatar.css';

interface FloAvatarProps {
  onInteract?: () => void;
}

type Expression = 'normal' | 'happy' | 'sleepy' | 'blink';

export const FloAvatar: React.FC<FloAvatarProps> = ({ onInteract }) => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [velocity, setVelocity] = useState({ x: 1.5, y: 1 });
  const [expression, setExpression] = useState<Expression>('normal');
  const [isBlinking, setIsBlinking] = useState(false);
  const [isOffScreen, setIsOffScreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [curiosityMode, setCuriosityMode] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(0);

  // Random expression changes
  useEffect(() => {
    const expressionInterval = setInterval(() => {
      const expressions: Expression[] = ['normal', 'happy', 'sleepy'];
      const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
      setExpression(randomExpression);
    }, 4000 + Math.random() * 6000);

    return () => clearInterval(expressionInterval);
  }, []);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Curiosity mode - sometimes gets curious and changes direction
  useEffect(() => {
    const curiosityInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        setCuriosityMode(true);
        setExpression('happy');
        
        // Change direction randomly when curious
        setVelocity(prev => ({
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3
        }));
        
        setTimeout(() => setCuriosityMode(false), 2000);
      }
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(curiosityInterval);
  }, []);

  // Random pauses - Flo sometimes stops to "think"
  useEffect(() => {
    const pauseInterval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance
        setPauseTimer(1000 + Math.random() * 2000);
        setExpression('sleepy');
      }
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(pauseInterval);
  }, []);

  // Floating animation with personality
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setPauseTimer(prev => Math.max(0, prev - 16));
      
      setPosition(prevPos => {
        // If paused, don't move
        if (pauseTimer > 0) {
          return prevPos;
        }

        let newX = prevPos.x + velocity.x;
        let newY = prevPos.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        const avatarSize = 60;
        const margin = 100;

        // Check for screen boundaries and off-screen floating
        if (newX > window.innerWidth + margin) {
          newX = -margin;
          newY = Math.random() * (window.innerHeight - avatarSize);
          setIsOffScreen(true);
          setTimeout(() => setIsOffScreen(false), 1500);
        } else if (newX < -margin) {
          newX = window.innerWidth + margin;
          newY = Math.random() * (window.innerHeight - avatarSize);
          setIsOffScreen(true);
          setTimeout(() => setIsOffScreen(false), 1500);
        }

        if (newY > window.innerHeight + margin) {
          newY = -margin;
          newX = Math.random() * (window.innerWidth - avatarSize);
          setIsOffScreen(true);
          setTimeout(() => setIsOffScreen(false), 1500);
        } else if (newY < -margin) {
          newY = window.innerHeight + margin;
          newX = Math.random() * (window.innerWidth - avatarSize);
          setIsOffScreen(true);
          setTimeout(() => setIsOffScreen(false), 1500);
        }

        // Bounce off visible screen edges with personality
        if (newX >= window.innerWidth - avatarSize && newX <= window.innerWidth) {
          newVelocityX = -Math.abs(velocity.x) * (0.8 + Math.random() * 0.4);
          if (Math.random() < 0.3) setExpression('happy'); // Sometimes happy when bouncing
        } else if (newX <= 0 && newX >= -avatarSize) {
          newVelocityX = Math.abs(velocity.x) * (0.8 + Math.random() * 0.4);
          if (Math.random() < 0.3) setExpression('happy');
        }

        if (newY >= window.innerHeight - avatarSize && newY <= window.innerHeight) {
          newVelocityY = -Math.abs(velocity.y) * (0.8 + Math.random() * 0.4);
          if (Math.random() < 0.3) setExpression('happy');
        } else if (newY <= 0 && newY >= -avatarSize) {
          newVelocityY = Math.abs(velocity.y) * (0.8 + Math.random() * 0.4);
          if (Math.random() < 0.3) setExpression('happy');
        }

        // Add personality to movement - sometimes drift, sometimes dart
        if (!curiosityMode) {
          if (Math.random() < 0.05) { // 5% chance to change direction slightly
            newVelocityX += (Math.random() - 0.5) * 0.5;
            newVelocityY += (Math.random() - 0.5) * 0.5;
          }
          
          // Gentle drift towards center sometimes
          if (Math.random() < 0.02) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            if (prevPos.x > centerX) newVelocityX -= 0.1;
            if (prevPos.x < centerX) newVelocityX += 0.1;
            if (prevPos.y > centerY) newVelocityY -= 0.1;
            if (prevPos.y < centerY) newVelocityY += 0.1;
          }
        }

        // Keep velocity within bounds, but allow for more personality
        newVelocityX = Math.max(-2.5, Math.min(2.5, newVelocityX));
        newVelocityY = Math.max(-2.5, Math.min(2.5, newVelocityY));

        setVelocity({ x: newVelocityX, y: newVelocityY });

        return { x: newX, y: newY };
      });
    }, 16); // ~60fps

    return () => clearInterval(animationFrame);
  }, [velocity, curiosityMode, pauseTimer]);

  // Hover effect
  const handleMouseEnter = useCallback(() => {
    setScale(1.1);
    setExpression('happy');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setScale(1);
  }, []);

  // Click interaction
  const handleClick = useCallback(() => {
    setExpression('happy');
    setScale(1.2);
    setTimeout(() => setScale(1), 200);
    onInteract?.();
  }, [onInteract]);

  const showMouth = expression === 'happy';

  return (
    <div
      className={`flo-avatar ${isOffScreen ? 'off-screen' : ''} ${expression}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Simple oval body */}
      <div className="flo-body">
        {/* Triangle ears */}
        <div className="flo-ear left-ear"></div>
        <div className="flo-ear right-ear"></div>
        
        {/* Simple dot eyes */}
        <div className={`flo-eye left-eye ${isBlinking ? 'blink' : ''}`}></div>
        <div className={`flo-eye right-eye ${isBlinking ? 'blink' : ''} ${expression === 'sleepy' ? 'sleepy' : ''}`}></div>
        
        {/* Simple mouth (only when happy) */}
        {showMouth && <div className="flo-mouth"></div>}
      </div>
    </div>
  );
};

export function createFloAvatar() {
  // Check if avatar already exists
  if (document.getElementById('flo-avatar-container')) {
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'flo-avatar-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999997;
    pointer-events: none;
    width: 100vw;
    height: 100vh;
  `;
  
  // Make avatar allow pointer events
  const avatarStyle = document.createElement('style');
  avatarStyle.textContent = `
    #flo-avatar-container .flo-avatar {
      pointer-events: auto;
    }
  `;
  document.head.appendChild(avatarStyle);
  
  document.body.appendChild(container);
  
  // Render React component
  const root = createRoot(container);
  root.render(
    <FloAvatar 
      onInteract={() => {
        console.log('Flo avatar clicked!');
        // Could trigger floating interface or other interactions
      }} 
    />
  );
}