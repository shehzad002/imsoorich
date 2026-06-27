"use client";

import { useState } from "react";

export function RequestToolForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", contact: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setForm({ name: "", description: "", contact: "" });
      } else {
        setError(data.error || "Failed to submit. Try again.");
      }
    } catch {
      setError("Failed to submit. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-16 rounded-2xl border border-neon-purple/20 bg-gradient-to-b from-neon-purple/5 to-transparent p-8 text-center">
      <h3 className="font-billboard text-2xl text-white sm:text-3xl">
        Can&apos;t find your tool?
      </h3>
      <p className="mx-auto mt-3 max-w-lg font-mono text-sm text-gray-400">
        Request any bot, sniper, or bundler. If we approve it, it shows up in{" "}
        <span className="text-neon-gold">Upcoming</span> — then we build it.
      </p>

      {!open && !done && (
        <button
          onClick={() => setOpen(true)}
          className="btn-neon mt-6 px-6 py-2.5"
        >
          + Request a Tool
        </button>
      )}

      {done && (
        <div className="mx-auto mt-6 max-w-md rounded-lg border border-neon-green/30 bg-neon-green/10 px-4 py-3 font-mono text-sm text-neon-green">
          ✅ Request sent! We&apos;ll review it soon. Watch the Upcoming section.
          <button
            onClick={() => {
              setDone(false);
              setOpen(false);
            }}
            className="mt-2 block w-full text-center text-xs text-gray-400 hover:text-neon-green"
          >
            Submit another
          </button>
        </div>
      )}

      {open && !done && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 max-w-md space-y-3 text-left"
        >
          <input
            type="text"
            placeholder="Tool name (e.g. Pumpfun Sniper Pro)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field w-full"
            maxLength={120}
            required
          />
          <textarea
            placeholder="What should it do? Describe the features you need."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field w-full min-h-[90px] resize-y"
            maxLength={1000}
            required
          />
          <input
            type="text"
            placeholder="Telegram / contact (optional)"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="input-field w-full"
            maxLength={120}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-neon flex-1 py-2.5 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-outline px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
