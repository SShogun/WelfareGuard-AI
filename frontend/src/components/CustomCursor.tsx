import { useEffect, useState } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [trailingPos, setTrailingPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'input' ||
                target.closest('button') ||
                target.closest('a')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Smooth trailing effect
    useEffect(() => {
        let animationFrameId: number;

        const updateTrailing = () => {
            setTrailingPos((prev) => ({
                x: prev.x + (position.x - prev.x) * 0.2,
                y: prev.y + (position.y - prev.y) * 0.2
            }));
            animationFrameId = requestAnimationFrame(updateTrailing);
        };

        animationFrameId = requestAnimationFrame(updateTrailing);
        return () => cancelAnimationFrame(animationFrameId);
    }, [position]);

    return (
        <>
            <div
                className="custom-cursor-dot"
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            />
            <div
                className={`custom-cursor-circle ${isHovering ? 'hovering' : ''}`}
                style={{ left: `${trailingPos.x}px`, top: `${trailingPos.y}px` }}
            />
        </>
    );
};

export default CustomCursor;
