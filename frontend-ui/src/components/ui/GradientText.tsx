import './GradientText.css';
import type { ReactNode } from 'react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
    showBorder?: boolean;
}

export default function GradientText({
    children,
    className = '',
    colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#3B82F6'],
    animationSpeed = 8,
    showBorder = false
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
        animationDuration: `${animationSpeed}s`
    };

    return (
        <span className={`animated-gradient-text ${className}`}>
            {showBorder && <span className="gradient-overlay" style={gradientStyle}></span>}
            <span className="text-content" style={gradientStyle}>
                {children}
            </span>
        </span>
    );
}
