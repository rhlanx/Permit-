"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrencyRange, formatWeekRange, cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { id: "restaurant", name: "Restaurant / Café", icon: "🍔" },
  { id: "food_truck", name: "Food Truck", icon: "🚚" },
  { id: "salon", name: "Hair / Beauty Salon", icon: "💇" },
  { id: "hvac", name: "HVAC Contractor", icon: "🔧" },
  { id: "home_improvement", name: "Home Improvement Contractor", icon: "🏠" },
  { id: "bnb", name: "Bed & Breakfast / Short-Term Rental", icon: "🛏️" },
  { id: "retail", name: "Retail Store", icon: "🏪" },
  { id: "pet_services", name: "Pet Services", icon: "🐕" },
  { id: "photography", name: "Photography Business", icon: "📸" },
  { id: "massage", name: "Massage Therapy", icon: "💆" },
  { id: "landscaping", name: "Landscaping", icon: "🌿" },
  { id: "handyman", name: "Handyman", icon: "🔨" },
];

const LOCATIONS = [
  { value: "annapolis", label: "City of Annapolis" },
  { value: "anne_arundel", label: "Anne Arundel County", sub: "Outside Annapolis city limits" },
  { value: "both", label: "Both" },
];

const STRUCTURES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "not_sure", label: "Not sure yet" },
];

interface PermitData {
  id: string;
  name: string;
  description: string;
  agency: string;
  agency_phone: string | null;
  agency_address: string | null;
  agency_url: string | null;
  level: string;
  fee_low: number;
  fee_high: number;
  fee_notes: string | null;
  timeline_weeks_low: number;
  timeline_weeks_high: number;
  renewal_period: string | null;
  renewal_fee: number | null;
  phase: number;
  phase_label: string;
  notes: string | null;
  required: string;
  condition_description: string | null;
  filing_order: number;
}

interface ResultsData {
  businessType: { id: string; name: string; icon: string };
  permits: PermitData[];
  summary: {
    totalPermits: number;
    costLow: number;
    costHigh: number;
    timelineLow: number;
    timelineHigh: number;
    levels: string[];
  };
}

function hasConditionalQuestions(businessType: string): boolean {
  return ["restaurant", "food_truck", "hvac", "home_improvement", "salon", "bnb"].includes(businessType);
}

function getTotalSteps(businessType: string): number {
  return hasConditionalQuestions(businessType) ? 4 : 3;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function FinderPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [structure, setStructure] = useState("");
  const [conditions, setConditions] = useState<Record<string, string>>({});

  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailModal, setEmailModal] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const totalSteps = businessType ? getTotalSteps(businessType) : 4;
  const showResults = !!results;

  const canAdvance = useCallback(() => {
    if (step === 1) return !!businessType;
    if (step === 2) return !!location;
    if (step === 3) return !!structure;
    return true;
  }, [step, businessType, location, structure]);

  function goNext() {
    if (!canAdvance()) return;
    setDirection(1);

    const skipDetails = step === 3 && !hasConditionalQuestions(businessType);
    if (step === totalSteps || skipDetails) {
      submitForm();
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step <= 1) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function submitForm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, location, structure, conditions }),
      });
      if (!res.ok) throw new Error("Failed to fetch permits");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setStep(1);
    setDirection(-1);
    setBusinessType("");
    setLocation("");
    setStructure("");
    setConditions({});
    setResults(null);
    setError("");
    setEmailSent(false);
  }

  async function handleEmailSubmit() {
    if (!emailValue.trim()) return;
    setEmailLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          business_type: businessType,
          service_tier: "roadmap",
          roadmap_data: JSON.stringify(results),
        }),
      });
      setEmailSent(true);
    } catch {
      // silently handle
    } finally {
      setEmailLoading(false);
    }
  }

  function downloadPdf() {
    if (!results) return;
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 95);
      doc.text("Naptown Permits — Your Permit Roadmap", 14, y);
      y += 12;

      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Business: ${results.businessType.name}`, 14, y);
      y += 7;
      doc.text(
        `Estimated cost: ${formatCurrencyRange(results.summary.costLow, results.summary.costHigh)}  |  Timeline: ${formatWeekRange(results.summary.timelineLow, results.summary.timelineHigh)}`,
        14,
        y
      );
      y += 7;
      doc.text(`Total permits: ${results.summary.totalPermits}`, 14, y);
      y += 12;

      const phases = [1, 2, 3, 4];
      const phaseLabels: Record<number, string> = { 1: "Set Up Your Business", 2: "Get Licensed", 3: "Get Permitted", 4: "Final Steps" };
      for (const phase of phases) {
        const phasePermits = results.permits.filter((p) => p.phase === phase);
        if (phasePermits.length === 0) continue;

        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 95);
        doc.text(`Phase ${phase}: ${phaseLabels[phase]}`, 14, y);
        y += 8;

        for (const permit of phasePermits) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(11);
          doc.setTextColor(30, 30, 30);
          const statusLabel = permit.required === "required" ? "[Required]" : permit.required === "conditional" ? "[May Be Required]" : "[Recommended]";
          doc.text(`${statusLabel} ${permit.name}`, 14, y);
          y += 5;
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Agency: ${permit.agency}`, 20, y);
          y += 4;
          doc.text(`Fee: ${formatCurrencyRange(permit.fee_low, permit.fee_high)}  |  Timeline: ${formatWeekRange(permit.timeline_weeks_low, permit.timeline_weeks_high)}`, 20, y);
          y += 4;
          const descLines = doc.splitTextToSize(permit.description, pageWidth - 34);
          doc.text(descLines, 20, y);
          y += descLines.length * 4 + 4;
        }
        y += 4;
      }

      if (y > 260) { doc.addPage(); y = 20; }
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("Naptown Permits is a document preparation service. We do not provide legal advice.", 14, y);
      y += 4;
      doc.text("Permit requirements change — always verify with the issuing agency.", 14, y);

      doc.save("naptown-permits-roadmap.pdf");
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1e3a5f] animate-spin mx-auto mb-4" />
          <p className="text-lg text-[#1e3a5f] font-medium">Building your permit roadmap...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return <ResultsView results={results} onStartOver={startOver} onDownloadPdf={downloadPdf} onEmailClick={() => setEmailModal(true)} emailModal={emailModal} emailValue={emailValue} setEmailValue={setEmailValue} emailSent={emailSent} emailLoading={emailLoading} onEmailSubmit={handleEmailSubmit} onEmailClose={() => setEmailModal(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1e3a5f]">
            Naptown Permits
          </Link>
          <span className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#c5a55a] h-2 rounded-full"
              initial={false}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 1 && <StepBusinessType value={businessType} onChange={setBusinessType} onNext={goNext} />}
            {step === 2 && <StepLocation value={location} onChange={setLocation} />}
            {step === 3 && <StepStructure value={structure} onChange={setStructure} />}
            {step === 4 && hasConditionalQuestions(businessType) && (
              <StepDetails businessType={businessType} conditions={conditions} setConditions={setConditions} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <button
            onClick={goBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              step === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
            )}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all text-white",
              canAdvance()
                ? "bg-[#1e3a5f] hover:bg-[#2a4f7f] shadow-md hover:shadow-lg"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {step === totalSteps ? "Get My Roadmap" : "Continue"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function StepBusinessType({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">What kind of business are you starting?</h1>
      <p className="text-gray-500 mb-6">Pick the closest match — we&apos;ll fine-tune later.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BUSINESS_TYPES.map((bt) => (
          <button
            key={bt.id}
            onClick={() => {
              onChange(bt.id);
              setTimeout(onNext, 200);
            }}
            className={cn(
              "flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border-2 transition-all text-center",
              value === bt.id
                ? "border-[#c5a55a] bg-[#c5a55a]/10 shadow-md"
                : "border-gray-200 bg-white hover:border-[#c5a55a]/50 hover:shadow-sm"
            )}
          >
            <span className="text-3xl">{bt.icon}</span>
            <span className="text-sm font-medium text-[#1e3a5f]">{bt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLocation({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">Where will your business operate?</h1>
      <p className="text-gray-500 mb-6">This determines which local permits apply.</p>
      <div className="space-y-3">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.value}
            onClick={() => onChange(loc.value)}
            className={cn(
              "w-full text-left p-5 rounded-xl border-2 transition-all",
              value === loc.value
                ? "border-[#c5a55a] bg-[#c5a55a]/10 shadow-md"
                : "border-gray-200 bg-white hover:border-[#c5a55a]/50"
            )}
          >
            <span className="font-semibold text-[#1e3a5f]">{loc.label}</span>
            {loc.sub && <span className="block text-sm text-gray-500 mt-0.5">{loc.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepStructure({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">How is your business set up?</h1>
      <p className="text-gray-500 mb-6">This affects which registrations you need.</p>
      <div className="space-y-3">
        {STRUCTURES.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              "w-full text-left p-5 rounded-xl border-2 transition-all",
              value === s.value
                ? "border-[#c5a55a] bg-[#c5a55a]/10 shadow-md"
                : "border-gray-200 bg-white hover:border-[#c5a55a]/50"
            )}
          >
            <span className="font-semibold text-[#1e3a5f]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDetails({
  businessType,
  conditions,
  setConditions,
}: {
  businessType: string;
  conditions: Record<string, string>;
  setConditions: (c: Record<string, string>) => void;
}) {
  const set = (key: string, val: string) => setConditions({ ...conditions, [key]: val });

  function YesNo({ label, field }: { label: string; field: string }) {
    return (
      <div className="mb-5">
        <p className="font-medium text-[#1e3a5f] mb-3">{label}</p>
        <div className="flex gap-3">
          {["yes", "no"].map((v) => (
            <button
              key={v}
              onClick={() => set(field, v)}
              className={cn(
                "flex-1 py-3 rounded-lg border-2 font-medium transition-all capitalize",
                conditions[field] === v
                  ? "border-[#c5a55a] bg-[#c5a55a]/10 text-[#1e3a5f]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#c5a55a]/50"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function NumberInput({ label, field, placeholder }: { label: string; field: string; placeholder?: string }) {
    return (
      <div className="mb-5">
        <label className="block font-medium text-[#1e3a5f] mb-2">{label}</label>
        <input
          type="number"
          min={0}
          value={conditions[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder || "Enter a number"}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#c5a55a] focus:outline-none transition-colors"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">A few more details</h1>
      <p className="text-gray-500 mb-6">This helps us fine-tune your permit requirements.</p>

      {businessType === "restaurant" && (
        <>
          <YesNo label="Will you serve alcohol?" field="serves_alcohol" />
          <YesNo label="New construction or major renovation?" field="new_construction" />
          <NumberInput label="How many seats?" field="seat_count" placeholder="e.g. 50" />
        </>
      )}
      {businessType === "food_truck" && (
        <YesNo label="Do you have a commissary kitchen?" field="has_commissary" />
      )}
      {(businessType === "hvac" || businessType === "home_improvement") && (
        <YesNo label="Will you do residential home improvement work?" field="home_improvement" />
      )}
      {businessType === "salon" && (
        <NumberInput label="How many stylists?" field="stylist_count" placeholder="e.g. 4" />
      )}
      {businessType === "bnb" && (
        <>
          <YesNo label="Is the property in the Annapolis Historic District?" field="historic_district" />
          <NumberInput label="How many guest rooms?" field="guest_rooms" placeholder="e.g. 3" />
        </>
      )}
    </div>
  );
}

function ResultsView({
  results,
  onStartOver,
  onDownloadPdf,
  onEmailClick,
  emailModal,
  emailValue,
  setEmailValue,
  emailSent,
  emailLoading,
  onEmailSubmit,
  onEmailClose,
}: {
  results: ResultsData;
  onStartOver: () => void;
  onDownloadPdf: () => void;
  onEmailClick: () => void;
  emailModal: boolean;
  emailValue: string;
  setEmailValue: (v: string) => void;
  emailSent: boolean;
  emailLoading: boolean;
  onEmailSubmit: () => void;
  onEmailClose: () => void;
}) {
  const { summary, permits, businessType } = results;
  const phases = [1, 2, 3, 4];
  const phaseLabels: Record<number, string> = { 1: "Set Up Your Business", 2: "Get Licensed", 3: "Get Permitted", 4: "Final Steps" };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-lg font-bold text-[#c5a55a]">
              Naptown Permits
            </Link>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Your Permit Roadmap</h1>
          <p className="text-white/70 text-lg">
            {businessType.icon} {businessType.name}
          </p>
        </div>
      </header>

      {/* Summary Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-[#1e3a5f]">{summary.totalPermits}</div>
              <div className="text-sm text-gray-500 mt-1">Permits Needed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1e3a5f]">{summary.levels.length}</div>
              <div className="text-sm text-gray-500 mt-1">Gov&apos;t Levels</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">{formatCurrencyRange(summary.costLow, summary.costHigh)}</div>
              <div className="text-sm text-gray-500 mt-1">Estimated Total</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">{formatWeekRange(summary.timelineLow, summary.timelineHigh)}</div>
              <div className="text-sm text-gray-500 mt-1">Estimated Timeline</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Permit Phases */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {phases.map((phase) => {
          const phasePermits = permits.filter((p) => p.phase === phase);
          if (phasePermits.length === 0) return null;
          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: phase * 0.1 }}
            >
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c5a55a] text-white text-sm font-bold">
                  {phase}
                </span>
                {phaseLabels[phase]}
              </h2>
              <div className="space-y-3">
                {phasePermits.map((permit) => (
                  <PermitCard key={permit.id} permit={permit} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <button onClick={onDownloadPdf} className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#2a4f7f] transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={onEmailClick} className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-lg font-medium hover:bg-[#1e3a5f]/5 transition-colors">
              <Mail className="w-4 h-4" /> Email My Roadmap
            </button>
          </div>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c5a55a] text-white rounded-lg font-medium hover:bg-[#d4ba7a] transition-colors"
          >
            Get Help With This <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Start Over */}
      <div className="max-w-4xl mx-auto px-4 pb-24 pt-4 text-center">
        <button onClick={onStartOver} className="text-sm text-gray-500 hover:text-[#1e3a5f] underline">
          Start over with a different business
        </button>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {emailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onEmailClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Email My Roadmap</h3>
                <button onClick={onEmailClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {emailSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium text-[#1e3a5f]">We&apos;ve saved your roadmap!</p>
                  <p className="text-sm text-gray-500 mt-1">We&apos;ll be in touch soon with your personalized permit details.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-4">Enter your email and we&apos;ll send you a copy of your permit roadmap.</p>
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#c5a55a] focus:outline-none mb-4"
                  />
                  <button
                    onClick={onEmailSubmit}
                    disabled={!emailValue.includes("@") || emailLoading}
                    className={cn(
                      "w-full py-3 rounded-lg font-semibold text-white transition-colors",
                      emailValue.includes("@") && !emailLoading
                        ? "bg-[#1e3a5f] hover:bg-[#2a4f7f]"
                        : "bg-gray-300 cursor-not-allowed"
                    )}
                  >
                    {emailLoading ? "Sending..." : "Send My Roadmap"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            Naptown Permits is a document preparation service. We do not provide legal advice. Permit requirements change — always verify with the issuing agency.
          </p>
        </div>
      </div>
    </div>
  );
}

function PermitCard({ permit }: { permit: PermitData }) {
  const [open, setOpen] = useState(false);

  const statusConfig = {
    required: { label: "Required", color: "bg-[#1e3a5f] text-white", icon: CheckCircle2 },
    conditional: { label: "May Be Required", color: "bg-[#c5a55a]/20 text-[#a88a3a]", icon: AlertCircle },
    recommended: { label: "Recommended", color: "bg-blue-50 text-blue-700", icon: Info },
  };

  const status = statusConfig[permit.required as keyof typeof statusConfig] || statusConfig.recommended;
  const StatusIcon = status.icon;

  const levelLabels: Record<string, string> = { federal: "Federal", state: "State", county: "County", city: "City" };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 md:p-5 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1", status.color)}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </span>
            <span className="text-xs text-gray-400 font-medium">{levelLabels[permit.level]}</span>
          </div>
          <h3 className="font-semibold text-[#1e3a5f] text-base">{permit.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
            <span>{formatCurrencyRange(permit.fee_low, permit.fee_high)}</span>
            <span>{formatWeekRange(permit.timeline_weeks_low, permit.timeline_weeks_high)}</span>
          </div>
        </div>
        <div className="shrink-0 mt-1 text-gray-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100 pt-4 space-y-3 text-sm">
              <p className="text-gray-600">{permit.description}</p>

              {permit.condition_description && (
                <p className="text-[#c5a55a] font-medium text-sm">
                  Condition: {permit.condition_description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                <div>
                  <span className="font-medium text-[#1e3a5f]">Agency:</span> {permit.agency}
                </div>
                {permit.agency_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${permit.agency_phone}`} className="text-[#1e3a5f] underline">
                      {permit.agency_phone}
                    </a>
                  </div>
                )}
                {permit.fee_notes && (
                  <div>
                    <span className="font-medium text-[#1e3a5f]">Fee Notes:</span> {permit.fee_notes}
                  </div>
                )}
                {permit.renewal_period && (
                  <div>
                    <span className="font-medium text-[#1e3a5f]">Renewal:</span> {permit.renewal_period}
                  </div>
                )}
              </div>

              {permit.notes && (
                <p className="text-gray-500 text-xs border-l-2 border-[#c5a55a]/40 pl-3">{permit.notes}</p>
              )}

              {permit.agency_url && (
                <a
                  href={permit.agency_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1e3a5f] font-medium hover:underline"
                >
                  Apply / Learn More <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
