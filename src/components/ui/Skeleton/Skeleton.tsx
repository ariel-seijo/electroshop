"use client";

import styles from "./Skeleton.module.css";

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
    styles.skeleton,
    variant === "circle" && styles.circle,
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
