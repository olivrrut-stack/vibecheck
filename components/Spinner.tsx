export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`vc-spin inline-block rounded-full border-2 border-line-strong border-t-ink ${className}`}
    />
  );
}
