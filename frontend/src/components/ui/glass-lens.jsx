import * as React from 'react';
import { cn } from '../../lib/utils.js';

export function GlassLens({
  children,
  className,
  intensity = 'medium', // 'subtle' | 'medium' | 'deep'
  interactive = true,
  as: Component = 'div',
  ...props
}) {
  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const intensityClasses = {
    subtle: 'bg-white/60 dark:bg-[#222A25]/60 backdrop-blur-sm border-white/40 dark:border-white/10',
    medium: 'bg-white/80 dark:bg-[#222A25]/80 backdrop-blur-md border-white/50 dark:border-white/15',
    deep: 'bg-white/90 dark:bg-[#222A25]/90 backdrop-blur-xl border-white/60 dark:border-white/20'
  };

  return (
    <Component
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300',
        intensityClasses[intensity] || intensityClasses.medium,
        className
      )}
      style={{
        boxShadow: isHovered && interactive
          ? '0 12px 30px -10px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
      }}
      {...props}
    >
      {/* Dynamic Specular Lens Flare on Hover */}
      {interactive && isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${position.x}% ${position.y}%, rgba(214, 169, 107, 0.12), transparent 70%)`
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
