import { motion } from "framer-motion";

// Fade in animation variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

// Slide up animation variants
export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Slide in from left
export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Slide in from right
export const slideInRightVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Scale animation
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Card hover effect
export const cardHover = {
  hover: {
    y: -5,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

// Animated Fade In Component
export const AnimatedFadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInVariants}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Animated Slide Up Component
export const AnimatedSlideUp = ({ children, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideUpVariants}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Animated Card Component
export const AnimatedCard = ({ children, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={scaleVariants}
    whileHover="hover"
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Animated Section Component
export const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.section
    initial="hidden"
    animate="visible"
    variants={slideUpVariants}
    transition={{ delay }}
  >
    {children}
  </motion.section>
);

// Animated List Component
export const AnimatedList = ({ children }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    {children}
  </motion.div>
);

// Animated List Item Component
export const AnimatedListItem = ({ children, delay = 0 }) => (
  <motion.div
    variants={slideUpVariants}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Page transition animation
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};

// Pulse animation for notifications
export const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Shimmer loading effect
export const shimmerVariants = {
  initial: { backgroundPosition: "-1000px 0" },
  animate: {
    backgroundPosition: "1000px 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Bounce animation
export const bounceVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Rotate animation
export const rotateVariants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Animated Button Component
export const AnimatedButton = ({ children, onClick, style = {}, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={style}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated Input Component
export const AnimatedInput = ({ ...props }) => (
  <motion.input
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileFocus={{ scale: 1.02 }}
    {...props}
  />
);

// Animated Modal Component
export const AnimatedModal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Animated Tab Component
export const AnimatedTab = ({ children, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    animate={{
      backgroundColor: isActive ? "#C41230" : "transparent",
      color: isActive ? "#FFFFFF" : "#334155"
    }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    style={{
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "0.9rem"
    }}
  >
    {children}
  </motion.button>
);

// Animated Progress Bar
export const AnimatedProgressBar = ({ progress, color = "#C41230" }) => (
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 1, ease: "easeOut" }}
    style={{
      height: "8px",
      backgroundColor: color,
      borderRadius: "4px"
    }}
  />
);

// Animated Counter Component
export const AnimatedCounter = ({ value, duration = 2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ count: 0 }}
        animate={{ count: value }}
        transition={{ duration }}
        style={{ fontSize: "2rem", fontWeight: "bold" }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
};

// Animated Tooltip Component
export const AnimatedTooltip = ({ children, content }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileHover={{ opacity: 1, y: 0 }}
    className="relative inline-block"
  >
    {children}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileHover={{ opacity: 1, scale: 1 }}
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap"
    >
      {content}
    </motion.div>
  </motion.div>
);

// Animated Badge Component
export const AnimatedBadge = ({ children, color = "#C41230" }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.1 }}
    style={{
      backgroundColor: color,
      color: "white",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: "600",
      display: "inline-block"
    }}
  >
    {children}
  </motion.div>
);

// Animated Skeleton Loader
export const AnimatedSkeleton = ({ width = "100%", height = "100%" }) => (
  <motion.div
    variants={shimmerVariants}
    animate="animate"
    style={{
      width,
      height,
      backgroundColor: "#E2E8F0",
      borderRadius: "8px",
      backgroundImage: "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
      backgroundSize: "1000px 100%"
    }}
  />
);

// Animated Dropdown Component
export const AnimatedDropdown = ({ children, isOpen }) => (
  <motion.div
    initial={{ opacity: 0, height: 0, y: -10 }}
    animate={{
      opacity: isOpen ? 1 : 0,
      height: isOpen ? "auto" : 0,
      y: isOpen ? 0 : -10
    }}
    transition={{ duration: 0.3 }}
    style={{ overflow: "hidden" }}
  >
    {children}
  </motion.div>
);

// Animated Sidebar Component
export const AnimatedSidebar = ({ children, isOpen }) => (
  <motion.aside
    initial={{ x: -300 }}
    animate={{ x: isOpen ? 0 : -300 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    style={{ position: "fixed", left: 0, top: 0, height: "100vh", zIndex: 1000 }}
  >
    {children}
  </motion.aside>
);

// Animated Notification Bell
export const AnimatedNotificationBell = ({ hasNotification }) => (
  <motion.div
    variants={hasNotification ? pulseVariants : {}}
    animate={hasNotification ? "animate" : "initial"}
  >
    <motion.div
      whileHover={{ rotate: 15 }}
      whileTap={{ scale: 0.9 }}
    >
      🔔
    </motion.div>
  </motion.div>
);
