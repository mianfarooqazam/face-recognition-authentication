'use client'

export default function ClientLayout({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
} 