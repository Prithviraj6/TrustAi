import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

export interface ChromaItem {
    image?: string;
    title: string;
    subtitle?: string;
    handle?: string;
    location?: string;
    borderColor?: string;
    gradient?: string;
    url?: string;
    // Pricing specific
    price?: string;
    period?: string;
    features?: string[];
    popular?: boolean;
    buttonText?: string;
    buttonType?: 'primary' | 'secondary';
}

export interface ChromaGridProps {
    items?: ChromaItem[];
    className?: string;
    radius?: number;
    columns?: number;
    rows?: number;
    damping?: number;
    fadeOut?: number;
    ease?: string;
    variant?: 'default' | 'pricing';
}

type SetterFn = (v: number | string) => void;

export const ChromaGrid: React.FC<ChromaGridProps> = ({
    items,
    className = '',
    radius = 300,
    columns = 3,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'power3.out',
    variant = 'default'
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);
    const setX = useRef<SetterFn | null>(null);
    const setY = useRef<SetterFn | null>(null);
    const pos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
        setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
        const { width, height } = el.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };
        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x: number, y: number) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true
        });
    };

    const handleMove = (e: React.PointerEvent) => {
        const r = rootRef.current!.getBoundingClientRect();
        moveTo(e.clientX - r.left, e.clientY - r.top);
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true
        });
    };

    const handleCardClick = (url?: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCardMove: React.MouseEventHandler<HTMLElement> = e => {
        const card = e.currentTarget as HTMLElement;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    const data = items || [];

    return (
        <div
            ref={rootRef}
            className={`chroma-grid ${className}`}
            style={
                {
                    '--r': `${radius}px`,
                    '--cols': columns
                } as React.CSSProperties
            }
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
        >
            {data.map((c, i) => (
                <article
                    key={i}
                    className="chroma-card"
                    onMouseMove={handleCardMove}
                    onClick={() => handleCardClick(c.url)}
                    style={
                        {
                            '--card-border': c.borderColor || 'transparent',
                            '--card-gradient': c.gradient || 'linear-gradient(145deg, #111, #000)',
                            cursor: c.url ? 'pointer' : 'default'
                        } as React.CSSProperties
                    }
                >
                    {c.popular && <div className="chroma-popular-badge">Popular</div>}

                    {variant === 'pricing' ? (
                        <div className="chroma-pricing-content">
                            <div className="chroma-pricing-header">
                                <div className="chroma-pricing-name">{c.title}</div>
                                <div className="chroma-pricing-price">
                                    {c.price}
                                    {c.period && <span className="chroma-pricing-period">/{c.period}</span>}
                                </div>
                            </div>

                            {c.features && (
                                <ul className="chroma-pricing-features">
                                    {c.features.map((feature, fi) => (
                                        <li key={fi}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button className={`chroma-pricing-button ${c.buttonType || 'secondary'}`}>
                                {c.buttonText || `Choose ${c.title}`}
                            </button>
                        </div>
                    ) : (
                        <>
                            {c.image && (
                                <div className="chroma-img-wrapper">
                                    <img src={c.image} alt={c.title} loading="lazy" />
                                </div>
                            )}
                            <footer className="chroma-info">
                                <h3 className="name">{c.title}</h3>
                                {c.handle && <span className="handle">{c.handle}</span>}
                                {c.subtitle && <p className="role">{c.subtitle}</p>}
                                {c.location && <span className="location">{c.location}</span>}
                            </footer>
                        </>
                    )}
                </article>
            ))}
            <div className="chroma-overlay" />
            <div ref={fadeRef} className="chroma-fade" />
        </div>
    );
};

export default ChromaGrid;
