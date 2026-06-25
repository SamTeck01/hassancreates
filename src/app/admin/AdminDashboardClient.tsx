"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlobeIcon,
  Briefcase02Icon,
  Message01Icon,
  Mail01Icon,
  UserIcon,
  Tick01Icon,
  Delete01Icon,
  Link01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { addProject, updateProject, deleteProject } from "@/app/actions/projects";
import { addService, updateService, deleteService } from "@/app/actions/services";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Visitor {
  id: number;
  ip_hash: string;
  country: string | null;
  city: string | null;
  visited_at: Date | string;
}

interface Project {
  id: string;
  number: string;
  clientName: string;
  year: string;
  role: string;
  services: string[];
  coverImage: string;
  href: string;
  description: string;
  tagline: string;
  swiperImages: string[];
  imageCaptions: string[];
  bgImage?: string;
}

interface Service {
  id: string;
  num: string;
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}

interface AdminDashboardClientProps {
  initialVisitors: Visitor[];
  initialProjects: Project[];
  initialServices: Service[];
}

// ── Mock Messages ─────────────────────────────────────────────────────────────
const MOCK_MESSAGES = [
  {
    id: 1,
    name: "Elena Rostova",
    email: "elena@rostova.design",
    subject: "Branding Collaboration Request",
    message: "Hi Hassan! I followed your work on Archin, and the geometric layout was incredibly inspiring. I'd love to discuss a potential partnership on a new branding project for a high-end architectural firm in Stockholm.",
    receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
  {
    id: 2,
    name: "Marcus Sterling",
    email: "m.sterling@capital-tech.com",
    subject: "Freelance UI Development (Next.js)",
    message: "Hey Hassan, We are seeking a freelance front-end developer/designer to support the revamp of our SaaS landing page. It needs the kind of micro-interactions and smooth scroll performance you've showcased. Do you have availability for a 3-month contract starting next month?",
    receivedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    read: false,
  },
  {
    id: 3,
    name: "Liam O'Connor",
    email: "liam@oconnor-group.ie",
    subject: "Service Inquiry — Webflow Redesign",
    message: "Hello, we are looking to migrate our marketing site from WordPress to Webflow or Next.js. We need a high-performance, beautifully interactive digital storefront. Please send your rates and package options.",
    receivedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatVisitorDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  const timeStr = `${hours}:${minutes}${ampm}`;

  if (checkDate.getTime() === today.getTime()) return `Today, ${timeStr}`;
  if (checkDate.getTime() === yesterday.getTime()) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}, ${timeStr}`;
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-white/5 relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

function VisitorsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-64 rounded-2xl" />
      <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-white/5 flex gap-8">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WorksSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#1a1a1a] border border-white/6 rounded-2xl overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="p-5 flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty States ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center text-white/20">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-white/50 mb-1">{title}</h3>
        <p className="text-xs text-white/25 max-w-[260px] leading-relaxed">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) onChange(data.url);
      else alert(data.error || "Upload failed.");
    } catch {
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">
        {label} {required && "*"}
      </label>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
        }}
        className={`relative h-24 border border-dashed rounded-xl flex flex-col items-center justify-center gap-1 p-3 transition-colors overflow-hidden ${
          dragActive ? "border-[#6B21D9] bg-[#6B21D9]/5" : "border-white/10 bg-black/20 hover:border-white/20"
        }`}
      >
        {value ? (
          <>
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('${value.replace(/'/g, "%27")}')` }}
            />
            <div className="relative z-10 flex flex-col items-center gap-1 bg-black/70 px-3 py-1.5 rounded-lg border border-white/5 max-w-[90%]">
              <span className="text-[10px] text-white font-mono truncate max-w-full">
                {value.split("/").pop()?.slice(0, 36)}
              </span>
              <button type="button" onClick={() => onChange("")} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase">
                Remove
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-[#6B21D9] animate-spin" />
            <span className="text-[10px] text-white/40">Uploading…</span>
          </div>
        ) : (
          <>
            <span className="text-[11px] text-white/50 text-center">
              Drop file or{" "}
              <label className="text-[#6B21D9] cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/avif"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </span>
            <span className="text-[9px] text-white/25 font-mono">PNG, JPG, WEBP up to 10MB</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#161616] border border-white/8 rounded-2xl ${maxWidth} w-full p-6 sm:p-8 shadow-2xl my-auto`}
      >
        <h3 className="text-base font-bold text-white mb-5">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDelete({
  open,
  name,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  if (!open) return null;
  return (
    <div onClick={onCancel} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#161616] border border-white/8 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
        <div className="w-11 h-11 rounded-full bg-red-950/25 border border-red-900/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon icon={Delete01Icon} size={18} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-white mb-2">Confirm Delete</h3>
        <p className="text-xs text-white/45 mb-6 leading-relaxed">
          Delete <strong className="text-white">{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDashboardClient({
  initialVisitors,
  initialProjects,
  initialServices,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"visitors" | "works" | "services" | "messages">("visitors");
  const [isLoading, setIsLoading] = useState(true);

  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<typeof MOCK_MESSAGES[0] | null>(null);

  // Simulate a brief loading state for data hydration feel
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Lock body scroll when any modal is open ──────────────────────────────
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  useEffect(() => {
    const anyOpen = isProjectModalOpen || !!projectToDelete || isServiceModalOpen || !!serviceToDelete;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isProjectModalOpen, projectToDelete, isServiceModalOpen, serviceToDelete]);

  // ── Project form fields ───────────────────────────────────────────────────
  const [fClientName, setFClientName] = useState("");
  const [fYear, setFYear] = useState("");
  const [fRole, setFRole] = useState("");
  const [fServices, setFServices] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fTagline, setFTagline] = useState("");
  const [fHref, setFHref] = useState("");
  const [fCoverImage, setFCoverImage] = useState("");
  const [fBgImage, setFBgImage] = useState("");
  const [fSwiperImages, setFSwiperImages] = useState<string[]>([]);
  const [fCaptions, setFCaptions] = useState<string[]>([]);

  // ── Service form fields ───────────────────────────────────────────────────
  const [sTitle, setSTitle] = useState("");
  const [sCount, setSCount] = useState("");
  const [sDescription, setSDescription] = useState("");
  const [sImage1, setSImage1] = useState("");
  const [sImage2, setSImage2] = useState("");

  const totalUniqueVisitors = useMemo(() => initialVisitors.length, [initialVisitors]);
  const unreadCount = messages.filter((m) => !m.read).length;

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch { /* best effort */ }
    router.push("/admin/login");
    router.refresh();
  };

  // ── Messages ──────────────────────────────────────────────────────────────
  const handleMessageClick = (msg: typeof MOCK_MESSAGES[0]) => {
    setSelectedMessage(msg);
    if (!msg.read) setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, read: true } : m));
  };
  const deleteMessage = (id: number) => {
    setMessages((p) => p.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  // ── Project CRUD ──────────────────────────────────────────────────────────
  const resetProjectForm = () => {
    setFClientName(""); setFYear(""); setFRole(""); setFServices("");
    setFDescription(""); setFTagline(""); setFHref("");
    setFCoverImage(""); setFBgImage("");
    setFSwiperImages([]); setFCaptions([]);
    setProjectError(""); setProjectSuccess(false); setEditingProject(null);
  };

  const openEditProject = (p: Project) => {
    resetProjectForm();
    setEditingProject(p);
    setFClientName(p.clientName); setFYear(p.year); setFRole(p.role);
    setFServices(p.services.join(", "));
    setFDescription(p.description || ""); setFTagline(p.tagline || "");
    setFHref(p.href); setFCoverImage(p.coverImage);
    setFBgImage(p.bgImage || "");
    setFSwiperImages(p.swiperImages || []); setFCaptions(p.imageCaptions || []);
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fClientName || !fYear || !fRole || !fDescription || !fCoverImage || !fTagline || !fHref) {
      setProjectError("Please fill in all required fields (*).");
      return;
    }
    setIsSubmitting(true); setProjectError("");

    const payload = {
      clientName: fClientName, year: fYear, role: fRole,
      services: fServices.split(",").map((s) => s.trim()).filter(Boolean),
      description: fDescription, tagline: fTagline, href: fHref,
      coverImage: fCoverImage, coverSrcSet: `${fCoverImage} 1024w`,
      bgImage: fBgImage || fCoverImage, bgSrcSet: `${fBgImage || fCoverImage} 2048w`,
      swiperImages: fSwiperImages.length ? fSwiperImages : [fCoverImage],
      imageCaptions: fCaptions.length ? fCaptions : ["Project showcase."],
    };

    try {
      if (editingProject) {
        const r = await updateProject(editingProject.id, payload);
        if (r.success) {
          setProjectSuccess(true);
          setProjectsList((p) => p.map((x) => x.id === editingProject.id ? { ...x, ...payload } : x));
          setTimeout(() => { setIsProjectModalOpen(false); resetProjectForm(); }, 1400);
        } else { setProjectError(r.error || "Update failed."); }
      } else {
        const id = fClientName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (projectsList.length + 1).toString().padStart(2, "0");
        const full = { id, number: num, ...payload };
        const r = await addProject(full);
        if (r.success) {
          setProjectSuccess(true);
          setProjectsList((p) => [...p, full]);
          setTimeout(() => { setIsProjectModalOpen(false); resetProjectForm(); }, 1400);
        } else { setProjectError(r.error || "Upload failed."); }
      }
    } catch { setProjectError("Unexpected error. Please retry."); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    try {
      const r = await deleteProject(projectToDelete.id);
      if (r.success) { setProjectsList((p) => p.filter((x) => x.id !== projectToDelete.id)); setProjectToDelete(null); }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setIsDeletingProject(false); }
  };

  // ── Service CRUD ──────────────────────────────────────────────────────────
  const resetServiceForm = () => {
    setSTitle(""); setSCount(""); setSDescription(""); setSImage1(""); setSImage2("");
    setServiceError(""); setServiceSuccess(false); setEditingService(null);
  };

  const openEditService = (s: Service) => {
    resetServiceForm();
    setEditingService(s);
    setSTitle(s.title); setSCount(s.count); setSDescription(s.description);
    setSImage1(s.image1); setSImage2(s.image2);
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle || !sDescription) { setServiceError("Title and description are required."); return; }
    setIsServiceSubmitting(true); setServiceError("");

    try {
      if (editingService) {
        const r = await updateService(editingService.id, {
          title: sTitle, count: sCount || "(0)", description: sDescription, image1: sImage1, image2: sImage2,
        });
        if (r.success) {
          setServiceSuccess(true);
          setServicesList((p) => p.map((x) => x.id === editingService.id
            ? { ...x, title: sTitle, count: sCount, description: sDescription, image1: sImage1, image2: sImage2 }
            : x
          ));
          setTimeout(() => { setIsServiceModalOpen(false); resetServiceForm(); }, 1400);
        } else { setServiceError(r.error || "Update failed."); }
      } else {
        const id = sTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);
        const num = (servicesList.length + 1).toString().padStart(2, "0");
        const r = await addService({ id, num, title: sTitle, count: sCount || "(0)", description: sDescription, image1: sImage1, image2: sImage2 });
        if (r.success) {
          setServiceSuccess(true);
          setServicesList((p) => [...p, { id, num, title: sTitle, count: sCount || "(0)", description: sDescription, image1: sImage1, image2: sImage2 }]);
          setTimeout(() => { setIsServiceModalOpen(false); resetServiceForm(); }, 1400);
        } else { setServiceError(r.error || "Add failed."); }
      }
    } catch { setServiceError("Unexpected error."); }
    finally { setIsServiceSubmitting(false); }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeletingService(true);
    try {
      const r = await deleteService(serviceToDelete.id);
      if (r.success) { setServicesList((p) => p.filter((x) => x.id !== serviceToDelete.id)); setServiceToDelete(null); }
      else alert(r.error || "Delete failed.");
    } catch { alert("Unexpected error."); }
    finally { setIsDeletingService(false); }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputCls = "w-full bg-black/40 border border-white/6 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#6B21D9]/60 focus:ring-1 focus:ring-[#6B21D9]/20 transition-colors";
  const labelCls = "block text-[10px] uppercase font-bold tracking-widest text-white/35 mb-1.5";
  const tabBtn = (active: boolean) =>
    `flex items-center gap-1.5 px-3 sm:px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
      active ? "bg-[#6B21D9] text-white" : "text-white/50 hover:text-white"
    }`;

  return (
    <>
      {/* ── Shimmer keyframe ── */}
      <style>{`
        @keyframes shimmer { to { transform: translateX(200%); } }
      `}</style>

      <div className="min-h-screen bg-[#0A0A0A] text-white antialiased pb-20" style={{ cursor: "auto" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

          {/* ── Header ── */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-5 mb-7">
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand */}
              <div className="w-9 h-9 rounded-xl bg-[#6B21D9]/15 border border-[#6B21D9]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[#6B21D9] font-black text-sm font-mono">HC</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold text-white leading-none truncate font-kyiv">
                  hassancreates
                  <span className="text-white/30 font-light text-sm ml-2">/ admin</span>
                </h1>
              </div>

              {/* Sign out — compact on mobile */}
              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-red-400 border border-white/5 hover:border-red-900/25 hover:bg-red-950/10 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>

            {/* Tab bar — scrollable on mobile */}
            <nav className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <button onClick={() => setActiveTab("visitors")} className={tabBtn(activeTab === "visitors")}>
                <HugeiconsIcon icon={GlobeIcon} size={13} strokeWidth={2} />
                <span>Visitors</span>
              </button>
              <button onClick={() => setActiveTab("works")} className={tabBtn(activeTab === "works")}>
                <HugeiconsIcon icon={Briefcase02Icon} size={13} strokeWidth={2} />
                <span>Works</span>
              </button>
              <button onClick={() => setActiveTab("services")} className={tabBtn(activeTab === "services")}>
                <HugeiconsIcon icon={Settings02Icon} size={13} strokeWidth={2} />
                <span>Services</span>
              </button>
              <button onClick={() => setActiveTab("messages")} className={`${tabBtn(activeTab === "messages")} relative`}>
                <HugeiconsIcon icon={Message01Icon} size={13} strokeWidth={2} />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="ml-1 bg-[#6B21D9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </header>

          {/* ── TAB: Visitors ── */}
          {activeTab === "visitors" && (
            <div className="flex flex-col gap-6">
              {isLoading ? (
                <VisitorsSkeleton />
              ) : (
                <>
                  <div className="bg-[#161616] border border-white/6 rounded-2xl p-6 sm:p-8 w-fit min-w-[220px]">
                    <p className="text-[11px] uppercase font-bold tracking-widest text-white/30 mb-2">Total Visitors</p>
                    <p className="text-5xl sm:text-6xl font-black font-mono text-white leading-none">
                      {totalUniqueVisitors}
                    </p>
                    <p className="text-xs text-white/30 mt-1.5">unique records logged</p>
                  </div>

                  <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden">
                    {initialVisitors.length === 0 ? (
                      <EmptyState
                        icon={<HugeiconsIcon icon={GlobeIcon} size={24} strokeWidth={1.5} />}
                        title="No visitors yet"
                        description="Visitor data will appear here once people visit your portfolio homepage."
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px] text-left">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="py-3 px-4 sm:px-6 text-[10px] font-bold uppercase tracking-widest text-white/25">Country</th>
                              <th className="py-3 px-4 sm:px-6 text-[10px] font-bold uppercase tracking-widest text-white/25">City</th>
                              <th className="py-3 px-4 sm:px-6 text-[10px] font-bold uppercase tracking-widest text-white/25">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/4">
                            {initialVisitors.map((v) => (
                              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 px-4 sm:px-6 text-[13px] text-white font-medium">{v.country || "—"}</td>
                                <td className="py-3.5 px-4 sm:px-6 text-[13px] text-white/50">{v.city || "—"}</td>
                                <td className="py-3.5 px-4 sm:px-6 text-[12px] text-white/35 font-mono">{formatVisitorDate(v.visited_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB: Works ── */}
          {activeTab === "works" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Portfolio Works</h2>
                  <p className="text-xs text-white/30 mt-0.5">Manage live case studies.</p>
                </div>
                <button
                  onClick={() => { resetProjectForm(); setIsProjectModalOpen(true); }}
                  className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
                >
                  <span>+ Upload Project</span>
                </button>
              </div>

              {isLoading ? (
                <WorksSkeleton />
              ) : projectsList.length === 0 ? (
                <div className="bg-[#161616] border border-white/6 rounded-2xl">
                  <EmptyState
                    icon={<HugeiconsIcon icon={Briefcase02Icon} size={24} strokeWidth={1.5} />}
                    title="No projects yet"
                    description="Upload your first project using the button above."
                    action={
                      <button
                        onClick={() => { resetProjectForm(); setIsProjectModalOpen(true); }}
                        className="text-xs font-bold text-[#6B21D9] hover:text-[#7c3aed] transition-colors"
                      >
                        + Upload first project
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {projectsList.map((p) => (
                    <div key={p.id} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group">
                      {/* Cover */}
                      <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden border-b border-white/5">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.clientName} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10">
                            <HugeiconsIcon icon={Briefcase02Icon} size={32} strokeWidth={1.5} />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-black/80 text-white font-mono text-[10px] font-bold h-5 px-2 rounded-full flex items-center border border-white/5">
                          {p.number}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-grow flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate">{p.clientName}</span>
                          <span className="text-[10px] font-mono text-white/30 flex-shrink-0">{p.year}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#6B21D9] uppercase tracking-wider">{p.role}</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {p.services.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[9px] font-mono text-white/30 bg-white/4 border border-white/5 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                        <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed mt-auto pt-2 border-t border-white/4">{p.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex gap-2">
                        <button
                          onClick={() => openEditProject(p)}
                          className="flex-grow py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-[11px] font-semibold text-white/80 hover:text-white rounded-xl transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setProjectToDelete(p)}
                          className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
                        </button>
                        <a
                          href={p.href} target="_blank" rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/8 border border-white/5 text-white/40 hover:text-white rounded-xl transition-colors"
                        >
                          <HugeiconsIcon icon={Link01Icon} size={13} strokeWidth={2} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Services ── */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Services</h2>
                  <p className="text-xs text-white/30 mt-0.5">Manage offerings shown on your site.</p>
                </div>
                <button
                  onClick={() => { resetServiceForm(); setIsServiceModalOpen(true); }}
                  className="flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6B21D9]/20"
                >
                  <span>+ Add Service</span>
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden">
                      <Skeleton className="h-24 rounded-none w-full" />
                      <div className="p-4 flex flex-col gap-2.5">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : servicesList.length === 0 ? (
                <div className="bg-[#161616] border border-white/6 rounded-2xl">
                  <EmptyState
                    icon={<HugeiconsIcon icon={Settings02Icon} size={24} strokeWidth={1.5} />}
                    title="No services yet"
                    description="Add your first service offering using the button above."
                    action={
                      <button
                        onClick={() => { resetServiceForm(); setIsServiceModalOpen(true); }}
                        className="text-xs font-bold text-[#6B21D9] hover:text-[#7c3aed] transition-colors"
                      >
                        + Add first service
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {servicesList.map((s) => (
                    <div key={s.id} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group">
                      {/* Dual image */}
                      <div className="h-20 bg-zinc-900 border-b border-white/5 flex overflow-hidden relative">
                        {s.image1 && <div className="w-1/2 overflow-hidden border-r border-white/5"><img src={s.image1} alt="" className="w-full h-full object-cover opacity-70" /></div>}
                        {s.image2 && <div className="w-1/2 overflow-hidden"><img src={s.image2} alt="" className="w-full h-full object-cover opacity-70" /></div>}
                        {!s.image1 && !s.image2 && <div className="w-full h-full flex items-center justify-center text-white/8"><HugeiconsIcon icon={Settings02Icon} size={28} strokeWidth={1.5} /></div>}
                        <span className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[9px] font-bold h-5 px-2 rounded-full flex items-center border border-white/5">{s.num}</span>
                        <span className="absolute top-2 right-2 bg-black/70 text-white/40 text-[9px] font-mono h-5 px-2 rounded-full flex items-center border border-white/5">{s.count}</span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-white">{s.title}</span>
                        <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">{s.description}</p>
                      </div>
                      <div className="px-4 pb-4 flex gap-2">
                        <button onClick={() => openEditService(s)} className="flex-grow py-2 bg-white/5 hover:bg-white/8 border border-white/5 text-[11px] font-semibold text-white/80 hover:text-white rounded-xl transition-colors">Edit</button>
                        <button onClick={() => setServiceToDelete(s)} className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/10 hover:border-red-900/25 text-red-500 hover:text-red-400 rounded-xl transition-colors">
                          <HugeiconsIcon icon={Delete01Icon} size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Messages ── */}
          {activeTab === "messages" && (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">
              {/* List */}
              <div className="lg:col-span-5 bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">Client Inbox</h3>
                  <p className="text-[11px] text-white/30 mt-0.5">Inquiries from portfolio visitors.</p>
                </div>
                <div className="flex-grow overflow-y-auto p-3 space-y-2 max-h-[60vh] lg:max-h-[560px]">
                  {messages.length === 0 ? (
                    <EmptyState
                      icon={<HugeiconsIcon icon={Message01Icon} size={20} strokeWidth={1.5} />}
                      title="Inbox empty"
                      description="No messages yet."
                    />
                  ) : (
                    messages.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleMessageClick(m)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors relative ${
                          selectedMessage?.id === m.id
                            ? "bg-[#6B21D9]/10 border-[#6B21D9]/40"
                            : "bg-black/20 border-white/4 hover:border-white/8 hover:bg-white/[0.02]"
                        }`}
                      >
                        {!m.read && <span className="absolute top-4 right-3.5 h-1.5 w-1.5 rounded-full bg-[#6B21D9]" />}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-7 w-7 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-[11px] font-bold text-white/60 flex-shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-white leading-none truncate">{m.name}</p>
                            <p className="text-[9px] text-white/30 font-mono mt-0.5">{new Date(m.receivedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-[11px] font-semibold text-white/80 truncate mb-0.5">{m.subject}</p>
                        <p className="text-[10px] text-white/35 line-clamp-1">{m.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Viewer */}
              <div className="lg:col-span-7 bg-[#161616] border border-white/6 rounded-2xl overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
                {selectedMessage ? (
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 p-5 border-b border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-[#6B21D9]/10 border border-[#6B21D9]/25 flex items-center justify-center text-sm font-bold text-[#6B21D9] flex-shrink-0">
                          {selectedMessage.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{selectedMessage.name}</p>
                          <p className="text-[11px] text-white/40 font-mono flex items-center gap-1 truncate">
                            <HugeiconsIcon icon={Mail01Icon} size={11} strokeWidth={2} className="flex-shrink-0" />
                            {selectedMessage.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setMessages((p) => p.map((m) => m.id === selectedMessage.id ? { ...m, read: !m.read } : m))}
                          className="p-2 rounded-lg hover:bg-white/5 text-white/35 hover:text-white transition-colors"
                          title="Toggle read"
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={15} strokeWidth={2} className={selectedMessage.read ? "text-[#6B21D9]" : ""} />
                        </button>
                        <button onClick={() => deleteMessage(selectedMessage.id)} className="p-2 rounded-lg hover:bg-red-950/25 text-white/35 hover:text-red-400 transition-colors">
                          <HugeiconsIcon icon={Delete01Icon} size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    {/* Subject */}
                    <div className="px-5 py-3 bg-black/20 border-b border-white/4">
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Subject</p>
                      <p className="text-[13px] font-semibold text-white">{selectedMessage.subject}</p>
                      <p className="text-[10px] text-white/25 font-mono mt-1">{new Date(selectedMessage.receivedAt).toLocaleString()}</p>
                    </div>
                    {/* Body */}
                    <div className="flex-grow overflow-y-auto p-5">
                      <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    {/* Actions */}
                    <div className="p-5 border-t border-white/5">
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="inline-flex items-center gap-2 bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={13} strokeWidth={2} />
                        Reply via email
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center p-8">
                    <EmptyState
                      icon={<HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.5} />}
                      title="No message selected"
                      description="Pick a message from the list to read it here."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Project Form Modal ── */}
      <Modal
        open={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); resetProjectForm(); }}
        title={editingProject ? `Edit: ${editingProject.clientName}` : "Upload New Project"}
      >
        <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Client Name *</label><input className={inputCls} value={fClientName} onChange={(e) => setFClientName(e.target.value)} placeholder="e.g. Archin" required /></div>
            <div><label className={labelCls}>Year *</label><input className={inputCls} value={fYear} onChange={(e) => setFYear(e.target.value)} placeholder="2026" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Role *</label><input className={inputCls} value={fRole} onChange={(e) => setFRole(e.target.value)} placeholder="Lead Designer" required /></div>
            <div><label className={labelCls}>URL / Href *</label><input className={inputCls} value={fHref} onChange={(e) => setFHref(e.target.value)} placeholder="./works/archin" required /></div>
          </div>
          <div><label className={labelCls}>Services (comma-separated)</label><input className={inputCls} value={fServices} onChange={(e) => setFServices(e.target.value)} placeholder="Branding, UI/UX, Development" /></div>
          <div><label className={labelCls}>Description *</label><textarea className={`${inputCls} h-20 resize-none`} value={fDescription} onChange={(e) => setFDescription(e.target.value)} placeholder="Brief project summary..." required /></div>
          <div><label className={labelCls}>Tagline *</label><textarea className={`${inputCls} h-20 resize-none`} value={fTagline} onChange={(e) => setFTagline(e.target.value)} placeholder="Extended detail for project view..." required /></div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone label="Cover Image *" value={fCoverImage} onChange={setFCoverImage} required />
            <ImageUploadZone label="Background Image" value={fBgImage} onChange={setFBgImage} />
          </div>

          {/* Slideshow */}
          {fSwiperImages.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-3">Slideshow Images</p>
              <div className="grid grid-cols-2 gap-3">
                {fSwiperImages.map((url, i) => (
                  <div key={i} className="flex gap-2 bg-black/20 border border-white/5 rounded-xl p-2.5 items-start">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <input
                        type="text"
                        value={fCaptions[i] || ""}
                        onChange={(e) => setFCaptions((p) => p.map((c, idx) => idx === i ? e.target.value : c))}
                        placeholder="Caption…"
                        className="w-full bg-transparent border-b border-white/10 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#6B21D9] transition-colors"
                      />
                    </div>
                    <button type="button" onClick={() => { setFSwiperImages((p) => p.filter((_, idx) => idx !== i)); setFCaptions((p) => p.filter((_, idx) => idx !== i)); }} className="text-red-500 hover:text-red-400 flex-shrink-0 p-1">
                      <HugeiconsIcon icon={Delete01Icon} size={11} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ImageUploadZone label="Add Slideshow Image" value="" onChange={(url) => { if (url) { setFSwiperImages((p) => [...p, url]); setFCaptions((p) => [...p, ""]); } }} />

          {projectError && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{projectError}</p>}
          {projectSuccess && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editingProject ? "Project updated!" : "Project uploaded!"}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={() => { setIsProjectModalOpen(false); resetProjectForm(); }} className="px-4 py-2 text-xs font-semibold text-white/50 hover:text-white transition-colors" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingProject ? "Save Changes" : "Save Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Service Form Modal ── */}
      <Modal
        open={isServiceModalOpen}
        onClose={() => { setIsServiceModalOpen(false); resetServiceForm(); }}
        title={editingService ? `Edit: ${editingService.title}` : "Add New Service"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleServiceSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className={labelCls}>Service Title *</label><input className={inputCls} value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="UI/UX Design" required /></div>
            <div><label className={labelCls}>Count</label><input className={inputCls} value={sCount} onChange={(e) => setSCount(e.target.value)} placeholder="(4)" /></div>
          </div>
          <div><label className={labelCls}>Description *</label><textarea className={`${inputCls} h-24 resize-none`} value={sDescription} onChange={(e) => setSDescription(e.target.value)} placeholder="What does this service cover?" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone label="Preview Image 1" value={sImage1} onChange={setSImage1} />
            <ImageUploadZone label="Preview Image 2" value={sImage2} onChange={setSImage2} />
          </div>

          {serviceError && <p className="text-red-400 text-xs px-3 py-2 bg-red-950/20 border border-red-900/20 rounded-lg">{serviceError}</p>}
          {serviceSuccess && <p className="text-emerald-400 text-xs px-3 py-2 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">✓ {editingService ? "Service updated!" : "Service added!"}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={() => { setIsServiceModalOpen(false); resetServiceForm(); }} className="px-4 py-2 text-xs font-semibold text-white/50 hover:text-white transition-colors" disabled={isServiceSubmitting}>Cancel</button>
            <button type="submit" className="bg-[#6B21D9] hover:bg-[#7c3aed] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50" disabled={isServiceSubmitting}>
              {isServiceSubmitting ? "Saving…" : editingService ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm delete dialogs ── */}
      <ConfirmDelete
        open={!!projectToDelete}
        name={projectToDelete?.clientName ?? ""}
        onCancel={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        busy={isDeletingProject}
      />
      <ConfirmDelete
        open={!!serviceToDelete}
        name={serviceToDelete?.title ?? ""}
        onCancel={() => setServiceToDelete(null)}
        onConfirm={handleDeleteService}
        busy={isDeletingService}
      />
    </>
  );
}
