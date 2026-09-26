
'use client';

import { useMemo, useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Mail, Globe, ShieldAlert, Plus, ShieldCheck, X } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

/**
 * @fileOverview User Directory Management & Authority Allocation.
 * Sources live account profiles from Firestore and handles KYC status and Admin Role overrides.
 */

export default function UserManagement() {
  const { t, formatNumber } = useTranslation();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isProcessingAdmin, setIsProcessingAdmin] = useState(false);

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: users, loading } = useCollection<any>(usersQuery);

  const handleVerify = (userId: string, currentStatus: string) => {
    if (!db) return;
    const nextStatus = currentStatus === 'Verified' ? 'Not Verified' : 'Verified';
    updateDoc(doc(db, "users", userId), {
      verificationStatus: nextStatus
    }).catch((err) => {
      console.error("Authority Failure:", err);
    });
  };

  const handleToggleRole = (userId: string, currentRole: string) => {
    if (!db) return;
    const nextRole = currentRole === 'Admin' ? 'Trader' : 'Admin';
    if (!window.confirm(`Modify authority level for this entity to ${nextRole}?`)) return;
    
    updateDoc(doc(db, "users", userId), {
      role: nextRole
    }).catch((err) => {
      console.error("Role Modification Failure:", err);
    });
  };

  const handleAddAdminByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !adminEmail) return;

    setIsProcessingAdmin(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", adminEmail.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("Entity not found in the global registry. User must register before authority can be granted.");
      } else {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), {
          role: "Admin"
        });
        alert(`Root Authority granted to ${adminEmail}.`);
        setIsAddAdminModalOpen(false);
        setAdminEmail("");
      }
    } catch (err) {
      alert(" HANDSHAKE ERROR: Could not update user role.");
    } finally {
      setIsProcessingAdmin(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <AuthedLayout 
      title="User Directory" 
      subtitle="Regulatory oversight and KYC verification workspace"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Card className="p-4 border-[#E4E4E4] bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 flex-grow w-full">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Search entities by name, email or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF]"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Global Entities:</span>
                <span className="text-xs font-mono font-bold text-[#0A0A0A]">{users?.length || 0}</span>
              </div>
            </div>
          </Card>

          <button 
            onClick={() => setIsAddAdminModalOpen(true)}
            className="w-full md:w-auto bg-[#0055FF] text-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm hover:bg-[#0A0A0A] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Grant Admin Authority</span>
          </button>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Entity Profile</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Contact Domain</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">KYC Status</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Authority</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Liquidity (USD)</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#6B7280] font-mono">Synchronizing Platform Records...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#6B7280]">No entities found in the current scope.</td></tr>
                ) : filteredUsers.map((userItem: any) => (
                  <tr key={userItem.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center font-bold text-[10px] text-[#0055FF]">
                          {userItem.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <span className="font-bold block text-[#0A0A0A]">{userItem.fullName || "Unnamed Entity"}</span>
                          <span className="text-[9px] text-[#6B7280] font-mono uppercase tracking-tighter">{userItem.id.slice(0, 10)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <Mail className="w-3 h-3 text-[#6B7280]" />
                          <span className="text-[#6B7280]">{userItem.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <Globe className="w-3 h-3 text-[#6B7280]" />
                          <span className="uppercase text-[#6B7280]">{userItem.country || "Global"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 border text-[9px] font-bold uppercase",
                        userItem.verificationStatus === 'Verified' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5"
                      )}>
                        {userItem.verificationStatus || "Not Verified"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleRole(userItem.id, userItem.role)}
                        className={cn(
                          "px-2 py-0.5 border text-[9px] font-bold uppercase transition-all",
                          userItem.role === 'Admin' 
                            ? "bg-[#0055FF] text-white border-[#0055FF]" 
                            : "bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF]"
                        )}
                      >
                        {userItem.role === 'Admin' ? "Root" : "Trader"}
                      </button>
                    </td>
                    <td className="p-4 text-right font-mono font-bold">
                      ${formatNumber(userItem.balance || 0, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleVerify(userItem.id, userItem.verificationStatus)}
                          className="text-[9px] font-bold uppercase px-3 py-1.5 border border-[#E4E4E4] hover:bg-[#0055FF] hover:text-white transition-colors"
                        >
                          {userItem.verificationStatus === 'Verified' ? "Revoke KYC" : "Verify KYC"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-[#0055FF]" />
                Authority Allocation
              </h3>
              <button onClick={() => setIsAddAdminModalOpen(false)} className="text-[#6B7280] hover:text-[#0A0A0A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddAdminByEmail} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Registered Entity Email</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@varbanmarkets.com"
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                  required
                />
              </div>

              <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#0055FF] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold">
                  Granting Root Authority provides full access to user ledgers, market switches, and platform configurations.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isProcessingAdmin}
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                {isProcessingAdmin ? "Provisioning Authority..." : "Commit Administrative Status"}
              </button>
            </form>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
