"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-4 pb-2 md:max-w-2xl md:mx-auto md:w-full">
        <Link
          href="/"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-text-secondary">
          Partner With Us
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-8 md:max-w-2xl md:mx-auto md:w-full">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center pt-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/15 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              We got your info
            </h2>
            <p className="text-sm text-text-secondary mb-8 max-w-xs">
              We&apos;ll reach out soon to discuss how we can feature your business on Rendition.
            </p>
            <Link
              href="/"
              className="text-accent-primary font-semibold text-sm hover:underline"
            >
              Back to home
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 pb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Get featured on Rendition
              </h2>
              <p className="text-sm text-text-secondary">
                We connect college couples with great local experiences. If your
                business is a perfect date night spot, we want to hear from you.
              </p>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              <div className="bg-bg-card border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold text-text-primary mb-1">Targeted audience</p>
                <p className="text-xs text-text-muted">
                  Every user is actively looking for something to do tonight with their partner.
                </p>
              </div>
              <div className="bg-bg-card border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold text-text-primary mb-1">Curated placement</p>
                <p className="text-xs text-text-muted">
                  Your business appears as a genuine recommendation, not a banner ad.
                </p>
              </div>
              <div className="bg-bg-card border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold text-text-primary mb-1">Foot traffic you can measure</p>
                <p className="text-xs text-text-muted">
                  Track how many couples tap &ldquo;Get Directions&rdquo; to your location.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Business name
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg-card border-2 border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="e.g. The Cocoa Bean"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Contact name
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg-card border-2 border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-bg-card border-2 border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="you@business.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tell us about your spot
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-bg-card border-2 border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                  placeholder="What makes your business a great date night spot?"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-accent-primary text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                Get in Touch
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
