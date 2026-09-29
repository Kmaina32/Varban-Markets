
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { 
  User, 
  ShieldCheck,
  Lock,
  Bell,
  Settings
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// Sub-components
import ProfileTab from "@/components/account/ProfileTab";
import KycTab from "@/components/account/KycTab";
import SecurityTab from "@/components/account/SecurityTab";
import AlertsTab from "@/components/account/AlertsTab";
import DisplayTab from "@/components/account/DisplayTab";

type AccountTab = 'profile' | 'kyc' | 'security' | 'alerts' | 'display';

export default function AccountClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as AccountTab;
    if (tabParam && ['profile', 'kyc', 'security', 'alerts', 'display'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'kyc', label: 'KYC', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'display', label: 'Display', icon: Settings },
  ] as const;

  return (
    <AuthedLayout title="Account Hub" subtitle="Manage your identity and workspace settings">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Institutional Tab Navigation */}
        <div className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={cn(
                "flex-1 min-w-[110px] py-4 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 border-b-2 transition-all", 
                activeTab === tab.id 
                  ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" 
                  : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'kyc' && <KycTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'display' && <DisplayTab />}
        </div>
      </div>
    </AuthedLayout>
  );
}
