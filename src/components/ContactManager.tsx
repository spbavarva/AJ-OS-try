import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/store';
import { Contact } from '../lib/types';
import { getLocalDate } from '../lib/date';
import { useConfirm } from './ConfirmModal';

// Inline editable contact component
const EditableContact: React.FC<{
  contact: Contact;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: Contact) => Promise<void>;
  onDelete: () => void;
  saving: boolean;
}> = ({ contact, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, saving }) => {
  // Helper to parse existing data
  const parseCompanyData = (str: string) => {
    if (!str) return { role: '', company: '' };
    const separators = [' at ', ' @ ', ' - ', ' | '];
    for (const sep of separators) {
      if (str.includes(sep)) {
        const [role, company] = str.split(sep);
        return { role: role.trim(), company: company.trim() };
      }
    }
    return { role: '', company: str }; // Default to treating whole string as company if no separator
  };

  const { role: initialRole, company: initialCompany } = parseCompanyData(contact.company);

  const [editName, setEditName] = useState(contact.name);
  const [editRole, setEditRole] = useState(initialRole);
  const [editCompany, setEditCompany] = useState(initialCompany);
  const [editEmail, setEditEmail] = useState(contact.email);
  const [editLinkedin, setEditLinkedin] = useState(contact.linkedin);
  const [editXAccount, setEditXAccount] = useState(contact.xAccount);
  const [editNotes, setEditNotes] = useState(contact.notes);
  const [editAvatarUrl, setEditAvatarUrl] = useState(contact.avatarUrl || '');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const { role, company } = parseCompanyData(contact.company);
      setEditName(contact.name);
      setEditRole(role);
      setEditCompany(company);
      setEditEmail(contact.email);
      setEditLinkedin(contact.linkedin);
      setEditXAccount(contact.xAccount);
      setEditNotes(contact.notes);
      setEditAvatarUrl(contact.avatarUrl || '');
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [isEditing, contact]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelEdit();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editName, editCompany, editRole, editEmail, editLinkedin, editXAccount, editNotes, editAvatarUrl]);

  const handleSave = async () => {
    if (!editName || saving) return;

    // Combine Role and Company
    const combinedCompany = editRole && editCompany
      ? `${editRole} at ${editCompany}`
      : editRole || editCompany;

    const updatedContact = {
      ...contact,
      name: editName,
      company: combinedCompany,
      email: editEmail,
      linkedin: editLinkedin,
      xAccount: editXAccount,
      notes: editNotes,
      avatarUrl: editAvatarUrl,
    };
    await onSave(updatedContact);
  };

  if (isEditing) {
    return (
      <div className="glass-card p-6 md:p-8 rounded-3xl border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20 animate-pulse-border col-span-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Editing Node</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm hover:shadow"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
                <span className="text-[8px] text-zinc-400 font-normal ml-0.5">ESC</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!editName || saving}
                className="group flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-500 text-white hover:bg-indigo-600 border border-indigo-600 hover:border-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                <span className="text-[8px] text-indigo-100 font-normal ml-0.5">⌘↵</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Name</label>
              <input
                ref={nameRef}
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-main placeholder-zinc-400"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Role / Job Title</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-main placeholder-zinc-400 font-medium"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                placeholder="Product Manager"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Role / Job Title</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-main placeholder-zinc-400 font-medium"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                placeholder="Product Manager"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Company / Entity</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-main placeholder-zinc-400 font-medium"
                value={editCompany}
                onChange={e => setEditCompany(e.target.value)}
                placeholder="Google"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Email</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-main placeholder-zinc-400"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Avatar URL</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-main placeholder-zinc-400"
                value={editAvatarUrl}
                onChange={e => setEditAvatarUrl(e.target.value)}
                placeholder="Profile photo URL"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">LinkedIn</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mono font-bold text-main placeholder-zinc-400 transition-all"
                value={editLinkedin}
                onChange={e => setEditLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">X Account</label>
              <input
                className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mono font-bold text-main placeholder-zinc-400 transition-all"
                value={editXAccount}
                onChange={e => setEditXAccount(e.target.value)}
                placeholder="@handle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Notes</label>
            <textarea
              className="w-full bg-black/5 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px] resize-y font-medium text-main placeholder-zinc-400"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Why is this contact important?"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
        onStartEdit();
      }}
    >
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Action Buttons (Top Right) */}
      <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-95 group-hover:scale-100" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onStartEdit}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-sky-500 hover:shadow-md transition-all border border-zinc-100"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-rose-500 hover:shadow-md transition-all border border-zinc-100"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative shrink-0">
            {contact.avatarUrl ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white transition-transform duration-500 group-hover:scale-105 bg-zinc-100">
                <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg ring-4 ring-white group-hover:scale-105 transition-transform duration-500">
                <span className="text-2xl font-black text-white uppercase">{contact.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-3 truncate group-hover:text-sky-600 transition-colors">
              {contact.name}
            </h3>

            <div className="flex flex-wrap gap-2">
              {parseCompanyData(contact.company).role && (
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80 text-zinc-600 shadow-sm">
                  <span className="text-[11px] font-medium tracking-wide truncate">
                    {parseCompanyData(contact.company).role}
                  </span>
                </div>
              )}
              {parseCompanyData(contact.company).company && (
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-white border border-indigo-100 text-indigo-600 shadow-sm shadow-indigo-100/50">
                  <span className="text-[11px] font-bold tracking-wide truncate">
                    {parseCompanyData(contact.company).company}
                  </span>
                </div>
              )}
              {!contact.company && (
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400">
                  <span className="text-[11px] font-medium tracking-wide">Independent</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {contact.notes ? (
          <div className="flex-1 mb-6">
            <div className="relative pl-4 border-l-2 border-indigo-200 py-1">
              <p className="text-sm text-slate-600 font-medium italic leading-relaxed line-clamp-3">
                "{contact.notes}"
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 mb-6 flex items-center justify-center opacity-30">
            <div className="h-px bg-slate-300 w-12 rounded-full"></div>
          </div>
        )}

        {/* Footer: Socials + Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow" onClick={(e) => e.stopPropagation()} title="Send Email">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm hover:shadow" onClick={(e) => e.stopPropagation()}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
            )}
            {contact.xAccount && (
              <a href={`https://x.com/${contact.xAccount.replace('@', '')}`} target="_blank" className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-black hover:text-white transition-all shadow-sm hover:shadow" onClick={(e) => e.stopPropagation()}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            )}
            {(!contact.linkedin && !contact.xAccount && !contact.email) && (
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider opacity-60">Offline Node</span>
            )}
          </div>

          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {contact.traceDate?.split('-').slice(1).join('/') || 'RECENT'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    email: '',
    linkedin: '',
    xAccount: '',
    notes: '',
    avatarUrl: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showConfirm } = useConfirm();

  useEffect(() => {
    setContacts(Storage.getContacts());
    Storage.fetchContacts().then(setContacts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSaving(true);
    try {
      const now = getLocalDate();

      const combinedCompany = formData.role && formData.company
        ? `${formData.role} at ${formData.company}`
        : formData.role || formData.company;

      const newContact: Contact = {
        id: crypto.randomUUID(),
        dateAdded: now,
        traceDate: now,
        ...formData,
        company: combinedCompany,
      };

      // Remove helper fields 'role' before saving to DB, as DB expects 'company' string
      const { role, company, ...contactData } = newContact as any;

      // Re-add the combined company string that might have been stripped if it matched the key 'company' from formData
      // Actually, newContact.company is already set to combinedCompany.
      // But formData.company is the raw input.
      // The spread `...formData` overrides `company` property if it comes after. 
      // Wait, `...formData` is before `company: combinedCompany` in my proposed fix below?
      // Let's check the previous code:
      /*
      const newContact: Contact = {
        id: ...,
        ...formData,
        company: combinedCompany, 
      };
      */
      // Use explicit construction to be safe and avoid lint errors or overwrites.

      const finalContact: Contact = {
        id: newContact.id,
        name: newContact.name,
        company: combinedCompany, // Explicitly set the combined string
        email: newContact.email,
        linkedin: newContact.linkedin,
        xAccount: newContact.xAccount,
        notes: newContact.notes,
        dateAdded: newContact.dateAdded,
        traceDate: newContact.traceDate,
        avatarUrl: newContact.avatarUrl
      };

      await Storage.saveContact(finalContact);
      setContacts([finalContact, ...contacts]);
      setFormData({ name: '', role: '', company: '', email: '', linkedin: '', xAccount: '', notes: '', avatarUrl: '' });
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (updatedContact: Contact) => {
    setSaving(true);
    try {
      await Storage.updateContact(updatedContact);
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to permanently remove this contact? This action cannot be undone.');
    if (confirmed) {
      await Storage.deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex justify-between items-end px-2">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-[1px] bg-gradient-to-r from-sky-500 to-transparent"></div>
            <span className="text-[10px] font-black mono uppercase tracking-[0.4em] text-zinc-500">Operation: Network Mapping</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">NETWORK GRAPH</h2>
          <p className="text-zinc-500 mt-4 max-w-lg leading-relaxed font-medium">
            High-value connections only. Store context, avoid memory-based networking. Build a verified logic map of your nodes.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) {
              setFormData({ name: '', company: '', email: '', linkedin: '', xAccount: '', notes: '', avatarUrl: '' });
            }
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl active:scale-95"
        >
          {isAdding ? 'CLOSE TERMINAL' : 'ADD NODE'}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="relative group animate-slide-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass-card p-8 rounded-3xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">01 / Identity</label>
                <input
                  className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all font-semibold text-main placeholder-zinc-400"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name (Required)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">02 / Logic Affiliation</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all text-main placeholder-zinc-400"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Role (e.g. Founder)"
                  />
                  <input
                    className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all text-main placeholder-zinc-400"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company (e.g. OpenAi)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">03 / Communication Endpoint</label>
                <input
                  className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all text-main placeholder-zinc-400"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">04 / Visual Asset URI</label>
                <input
                  className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all text-main placeholder-zinc-400"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="Profile photo URL (LinkedIn or similar)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">05 / LinkedIn Protocol</label>
                <input
                  className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-sky-500/50 mono font-bold text-main placeholder-zinc-400"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">06 / X Interface</label>
                <input
                  className="w-full bg-black/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-sky-500/50 mono font-bold text-main placeholder-zinc-400"
                  value={formData.xAccount}
                  onChange={e => setFormData({ ...formData, xAccount: e.target.value })}
                  placeholder="@handle"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">07 / System Context</label>
              <textarea
                className="w-full bg-black/5 border border-white/5 rounded-2xl px-6 py-4 text-sm h-32 resize-none focus:outline-none focus:border-sky-500/50 transition-all leading-relaxed font-medium text-main placeholder-zinc-400"
                placeholder="Verifiable intent only. Why is this node in the graph?"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={!formData.name || saving}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Processing...' : 'Commit Node to Engine'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
        {contacts.length === 0 && !isAdding && (
          <div className="col-span-2 text-center py-24 glass-panel border-dashed border-white/5 rounded-[4rem]">
            <p className="text-zinc-700 mono text-sm uppercase font-black tracking-[0.5em]">No Nodes Mapped</p>
          </div>
        )}
        {contacts.map(c => (
          <EditableContact
            key={c.id}
            contact={c}
            isEditing={editingId === c.id}
            onStartEdit={() => {
              setEditingId(c.id);
              setIsAdding(false);
            }}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleInlineSave}
            onDelete={() => deleteContact(c.id)}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
};
