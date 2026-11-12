import Image from 'next/image';

// Studio portrait print: arched frame, seamless-paper backdrop with a key
// light, pink rim aura behind the subject, and a soft floor shadow.
export default function Portrait({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      {/* outer pink glow around the whole print */}
      <div className="aura absolute -inset-6 rounded-t-full rounded-b-[3rem] pointer-events-none" />
      <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[2.5rem] border border-accent/40 shadow-[0_30px_80px_-30px_rgba(71,67,41,0.55),0_0_0_6px_rgba(255,111,166,0.08)]">
        {/* seamless studio backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_32%,#FFFFFF_0%,#F6EEE4_45%,#E6D6C3_100%)]" />
        {/* pink key-light behind the subject */}
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-[85%] aspect-square rounded-full bg-[radial-gradient(closest-side,rgba(255,111,166,0.38),rgba(255,111,166,0.12)_60%,transparent)] blur-2xl" />
        {/* floor line + shadow */}
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent to-[#DCCAB3]/70" />
        <div className="absolute left-1/2 bottom-[4%] -translate-x-1/2 w-[80%] h-[7%] rounded-[100%] bg-[#474329]/25 blur-xl" />
        <Image
          src="/portrait.webp"
          alt="Gian Benedict Bigay, studio portrait"
          fill
          priority={priority}
          sizes="(max-width: 768px) 86vw, 32vw"
          quality={95}
          className="object-contain object-bottom px-[3%] pt-[9%] pb-[3%] drop-shadow-[0_0_18px_rgba(255,111,166,0.45)]"
        />
        {/* subtle vignette for the print look */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(71,67,41,0.18)] rounded-[inherit]" />
      </div>
    </div>
  );
}
