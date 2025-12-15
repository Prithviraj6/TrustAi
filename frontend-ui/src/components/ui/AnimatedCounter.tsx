import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    formatOptions?: Intl.NumberFormatOptions;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 2,
    prefix = '',
    suffix = '',
    className = '',
    formatOptions = {}
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isInView || hasAnimated.current) return;
        hasAnimated.current = true;

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (endTime - startTime), 1);

            // Easing function (ease out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            setCount(Math.floor(eased * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(value);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    const formattedCount = new Intl.NumberFormat('en-US', formatOptions).format(count);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, ease: 'backOut' }}
        >
            {prefix}{formattedCount}{suffix}
        </motion.span>
    );
};

export default AnimatedCounter;
