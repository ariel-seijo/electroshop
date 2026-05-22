"use client";

import { useToastStore } from "../hooks/useToast";
import styles from "../styles/Toast.module.css";

export function ToastContainer() {
  const { message, type } = useToastStore();

  if (!message) return null;

  return (
    <div className={styles.container}>
      <div className={`${styles.toast} ${styles[type] || ""}`}>
        {message}
      </div>
    </div>
  );
}
