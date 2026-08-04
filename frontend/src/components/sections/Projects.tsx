import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, ExternalLink, Plus, Edit3, Trash2, X, 
  Sparkles, Filter, Search, Check, ArrowRight, AlertTriangle,
  Upload, Lock
} from 'lucide-react';
import { PROJECTS_DATA } from "../../data";
import AutoUploadForm from '../AutoUploadForm';
import { Project } from '../../types';
import { 
  fetchProjects, 
  upsertProject, 
  deleteProject, 
  uploadImageToSupabase, 
  upsertPortfolioSetting 
} from '../../lib/db';
interface ProjectsProps {
  isOwner?: boolean;
}

export default function Projects({ isOwner = false }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [ownerOnlyModalOpen, setOwnerOnlyModalOpen] = useState(false);

  // Client-side Editor Mode
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    return localStorage.getItem('portfolio_editor_mode') === 'true';
  });
  const canEdit = isOwner;

  const handleVisitLiveWeb = (link: string | undefined, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const isOwnerLogged = localStorage.getItem('is_owner') === 'true' || isOwner;
    if (isOwnerLogged) {
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        alert('No live demonstration URL configured for this project.');
      }
    } else {
      setOwnerOnlyModalOpen(true);
    }
  };

  // Admin Editing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLongDesc, setFormLongDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formMetric1Label, setFormMetric1Label] = useState('');
  const [formMetric1Value, setFormMetric1Value] = useState('');
  const [formMetric2Label, setFormMetric2Label] = useState('');
  const [formMetric2Value, setFormMetric2Value] = useState('');

  // Sync state with Supabase Database, LocalStorage fallback, or default data
  useEffect(() => {
    async function loadProjects() {
      try {
        // 1. Primary: Fetch live projects from Supabase DB
        const dbProjects = await fetchProjects();
        if (dbProjects && dbProjects.length > 0) {
          setProjects(dbProjects);
          localStorage.setItem('portfolio_custom_projects', JSON.stringify(dbProjects));
          setIsLoading(false);
          return;
        }

        // 2. Secondary: Load from LocalStorage if DB empty/offline
        const saved = localStorage.getItem('portfolio_custom_projects');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setIsLoading(false);
            return;
          }
        }

        // 3. Fallback: Default data
        setProjects(PROJECTS_DATA);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();

    // Auto-refresh every 3 seconds to pull live updates on other devices
    const interval = setInterval(loadProjects, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    'All', 
    ...Array.from(
      new Set(
        projects
          .filter(p => p && typeof p.category === 'string')
          .map(p => p.category.split(' & ')[0] || p.category)
      )
    )
  ];

  const filteredProjects = projects.filter(project => {
    if (!project) return false;
    const category = project.category || '';
    const title = project.title || '';
    const description = project.description || '';
    const tags = project.tags || [];

    const matchesCategory = activeCategory === 'All' || 
      category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some((t: string) => t && t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormCategory('');
    setFormDesc('');
    setFormLongDesc('');
    setFormImage('');
    setFormTags('');
    setFormLink('');
    setFormGithub('');
    setFormMetric1Label('');
    setFormMetric1Value('');
    setFormMetric2Label('');
    setFormMetric2Value('');
    setIsEditModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      // 1. Try uploading to Supabase Storage first for a permanent live CDN URL
      const publicUrl = await uploadImageToSupabase(file, 'portfolio-photos');
      if (publicUrl) {
        setFormImage(publicUrl);
        setIsUploadingImage(false);
        return;
      }

      // 2. Fallback to compressed base64 if storage is unconfigured/offline
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

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormTitle(project.title);
    setFormCategory(project.category);
    setFormDesc(project.description);
    setFormLongDesc(project.longDescription);
    setFormImage(project.image);
    setFormTags(project.tags.join(', '));
    setFormLink(project.link || '');
    setFormGithub(project.github || '');
    setFormMetric1Label(project.metrics?.[0]?.label || '');
    setFormMetric1Value(project.metrics?.[0]?.value || '');
    setFormMetric2Label(project.metrics?.[1]?.label || '');
    setFormMetric2Value(project.metrics?.[1]?.value || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        // Delete from Supabase DB
        await deleteProject(projectId);

        const updated = projects.filter(p => p.id !== projectId);
        await upsertPortfolioSetting('portfolio_custom_projects', updated);

        setProjects(updated);
        localStorage.setItem('portfolio_custom_projects', JSON.stringify(updated));
      } catch (err: any) {
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const metricsArray = [];
    if (formMetric1Label && formMetric1Value) {
      metricsArray.push({ label: formMetric1Label, value: formMetric1Value });
    }
    if (formMetric2Label && formMetric2Value) {
      metricsArray.push({ label: formMetric2Label, value: formMetric2Value });
    }

    const newId = editingProject
      ? editingProject.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'proj_' + Date.now());

    const payload: Project = {
      id: newId,
      title: formTitle,
      category: formCategory,
      description: formDesc,
      longDescription: formLongDesc,
      image: formImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      tags: tagsArray,
      link: formLink || undefined,
      github: formGithub || undefined,
      metrics: metricsArray.length ? metricsArray : undefined
    };

    try {
      // 1. Save to Supabase DB table 'projects'
      await upsertProject(payload);

      let updated: Project[];
      if (editingProject) {
        updated = projects.map(p => p.id === editingProject.id ? payload : p);
      } else {
        updated = [...projects, payload];
      }

      // 2. Also save to portfolio_settings for backup sync
      await upsertPortfolioSetting('portfolio_custom_projects', updated);

      // 3. Update local state and localStorage cache
      setProjects(updated);
      localStorage.setItem('portfolio_custom_projects', JSON.stringify(updated));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section 
      id="projects" 
      className="py-24 bg-surface scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-12 gap-12 mb-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="md:col-span-4 flex flex-col items-start text-left"
          >
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">
              Projects Case Studies
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-4" />
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-6">
              A collection of structural logic, algorithm design implementations, and cloud utilities built during active sprints and internships.
            </p>

            {isOwner && (
              <div className="flex flex-col gap-3 w-full sm:max-w-xs mb-4">
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
                      <span>Add Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset all projects to defaults?')) {
                          localStorage.removeItem('portfolio_custom_projects');
                          setProjects(PROJECTS_DATA);
                          setActiveCategory('All');
                          setSearchQuery('');
                        }
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-surface-container text-on-surface-variant border border-outline-variant/15 hover:bg-surface-container-high rounded-lg transition-all cursor-pointer"
                      title="Reset to default projects"
                    >
                      <span className="text-[10px] font-mono font-semibold">Reset Defaults</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Search and Filters */}
          <div className="md:col-span-8 flex flex-col justify-end gap-6 text-left">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                <input
                  type="text"
                  placeholder="Search technical stacks, titles, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <span className="text-[10px] font-mono text-on-surface-variant/60 flex items-center gap-1.5 self-center">
                <Filter size={10} />
                Showing {filteredProjects.length} of {projects.length} entries
              </span>
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-outline-variant/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Grid */}
        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 text-left"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative flex flex-col bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/5 dark:bg-white/5 border-b border-outline-variant/10">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
                    <span className="text-[10px] font-mono text-white/90 font-semibold tracking-wider uppercase">
                      {project.category}
                    </span>
                  </div>

                  {canEdit && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      <button
                        onClick={(e) => openEditModal(project, e)}
                        className="p-1.5 bg-black/70 backdrop-blur-md text-white/95 border border-white/10 hover:bg-primary hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1.5 bg-black/70 backdrop-blur-md text-rose-400 border border-white/10 hover:bg-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4 font-normal">
                      {project.description}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  {project.metrics && project.metrics.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-outline-variant/10 my-3 bg-surface-container-lowest/50 px-3 rounded-xl border border-outline-variant/5">
                      {project.metrics.slice(0, 3).map((metric: any, mIdx: number) => ( // 👈 Fixed metric & mIdx types
                        <div key={mIdx} className="flex flex-col items-start">
                          <span className="text-[10px] font-mono text-on-surface-variant/55 uppercase font-semibold">
                            {metric.label}
                          </span>
                          <span className="text-xs font-bold text-primary mt-0.5 font-mono">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 mt-auto">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag: string, tIdx: number) => ( // 👈 Fixed tag & tIdx types
                        <span 
                          key={tIdx} 
                          className="px-2 py-0.5 bg-surface-container text-on-surface-variant/80 font-mono text-[9px] font-semibold border border-outline-variant/5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant/60 font-mono text-[9px] rounded-md">
                          +{project.tags.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-outline-variant/5 pt-3 mt-1">
                      <span className="text-[10px] font-mono text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore Study Case <ArrowRight size={12} />
                      </span>
                      <div className="flex items-center gap-2">
                        {project.github && (
                          <a 
                            href={project.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                          >
                            <Github size={14} />
                          </a>
                        )}
                        {project.link && (
                          <button 
                            onClick={(e) => handleVisitLiveWeb(project.link, e)}
                            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/15 transition-colors cursor-pointer"
                          >
                            <ExternalLink size={12} />
                            <span>Visit Live Web</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedProject(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline/25 rounded-2xl shadow-2xl overflow-hidden z-10 text-left flex flex-col max-h-[90vh]"
            >
              <div className="relative aspect-video w-full bg-black/5 dark:bg-white/5 border-b border-outline-variant/10 overflow-hidden shrink-0">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/80 rounded-full border border-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-2.5 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-mono font-bold tracking-widest uppercase rounded-full">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-headline text-xl md:text-2xl font-bold text-white mt-3 leading-tight drop-shadow-md">
                    {selectedProject.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                <div>
                  <h4 className="font-headline text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest mb-2 font-mono">
                    Problem & Conceptual Objective
                  </h4>
                  <p className="text-xs text-on-surface-variant/90 leading-relaxed font-normal bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-headline text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest mb-2 font-mono">
                    Deep Architectural Implementation
                  </h4>
                  <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line font-light">
                    {selectedProject.longDescription}
                  </p>
                </div>

                {selectedProject.metrics && selectedProject.metrics.length > 0 && (
                  <div>
                    <h4 className="font-headline text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest mb-3 font-mono">
                      Validation Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedProject.metrics.map((metric: any, idx: number) => ( // 👈 Fixed metric & idx types
                        <div key={idx} className="p-3.5 bg-surface-container-low border border-outline-variant/10 rounded-xl">
                          <span className="text-[9px] font-mono text-on-surface-variant/60 font-semibold uppercase">
                            {metric.label}
                          </span>
                          <p className="text-base font-bold text-primary mt-1 font-mono leading-none">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-headline text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest mb-2.5 font-mono">
                    Engineering Stack & Libraries
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag: string, idx: number) => ( // 👈 Fixed tag & idx types
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 bg-surface-container text-on-surface font-mono text-[10px] border border-outline-variant/10 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  ID: {selectedProject.id} • Built in React Canvas environment
                </span>
                
                <div className="flex items-center gap-3">
                  {selectedProject.github && (
                    <a 
                      href={selectedProject.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-outline-variant/25 hover:border-outline/50 text-xs font-bold text-on-surface rounded-xl transition-all cursor-pointer"
                    >
                      <Github size={14} />
                      <span>Explore Repository</span>
                    </a>
                  )}
                  {selectedProject.link && (
                    <button 
                      onClick={() => handleVisitLiveWeb(selectedProject.link)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 hover:bg-primary-hover transition-all cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      <span>Live Demonstration</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Add/Edit Project Dialog Modal */}
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
              className="relative w-full max-w-xl bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl overflow-hidden z-10 text-left flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4.5 bg-surface-container border-b border-outline-variant/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="font-headline font-bold text-on-surface">
                    {editingProject ? 'Modify Project Case Study' : 'Deploy New Project Case Study'}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {editingProject ? (
  <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Project Title</label>
        <input
          type="text"
          required
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Category</label>
        <input
          type="text"
          required
          value={formCategory}
          onChange={(e) => setFormCategory(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
    </div>
    <div>
      <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Short Description</label>
      <textarea
        required
        rows={2}
        value={formDesc}
        onChange={(e) => setFormDesc(e.target.value)}
        className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
      />
    </div>
    <div>
      <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Long Architecture Description</label>
      <textarea
        required
        rows={4}
        value={formLongDesc}
        onChange={(e) => setFormLongDesc(e.target.value)}
        className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
      />
    </div>
    <div>
      <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Tags (comma separated)</label>
      <input
        type="text"
        placeholder="React, TypeScript, AWS"
        value={formTags}
        onChange={(e) => setFormTags(e.target.value)}
        className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">GitHub URL</label>
        <input
          type="url"
          value={formGithub}
          onChange={(e) => setFormGithub(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Live Project URL</label>
        <input
          type="url"
          value={formLink}
          onChange={(e) => setFormLink(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-[10px] font-mono text-on-surface-variant font-bold uppercase mb-1">Project Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full text-xs bg-surface-container-lowest px-2 py-1 rounded border border-primary outline-none text-on-surface"
        />
        {formImage && (
          <img src={formImage} alt="Preview" className="mt-2 max-h-40 object-contain rounded" />
        )}
      </div>
    </div>
    <div className="pt-2 border-t border-outline-variant/20 flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setIsEditModalOpen(false)}
        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors cursor-pointer"
      >
        {isSaving ? 'Saving...' : 'Save Project'}
      </button>
    </div>
  </form>
) : (
  <div className="p-6 overflow-y-auto">
    <AutoUploadForm />
  </div>
)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Only Restricted Modal */}
      <AnimatePresence>
        {ownerOnlyModalOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setOwnerOnlyModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface-container-lowest border border-outline/25 rounded-2xl shadow-2xl p-6 text-center z-10"
            >
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Lock size={24} />
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Restricted Access</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Live web demonstrations are accessible exclusively to verified profile owners or authorized recruiter sessions.
              </p>
              <button
                onClick={() => setOwnerOnlyModalOpen(false)}
                className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Understand & Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}