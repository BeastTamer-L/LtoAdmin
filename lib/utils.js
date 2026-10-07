/**
 * Utility function to conditionally join class names together
 * Similar to clsx library but lightweight
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}