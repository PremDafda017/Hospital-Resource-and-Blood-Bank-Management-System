import React from 'react';

// Responsive Design System
// Breakpoints and utilities for consistent responsive design across the application

export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
  
  // Max-width queries
  xsMax: `@media (max-width: ${breakpoints.sm - 1}px)`,
  smMax: `@media (max-width: ${breakpoints.md - 1}px)`,
  mdMax: `@media (max-width: ${breakpoints.lg - 1}px)`,
  lgMax: `@media (max-width: ${breakpoints.xl - 1}px)`,
  xlMax: `@media (max-width: ${breakpoints.xxl - 1}px)`
};

// Responsive spacing
export const spacing = {
  xs: { padding: '8px', margin: '8px', gap: '8px' },
  sm: { padding: '12px', margin: '12px', gap: '12px' },
  md: { padding: '16px', margin: '16px', gap: '16px' },
  lg: { padding: '24px', margin: '24px', gap: '24px' },
  xl: { padding: '32px', margin: '32px', gap: '32px' }
};

// Responsive font sizes
export const fontSizes = {
  xs: { h1: '1.5rem', h2: '1.25rem', h3: '1.1rem', body: '0.85rem', small: '0.75rem' },
  sm: { h1: '1.75rem', h2: '1.5rem', h3: '1.25rem', body: '0.9rem', small: '0.8rem' },
  md: { h1: '2rem', h2: '1.75rem', h3: '1.5rem', body: '1rem', small: '0.85rem' },
  lg: { h1: '2.25rem', h2: '2rem', h3: '1.75rem', body: '1.1rem', small: '0.9rem' },
  xl: { h1: '2.5rem', h2: '2.25rem', h3: '2rem', body: '1.15rem', small: '0.95rem' }
};

// Responsive sidebar widths
export const sidebarWidths = {
  collapsed: 68,
  expanded: 260,
  mobile: 0 // Hidden on mobile, use hamburger menu
};

// Grid system
export const grid = {
  columns: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 4
  }
};

// Card responsive styles
export const getCardResponsiveStyle = (breakpoint = 'md') => {
  const styles = {
    xs: {
      width: '100%',
      minWidth: 'auto',
      padding: '12px'
    },
    sm: {
      width: 'calc(50% - 8px)',
      minWidth: '280px',
      padding: '16px'
    },
    md: {
      width: 'calc(50% - 12px)',
      minWidth: '300px',
      padding: '20px'
    },
    lg: {
      width: 'calc(33.333% - 16px)',
      minWidth: '320px',
      padding: '24px'
    },
    xl: {
      width: 'calc(25% - 18px)',
      minWidth: '340px',
      padding: '24px'
    }
  };
  return styles[breakpoint] || styles.md;
};

// Table responsive styles
export const getTableResponsiveStyle = () => ({
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch'
});

// Container responsive styles
export const getContainerStyle = (breakpoint = 'md') => {
  const styles = {
    xs: { maxWidth: '100%', padding: '0 12px' },
    sm: { maxWidth: '540px', padding: '0 16px' },
    md: { maxWidth: '720px', padding: '0 20px' },
    lg: { maxWidth: '960px', padding: '0 24px' },
    xl: { maxWidth: '1140px', padding: '0 24px' },
    xxl: { maxWidth: '1320px', padding: '0 24px' }
  };
  return styles[breakpoint] || styles.md;
};

// Hook to detect screen size
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState('md');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) setScreenSize('xs');
      else if (width < breakpoints.md) setScreenSize('sm');
      else if (width < breakpoints.lg) setScreenSize('md');
      else if (width < breakpoints.xl) setScreenSize('lg');
      else if (width < breakpoints.xxl) setScreenSize('xl');
      else setScreenSize('xxl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Animation variants for Framer Motion
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Scroll animation hook
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};
