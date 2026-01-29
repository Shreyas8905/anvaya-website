import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6';
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.2 }}
        className={`${baseStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  
  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

export default Card;
