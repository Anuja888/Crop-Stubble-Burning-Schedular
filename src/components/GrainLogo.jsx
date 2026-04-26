export default function GrainLogo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" 
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grain-grad" x1="0" y1="0" 
          x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15"/>
          <stop offset="100%" stopColor="#22c55e"/>
        </linearGradient>
      </defs>
      {/* Left stalk */}
      <rect x="20" y="10" width="5" height="32" rx="2.5" 
        fill="url(#grain-grad)" opacity="0.9"/>
      {/* Left grain tip */}
      <ellipse cx="22.5" cy="8" rx="4" ry="6" 
        fill="url(#grain-grad)" opacity="0.85"/>
      {/* Right stalk */}
      <rect x="34" y="16" width="5" height="28" rx="2.5" 
        fill="url(#grain-grad)" opacity="0.9"/>
      {/* Right grain tip */}
      <ellipse cx="36.5" cy="14" rx="4" ry="6" 
        fill="url(#grain-grad)" opacity="0.85"/>
      {/* Bottom base connecting bar */}
      <rect x="18" y="40" width="24" height="4" rx="2" 
        fill="url(#grain-grad)" opacity="0.6"/>
    </svg>
  )
}
