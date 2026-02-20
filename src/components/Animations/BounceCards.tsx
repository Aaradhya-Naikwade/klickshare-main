import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import "../../styles/bouncecards.module.css";

interface BounceCardsProps {
  className?: string;
  images?: string[];
  containerWidth?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  mobileTransformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 700,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(5deg) translateX(-50%)',
    'rotate(0deg) translateX(-30%)',
    'rotate(-5deg) translateX(-10%)',
    'rotate(0deg) translateX(10%)',
    'rotate(-4deg) translateX(30%)',
    'rotate(-5deg) translateX(50%)',
  ],
  mobileTransformStyles = [
    'rotate(2deg) translateX(-40%)',
    'rotate(0deg) translateX(-20%)',
    'rotate(-5deg) translateX(-10%)',
    'rotate(5deg) translateX(10%)',
    'rotate(-2deg) translateX(20%)',
    'rotate(-2deg) translateX(40%)',
  ],
  enableHover = false
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // GSAP animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
          duration: 0.8
        }
      );
    });
    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  // Helpers for hover effects
  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    if (transformStr === 'none') return 'rotate(0deg)';
    return `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform: string, offsetPercent: number) => {
    const translateRegex = /translateX\(([-0-9.]+)%\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const current = parseFloat(match[1]);
      const newVal = current + offsetPercent;
      return baseTransform.replace(translateRegex, `translateX(${newVal}%)`);
    } else {
      return `${baseTransform} translateX(${offsetPercent}%)`;
    }
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return;

    images.forEach((_, i) => {
      const selector = `.card-${i}`;
      gsap.killTweensOf(selector);

      // Pick transform style based on screen
      const baseTransform = windowWidth < 640 ? mobileTransformStyles[i] || 'none' : transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        gsap.to(selector, { transform: getNoRotationTransform(baseTransform), duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
      } else {
        const offsetPercent = i < hoveredIdx ? -25 : 25;
        gsap.to(selector, {
          transform: getPushedTransform(baseTransform, offsetPercent),
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: Math.abs(hoveredIdx - i) * 0.05,
          overwrite: 'auto'
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover) return;
    images.forEach((_, i) => {
      gsap.killTweensOf(`.card-${i}`);
      const baseTransform = windowWidth < 640 ? mobileTransformStyles[i] || 'none' : transformStyles[i] || 'none';
      gsap.to(`.card-${i}`, { transform: baseTransform, duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
    });
  };

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (windowWidth < 640) return '80%'; // mobile
    if (windowWidth < 1024) return '45%'; // tablet
    return '30%'; // desktop
  };

  // Calculate card height based on screen size
  const getCardHeight = () => {
    if (windowWidth < 640) return '60vw'; // mobile
    if (windowWidth < 1024) return '45vw'; // tablet
    return '50vw'; // desktop
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: '100%',
        maxWidth: containerWidth,
        height: getCardHeight(),
        maxHeight: 400,
        marginTop: '1rem',
      }}
    >
      {images.map((src, idx) => {
        let responsiveHide = '';
        if (idx === 0 || idx === 5) responsiveHide = 'hidden lg:block';
        if (idx === 1 || idx === 4) responsiveHide = 'hidden sm:block lg:block';

        return (
          <div
            key={idx}
            className={`card card-${idx} absolute rounded-2xl overflow-hidden ${responsiveHide}`}
            style={{
              width: getCardWidth(),
              aspectRatio: '220 / 240',
              background: 'linear-gradient(135deg, #1F6563, #3DC6C2, #1F6563)',
              transform: windowWidth < 640 ? mobileTransformStyles[idx] || 'none' : transformStyles[idx] || 'none',
              willChange: 'transform, opacity',
            }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            <div className="w-full h-full bg-black rounded-xl p-[9px] flex items-center justify-center overflow-hidden">
              <img className="w-full h-full object-cover rounded-lg" src={src} alt={`card-${idx}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
