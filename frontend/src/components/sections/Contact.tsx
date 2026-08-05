import React, { useState, useEffect, FormEvent } from 'react';
import { insertContactMessage } from '../../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Send, Github, Linkedin, MessageSquare, Trash2, CheckCircle, Compass, RotateCcw, Edit2, Check, X, ExternalLink, ShieldAlert, Lock } from 'lucide-react';
import { ContactMessage } from '../../types';

interface ContactProps {
  isOwner?: boolean;
  onShowGithubId?: () => void;
  onShowLinkedinId?: () => void;
}

export default function Contact({ isOwner = false, onShowGithubId, onShowLinkedinId }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('General Opportunity');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [submissions, setSubmissions] = useState<ContactMessage[]>([]);

  // Profile Links & Handles
  const [linkedinUrl, setLinkedinUrl] = useState(() => {
    return localStorage.getItem('portfolio_linkedin_url') || 'https://linkedin.com/in/narendra-gond-83a050329';
  });
  const [linkedinHandle, setLinkedinHandle] = useState(() => {
    return localStorage.getItem('portfolio_linkedin_handle') || 'narendra-gond-83a050329';
  });

  const [githubUrl, setGithubUrl] = useState(() => {
    return localStorage.getItem('portfolio_github_url') || 'https://github.com/Narendra-104';
  });
  const [githubHandle, setGithubHandle] = useState(() => {
    return localStorage.getItem('portfolio_github_handle') || 'Narendra-104';
  });

  // Owner Editing States
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [tempLinkedin, setTempLinkedin] = useState(linkedinUrl);
  const [tempLinkedinHandle, setTempLinkedinHandle] = useState(linkedinHandle);

  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [tempGithub, setTempGithub] = useState(githubUrl);
  const [tempGithubHandle, setTempGithubHandle] = useState(githubHandle);

  // Restricted Access Modal State for Viewers
  const [restrictedModalData, setRestrictedModalData] = useState<{ platform: string; handle: string } | null>(null);

  // Communication Mode
  const [commsMode, setCommsMode] = useState<'incoming' | 'outgoing'>('incoming');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');

  // Location States
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('portfolio_location_name') || 'Wagholi, Pune, Maharashtra, India';
  });
  const [latitude, setLatitude] = useState(() => {
    const lat = localStorage.getItem('portfolio_location_lat');
    return lat ? parseFloat(lat) : 18.5789;
  });
  const [longitude, setLongitude] = useState(() => {
    const lon = localStorage.getItem('portfolio_location_lon');
    return lon ? parseFloat(lon) : 73.9781;
  });
  const [locationType, setLocationType] = useState<'default' | 'live'>(() => {
    return (localStorage.getItem('portfolio_location_type') as 'default' | 'live') || 'default';
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleSaveLinkedin = () => {
    setLinkedinUrl(tempLinkedin);
    setLinkedinHandle(tempLinkedinHandle);
    localStorage.setItem('portfolio_linkedin_url', tempLinkedin);
    localStorage.setItem('portfolio_linkedin_handle', tempLinkedinHandle);
    setIsEditingLinkedin(false);
  };

  const handleSaveGithub = () => {
    setGithubUrl(tempGithub);
    setGithubHandle(tempGithubHandle);
    localStorage.setItem('portfolio_github_url', tempGithub);
    localStorage.setItem('portfolio_github_handle', tempGithubHandle);
    setIsEditingGithub(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setLatitude(lat);
        setLongitude(lon);
        localStorage.setItem('portfolio_location_lat', lat.toString());
        localStorage.setItem('portfolio_location_lon', lon.toString());

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            const addressParts = displayName.split(', ');
            const readableAddress = addressParts.length > 5 
              ? addressParts.slice(0, 5).join(', ') 
              : displayName;

            setLocationName(readableAddress);
            setLocationType('live');
            localStorage.setItem('portfolio_location_name', readableAddress);
            localStorage.setItem('portfolio_location_type', 'live');
          } else {
            const fallbackName = `Coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
            setLocationName(fallbackName);
            setLocationType('live');
            localStorage.setItem('portfolio_location_name', fallbackName);
            localStorage.setItem('portfolio_location_type', 'live');
          }
        } catch {
          const fallbackName = `Coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
          setLocationName(fallbackName);
          setLocationType('live');
          localStorage.setItem('portfolio_location_name', fallbackName);
          localStorage.setItem('portfolio_location_type', 'live');
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location request was denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleResetLocation = () => {
    setLocationName('Wagholi, Pune, Maharashtra, India');
    setLatitude(18.5789);
    setLongitude(73.9781);
    setLocationType('default');
    setLocationError('');
    localStorage.removeItem('portfolio_location_name');
    localStorage.removeItem('portfolio_location_lat');
    localStorage.removeItem('portfolio_location_lon');
    localStorage.removeItem('portfolio_location_type');
  };

  useEffect(() => {
    const saved = localStorage.getItem('alex_portfolio_submissions');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing submissions: ', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOwner) {
      setCommsMode('incoming');
    }
  }, [isOwner]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commsMode === 'incoming') {
      if (!name || !email || !message) {
        alert('Please fill out all fields before transmitting your message!');
        return;
      }
    } else {
      if (!recipientEmail || !message) {
        alert('Please specify the recipient email and a message before dispatching!');
        return;
      }
    }

    setStatus('sending');

    // Simulate delay then process
    setTimeout(async () => {
      if (commsMode === 'incoming') {
        const newMsg: ContactMessage = {
          id: 'msg-' + Date.now(),
          name,
          email,
          inquiryType,
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Save locally
        const updated = [newMsg, ...submissions];
        setSubmissions(updated);
        localStorage.setItem('alex_portfolio_submissions', JSON.stringify(updated));

        // Insert into Supabase
        await insertContactMessage({
          name,
          email,
          inquiry_type: inquiryType,
          message
        });

        const mailtoSubject = encodeURIComponent(`Portfolio Inquiry: ${inquiryType} from ${name}`);
        const mailtoBody = encodeURIComponent(
          `Greetings Narendra,\n\nI contacted you via your portfolio website with the following inquiry details:\n\n` +
          `• Sender Name: ${name}\n` +
          `• Sender Email: ${email}\n` +
          `• Category: ${inquiryType}\n\n` +
          `Message Body:\n=========================================\n${message}\n=========================================\n\n` +
          `---\nTransmitted & logged in your Supabase backend.`
        );
        window.location.href = `mailto:narendragond012@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      } else {
        const newMsg: ContactMessage = {
          id: 'msg-' + Date.now(),
          name: 'Narendra Gond (Direct Outgoing)',
          email: recipientEmail,
          inquiryType: customSubject || 'Direct Message from Narendra',
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updated = [newMsg, ...submissions];
        setSubmissions(updated);
        localStorage.setItem('alex_portfolio_submissions', JSON.stringify(updated));
        const mailtoSubject = encodeURIComponent(customSubject || `Message from Narendra Gond`);
        const mailtoBody = encodeURIComponent(message);
        window.location.href = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
      }
      setStatus('success');
      setName('');
      setEmail('');
      setRecipientEmail('');
      setCustomSubject('');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1200);
  };

  const handleClearMessage = (id: string) => {
    const filtered = submissions.filter((msg) => msg.id !== id);
    setSubmissions(filtered);
    localStorage.setItem('alex_portfolio_submissions', JSON.stringify(filtered));
  };

  return (
    <section id="contact" className="py-24 bg-background scroll-mt-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left panel information */}
          <div className="space-y-10">
            <div>
              <span className="text-primary font-headline text-xs font-bold uppercase tracking-widest mb-3 block">
                Connectivity
              </span>
              <h2 className="font-headline text-3xl font-bold text-on-surface">
                Start a Conversation
              </h2>
            </div>

            {/* Address rows info */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-on-surface">Email Inquiry</h3>
                  <p className="font-sans text-xs text-on-surface-variant font-medium mt-0.5">
                    narendragond012@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline text-sm font-bold text-on-surface">Base Location</h3>
                    {locationType === 'live' ? (
                      <span className="text-[9px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> Live Location
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Primary Base
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant font-medium leading-relaxed">
                    {locationName}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="flex items-center gap-1.5 text-[10px] font-headline font-bold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/15 transition-all cursor-pointer disabled:opacity-60"
                      title="Request live browser location"
                    >
                      <Compass size={11} className={`${detectingLocation ? 'animate-spin' : ''}`} />
                      {detectingLocation ? 'Detecting...' : 'Detect My Live Location'}
                    </button>
                    
                    {locationType === 'live' && (
                      <button
                        type="button"
                        onClick={handleResetLocation}
                        className="flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 border border-outline-variant/10 transition-all cursor-pointer"
                        title="Reset coordinates to default Base"
                        aria-label="Reset Location"
                      >
                        <RotateCcw size={11} />
                      </button>
                    )}
                  </div>

                  {locationError && (
                    <p className="text-[9px] font-semibold text-red-500 mt-1.5 leading-snug">
                      ⚠️ {locationError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profiles & Ecosystem Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-headline text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Profile Handles
                </p>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${isOwner ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {isOwner ? 'Owner Mode: Full Access' : 'Viewer Mode: Protected'}
                </span>
              </div>

              <div className="space-y-3">
                
                {/* LinkedIn Box */}
                <div className="p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-grow overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Linkedin size={16} />
                    </div>
                    {isEditingLinkedin ? (
                      <div className="space-y-1 w-full">
                        <input
                          type="text"
                          value={tempLinkedinHandle}
                          onChange={(e) => setTempLinkedinHandle(e.target.value)}
                          className="w-full text-xs bg-surface-container-lowest px-2 py-1 rounded border border-primary outline-none text-on-surface"
                          placeholder="Handle (e.g. narendra-gond-83a050329)"
                        />
                        <input
                          type="text"
                          value={tempLinkedin}
                          onChange={(e) => setTempLinkedin(e.target.value)}
                          className="w-full text-xs bg-surface-container-lowest px-2 py-1 rounded border border-primary outline-none text-on-surface"
                          placeholder="Full URL (https://...)"
                        />
                      </div>
                    ) : (
                      <div className="truncate">
                        <span className="text-xs font-bold text-on-surface block leading-tight">LinkedIn ID</span>
                        <span className="text-[11px] text-primary font-mono font-semibold truncate block">@{linkedinHandle}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isOwner ? (
                      isEditingLinkedin ? (
                        <>
                          <button
                            onClick={handleSaveLinkedin}
                            className="p-1.5 bg-primary text-white rounded-lg hover:opacity-90 cursor-pointer"
                            title="Save"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setTempLinkedin(linkedinUrl);
                              setTempLinkedinHandle(linkedinHandle);
                              setIsEditingLinkedin(false);
                            }}
                            className="p-1.5 bg-surface-container-high text-on-surface-variant rounded-lg hover:text-red-500 cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsEditingLinkedin(true)}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Edit Link & ID"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover px-2.5 py-1.5 rounded-lg transition-all"
                            title="Open Link"
                          >
                            Open <ExternalLink size={10} />
                          </a>
                        </div>
                      )
                    ) : (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary hover:opacity-90 px-2.5 py-1.5 rounded-lg transition-all"
                        title="View LinkedIn Profile"
                      >
                        <ExternalLink size={10} /> Visit Profile
                      </a>
                    )}
                  </div>
                </div>

                {/* GitHub Box */}
                <div className="p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-grow overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Github size={16} />
                    </div>
                    {isEditingGithub ? (
                      <div className="space-y-1 w-full">
                        <input
                          type="text"
                          value={tempGithubHandle}
                          onChange={(e) => setTempGithubHandle(e.target.value)}
                          className="w-full text-xs bg-surface-container-lowest px-2 py-1 rounded border border-primary outline-none text-on-surface"
                          placeholder="Handle (e.g. Narendra-104)"
                        />
                        <input
                          type="text"
                          value={tempGithub}
                          onChange={(e) => setTempGithub(e.target.value)}
                          className="w-full text-xs bg-surface-container-lowest px-2 py-1 rounded border border-primary outline-none text-on-surface"
                          placeholder="Full URL (https://...)"
                        />
                      </div>
                    ) : (
                      <div className="truncate">
                        <span className="text-xs font-bold text-on-surface block leading-tight">GitHub ID</span>
                        <span className="text-[11px] text-primary font-mono font-semibold truncate block">@{githubHandle}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isOwner ? (
                      isEditingGithub ? (
                        <>
                          <button
                            onClick={handleSaveGithub}
                            className="p-1.5 bg-primary text-white rounded-lg hover:opacity-90 cursor-pointer"
                            title="Save"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setTempGithub(githubUrl);
                              setTempGithubHandle(githubHandle);
                              setIsEditingGithub(false);
                            }}
                            className="p-1.5 bg-surface-container-high text-on-surface-variant rounded-lg hover:text-red-500 cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsEditingGithub(true)}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Edit Link & ID"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover px-2.5 py-1.5 rounded-lg transition-all"
                            title="Open Link"
                          >
                            Open <ExternalLink size={10} />
                          </a>
                        </div>
                      )
                    ) : (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary hover:opacity-90 px-2.5 py-1.5 rounded-lg transition-all"
                        title="View GitHub Profile"
                      >
                        <ExternalLink size={10} /> Visit Profile
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right column form block */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm">
            {isOwner && (
              <div className="flex bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20 mb-6">
                <button
                  type="button"
                  onClick={() => setCommsMode('incoming')}
                  className={`flex-1 py-1.5 text-[10px] font-headline font-bold uppercase rounded-lg transition-all cursor-pointer text-center ${
                    commsMode === 'incoming'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Receive Inquiries
                </button>
                <button
                  type="button"
                  onClick={() => setCommsMode('outgoing')}
                  className={`flex-1 py-1.5 text-[10px] font-headline font-bold uppercase rounded-lg transition-all cursor-pointer text-center ${
                    commsMode === 'outgoing'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  Dispatch Mail
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {commsMode === 'incoming' ? (
                  <motion.div
                    key="incoming"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="full-name" className="text-[11px] font-bold text-on-surface-variant ml-1">
                          Full Name *
                        </label>
                        <input
                          id="full-name"
                          type="text"
                          required={commsMode === 'incoming'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          disabled={status === 'sending'}
                          className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface shadow-sm disabled:opacity-60"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="email-address" className="text-[11px] font-bold text-on-surface-variant ml-1">
                          Email Address *
                        </label>
                        <input
                          id="email-address"
                          type="email"
                          required={commsMode === 'incoming'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          disabled={status === 'sending'}
                          className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface shadow-sm disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label htmlFor="inquiry-type" className="text-[11px] font-bold text-on-surface-variant ml-1">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiry-type"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        disabled={status === 'sending'}
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        <option>General Opportunity</option>
                        <option>Project Partnership</option>
                        <option>Consulting Request</option>
                        <option>Speaking Engagement</option>
                      </select>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="outgoing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="recipient-email" className="text-[11px] font-bold text-on-surface-variant ml-1">
                        Recipient Email Address *
                      </label>
                      <input
                        id="recipient-email"
                        type="email"
                        required={commsMode === 'outgoing'}
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="client@company.com"
                        disabled={status === 'sending'}
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface shadow-sm disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label htmlFor="custom-subject" className="text-[11px] font-bold text-on-surface-variant ml-1">
                        Subject / Topic *
                      </label>
                      <input
                        id="custom-subject"
                        type="text"
                        required={commsMode === 'outgoing'}
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        placeholder="Proposal / Partnership discussion"
                        disabled={status === 'sending'}
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface shadow-sm disabled:opacity-60"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5 text-left">
                <label htmlFor="message-body" className="text-[11px] font-bold text-on-surface-variant ml-1">
                  Message *
                </label>
                <textarea
                  id="message-body"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={commsMode === 'incoming' ? "How can I help you today?" : "Write your custom message details here..."}
                  disabled={status === 'sending'}
                  className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/30 text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-on-surface shadow-sm disabled:opacity-60 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-primary text-white font-headline text-xs font-bold py-4 rounded-xl hover:opacity-95 active:scale-[0.99] transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-center"
              >
                {status === 'idle' && (
                  <>
                    {commsMode === 'incoming' ? 'Transmit Message' : 'Dispatch Outgoing Mail'}
                    <Send size={13} />
                  </>
                )}
                {status === 'sending' && (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {commsMode === 'incoming' ? 'Transmitting...' : 'Dispatching...'}
                  </>
                )}
                {status === 'success' && (
                  <>
                    {commsMode === 'incoming' ? 'Message Sent Successfully' : 'Mail Redirect Success'}
                    <CheckCircle size={14} className="text-white" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Real-time Submissions log visualizer for Owner */}
        <AnimatePresence>
          {isOwner && submissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-12 bg-surface-container-low border border-outline-variant/35 rounded-2xl p-6 md:p-8 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <MessageSquare size={16} />
                  <span className="font-headline text-xs uppercase tracking-widest">
                    Submission Inboxes Logged Local
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSubmissions([]);
                    localStorage.removeItem('alex_portfolio_submissions');
                  }}
                  className="p-1 px-2 text-on-surface-variant hover:text-red-500 rounded-md hover:bg-red-500/15 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={12} /> Clear Log
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                {submissions.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl flex items-start gap-3 relative group"
                  >
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-center pr-6">
                        <span className="font-headline text-xs font-extrabold text-on-surface leading-none">
                          {msg.name}
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-bold leading-none bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {msg.inquiryType}
                        </span>
                      </div>
                      <p className="text-[9px] text-on-surface-variant font-semibold">
                        {msg.email} • Transmitted {msg.timestamp}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/10">
                        {msg.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleClearMessage(msg.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Submission Item"
                      aria-label="Delete Submission"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Viewer Owner-Access-Only Pop-up Modal */}
      <AnimatePresence>
        {restrictedModalData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <ShieldAlert size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Owner Access Only
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Direct profile links for <strong className="text-on-surface">{restrictedModalData.platform}</strong> are restricted. Only the profile owner can view or access direct external links.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase block mb-1">
                  Public ID Handle
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  {restrictedModalData.handle}
                </span>
              </div>

              <button
                onClick={() => setRestrictedModalData(null)}
                className="w-full text-xs font-bold text-white bg-primary hover:bg-primary-hover py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Understand & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}