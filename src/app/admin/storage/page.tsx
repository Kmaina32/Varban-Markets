
'use client';

/**
 * @fileOverview Admin Storage Node (R2 Manager).
 * Direct interface for management of the decentralized storage infrastructure.
 */

import { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Folder, 
  File, 
  Search, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  MoreVertical, 
  Eye, 
  Download,
  X,
  Check,
  User,
  ExternalLink,
  Database
} from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

interface R2Item {
  name: string;
  prefix?: string; // For folders
  key?: string;   // For files
  type: 'folder' | 'file';
  size?: number;
  lastModified?: string;
}

export default function AdminStorageManager() {
  const db = useFirestore();
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [items, setItems] = useState<{ folders: R2Item[], files: R2Item[] }>({ folders: [], files: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // User Search Logic
  const [userSearch, setUserSearch] = useState("");
  const usersRef = useMemo(() => (db ? collection(db, "users") : null), [db]);
  const { data: users } = useCollection<any>(usersRef ? query(usersRef, limit(10)) : null);
  
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim() || !users) return [];
    return users.filter(u => 
      (u.profile?.fullName || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.profile?.email || "").toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const [renamingItem, setRenamingItem] = useState<{ item: R2Item, newName: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadListing = async (prefix: string) => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/storage/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix })
      });
      const data = await resp.json();
      setItems(data);
    } catch (err) {
      alert("Handshake Failure: Could not reach R2 node.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListing(currentPrefix);
  }, [currentPrefix]);

  const handleRename = async () => {
    if (!renamingItem || isProcessing) return;
    setIsProcessing(true);

    const oldPath = renamingItem.item.prefix || renamingItem.item.key || "";
    const pathParts = oldPath.split('/');
    pathParts.pop(); // Remove the old name
    if (renamingItem.item.type === 'folder') pathParts.pop(); // Folders have trailing slash

    const newPathBase = pathParts.join('/');
    const newPath = renamingItem.item.type === 'folder' 
      ? (newPathBase ? `${newPathBase}/${renamingItem.newName}/` : `${renamingItem.newName}/`)
      : (newPathBase ? `${newPathBase}/${renamingItem.newName}` : renamingItem.newName);

    try {
      const resp = await fetch('/api/storage/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPath, 
          newPath, 
          isFolder: renamingItem.item.type === 'folder' 
        })
      });
      
      if (resp.ok) {
        setRenamingItem(null);
        loadListing(currentPrefix);
      }
    } catch (e) {
      alert("Authority Failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (item: R2Item) => {
    if (!window.confirm(`Confirm permanent deletion of ${item.name}?`)) return;
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: item.prefix || item.key, 
          isFolder: item.type === 'folder' 
        })
      });
      if (resp.ok) loadListing(currentPrefix);
    } catch (e) {
      alert("Authority Failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  const jumpToUser = (userName: string) => {
    const sanitized = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    setCurrentPrefix(`user/${sanitized}/`);
    setUserSearch("");
  };

  const breadcrumbs = useMemo(() => {
    const parts = currentPrefix.split('/').filter(Boolean);
    const result = [{ name: 'root', path: '' }];
    let acc = '';
    parts.forEach(p => {
      acc += `${p}/`;
      result.push({ name: p, path: acc });
    });
    return result;
  }, [currentPrefix]);

  return (
    <AuthedLayout title="Storage Node" subtitle="Root access to decentralized R2 infrastructure">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Search & Utility Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm lg:col-span-2 flex items-center gap-4">
            <Search className="w-4 h-4 text-[#6B7280]" />
            <input 
              placeholder="Filter current view..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-grow text-xs outline-none bg-transparent"
            />
          </Card>
          
          <div className="relative">
            <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex items-center gap-4">
              <User className="w-4 h-4 text-[#0055FF]" />
              <input 
                placeholder="Search user directory..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="flex-grow text-xs outline-none bg-transparent"
              />
            </Card>
            {filteredUsers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E4] shadow-xl z-[50] divide-y divide-[#F7F7F5]">
                {filteredUsers.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => jumpToUser(u.profile?.fullName || u.email)}
                    className="w-full text-left p-3 hover:bg-[#F7F7F5] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase block">{u.profile?.fullName || u.email}</span>
                      <span className="text-[8px] text-[#6B7280] font-mono">{u.email}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[#E4E4E4] group-hover:text-[#0055FF]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Browser Header */}
        <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {breadcrumbs.map((bc, idx) => (
              <div key={bc.path} className="flex items-center shrink-0">
                <button 
                  onClick={() => setCurrentPrefix(bc.path)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 transition-colors",
                    idx === breadcrumbs.length - 1 ? "text-[#0A0A0A]" : "text-[#6B7280] hover:text-[#0055FF]"
                  )}
                >
                  {bc.name}
                </button>
                {idx < breadcrumbs.length - 1 && <span className="text-[#6B7280] text-[10px]">/</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest bg-white border border-[#E4E4E4] px-2 py-1">
                Bucket: varbanmarkets
             </span>
             {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0055FF]" />}
          </div>
        </div>

        {/* File Browser Table */}
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Object Domain</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Storage Key</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Allocated Size</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-16 text-center text-[#6B7280] animate-pulse font-mono uppercase tracking-[0.2em] text-[10px]">Synchronizing R2 Node...</td></tr>
                ) : (
                  <>
                    {/* Folders */}
                    {items.folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(folder => (
                      <tr key={folder.prefix} className="hover:bg-[#F7F7F5] transition-colors group">
                        <td className="p-4 flex items-center space-x-3">
                          <Folder className="w-4 h-4 text-[#0055FF]" />
                          <button 
                            onClick={() => setCurrentPrefix(folder.prefix || "")}
                            className="font-bold text-[#0A0A0A] hover:underline uppercase tracking-tight"
                          >
                            {folder.name}
                          </button>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-[#6B7280] truncate max-w-[200px]">{folder.prefix}</td>
                        <td className="p-4 text-[#6B7280] uppercase text-[10px]">Directory</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => setRenamingItem({ item: folder, newName: folder.name })}
                              className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#0055FF] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(folder)}
                              className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#C43D3D] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Files */}
                    {items.files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(file => (
                      <tr key={file.key} className="hover:bg-[#F7F7F5] transition-colors group">
                        <td className="p-4 flex items-center space-x-3">
                          <File className="w-4 h-4 text-[#6B7280]" />
                          <span className="font-bold text-[#0A0A0A] truncate max-w-[150px]">{file.name}</span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-[#6B7280] truncate max-w-[200px]">{file.key}</td>
                        <td className="p-4 text-[#6B7280] font-mono text-[10px]">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "0 KB"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={async () => {
                                const resp = await fetch('/api/storage/view-url', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ storageKey: file.key })
                                });
                                const { viewUrl } = await resp.json();
                                window.open(viewUrl, '_blank');
                              }}
                              className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#0055FF] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setRenamingItem({ item: file, newName: file.name })}
                              className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#0055FF] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(file)}
                              className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#C43D3D] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rename Modal */}
        {renamingItem && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-white border-[#E4E4E4] shadow-2xl relative p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                  Rename {renamingItem.item.type}
                </h3>
                <button onClick={() => setRenamingItem(null)}><X className="w-4 h-4 text-[#6B7280]" /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">New Entry Name</label>
                  <input 
                    value={renamingItem.newName}
                    onChange={e => setRenamingItem({ ...renamingItem, newName: e.target.value })}
                    className="w-full p-3 border border-[#E4E4E4] text-xs font-bold outline-none focus:border-[#0055FF]"
                    autoFocus
                  />
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-2">
                   <Database className="w-3.5 h-3.5 text-[#0055FF] shrink-0 mt-0.5" />
                   <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase">
                      Warning: Renaming namespaces is an intensive operation. All associated metadata will be updated to the new path.
                   </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setRenamingItem(null)}
                  className="flex-1 py-3 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRename}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all"
                >
                  {isProcessing ? "Synchronizing..." : "Apply Rename"}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AuthedLayout>
  );
}
