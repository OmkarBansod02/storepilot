import { demoContent } from "@/features/demo/lib/demo-content";
import { Layers, Scissors, CreditCard } from "lucide-react";

const icons = [Layers, Scissors, CreditCard];

export function DemoFeatures() {
  return (
    <section
      id="features"
      className="border-t border-[#e8ddd0]/60 bg-[#f5efe8]"
    >
      <div className="mx-auto max-w-5xl px-6 py-28">
        <p className="text-center text-[11px] font-bold tracking-[0.2em] text-[#6b4c3b] uppercase">
          Craftsmanship
        </p>
        <h2 className="mt-3 text-center text-[28px] font-bold tracking-tight sm:text-[36px]">
          Why customers love this wallet
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {demoContent.features.map((feature, i) => {
            const Icon = icons[i];
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-[#e8ddd0]/70 bg-white p-7 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="mx-auto flex size-13 items-center justify-center rounded-xl bg-[#f5efe8]">
                  <Icon className="size-6 text-[#8b5e3c]" />
                </div>
                <h3 className="mt-6 text-[16px] font-semibold tracking-tight">
                  {feature.title}
                </h3>
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
