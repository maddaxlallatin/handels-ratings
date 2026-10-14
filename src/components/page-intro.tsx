export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance">{title}</h1>
      {children ? <div className="text-base leading-relaxed text-pretty text-muted-foreground">{children}</div> : null}
    </div>
  );
}
