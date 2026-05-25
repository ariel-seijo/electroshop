"use client";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: "rectangle" | "circle";
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
}

export default function Skeleton({
  width,
  height,
  variant = "rectangle",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const classes = [
    "block rounded bg-[linear-gradient(90deg,rgb(28,28,28)_25%,rgb(35,35,35)_50%,rgb(28,28,28)_75%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none motion-reduce:bg-surface-28",
    variant === "circle" && "rounded-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inline: React.CSSProperties = {
    width: width != null ? width : "100%",
    height: height != null ? height : "1em",
    ...style,
  };

  return (
    <div
      className={classes}
      style={inline}
      aria-hidden="true"
      {...props}
    />
  );
}
