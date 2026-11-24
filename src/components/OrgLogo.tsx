import Image from 'next/image';

// Логотип организатора или заглушка с инициалами, пока логотипа нет.
export default function OrgLogo({ src, name, size = 40 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <span className="relative inline-block flex-shrink-0 overflow-hidden rounded-md bg-white" style={{ width: size, height: size }}>
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  }
  const initials = name.replace(/[«»"]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span title={`${name}: логотип ❓`}
      className="inline-flex flex-shrink-0 items-center justify-center rounded-md border-2 border-dashed border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-800"
      style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}
