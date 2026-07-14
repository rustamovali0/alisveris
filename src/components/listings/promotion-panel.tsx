"use client";

import { useState } from "react";
import { ArrowUp, Check, Crown, Gem, Rocket, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PromotionType = "vip" | "premium" | "boost";

type PromotionPlan = {
  id: string;
  label: string;
  price: string;
  selected?: boolean;
  badge?: string;
};

type PromotionService = {
  id: PromotionType;
  title: string;
  modalTitle: string;
  description: string;
  bonus: string;
  icon: LucideIcon;
  accent: string;
  cta: string;
  plans: PromotionPlan[];
};

const services: PromotionService[] = [
  {
    id: "vip",
    title: "VIP et",
    modalTitle: "VIP et",
    description:
      "Elan axtarış nəticələrində irəli çəkiləcək və öz kateqoriyasındakı bütün VIP elanlar arasında xidmətin aktivlik müddətinin sonunadək təsadüfi qaydada göstəriləcək.",
    bonus: "HƏR GÜN İRƏLİ ÇƏK",
    icon: Gem,
    accent: "bg-orange-100 text-orange-700",
    cta: "5,00 ₼-dan",
    plans: [
      { id: "vip-5", label: "5 gün", price: "5,00 ₼" },
      { id: "vip-15", label: "15 gün", price: "11,00 ₼", selected: true },
      { id: "vip-30", label: "30 gün", price: "17,00 ₼" },
    ],
  },
  {
    id: "premium",
    title: "Premium et",
    modalTitle: "Premium et",
    description:
      "Elan axtarış nəticələrində irəli çəkiləcək, öz kateqoriyasındakı bütün VIP elanlar arasında təsadüfi qaydada göstəriləcək və xidmətin aktivlik müddətinin sonunadək əsas səhifədə qalacaq.",
    bonus: "HƏR GÜN İRƏLİ ÇƏK + VIP",
    icon: Crown,
    accent: "bg-purple-100 text-purple-700",
    cta: "11,00 ₼-dan",
    plans: [
      { id: "premium-5", label: "5 gün", price: "11,00 ₼" },
      { id: "premium-15", label: "15 gün", price: "22,00 ₼", selected: true },
      { id: "premium-30", label: "30 gün", price: "33,00 ₼" },
    ],
  },
  {
    id: "boost",
    title: "İrəli çək",
    modalTitle: "Elanı irəli çək",
    description: "Elan bütün və axtarış nəticələrinin içində birinci yerə qalxacaq.",
    bonus: "",
    icon: ArrowUp,
    accent: "bg-emerald-100 text-emerald-700",
    cta: "0,70 ₼-dan",
    plans: [
      { id: "boost-3", label: "3 dəfə (8 saatdan bir)", price: "0,70 ₼" },
      { id: "boost-9", label: "9 dəfə (8 saatdan bir)", price: "1,50 ₼" },
      { id: "boost-15", label: "15 dəfə (8 saatdan bir)", price: "2,20 ₼", selected: true },
      { id: "boost-30", label: "30 dəfə (8 saatdan bir)", price: "3,70 ₼" },
    ],
  },
];

const paymentMethods = [
  "Bank kartı",
  "Şəxsi hesab (0,00 ₼)",
  "Terminallarda ödəniş",
];

export function PromotionPanel({ listingId }: { listingId: string }) {
  const [selectedService, setSelectedService] = useState<PromotionService | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);

  function openService(service: PromotionService) {
    setSelectedService(service);
    setSelectedPlan(
      service.plans.find((plan) => plan.selected)?.id ?? service.plans[0]?.id ?? "",
    );
    setPaymentMethod(paymentMethods[0]);
  }

  function closeModal() {
    setSelectedService(null);
    setSelectedPlan("");
  }

  const selectedPlanDetails = selectedService?.plans.find((plan) => plan.id === selectedPlan);
  const SelectedIcon = selectedService?.icon;

  return (
    <>
      <Card className="p-4" data-testid="promotion-panel">
        <div className="mb-3">
          <p className="text-sm font-semibold text-primary">Elanı fərqləndir</p>
          <h2 className="text-lg font-black">Satışı sürətləndir</h2>
        </div>
        <div className="grid gap-2">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <button
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-primary-soft/40"
                key={service.id}
                type="button"
                onClick={() => openService(service)}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${service.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-black">{service.title}</span>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      {service.cta}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">
                    {service.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedService ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
          role="dialog"
        >
          <div className="flex max-h-[calc(100vh-40px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                {SelectedIcon ? <SelectedIcon className="h-6 w-6 text-warning" /> : null}
                <h2 className="text-2xl font-black">{selectedService.modalTitle}</h2>
              </div>
              <Button aria-label="Bağla" size="icon" type="button" variant="ghost" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid gap-4 overflow-y-auto px-5 pb-5">
              <section className="rounded-2xl bg-card p-5 shadow-sm">
                <p className="text-sm leading-6 text-foreground">{selectedService.description}</p>
                {selectedService.bonus ? (
                  <div className="mt-4 rounded-lg bg-background p-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-muted">
                      <span>Əvvəl</span>
                      <span className="font-bold line-through">1 DƏFƏ İRƏLİ ÇƏK</span>
                      <span className="rounded-r-lg bg-warning px-3 py-1 text-xs font-black text-white">
                        BONUS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Rocket className="h-4 w-4" />
                      </span>
                      {selectedService.bonus}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-black">Xidmətin müddəti</h3>
                <div className="grid gap-3">
                  {selectedService.plans.map((plan) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm transition hover:bg-background"
                      key={plan.id}
                    >
                      <input
                        checked={selectedPlan === plan.id}
                        className="h-5 w-5 accent-primary"
                        name="promotion-plan"
                        type="radio"
                        value={plan.id}
                        onChange={() => setSelectedPlan(plan.id)}
                      />
                      <span className="flex-1 text-base">
                        {plan.label} / {plan.price}
                        {plan.badge ? (
                          <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                            {plan.badge}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-black">Ödəniş üsulu</h3>
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-base hover:bg-background"
                      key={method}
                    >
                      <input
                        checked={paymentMethod === method}
                        className="h-5 w-5 accent-primary"
                        name="payment-method"
                        type="radio"
                        onChange={() => setPaymentMethod(method)}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <div className="border-t border-border bg-background p-5">
              <Button
                className="w-full"
                type="button"
                onClick={() => {
                  console.info("listing_promotion_selected", {
                    listingId,
                    service: selectedService.id,
                    plan: selectedPlan,
                    paymentMethod,
                  });
                  closeModal();
                }}
              >
                <Check className="h-4 w-4" />
                {selectedPlanDetails ? `${selectedPlanDetails.price} ödə` : "Ödə"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
