"use client";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Calendar, ChevronRight } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

// Mini atoms – simplified for fun and clean look
interface FieldLabelProps {
  children: React.ReactNode;
}

function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
      {children}
    </label>
  );
}

interface HelpProps {
  children?: React.ReactNode;
  className?: string;
}

function Help({ children, className }: HelpProps) {
  if (!children) return null;
  return <p className={["text-xs text-gray-500 mt-1", className || ""].join(" ")}>{children}</p>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-lg border text-gray-900 placeholder:text-gray-400",
        "bg-white px-4 py-3 text-sm outline-none",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "transition-all duration-200",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-lg border text-gray-900 appearance-none",
        "bg-white px-4 py-3 text-sm outline-none",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "transition-all duration-200",
        props.className || "",
      ].join(" ")}
    >
      {props.children}
    </select>
  );
}

interface Game {
  key: string;
  label: string;
  image: string;
}

const GAMES: Game[] = [
  { key: "fc25", label: "FC 25", image: "/games/fc25.jpg" },
  { key: "sf6", label: "Street Fighter 6", image: "/games/sf6.jpg" },
];

const SLIDESHOW_IMAGES: string[] = [
  "/games/fc25.jpg",
  "/games/sf6s.jpg",
  "/games/fc25-2.jpg",
  "/games/sf6-2.jpg",
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  dob: string;
  course: string;
  gender: string;
  year: string;
  game: string;
  acceptTc: boolean;
}

// Custom success toast component with Framer Motion
const SuccessToast = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -50, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bg-green-600 text-white rounded-xl shadow-lg p-4 flex items-center gap-3 border-2 border-green-400"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
      >
        <CheckCircle className="w-6 h-6" />
      </motion.div>
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
};

export default function ClientForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    course: "",
    gender: "",
    year: "",
    game: "",
    acceptTc: false,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successId, setSuccessId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Helper to update form fields
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(form.email.trim()) &&
      /^\d{10}$/.test(form.phone.trim()) &&
      form.dob.trim().length > 0 &&
      form.course.trim().length > 0 &&
      form.gender.trim().length > 0 &&
      form.year.trim().length > 0 &&
      form.game.trim().length > 0 &&
      form.acceptTc
    );
  }, [form]);

  // Handle slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Please complete all required fields with valid data and accept T&C.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/playmax/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: { id?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Submission failed");
      } else {
        setSuccessId(data.id || null);
        // Using the custom component for the toast
        toast.custom((t) => (
          <SuccessToast message="Registration Successful! 🎉" />
        ), {
          duration: 5000,
          position: 'top-center',
        });

        // Reset form after successful submission
        setForm({
          name: "",
          email: "",
          phone: "",
          dob: "",
          course: "",
          gender: "",
          year: "",
          game: "",
          acceptTc: false,
        });
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen relative">
      {/* Toaster component for react-hot-toast */}
      <Toaster />

      {/* Hero */}
      <section className="pt-28 pb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-blue-700 via-sky-500 to-cyan-400"
        >
          Register for PlayMax Campus League
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2 text-gray-600"
        >
          Quick sign-up. Pick a title. See you on the stage! 🚀
        </motion.p>
      </section>

      {/* Integrated Card */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-2xl overflow-hidden bg-indigo-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Dynamic Image Section */}
            <div className="relative h-64 lg:h-auto">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={SLIDESHOW_IMAGES[currentImageIndex]}
                  alt="Featured Image"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const t = e.target as HTMLImageElement;
                    t.onerror = null;
                    t.src = "https://placehold.co/800x800/FFFFFF/000000?text=PlayMax";
                  }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:to-transparent" />
              <div className="absolute bottom-4 left-4 text-white z-10">
                <h2 className="text-2xl font-bold">Join the Fun!</h2>
                <p className="text-sm">Compete in exciting games 🎮</p>
              </div>
            </div>

            {/* Form Section */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <FieldLabel>Full name *</FieldLabel>
                  <TextInput
                    placeholder="Alex Sharma"
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)}
                    aria-label="Full name"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Email *</FieldLabel>
                    {/^\S+@\S+\.\S+$/.test(form.email.trim()) ? (
                      <span className="text-xs text-green-500">✅</span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <TextInput
                      type="email"
                      placeholder="alex@mail.com"
                      value={form.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("email", e.target.value)}
                      aria-label="Email"
                      className="pl-10"
                      required
                    />
                  </div>
                  <Help>Use an active email to receive updates.</Help>
                </div>
                {/* Phone */}
                <div>
                  <FieldLabel>Phone number *</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <TextInput
                      placeholder="XXXXXXXXXX"
                      value={form.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("phone", e.target.value)}
                      aria-label="Phone number"
                      inputMode="tel"
                      className="pl-10"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                  <Help>Enter a 10-digit phone number.</Help>
                </div>
                {/* DOB */}
                <div>
                  <FieldLabel>Date of birth *</FieldLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <TextInput
                      type="date"
                      value={form.dob}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("dob", e.target.value)}
                      aria-label="Date of birth"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {/* Course */}
                <div className="md:col-span-2">
                  <FieldLabel>Course *</FieldLabel>
                  <TextInput
                    placeholder="BBA, B.Tech…"
                    value={form.course}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("course", e.target.value)}
                    aria-label="Course"
                    required
                  />
                </div>
                {/* Gender */}
                <div>
                  <FieldLabel>Gender *</FieldLabel>
                  <Select
                    value={form.gender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField("gender", e.target.value)}
                    aria-label="Gender"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </Select>
                </div>
                {/* Year */}
                <div>
                  <FieldLabel>Year *</FieldLabel>
                  <Select
                    value={form.year}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField("year", e.target.value)}
                    aria-label="Year"
                    required
                  >
                    <option value="">Select Year</option>
                    <option>FY</option>
                    <option>SY</option>
                    <option>TY</option>
                    <option>Final Year</option>
                    <option>PG</option>
                    <option>Other</option>
                  </Select>
                </div>
              </div>

              {/* Game picker */}
              <div className="mt-6">
                <FieldLabel>Choose your game * 🎮</FieldLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {GAMES.map((g: Game) => {
                    const active = form.game === g.key;
                    return (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setField("game", g.key)}
                        className={[
                          "relative overflow-hidden rounded-lg border transition-all duration-200",
                          active ? "border-blue-500 shadow-md" : "border-gray-300 hover:border-zinc-500",
                        ].join(" ")}
                        aria-pressed={active}
                        aria-label={`Choose ${g.label}`}
                      >
                        <img
                          src={g.image}
                          alt={g.label}
                          className="w-full h-32 object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const t = e.target as HTMLImageElement;
                            t.onerror = null;
                            t.src = "https://placehold.co/400x200/FFFFFF/000000?text=Game";
                          }}
                        />
                        <div className="p-2 text-center">
                          <span className="font-medium text-sm text-gray-900">{g.label}</span>
                        </div>
                        {active && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 text-xs">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Help className="mt-2">Can't decide? Pick one now; changes can be requested later.</Help>
              </div>

              {/* Consent */}
              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.acceptTc}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("acceptTc", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    aria-label="Accept Terms and Conditions"
                    required
                  />
                  I accept the Terms & Conditions and Privacy Policy
                </label>
              </div>

              {/* Error */}
              {error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  role="alert"
                >
                  {error}
                </motion.div>
              ) : null}

              {/* CTA */}
              <div className="mt-6">
                <motion.button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={[
                    "w-full py-3 rounded-lg font-medium text-white",
                    "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
                    "disabled:opacity-50 transition",
                  ].join(" ")}
                >
                  <span className="flex items-center justify-center gap-2">
                    {submitting ? "Submitting…" : "Register now"}
                    {!submitting && <ChevronRight className="h-4 w-4" />}
                  </span>
                </motion.button>
                <p className="text-xs text-gray-500 text-center mt-2">Takes less than a minute! ⏱️</p>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </main>
  );
}