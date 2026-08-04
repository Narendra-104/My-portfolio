import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Search, Plus, Edit3, Trash2, X, ExternalLink, 
  ShieldCheck, Calendar, RefreshCw, Check, Sparkles, Upload
} from 'lucide-react';
import { CERTIFICATES_DATA } from "../../data";
import { Certificate } from '../../types';
import { 
  fetchCertificates, 
  upsertCertificate, 
  deleteCertificate, 
  uploadImageToSupabase, 
  upsertPortfolioSetting 
} from '../../lib/db';

interface CertificatesProps {
  isOwner?: boolean;
}

export default function Certificates({ isOwner = false }: CertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(CERTIFICATES_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Client-side Editor Mode
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    return localStorage.getItem('portfolio_editor_mode') === 'true';
  });
  const canEdit = isOwner;

  // Admin Editing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formIssuer, setFormIssuer] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCertId, setFormCertId] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formVerifyUrl, setFormVerifyUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      // 1. Try uploading to Supabase Storage first
      const publicUrl = await uploadImageToSupabase(file, 'portfolio-photos');
      if (publicUrl) {
        setFormImage(publicUrl);
        setIsUploadingImage(false);
        return;
      }

      // 2. Fallback to canvas compression base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setFormImage(compressedBase64);
            setIsUploadingImage(false);
          } else {
            const rawReader = new FileReader();
            rawReader.onload = (re) => {
              setFormImage(re.target?.result as string);
              setIsUploadingImage(false);
            };
            rawReader.readAsDataURL(file);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setIsUploadingImage(false);
      setUploadError(err.message || 'Failed to process image.');
    }
  };

  // Sync state with Supabase Database, LocalStorage fallback, or default data
  useEffect(() => {
    async function loadCertificates() {
      try {
        // 1. Fetch live certificates from Supabase DB
        const dbCerts = await fetchCertificates();
        if (dbCerts && dbCerts.length > 0) {
          setCertificates(dbCerts);
          localStorage.setItem('portfolio_custom_certificates', JSON.stringify(dbCerts));
          setIsLoading(false);
          return;
        }

        // 2. Fallback to LocalStorage
        const saved = localStorage.getItem('portfolio_custom_certificates');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCertificates(parsed);
            setIsLoading(false);
            return;
          }
        }
        setCertificates(CERTIFICATES_DATA);
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificates();

    const interval = setInterval(loadCertificates, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredCertificates = certificates.filter(cert => {
    return cert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cert.certId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openAddModal = () => {
    setEditingCert(null);
    setFormTitle('');
    setFormIssuer('');
    setFormDate('');
    setFormCertId('');
    setFormImage('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800');
    setFormVerifyUrl('');
    setIsEditModalOpen(true);
  };

  const openEditModal = (cert: Certificate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCert(cert);
    setFormTitle(cert.title);
    setFormIssuer(cert.issuer);
    setFormDate(cert.date);
    setFormCertId(cert.certId);
    setFormImage(cert.image);
    setFormVerifyUrl(cert.verifyUrl);
    setIsEditModalOpen(true);
  };

  const handleDeleteCert = async (certId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this certificate?')) {
      try {
        // Delete from Supabase DB
        await deleteCertificate(certId);

        const updated = certificates.filter(c => c.id !== certId);
        await upsertPortfolioSetting('portfolio_custom_certificates', updated);

        setCertificates(updated);
        localStorage.setItem('portfolio_custom_certificates', JSON.stringify(updated));
      } catch (err: any) {
        alert('Failed to delete certificate: ' + err.message);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Certificate = {
      id: editingCert ? editingCert.id : 'cert_' + Date.now(),
      title: formTitle,
      issuer: formIssuer,
      date: formDate,
      certId: formCertId,
      image: formImage,
      verifyUrl: formVerifyUrl
    };

    try {
      // 1. Save to Supabase DB table 'certificates'
      await upsertCertificate(payload);

      let updated: Certificate[];
      if (editingCert) {
        updated = certificates.map(c => c.id === editingCert.id ? payload : c);
      } else {
        updated = [...certificates, payload];
      }

      // 2. Also save to portfolio_settings
      await upsertPortfolioSetting('portfolio_custom_certificates', updated);

      // 3. Update local state and localStorage
      setCertificates(updated);
      localStorage.setItem('portfolio_custom_certificates', JSON.stringify(updated));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert('Failed to save certificate: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section 
      id="certificates" 
      className="py-24 bg-surface-container-low border-y border-outline-variant/10 scroll-mt-12 text-left"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-12 gap-12 mb-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="md:col-span-4 flex flex-col items-start"
          >
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">
              Verified Accreditations
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-4" />
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-6">
              Official virtual internship credentials, professional programmatic accreditations, and academic honors vetted through real verification pipelines.
            </p>

            {/* Editor mode toggles and actions */}
            {isOwner && (
              <div className="flex flex-col gap-3 w-full sm:max-w-xs mb-4 text-left">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !isEditMode;
                    setIsEditMode(newVal);
                    localStorage.setItem('portfolio_editor_mode', String(newVal));
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-xs font-bold cursor-pointer w-full ${
                    isEditMode 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className={isEditMode ? 'animate-pulse text-emerald-500' : ''} />
                    {isEditMode ? 'Editor Mode: Active' : 'Enable Editor Mode'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-emerald-500 animate-ping' : 'bg-on-surface-variant/30'}`} />
                </button>

                {canEdit && (
                  <div className="flex flex-wrap gap-2 w-full">
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-[11px] font-bold rounded-lg shadow-md shadow-primary/10 hover:bg-primary-hover transition-all cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Certificate</span>
                    </button>
                     <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset all certificates to defaults?')) {
                          localStorage.removeItem('portfolio_custom_certificates');
                          setCertificates(CERTIFICATES_DATA);
                          setSearchQuery('');
                        }
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-surface-container text-on-surface-variant border border-outline-variant/15 hover:bg-surface-container-high rounded-lg transition-all cursor-pointer"
                      title="Reset to default certificates"
                    >
                      <span className="text-[10px] font-mono font-semibold">Reset Defaults</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Search tool */}
          <div className="md:col-span-8 flex flex-col justify-end gap-4">
            <div className="relative flex-grow max-w-md self-end w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
              <input
                type="text"
                placeholder="Search credential issuer, certification names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-surface-container-lowest text-on-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCertificates.map((cert, idx) => (
              <motion.div
                layout
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative bg-surface-container-lowest border border-outline-variant/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-primary/25 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Visual Thumb representation */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5 dark:bg-white/5 border-b border-outline-variant/10">
                  <img 
                    src={cert.image} 
                    alt={cert.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                    <span className="text-[10px] font-mono text-white/90 font-medium flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-emerald-400" /> Click to view verification credentials
                    </span>
                  </div>

                  {canEdit && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      <button
                        onClick={(e) => openEditModal(cert, e)}
                        className="p-1.5 bg-black/70 backdrop-blur-md text-white/95 border border-white/10 hover:bg-primary hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Edit Certification"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCert(cert.id, e)}
                        className="p-1.5 bg-black/70 backdrop-blur-md text-rose-400 border border-white/10 hover:bg-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Delete Certification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Award size={14} className="text-primary" />
                      <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                        {cert.issuer}
                      </span>
                    </div>

                    <h3 className="font-headline text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors mb-1.5">
                      {cert.title}
                    </h3>
                  </div>

                  <div className="border-t border-outline-variant/5 pt-3 mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-on-surface-variant/70 flex items-center gap-1">
                      <Calendar size={11} /> {cert.date}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-500 flex items-center gap-0.5">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Certificate Credentials Highlight Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedCert(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-lowest border border-outline/25 rounded-2xl shadow-2xl overflow-hidden z-10 text-left flex flex-col"
            >
              {/* Header Visual Image */}
              <div className="relative aspect-video w-full bg-black/5 dark:bg-white/5 border-b border-outline-variant/10 overflow-hidden shrink-0">
                <img 
                  src={selectedCert.image} 
                  alt={selectedCert.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/80 rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Certificate data readout */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/15 w-fit">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Secured Verification Node
                  </span>
                </div>

                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface leading-tight">
                    {selectedCert.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    Issued by <strong className="text-primary">{selectedCert.issuer}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <div>
                    <span className="block text-[9px] font-mono text-on-surface-variant/60 font-semibold uppercase">
                      Credential ID
                    </span>
                    <span className="text-xs font-bold text-on-surface font-mono mt-0.5 block break-all">
                      {selectedCert.certId}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-on-surface-variant/60 font-semibold uppercase">
                      Issue Date
                    </span>
                    <span className="text-xs font-bold text-on-surface font-mono mt-0.5 block">
                      {selectedCert.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  Secure cryptographic credential
                </span>
                
                <a 
                  href={selectedCert.verifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <ExternalLink size={12} />
                  <span>Verify Credential</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Add/Edit Certificate Dialog Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsEditModalOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl overflow-hidden z-10 text-left flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4.5 bg-surface-container border-b border-outline-variant/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="font-headline font-bold text-on-surface">
                    {editingCert ? 'Modify Certificate Credential' : 'Register New Certificate'}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="e.g. AWS Cloud & AI/ML Virtual Internship"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">
                      Issuer / Provider
                    </label>
                    <input
                      type="text"
                      required
                      value={formIssuer}
                      onChange={(e) => setFormIssuer(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="e.g. EduSkills Foundation"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="e.g. June 2025"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      required
                      value={formCertId}
                      onChange={(e) => setFormCertId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="e.g. ES-AWS-AIML-2025-9831"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase">
                        Certificate Image URL
                      </label>
                      <span className="text-[9px] text-primary/80 font-mono">Or Upload File</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="text"
                        required
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="flex-grow px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary placeholder-on-surface-variant/40"
                        placeholder="https://... or upload"
                      />
                      <label className="flex items-center justify-center p-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-xl cursor-pointer transition-all shrink-0 hover:border-primary" title="Upload certificate from your folder">
                        <Upload size={14} className="text-primary" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploadingImage && (
                      <p className="text-[9px] text-amber-500 font-medium mt-1 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Processing and optimizing image...
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-[9px] text-red-500 font-medium mt-1">
                        ✗ {uploadError}
                      </p>
                    )}
                    {formImage && formImage.startsWith('http') && (
                      <p className="text-[9px] text-emerald-500 font-medium mt-1">
                        ✓ Image uploaded & active
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">
                    Verification URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formVerifyUrl}
                    onChange={(e) => setFormVerifyUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="https://vois.eduskillsfoundation.org/verify/..."
                  />
                </div>

                <div className="border-t border-outline-variant/10 pt-4 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-surface text-on-surface border border-outline-variant/25 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    className={`px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-1.5 ${(isSaving || isUploadingImage) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>{editingCert ? 'Save Changes' : 'Register Certification'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
