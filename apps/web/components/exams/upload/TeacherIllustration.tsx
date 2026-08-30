import Image from "next/image";

const FLOATING_BADGES = [
  {
    icon: "/images/Clock.svg",
    className: "right-[2px] top-[2px]",
  },
  {
    icon: "/images/Task Square.svg",
    className: "left-[-1px] top-[34px]",
  },
  {
    icon: "/images/Cloud Lightning.svg",
    className: "right-[1px] bottom-[22px]",
  },
  {
    icon: "/images/settings.svg",
    className: "left-[7px] bottom-[4px]",
  },
];

export default function TeacherIllustration() {
  return (
    <div
      className="
        relative mx-auto
        h-[78px] w-[78px]
        sm:h-[92px] sm:w-[92px]
        md:h-[160px] md:w-[160px]
      "
    >
      {/* Outer peach circle */}
      <div className="absolute -inset-[10px] rounded-full bg-[#F7DED3] md:-inset-[18px]" />

      {/* Inner peach ring */}
      <div className="absolute -inset-[2px] rounded-full bg-[#F6B9A4] md:-inset-[-3.5px]" />

      {/* White center */}
      <div className="absolute inset-[14px] rounded-full bg-white md:inset-[25px]" />

      {/* Teacher */}
      <div className="absolute inset-[11px] overflow-hidden rounded-full md:inset-[19px]">
        <Image
          src="/images/teacher-illustration.svg"
          alt="VedaAI teacher"
          fill
          priority
          sizes="160px"
          className="object-contain object-bottom"
        />
      </div>

      {/* Floating badges */}
      {FLOATING_BADGES.map(({ icon, className }, index) => (
        <span
          key={index}
          className={`
            absolute flex items-center justify-center
            h-[14px] w-[14px]
            rounded-full
            bg-[var(--color-accent)]
            shadow-sm
            md:h-[18px] md:w-[18px]
            ${className}
          `}
        >
          <Image
            src={icon}
            alt=""
            width={8}
            height={8}
            className="md:h-[10px] md:w-[10px]"
          />
        </span>
      ))}
    </div>
  );
}