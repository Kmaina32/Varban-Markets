'use client';

/**
 * @fileOverview Profile Management Tab (Supabase Version).
 * Features expanded Address and Investor Profile sections.
 * Enforces mandatory data fields for regulatory compliance.
 */

import React, { useState, useEffect } from 'react';
import { User, Camera, Loader2, ShieldAlert, MapPin, Briefcase, Globe, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/app/lib/supabase/client';
import { COUNTRIES } from '@/app/lib/countries';
import { cn } from '@/app/lib/utils';
import { useUser } from '@/firebase';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function ProfileTab() {
  const { user } = useUser();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const [form, setForm] = useState({
    firstName: "", 
    lastName: "", 
    phone: "", 
    country: "United Kingdom", 
    dialCode: "+44",
    // Address Information
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    // Investor Profile
    accountPurpose: "Portfolio Diversification",
    originFunds: "Kenya",
    netWorth: "Less than $10,000",
    annualIncome: "Less than $10,000",
    tradeForecast: "$5,000 - $25,000",
    education: "Bachelor's Degree / Diploma",
    employmentStatus: "Employed",
    sourceWealth: "Business Revenue"
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .maybeSingle();
        
        if (data) {
          setProfile(data);
          const rawPhone = data.phone || "";
          const phoneParts = rawPhone.split(' ');
          setForm({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
            country: data.country || "United Kingdom",
            dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44",
            addressLine1: data.address_line1 || "",
            addressLine2: data.address_line2 || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zip_code || "",
            accountPurpose: data.account_purpose || "Portfolio Diversification",
            originFunds: data.origin_funds || "Kenya",
            netWorth: data.net_worth || "Less than $10,000",
            annualIncome: data.annual_income || "Less than $10,000",
            tradeForecast: data.trade_forecast || "$5,000 - $25,000",
            education: data.education || "Bachelor's Degree / Diploma",
            employmentStatus: data.employment_status || "Employed",
            sourceWealth: data.source_wealth || "Business Revenue"
          });
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user?.uid, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || isSaving) return;
    setIsSaving(true);
    
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const cleanPhone = `${form.dialCode} ${form.phone}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          full_name: fullName,
          phone: cleanPhone,
          country: form.country,
          address_line1: form.addressLine1,
          address_line2: form.addressLine2,
          city: form.city,
          state: form.state,
          zip_code: form.zipCode,
          account_purpose: form.accountPurpose,
          origin_funds: form.originFunds,
          net_worth: form.netWorth,
          annual_income: form.annualIncome,
          trade_forecast: form.tradeForecast,
          education: form.education,
          employment_status: form.employmentStatus,
          source_wealth: form.sourceWealth,
          profile_completed: true // Mark as finalized
        })
        .eq('id', user.uid);
      
      if (error) throw error;

      setDialog({
        status: 'success',
        title: 'Registration Finalized',
        message: 'Your profile has been successfully synchronized and validated. You now have full access to the trading terminal.'
      });
      
      // Refresh local profile state
      setProfile(prev => ({ ...prev, profile_completed: true }));
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Validation Error',
        message: err.message || 'Failed to synchronize registration data. Please verify all mandatory fields.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Synchronizing Identity Node...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. PERSONAL INFORMATION */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <User className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label>
                  <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
                <div className="flex gap-2">
                  <select value={form.dialCode} onChange={e => setForm({...form, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5] outline-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                  </select>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF] bg-white" required />
                </div>
              </div>
            </Card>

            {/* 2. ADDRESS INFORMATION */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <MapPin className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Address Line 1</label>
                  <input value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" required placeholder="Street address or P.O. Box" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Address Line 2 (Optional)</label>
                  <input value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" placeholder="Apartment, suite, unit, etc." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Town / City</label>
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Province / State (Optional)</label>
                  <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Postal / Zip Code</label>
                  <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-mono font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country of Residence</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* 3. INVESTOR PROFILE */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <Briefcase className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Investor Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Purpose of Account Opening</label>
                  <select value={form.accountPurpose} onChange={e => setForm({...form, accountPurpose: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                    <option>Portfolio Diversification</option>
                    <option>Speculative Trading</option>
                    <option>Hedging</option>
                    <option>Savings</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Expected Country of Origin and Destination of Funds</label>
                  <select value={form.originFunds} onChange={e => setForm({...form, originFunds: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Estimated net worth</label>
                    <select value={form.netWorth} onChange={e => setForm({...form, netWorth: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                      <option>Less than $10,000</option>
                      <option>$10,000 - $50,000</option>
                      <option>$50,000 - $100,000</option>
                      <option>Over $100,000</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Estimated annual income</label>
                    <select value={form.annualIncome} onChange={e => setForm({...form, annualIncome: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                      <option>Less than $10,000</option>
                      <option>$10,000 - $50,000</option>
                      <option>$50,000 - $100,000</option>
                      <option>Over $100,000</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Anticipated dollar amount to trade with us within the next 12 months</label>
                  <select value={form.tradeForecast} onChange={e => setForm({...form, tradeForecast: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                    <option>$0 - $5,000</option>
                    <option>$5,000 - $25,000</option>
                    <option>$25,000 - $100,000</option>
                    <option>Over $100,000</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Education</label>
                    <select value={form.education} onChange={e => setForm({...form, education: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                      <option>Secondary Education</option>
                      <option>Bachelor's Degree / Diploma</option>
                      <option>Master's / PhD</option>
                      <option>Professional Qualification</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Employment Status</label>
                    <select value={form.employmentStatus} onChange={e => setForm({...form, employmentStatus: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                      <option>Employed</option>
                      <option>Self-Employed</option>
                      <option>Retired</option>
                      <option>Student</option>
                      <option>Unemployed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Source of Income / Wealth</label>
                  <select value={form.sourceWealth} onChange={e => setForm({...form, sourceWealth: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none">
                    <option>Employment Salary</option>
                    <option>Business Revenue</option>
                    <option>Investments / Dividends</option>
                    <option>Inheritance / Gift</option>
                    <option>Savings</option>
                  </select>
                </div>
              </div>
            </Card>

            <button type="submit" disabled={isSaving} className="w-full btn-institutional-primary py-5 text-xs tracking-[0.2em] shadow-xl">
              {isSaving ? "SYNCHRONIZING..." : "Complete Registration"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#0055FF]" />
              <span className="text-[10px] font-bold uppercase text-[#0A0A0A] tracking-widest">Enforcement Status</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                <span className="text-[8px] uppercase text-[#6B7280] block mb-1">Registration Level</span>
                <p className="text-[10px] font-bold uppercase text-[#0A0A0A]">
                  {profile?.profile_completed ? "Full Institutional Access" : "Pending Onboarding"}
                </p>
              </div>

              {!profile?.profile_completed && (
                <div className="flex items-start gap-3 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20">
                  <Info className="w-4 h-4 text-[#C43D3D] shrink-0" />
                  <p className="text-[9px] text-[#C43D3D] uppercase font-bold leading-relaxed">
                    Access to the Trade Terminal and Vault Funding is restricted until the Investor Profile is completed and synchronized.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] space-y-4">
             <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] tracking-widest">Communication</h4>
             <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
               Manage your marketing and security notification preferences from the Alerts center. You can unsubscribe from non-critical broadcasts at any time.
             </p>
             <button className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest underline decoration-2 underline-offset-4">Open Subscriptions Center</button>
          </Card>

          <div className="p-4 flex items-start gap-3">
            <Globe className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
              All registration data is processed according to Saint Lucia jurisdiction laws and protected by TLS 1.3 encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
