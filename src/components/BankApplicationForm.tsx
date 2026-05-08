import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2, Save, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  accountType: string;
  deposit: string;
  notes: string;
};

const empty: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dob: "",
  street: "", city: "", state: "", zip: "", country: "",
  accountType: "", deposit: "", notes: "",
};

const STORAGE_KEY = "bank_application_draft";

const steps = [
  { id: 1, title: "Personal Info", desc: "Tell us about yourself" },
  { id: 2, title: "Address", desc: "Where do you live?" },
  { id: 3, title: "Account Type", desc: "Choose your account" },
  { id: 4, title: "Review", desc: "Confirm your details" },
];

export function BankApplicationForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!data.firstName || !data.lastName || !data.email || !data.phone) {
        toast.error("Please fill in all required fields");
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        toast.error("Please enter a valid email");
        return false;
      }
    }
    if (step === 3 && !data.accountType) {
      toast.error("Please select an account type");
      return false;
    }
    return true;
  };

  const next = () => validateStep() && setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast.success("Draft saved");
  };

  const loadDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return toast.error("No draft found");
    try {
      setData({ ...empty, ...JSON.parse(raw) });
      toast.success("Draft loaded");
    } catch {
      toast.error("Failed to load draft");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const payload = {
      u_first_name: data.firstName,
      u_last_name: data.lastName,
      u_email: data.email,
      u_phone: data.phone,
      u_dob: data.dob,
      u_street: data.street,
      u_city: data.city,
      u_state: data.state,
      u_zip: data.zip,
      u_country: data.country,
      u_account_type: data.accountType,
      u_deposit: data.deposit,
      u_notes: data.notes,
    };
    try {
      const res = await fetch(
        "https://dev189559.service-now.com/api/now/table/x_1994162_kyc_au_0_bank_application",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Basic " + btoa("admin:j58z-gL%CMcY"),
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      const json = await res.json();
      const sysId = json?.result?.sys_id ?? "(no sys_id returned)";
      setSuccessId(sysId);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSuccessId(null);
    setData(empty);
    setStep(1);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step Tabs */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {steps.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                onClick={() => s.id < step && setStep(s.id)}
                className={`group flex flex-col items-start rounded-xl border p-3 text-left transition-all sm:p-4 ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : done
                    ? "border-primary/30 bg-card"
                    : "border-border bg-card opacity-70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.id}
                  </span>
                  <span className="hidden text-sm font-semibold sm:inline">{s.title}</span>
                </div>
                <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
                  {s.desc}
                </span>
                <span className="mt-1 text-xs font-medium sm:hidden">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Submission failed</p>
              <p className="mt-1 text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <SectionHeader title="Personal Information" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" required>
                <Input value={data.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" />
              </Field>
              <Field label="Last Name" required>
                <Input value={data.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" />
              </Field>
              <Field label="Email Address" required>
                <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
              </Field>
              <Field label="Phone Number" required>
                <Input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 0100" />
              </Field>
              <Field label="Date of Birth">
                <Input type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <SectionHeader title="Address" />
            <Field label="Street Address">
              <Input value={data.street} onChange={(e) => update("street", e.target.value)} placeholder="123 Main St" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City"><Input value={data.city} onChange={(e) => update("city", e.target.value)} /></Field>
              <Field label="State"><Input value={data.state} onChange={(e) => update("state", e.target.value)} /></Field>
              <Field label="ZIP Code"><Input value={data.zip} onChange={(e) => update("zip", e.target.value)} /></Field>
              <Field label="Country">
                <Select value={data.country} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <SectionHeader title="Account Type" />
            <Field label="Select Account" required>
              <Select value={data.accountType} onValueChange={(v) => update("accountType", v)}>
                <SelectTrigger><SelectValue placeholder="Choose an account type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings Account">Savings Account</SelectItem>
                  <SelectItem value="Current Account">Current Account</SelectItem>
                  <SelectItem value="Business Account">Business Account</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Initial Deposit">
              <Input type="number" min="0" value={data.deposit} onChange={(e) => update("deposit", e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Additional Notes">
              <Textarea rows={4} value={data.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything else we should know?" />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <SectionHeader title="Review & Submit" />
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["First Name", data.firstName],
                    ["Last Name", data.lastName],
                    ["Email", data.email],
                    ["Phone", data.phone],
                    ["Date of Birth", data.dob],
                    ["Street", data.street],
                    ["City", data.city],
                    ["State", data.state],
                    ["ZIP Code", data.zip],
                    ["Country", data.country],
                    ["Account Type", data.accountType],
                    ["Initial Deposit", data.deposit],
                    ["Notes", data.notes],
                  ].map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? "bg-muted/40" : ""}>
                      <td className="w-1/3 px-4 py-3 font-medium text-muted-foreground">{k}</td>
                      <td className="px-4 py-3 break-all">{v || <span className="text-muted-foreground/60">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={saveDraft}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={loadDraft}>
              <Upload className="mr-2 h-4 w-4" /> Load Draft
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 1}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={next}>
                Next Step <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!successId} onOpenChange={(o) => !o && reset()}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Application Submitted</DialogTitle>
            <DialogDescription className="text-center">
              Your bank account application has been received successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference (sys_id)</p>
            <p className="mt-1 font-mono text-sm break-all">{successId}</p>
          </div>
          <DialogFooter>
            <Button onClick={reset} className="w-full">Start New Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
