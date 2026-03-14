type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base md:text-right">
        {description}
      </p>
    </div>
  );
}
