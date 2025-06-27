"use client";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export default function AudioPlayer({
  src,
  title,
  className = "",
}: AudioPlayerProps) {
  return (
    <div className={`bg-muted rounded-lg p-4 ${className}`}>
      {title && (
        <div className="mb-3">
          <h4 className="truncate text-sm font-medium">{title}</h4>
        </div>
      )}

      <audio controls src={src} className="w-full" preload="none" />
    </div>
  );
}
