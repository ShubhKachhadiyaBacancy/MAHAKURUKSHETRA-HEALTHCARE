type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  action
}: PageIntroProps) {
  return (
    <section className="page-intro">
      <div className="page-intro__glow" aria-hidden="true" />
      <div className="page-intro__body">
        <div className="page-intro__copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-intro__title">{title}</h1>
          <p className="page-intro__description">{description}</p>
        </div>
        {action ? <div className="page-intro__action">{action}</div> : null}
      </div>
    </section>
  );
}
