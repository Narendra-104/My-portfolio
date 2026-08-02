import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AutoUploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);

  const handleAutoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `uploads/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-photos')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('portfolio-photos')
        .getPublicUrl(filePath);
      setUploadedImageUrl(urlData.publicUrl);
      if (!title) {
        const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(autoTitle);
      }
    } catch (err: any) {
      console.error('Auto upload failed:', err);
      alert(`Auto Upload Error: ${err.message}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImageUrl) return alert('Please select a photo first!');
    if (!title.trim()) return alert('Please enter a project title');
    setIsSavingDb(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            image_url: uploadedImageUrl,
          },
        ]);
      if (error) throw error;
      alert('🎉 Project saved to database!');
      setTitle('');
      setDescription('');
      setUploadedImageUrl(null);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Database Save Error: ${err.message}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-white shadow-xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
        <Upload className="h-5 w-5" /> Auto-Store Photo Project
      </h2>
      <form onSubmit={handleSaveProject} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Select Photo (Uploads Automatically)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAutoPhotoUpload}
            className="hidden"
            id="auto-photo-input"
            disabled={isUploadingPhoto}
          />
          <label
            htmlFor="auto-photo-input"
            className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
              uploadedImageUrl
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-zinc-800 hover:border-indigo-500/50 bg-zinc-950'
            }`}
          >
            {isUploadingPhoto ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400 py-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-medium">Auto‑uploading to Supabase…</span>
              </div>
            ) : uploadedImageUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={uploadedImageUrl} alt="Uploaded preview" className="h-36 w-full object-cover rounded-md" />
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium mt-1">
                  <CheckCircle2 className="h-4 w-4" /> Stored in Supabase Bucket!
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-zinc-500 py-4">
                <ImageIcon className="h-8 w-8 mb-1 text-zinc-400" />
                <span className="text-xs font-medium">Click to select photo</span>
                <span className="text-[10px] text-zinc-600">Image stores automatically upon selection</span>
              </div>
            )}
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Project Title"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description…"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={!uploadedImageUrl || isSavingDb || isUploadingPhoto}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-semibold py-2.5 rounded-lg transition"
        >
          {isSavingDb ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Record…
            </>
          ) : (
            'Save Project Record'
          )}
        </button>
      </form>
    </div>
  );
}
