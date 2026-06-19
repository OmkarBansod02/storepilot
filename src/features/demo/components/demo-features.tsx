import { demoContent } from "@/features/demo/lib/demo-content";
import { Zap, BarChart3, FlaskConical } from "lucide-react";

const icons = [Zap, BarChart3, FlaskConical];

export function DemoFeatures() {
  return (
    <section className="border-t border-border/60 bg-surface-muted">
      <div className="mx-auto max-w-5xl px-6 py-28">
        <h2 className="text-center text-[28px] font-bold tracking-tight sm:text-[36px]">
          Everything you need to launch and learn
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {demoContent.features.map((feature, i) => {
            const Icon = icons[i];
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border/70 bg-card p-7 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="mx-auto flex size-13 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-6 text-[16px] font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
