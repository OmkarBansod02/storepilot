import { demoContent } from "@/features/demo/lib/demo-content";

const { socialProof } = demoContent;

export function DemoSocialProof() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28">
      <div className="text-center">
        <p className="text-[56px] font-extrabold tracking-tight text-primary sm:text-[64px]">
          {socialProof.metric}
        </p>
        <p className="mt-3 text-[15px] font-medium text-muted-foreground">
          {socialProof.metricLabel}
        </p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {socialProof.quotes.map((quote) => (
          <div
            key={quote.author}
            className="rounded-xl border border-border/70 border-l-[3px] border-l-primary/40 bg-card p-7 shadow-card"
          >
            <p className="text-[14.5px] leading-relaxed text-muted-foreground italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <div className="mt-5">
              <p className="text-[14px] font-semibold">{quote.author}</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{quote.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
