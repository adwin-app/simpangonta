
import React from 'react';
import { AppColors } from '../constants';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
        {children}
    </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-6 py-3 font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = variant === 'primary' 
        ? `text-white focus:ring-yellow-400` 
        : `bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400`;
    
    const primaryColorStyle = { backgroundColor: AppColors.accent };

    return (
        <button className={`${baseClasses} ${variantClasses} ${className}`} style={variant === 'primary' ? primaryColorStyle : {}} {...props}>
            {children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
    <input
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        {...props}
    />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
    <select
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${className}`}
        {...props}
    >
        {children}
    </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
    <textarea
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        rows={4}
        {...props}
    />
);
