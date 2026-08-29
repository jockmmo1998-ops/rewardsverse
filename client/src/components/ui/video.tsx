import { cn } from '@/lib/utils';
import './video.css';

interface VideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: 'auto' | '16:9' | '4:3' | (string & {});
}

export default function Video({
  className,
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  aspectRatio = 'auto',
}: VideoProps) {
  const ratio = aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '4:3' ? '4 / 3' : undefined;
  return (
    <div className={cn('min-w-[100px] overflow-hidden rounded-xl bg-muted', className)} custom-component="video">
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        controls={controls}
        playsInline
        className="block h-auto w-full object-cover"
        style={ratio ? { aspectRatio: ratio } : undefined}
      />
    </div>
  );
}
