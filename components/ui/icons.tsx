import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BrandMarkIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      <path d="M8.5 12h7" />
      <path d="M12 8.5v7" />
      <path d="M6.75 16.25h3.5" />
      <path d="M13.75 7.75h3.5" />
    </IconFrame>
  );
}

export function QueueIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="3" />
      <path d="M8 9.25h8" />
      <path d="M8 12h8" />
      <path d="M8 14.75h5" />
      <circle cx="17.25" cy="16.5" r="2.25" />
      <path d="m16.3 16.45.7.7 1.2-1.45" />
    </IconFrame>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3.75c2.2 1.5 4.8 2.35 7.5 2.45v5.1c0 4.6-2.85 7.8-7.5 9.7-4.65-1.9-7.5-5.1-7.5-9.7V6.2c2.7-.1 5.3-.95 7.5-2.45Z" />
      <path d="m8.85 12.35 2.05 2.1 4.2-4.4" />
    </IconFrame>
  );
}

export function PathwayIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="6.5" cy="7" r="2" />
      <circle cx="17.5" cy="7" r="2" />
      <circle cx="12" cy="17" r="2.25" />
      <path d="M8.45 7h7.1" />
      <path d="M8 8.5 10.7 14" />
      <path d="M16 8.5 13.3 14" />
    </IconFrame>
  );
}

export function ClipboardPulseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M9 5.25h6" />
      <path d="M10 3.75h4a1 1 0 0 1 1 1v1.25H9V4.75a1 1 0 0 1 1-1Z" />
      <rect x="5.5" y="5.75" width="13" height="14.5" rx="3" />
      <path d="m8.25 13.15 1.65 0 1.35-2.25 2.05 4.45 1.35-2.2h1.1" />
    </IconFrame>
  );
}

export function TimerIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M9 3.75h6" />
      <path d="M12 8.5v4l2.65 1.55" />
      <circle cx="12" cy="13" r="7.25" />
    </IconFrame>
  );
}

export function UserVoiceIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="9.25" cy="9.25" r="3" />
      <path d="M4.75 18.25c.75-2.85 2.75-4.5 4.5-4.5s3.75 1.65 4.5 4.5" />
      <path d="M16 9.25c2 0 3.75 1.75 3.75 4" />
      <path d="M16 6.25c1.1 0 2 .9 2 2" />
    </IconFrame>
  );
}

export function TrendUpIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 17.5h14" />
      <path d="M7 14.75 11 10.75l2.7 2.7 4.3-5.2" />
      <path d="M15.85 8.25H18.5v2.65" />
    </IconFrame>
  );
}
