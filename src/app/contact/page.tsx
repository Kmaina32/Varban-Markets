"use client";

import React, { useState } from "react";
import Link from "next/image";
import { Mail, ShieldCheck, MapPin, Phone, Send, Check, MessageCircle } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useTranslation();

  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    topic: "General Question",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setStatus("loading");
    try {
      await addDoc(collection(db, "contact_messages"), {
        fullName: formData.name,
        email: formData.email,
        topic: formData.topic,
        message: formData.message,
        status: "New",
        timestamp: serverTimestamp(),
        userId: user?.uid || "anonymous"
      });
      setSubmitted(true);
    } catch (err) {
      alert("Transmission failure: Security handshake interrupted.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <div>
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-4">{t('nav.contact')}</span>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-tight">
                Institutional Support Desk.
              </h1>
              <p className="text-sm text-[#6B7280] mt-6 leading-relaxed">
                Access our global support network for technical assistance, account inquiries, or institutional partnerships.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Mail, title: "Electronic Mail", detail: "desk@varbanmarkets.com" },
                { icon: Phone, title: "Global Phone Line", detail: "+44 (0) 20 7946 0122" },
                { icon: MapPin, title: "London Headquarters", detail: "25 Bank Street, Canary Wharf, London E14 5JP" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <item.icon className="w-5 h-5 text-[#0055FF] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{item.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {user && (
              <div className="bg-[#0A0A0A] text-white p-6 border-b-4 border-[#0055FF]">
                <ShieldCheck className="w-8 h-8 text-[#0055FF] mb-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Priority Account Status</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed">
                  Authenticated workspace members receive priority status in the support queue for rapid resolution.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {submitted ? (
              <div className="bg-white border border-[#E4E4E4] p-12 text-center space-y-4 shadow-sm h-full flex flex-col justify-center">
                <div className="w-12 h-12 bg-[#16835B]/10 border border-[#16835B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#16835B]" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Message Transmitted</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                  Your inquiry has been logged in the support ledger. Our desk will respond via email shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest underline mt-4"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm">
                <div className="border-b border-[#E4E4E4] pb-6 mb-8">
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">
                    Submit an Inquiry
                  </h2>
                  <p className="text-[11px] text-[#6B7280] mt-2 uppercase tracking-wider font-bold">
                    Direct access to the Varban matching engine support desk.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Your Name</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Your Email</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Topic</label>
                    <select 
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5] appearance-none cursor-pointer"
                    >
                      <option>General Question</option>
                      <option>Account Issue</option>
                      <option>Payment Issue</option>
                      <option>Technical Problem</option>
                      <option>Institutional Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Message</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                      placeholder="Describe your inquiry in detail..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full btn-institutional-primary flex items-center justify-center space-x-2 py-4"
                  >
                    {status === 'loading' ? "Transmitting..." : (
                      <>
                        <span>Transmit Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Support Trigger */}
      <button 
        onClick={() => alert("Initializing Secure Chat Handshake...")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0A0A0A] text-white flex items-center justify-center shadow-2xl hover:bg-[#0055FF] transition-all z-[100] border-2 border-white"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
