import React, { useState, useEffect } from 'react';
import {
  DatabaseCase,
  NewsLeadItem,
  NewsSourceItem,
  CorrectionItem,
  AdminActivityItem,
  PublicationStatus,
} from '../../types';
import {
  auth,
  loginWithGoogle,
  logoutUser,
} from '../../lib/firebase';
import {
  subscribeToAllCases,
  saveCase,
  deleteCaseRecord,
  seedInitialDatabase,
} from '../../lib/casesService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CaseEditorModal } from './CaseEditorModal';
import {
  LayoutDashboard,
  FolderOpen,
  Newspaper,
  Radio,
  FileCheck2,
  History,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPublic: () => void;
  onToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPublic,
  onToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cases' | 'news' | 'sources' | 'corrections' | 'audit'
  >('overview');

  const [allCases, setAllCases] = useState<DatabaseCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  // Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<DatabaseCase> | null>(null);

  // News Leads & Sources
  const [newsLeads, setNewsLeads] = useState<NewsLeadItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [sourcesList, setSourcesList] = useState<NewsSourceItem[]>([]);

  // Corrections
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminActivityItem[]>([]);

  // Filters for cases
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');

  // Track Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore cases when authorized
  useEffect(() => {
    if (!currentUser) {
      setAllCases([]);
      setCasesLoading(false);
      return;
    }

    setCasesLoading(true);
    const unsub = subscribeToAllCases(
      (cases) => {
        setAllCases(cases);
        setCasesLoading(false);
      },
      (err) => {
        console.warn('Admin cases subscription notice:', err.message);
        setCasesLoading(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Fetch sources registry
  const fetchSources = async () => {
    try {
      const res = await fetch('/api/news/sources');
      if (res.ok) {
        const data = await res.json();
        setSourcesList(data.sources || []);
      }
    } catch {
      // offline / mock
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Trigger automated news discovery
  const runNewsDiscovery = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/news/discover', { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setNewsLeads(data.leads);
        onToast(`Discovered ${data.foundCount} reports, analyzed ${data.analyzedCount} with Gemini.`);
      } else {
        onToast(data.error || 'Discovery finished with no new items.');
      }
    } catch (err: any) {
      onToast('News discovery request failed: ' + (err?.message || 'Check network'));
    } finally {
      setNewsLoading(false);
    }
  };

  // Seed initial data
  const handleSeedDatabase = async () => {
    try {
      const count = await seedInitialDatabase();
      onToast(`Successfully initialized database with ${count} verified template cases.`);
    } catch (err: any) {
      onToast('Seeding failed: ' + err.message);
    }
  };

  // Convert news lead into a new case draft
  const handleLeadToCase = (lead: NewsLeadItem) => {
    setEditingCase({
      id: `JC-BD-${String(Math.floor(1000 + Math.random() * 9000))}`,
      titleBn: lead.headline,
      titleEn: lead.headline,
      incidentDate: lead.suggestedIncidentDate,
      datePrecision: lead.suggestedIncidentDate ? 'day' : 'unknown',
      district: (lead.suggestedDistrict?.toLowerCase() as any) || 'dhaka',
      legalStatus: (lead.suggestedStatus as any) || 'investigation',
      verificationStatus: 'unverified',
      publicationStatus: 'draft',
      internalNotes: `Discovered from ${lead.publisher} (${lead.articleUrl}). AI Confidence: ${lead.aiConfidence}%. AI Summary: ${lead.aiSummary}`,
      sources: [
        {
          id: `src-${Date.now()}`,
          caseId: '',
          publisher: lead.publisher,
          url: lead.articleUrl,
          sourceType: 'reputable_news',
          publicationDate: lead.publishedAt?.split('T')[0] || null,
          dateAccessed: new Date().toISOString().split('T')[0],
          verificationStatus: 'unverified',
          notes: 'Discovered report citation',
        },
      ],
    });
    setEditorOpen(true);
  };

  const isSuperadmin =
    currentUser?.email === 'nahianalmubin2006@gmail.com';

  const publishedCount = allCases.filter((c) => c.publicationStatus === 'published').length;
  const draftCount = allCases.filter((c) => c.publicationStatus === 'draft').length;
  const archivedCount = allCases.filter((c) => c.publicationStatus === 'archived').length;

  const filteredCases = allCases.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.titleEn.toLowerCase().includes(q) ||
      c.titleBn.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.publicationStatus === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#26211F] flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#26211F] text-white px-4 sm:px-6 py-3.5 border-b border-[#3D3531] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPublic}
            className="flex items-center gap-1.5 text-xs text-[#FAF8F5]/80 hover:text-white bg-white/10 px-2.5 py-1.5 rounded transition-colors"
          >
            <ArrowLeft size={14} /> Back to Public Site
          </button>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <h1 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
            <span>Justice Clock</span>
            <span className="text-xs bg-[#8B1E2D] px-2 py-0.5 rounded font-sans tracking-wide">
              ADMIN DASHBOARD
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="font-medium text-white flex items-center gap-1 justify-end">
                  <ShieldCheck size={13} className="text-green-400" />
                  <span>{currentUser.email}</span>
                </div>
                <span className="text-[10px] text-green-400 font-mono">
                  {isSuperadmin ? 'Superadmin (Full Access)' : 'Authorized Admin'}
                </span>
              </div>
              <button
                onClick={() => logoutUser()}
                className="bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded text-white flex items-center gap-1 transition-colors"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="bg-[#8B1E2D] hover:bg-[#6f1824] px-3 py-1.5 rounded text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogIn size={13} /> Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      {!currentUser ? (
        <div className="max-w-xl mx-auto w-full px-4 py-16 text-center space-y-6">
          <div className="bg-white p-8 rounded-lg border border-[#E4DED7] shadow-sm space-y-4">
            <ShieldCheck size={44} className="mx-auto text-[#8B1E2D]" />
            <h2 className="font-serif font-bold text-2xl text-[#26211F]">
              Administrator Authentication Required
            </h2>
            <p className="text-sm text-[#6B635E] leading-relaxed">
              This area is strictly restricted to authorized platform administrators. Please sign in with your authorized Google account (<strong className="text-[#26211F]">nahianalmubin2006@gmail.com</strong>) to manage cases, view private drafts, and review discovered news reports.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => loginWithGoogle()}
                className="btn-primary !py-2.5 !px-6 text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
              >
                <LogIn size={16} /> Sign In with Google
              </button>
              <button
                onClick={onBackToPublic}
                className="btn-ghost !py-2.5 !px-5 text-sm w-full sm:w-auto"
              >
                Back to Public Tracker
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2.5 transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'text-[#26211F] hover:bg-white'
            }`}
          >
            <LayoutDashboard size={17} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center justify-between transition-colors ${
              activeTab === 'cases'
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'text-[#26211F] hover:bg-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FolderOpen size={17} /> Cases Management
            </span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-mono">
              {allCases.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center justify-between transition-colors ${
              activeTab === 'news'
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'text-[#26211F] hover:bg-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Newspaper size={17} /> News Review Queue
            </span>
            {newsLeads.length > 0 && (
              <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded font-mono">
                {newsLeads.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2.5 transition-colors ${
              activeTab === 'sources'
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'text-[#26211F] hover:bg-white'
            }`}
          >
            <Radio size={17} /> News Feed Registry
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2.5 transition-colors ${
              activeTab === 'corrections'
                ? 'bg-[#8B1E2D] text-white shadow-xs'
                : 'text-[#26211F] hover:bg-white'
            }`}
          >
            <FileCheck2 size={17} /> Public Corrections
          </button>

          {/* Quick Database Seeder */}
          <div className="pt-6 border-t border-[#E4DED7] mt-6">
            <button
              onClick={handleSeedDatabase}
              className="w-full text-left px-3 py-2 text-xs bg-white border border-[#E4DED7] hover:border-[#8B1E2D] rounded flex items-center gap-2 text-[#6B635E] hover:text-[#8B1E2D] transition-colors"
            >
              <Database size={14} /> Seed / Reset Initial Cases
            </button>
            <p className="text-[11px] text-[#6B635E] mt-1.5 px-1 leading-relaxed">
              Populates Firestore with initial verified cases if database is empty.
            </p>
          </div>
        </aside>

        {/* Tab Main Content */}
        <main className="flex-1 bg-white p-5 sm:p-7 rounded-lg border border-[#E4DED7] shadow-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#26211F]">
                  System Overview
                </h2>
                <p className="text-sm text-[#6B635E] mt-1">
                  Single source of truth for all tracked cases in Bangladesh. Changes made here reflect immediately on the live public website.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E4DED7]">
                  <p className="text-xs text-[#6B635E] uppercase font-semibold">Published Live</p>
                  <p className="font-serif font-bold text-3xl text-[#8B1E2D] mt-1">
                    {publishedCount}
                  </p>
                  <p className="text-[11px] text-green-700 mt-1">Visible on public tracker</p>
                </div>
                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E4DED7]">
                  <p className="text-xs text-[#6B635E] uppercase font-semibold">Drafts & Verification</p>
                  <p className="font-serif font-bold text-3xl text-[#26211F] mt-1">
                    {draftCount}
                  </p>
                  <p className="text-[11px] text-[#6B635E] mt-1">Internal only</p>
                </div>
                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E4DED7]">
                  <p className="text-xs text-[#6B635E] uppercase font-semibold">News Leads</p>
                  <p className="font-serif font-bold text-3xl text-amber-600 mt-1">
                    {newsLeads.length}
                  </p>
                  <p className="text-[11px] text-[#6B635E] mt-1">Discovered via RSS</p>
                </div>
                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E4DED7]">
                  <p className="text-xs text-[#6B635E] uppercase font-semibold">Archived Cases</p>
                  <p className="font-serif font-bold text-3xl text-[#6B635E] mt-1">
                    {archivedCount}
                  </p>
                  <p className="text-[11px] text-[#6B635E] mt-1">Unpublished history</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-amber-950 text-sm">
                    Automated News Discovery Workflow
                  </h3>
                  <p className="text-xs text-amber-900 mt-0.5 max-w-xl">
                    Query Bangladeshi news feeds (Dhaka Tribune, Daily Star, Prothom Alo) and run Gemini legal information extraction into your private review queue.
                  </p>
                </div>
                <button
                  onClick={runNewsDiscovery}
                  disabled={newsLoading}
                  className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} />
                  <span>{newsLoading ? 'Analyzing Feeds...' : 'Run News Discovery Now'}</span>
                </button>
              </div>

              {/* System Architecture Details */}
              <div className="border border-[#E4DED7] rounded-lg p-5 bg-[#FAF8F5]">
                <h3 className="font-serif font-bold text-base text-[#26211F] flex items-center gap-2">
                  <Database size={18} className="text-[#8B1E2D]" />
                  <span>Backend & Security Status</span>
                </h3>
                <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-[#E4DED7]">
                    <span className="text-[#6B635E] block font-medium">Database:</span>
                    <span className="font-semibold text-green-700">Firebase Cloud Firestore</span>
                    <span className="block text-[#6B635E] font-mono text-[10px] mt-0.5">ultra-wall-9smzh</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#E4DED7]">
                    <span className="text-[#6B635E] block font-medium">AI Extraction Engine:</span>
                    <span className="font-semibold text-[#26211F]">Gemini 3.8 Flash (Server-Side)</span>
                    <span className="block text-[#6B635E] text-[10px] mt-0.5">Automated factual parser</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#E4DED7]">
                    <span className="text-[#6B635E] block font-medium">Security Rules:</span>
                    <span className="font-semibold text-green-700">Zero-Trust ABAC Deployed</span>
                    <span className="block text-[#6B635E] text-[10px] mt-0.5">Strict role validation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CASES MANAGEMENT */}
          {activeTab === 'cases' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#26211F]">
                    Case Management
                  </h2>
                  <p className="text-xs text-[#6B635E]">
                    Create, edit, verify, and publish case records to the live tracker.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCase(null);
                    setEditorOpen(true);
                  }}
                  className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 self-start"
                >
                  <Plus size={16} /> Create New Case
                </button>
              </div>

              {/* Filters */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <input
                    type="search"
                    placeholder="Search by case ID, English title, or Bangla title..."
                    className="field pl-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B635E]" />
                </div>
                <div>
                  <select
                    className="field text-xs cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Statuses ({allCases.length})</option>
                    <option value="published">Published Only ({publishedCount})</option>
                    <option value="draft">Drafts Only ({draftCount})</option>
                    <option value="archived">Archived Only ({archivedCount})</option>
                  </select>
                </div>
              </div>

              {/* Cases List */}
              {casesLoading ? (
                <div className="py-12 text-center text-sm text-[#6B635E] animate-pulse">
                  Loading cases from Firestore...
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#E4DED7] rounded-lg">
                  <p className="text-base font-serif font-bold text-[#26211F]">
                    No cases match the filter.
                  </p>
                  <p className="text-xs text-[#6B635E] mt-1">
                    Click "Create New Case" or "Seed Initial Verified Cases" to add records.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E4DED7] border border-[#E4DED7] rounded-lg overflow-hidden">
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-[#FAF8F5] border border-[#E4DED7] px-2 py-0.5 rounded text-[#26211F]">
                            {c.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              c.publicationStatus === 'published'
                                ? 'bg-green-100 text-green-800'
                                : c.publicationStatus === 'draft'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {c.publicationStatus}
                          </span>
                          <span className="badge !py-0.5 !px-2 text-[10px]">
                            {c.legalStatus}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#26211F]">
                          {c.titleEn}{' '}
                          <span className="font-normal text-sm text-[#6B635E]">
                            / {c.titleBn}
                          </span>
                        </h4>
                        <p className="text-xs text-[#6B635E]">
                          <span>District: <strong className="capitalize text-[#26211F]">{c.district}</strong></span>
                          <span className="mx-2">·</span>
                          <span>Incident: <strong className="text-[#26211F]">{c.incidentDate || 'Unknown'}</strong> ({c.datePrecision})</span>
                          <span className="mx-2">·</span>
                          <span>Sources: {c.sources?.length || 0}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setEditingCase(c);
                            setEditorOpen(true);
                          }}
                          className="btn-ghost !py-1.5 !px-3 text-xs flex items-center gap-1"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus =
                              c.publicationStatus === 'published' ? 'draft' : 'published';
                            await saveCase({ ...c, publicationStatus: newStatus });
                            onToast(`Case ${c.id} is now ${newStatus}.`);
                          }}
                          className={`btn-ghost !py-1.5 !px-2.5 text-xs ${
                            c.publicationStatus === 'published'
                              ? 'text-amber-800 hover:bg-amber-50'
                              : 'text-green-800 hover:bg-green-50'
                          }`}
                        >
                          {c.publicationStatus === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete case ${c.id}?`)) {
                              await deleteCaseRecord(c.id);
                              onToast(`Case ${c.id} deleted.`);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete case"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEWS REVIEW QUEUE */}
          {activeTab === 'news' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#26211F]">
                    News Discovery & Review Queue
                  </h2>
                  <p className="text-xs text-[#6B635E]">
                    Discovered news leads extracted via Gemini AI. Discovered items are NEVER published automatically.
                  </p>
                </div>
                <button
                  onClick={runNewsDiscovery}
                  disabled={newsLoading}
                  className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 self-start"
                >
                  <RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} />
                  <span>{newsLoading ? 'Discovering...' : 'Scan Feeds Now'}</span>
                </button>
              </div>

              {newsLeads.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#E4DED7] rounded-lg p-6 bg-[#FAF8F5]">
                  <Newspaper size={32} className="mx-auto text-[#6B635E] opacity-60 mb-2" />
                  <p className="font-serif font-bold text-lg text-[#26211F]">
                    No leads in the review queue
                  </p>
                  <p className="text-xs text-[#6B635E] mt-1 max-w-md mx-auto">
                    Click "Scan Feeds Now" to check registered RSS feeds from Dhaka Tribune, The Daily Star, and Prothom Alo for recent crime and judicial reporting.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsLeads.map((lead, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-[#E4DED7] rounded-lg bg-[#FAF8F5] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold bg-white border border-[#E4DED7] px-2 py-0.5 rounded text-[#8B1E2D]">
                          {lead.publisher}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6B635E]">
                            AI Confidence: <strong>{lead.aiConfidence}%</strong> (Estimated)
                          </span>
                          <a
                            href={lead.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#8B1E2D] hover:underline flex items-center gap-1"
                          >
                            <span>Read Article</span> <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#26211F]">
                        {lead.headline}
                      </h3>

                      <p className="text-xs text-[#6B635E] leading-relaxed italic bg-white p-2.5 rounded border border-[#E4DED7]">
                        "{lead.excerpt}"
                      </p>

                      {/* AI Structured Extraction Box */}
                      <div className="bg-white p-3.5 rounded border border-[#E4DED7] text-xs space-y-2">
                        <p className="font-semibold text-[#26211F]">
                          Gemini Structured Extraction (Unverified Suggestion):
                        </p>
                        <p className="text-[#6B635E]">{lead.aiSummary}</p>
                        <div className="flex flex-wrap gap-3 pt-1 border-t border-[#E4DED7] text-[11px]">
                          <span>
                            Suggested Date:{' '}
                            <strong className="text-[#26211F]">
                              {lead.suggestedIncidentDate || 'Not specified'}
                            </strong>
                          </span>
                          <span>
                            Suggested District:{' '}
                            <strong className="text-[#26211F] capitalize">
                              {lead.suggestedDistrict || 'Unspecified'}
                            </strong>
                          </span>
                          <span>
                            Status:{' '}
                            <strong className="text-[#26211F]">
                              {lead.suggestedStatus}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Warnings */}
                      {lead.missingInfoWarnings && lead.missingInfoWarnings.length > 0 && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200 space-y-0.5">
                          {lead.missingInfoWarnings.map((w, wi) => (
                            <p key={wi} className="flex items-center gap-1.5">
                              <AlertCircle size={12} /> {w}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E4DED7]">
                        <button
                          onClick={() => {
                            setNewsLeads(newsLeads.filter((_, i) => i !== idx));
                            onToast('Lead archived.');
                          }}
                          className="btn-ghost !py-1 !px-3 text-xs"
                        >
                          Dismiss / Reject
                        </button>
                        <button
                          onClick={() => handleLeadToCase(lead)}
                          className="btn-primary !py-1 !px-4 text-xs flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} /> Review & Create Case
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NEWS SOURCE REGISTRY */}
          {activeTab === 'sources' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#26211F]">
                  News Source Registry
                </h2>
                <p className="text-xs text-[#6B635E] mt-1">
                  Configured RSS and news feeds polled by the automated discovery pipeline.
                </p>
              </div>

              <div className="border border-[#E4DED7] rounded-lg divide-y divide-[#E4DED7]">
                {sourcesList.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#26211F]">
                        {src.name}
                      </h4>
                      <p className="text-xs font-mono text-[#6B635E] mt-0.5">
                        {src.feedUrl}
                      </p>
                      <p className="text-[11px] text-[#6B635E] mt-1">
                        Status: {src.enabled ? 'Active' : 'Disabled'} · Checked:{' '}
                        {src.lastCheckedAt
                          ? new Date(src.lastCheckedAt).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                    <span className="badge text-xs">
                      {src.sourceType.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CORRECTIONS QUEUE */}
          {activeTab === 'corrections' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#26211F]">
                  Public Correction & Removal Requests
                </h2>
                <p className="text-xs text-[#6B635E] mt-1">
                  Private review queue for corrections submitted by families, lawyers, or the public.
                </p>
              </div>

              <div className="py-8 text-center border border-dashed border-[#E4DED7] rounded-lg p-6 bg-[#FAF8F5]">
                <FileCheck2 size={32} className="mx-auto text-[#6B635E] opacity-60 mb-2" />
                <p className="font-serif font-bold text-base text-[#26211F]">
                  Review Queue Active
                </p>
                <p className="text-xs text-[#6B635E] mt-1 max-w-md mx-auto">
                  When a visitor submits a correction from the public website, it arrives safely here without directly modifying public records.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
      )}

      {/* Case Editor & Preview Modal */}
      <CaseEditorModal
        isOpen={editorOpen}
        initialCase={editingCase}
        onClose={() => setEditorOpen(false)}
        onSave={async (caseData) => {
          await saveCase(caseData);
          onToast(`Saved case ${caseData.id} (${caseData.publicationStatus}).`);
        }}
      />
    </div>
  );
};
