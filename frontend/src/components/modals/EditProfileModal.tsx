import React, { useState, useRef } from 'react';
import { X, Upload, User, Briefcase, FileText, Check, RotateCcw, AlertCircle, Image, KeyRound, Loader2 } from 'lucide-react';
import { uploadImageToSupabase, upsertPortfolioSetting } from '../../lib/db';

interface ProfileData {
  name: string;
  role: string;
  tagline: string;
  statusTag: string;
  avatarImage: string;
  fallbackImage: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (updated: ProfileData) => void;
  onReset: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onReset
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [tagline, setTagline] = useState(profile.tagline);
  const [statusTag, setStatusTag] = useState(profile.statusTag);
  const [avatarImage, setAvatarImage] = useState(profile.avatarImage);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [customPasscode, setCustomPasscode] = useState(() => {
    return localStorage.getItem('owner_custom_passcode') || 'narendra2026';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process selected file & upload to Supabase Storage
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported (JPEG, PNG, WEBP, etc.)');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // 1. Try uploading to Supabase Storage bucket for permanent CDN URL
      const cdnUrl = await uploadImageToSupabase(file, 'portfolio-photos');
      if (cdnUrl) {
        setAvatarImage(cdnUrl);
        setIsUploadingPhoto(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, converting to local preview:', err);
    }

    // 2. Fallback to FileReader base64 preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarImage(event.target?.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    if (!role.trim()) {
      alert('Role cannot be empty.');
      return;
    }

    localStorage.setItem('owner_custom_passcode', customPasscode.trim() || 'narendra2026');

    const updatedProfile = {
      name: name.trim(),
      role: role.trim(),
      tagline: tagline.trim(),
      statusTag: statusTag.trim(),
      avatarImage: avatarImage,
      fallbackImage: profile.fallbackImage
    };

    // Save to Supabase DB for multi-device sync
    await upsertPortfolioSetting('portfolio_custom_profile', updatedProfile);

    onSave(updatedProfile);

    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 1000);
  };

  const handleResetClick = () => {
    onReset();
    const defaults = {
      name: 'Narendra Gond',
      role: 'Human-Centric Tech Specialist & Systems Architect',
      tagline: 'Engineering Student, JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune, Maharashtra, India.',
      statusTag: 'Available for Internship 2026',
      avatarImage: '/src/assets/images/narendra_official_portrait_1781795673338.jpg'
    };
    setName(defaults.name);
    setRole(defaults.role);
    setTagline(defaults.tagline);
    setStatusTag(defaults.statusTag);
    setAvatarImage(defaults.avatarImage);
    setCustomPasscode('narendra2026');
    localStorage.removeItem('owner_custom_passcode');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div 
        className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] z-10 transition-all transform scale-100"
        id="profile-edit-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
          title="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
            <User className="text-primary" size={24} />
            Edit Professional Profile
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Customize how your personal information and portfolio image appear to employers and visitors.
          </p>
        </div>

        {showSavedFeedback ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4 border border-success/20 animate-bounce">
              <Check size={36} />
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface">Profile Saved Successfully!</h3>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2 flex items-center gap-1.5">
                  <Image size={16} className="text-primary" />
                  Profile Photo
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-square md:aspect-auto md:h-52 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
                  }`}
                  title="Drag and drop an image or click to select"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Preview"
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profile.fallbackImage;
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-semibold text-on-surface">Click to browse</span>
                      <span className="text-[10px] text-on-surface-variant mt-1">or drag & drop your photo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                    <User size={15} className="text-primary" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={15} className="text-primary" />
                    Professional Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                    <Check size={15} className="text-primary" />
                    Availability Status
                  </label>
                  <input
                    type="text"
                    value={statusTag}
                    onChange={(e) => setStatusTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                <FileText size={15} className="text-primary" />
                Headline Tagline
              </label>
              <textarea
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full h-24 px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm resize-none"
              />
            </div>

            <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-2.5">
              <label className="block text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound size={15} className="text-primary" />
                Portfolio Access Passcode
              </label>
              <input
                type="text"
                value={customPasscode}
                onChange={(e) => setCustomPasscode(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant rounded-lg font-mono text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline/10">
              <button
                type="button"
                onClick={handleResetClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline/30 text-on-surface-variant hover:text-primary rounded-lg text-xs font-semibold"
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-lg text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg text-sm shadow-md">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}