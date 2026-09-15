"use client";

import { useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Bell, Shield, Wallet, Activity, CheckCircle2, Info } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function NotificationsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const notesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, user]);

  const { data: alerts, loading } = useCollection<any>(notesQuery);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Trade': return Activity;
      case 'Security': return Shield;
      case 'Funds': return Wallet;
      default: return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Trade': return "text-[#16835B]";
      case 'Security': return "text-[#0055FF]";
      case 'Funds': return "text-[#16835B]";
      default: return "text-[#6B7280]";
    }
  };

  return (
    <AuthedLayout 
      title="Notifications" 
      subtitle="Account activity and updates"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">Feed</span>
            <span className="bg-[#0055FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {alerts?.filter((a: any) => a.isUnread).length || 0} New
            </span>
          </div>
          <button className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0A0A0A] transition-colors flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-[#6B7280] p-4 text-center">Loading notifications...</p>
          ) : alerts?.length === 0 ? (
            <Card className="bg-white border-[#E4E4E4] p-10 text-center shadow-sm">
              <Bell className="w-8 h-8 text-[#E4E4E4] mx-auto mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">No notifications yet</p>
            </Card>
          ) : alerts?.map((alert: any) => {
            const Icon = getIcon(alert.type);
            return (
              <Card 
                key={alert.id} 
                className={`bg-white border-[#E4E4E4] p-5 shadow-sm flex items-start space-x-4 group hover:border-[#0055FF] transition-all relative ${alert.isUnread ? 'border-l-2 border-l-[#0055FF]' : ''}`}
              >
                <div className={`p-2.5 bg-[#F7F7F5] border border-[#E4E4E4] group-hover:border-[#0055FF] transition-colors`}>
                  <Icon className={`w-4 h-4 ${getColor(alert.type)}`} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-tight text-[#0A0A0A]">
                        {alert.title}
                      </h4>
                      {alert.isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0055FF]"></span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[#6B7280]">
                      {alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-2xl">{alert.body}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 text-center space-y-2">
          <Info className="w-5 h-5 text-[#E4E4E4] mx-auto mb-1" />
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">End of feed</p>
        </div>
      </div>
    </AuthedLayout>
  );
}
