import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

// Timing for transitions
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="page-transition-wrapper"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 