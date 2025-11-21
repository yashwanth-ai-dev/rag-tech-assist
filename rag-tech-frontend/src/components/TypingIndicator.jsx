export default function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center px-3 py-2">
      <div className="w-3 h-3 bg-[var(--neon-blue)] animate-ping rounded-full"></div>
      <div className="w-3 h-3 bg-[var(--neon-pink)] animate-ping rounded-full delay-150"></div>
      <div className="w-3 h-3 bg-[var(--neon-purple)] animate-ping rounded-full delay-300"></div>
    </div>
  );
}
