import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    icon: Sparkles,
    title: "Free Trial",
    price: "$0",
    duration: "3 months",
    description: "Perfect to get started",
    features: ["Unlimited assignments", "AI study tips", "Progress tracking"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "premium",
    icon: Crown,
    title: "Premium",
    price: "$6",
    duration: "per year",
    description: "Best value for students",
    features: [
      "Everything in Free",
      "Priority AI insights",
      "Advanced analytics",
    ],
    cta: "Upgrade",
    highlighted: true,
  },
];

export default function SubscriptionSection() {
  const handlePlanClick = (planId: string) => {
    if (planId === "free") {
      toast.success("You're already on the Free Trial!");
    } else {
      toast.success("Premium upgrade coming soon! 🚀");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
      aria-label="Subscription plans"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Plans
        </h2>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          3 months free
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07 }}
            >
              <Card
                className={`relative overflow-hidden shadow-card transition-shadow hover:shadow-card-hover ${
                  plan.highlighted
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute right-3 top-3">
                    <Badge className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground">
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-xl font-bold">
                          {plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {plan.duration}
                        </span>
                      </div>
                      <p className="font-medium text-sm leading-none mb-0.5">
                        {plan.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {plan.description}
                      </p>
                      <ul className="space-y-1 mb-3">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        variant={plan.highlighted ? "default" : "outline"}
                        className="w-full h-7 text-xs"
                        onClick={() => handlePlanClick(plan.id)}
                        data-ocid={`subscription.${plan.id === "premium" ? "primary_button" : "secondary_button"}`}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
