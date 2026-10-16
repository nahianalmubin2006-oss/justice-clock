import React, { useState } from 'react';
import {
  DatabaseCase,
  DatabaseEvent,
  DatabaseSource,
  District,
  CaseStatus,
  VerificationStatus,
  PublicationStatus,
  DatePrecision,
  TimelineStage,
} from '../../types';
import { DISTRICTS, STATUSES, VERIFS } from '../../data/cases';
import { X, Plus, Trash2, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CaseEditorModalProps {
  initialCase: Partial<DatabaseCase> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: DatabaseCase) => Promise<void>;
}

export const CaseEditorModal: React.FC<CaseEditorModalProps> = ({
  initialCase,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(
    initialCase?.id || `JC-BD-${String(Math.floor(1000 + Math.random() * 9000))}`
  );
  const [titleBn, setTitleBn] = useState(initialCase?.titleBn || '');
  const [titleEn, setTitleEn] = useState(initialCase?.titleEn || '');
  const [incidentDate, setIncidentDate] = useState(initialCase?.incidentDate || '');
  const [datePrecision, setDatePrecision] = useState<DatePrecision>(
    initialCase?.datePrecision || 'day'
  );
  const [dateExplanation, setDateExplanation] = useState(
    initialCase?.dateExplanation || ''
  );
  const [complaintDate, setComplaintDate] = useState(
    initialCase?.complaintDate || ''
  );
  const [district, setDistrict] = useState<District>(
    initialCase?.district || 'dhaka'
  );
  const [locationDetails, setLocationDetails] = useState(
    initialCase?.locationDetails || ''
  );
  const [courtName, setCourtName] = useState(initialCase?.courtName || '');
  const [legalStatus, setLegalStatus] = useState<CaseStatus>(
    initialCase?.legalStatus || 'investigation'
  );
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(initialCase?.verificationStatus || 'partial');
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>(
    initialCase?.publicationStatus || 'draft'
  );
  const [internalNotes, setInternalNotes] = useState(
    initialCase?.internalNotes || ''
  );

  // Timeline events state
  const [events, setEvents] = useState<DatabaseEvent[]>(
    initialCase?.events || [
      {
        id: 'ev-1',
        caseId: id,
        stage: 'reported',
        eventDate: initialCase?.incidentDate || null,
        titleBn: 'ঘটনা রিপোর্ট',
        titleEn: 'Incident Reported',
        verificationStatus: 'partial',
        visibility: 'public',
      },
    ]
  );

  // Sources state
  const [sources, setSources] = useState<DatabaseSource[]>(
    initialCase?.sources || []
  );

  // Privacy verification checkmarks
  const [privacyChecks, setPrivacyChecks] = useState({
    minorProtected: true,
    anonymizedTitle: true,
    noPrivateAddress: true,
    nonSensationalist: true,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Handlers for Timeline
  const addEvent = () => {
    setEvents([
      ...events,
      {
        id: `ev-${Date.now()}`,
        caseId: id,
        stage: 'investigation',
        eventDate: '',
        titleBn: 'নতুন পর্যায়',
        titleEn: 'New Stage',
        verificationStatus: 'partial',
        visibility: 'public',
      },
    ]);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const updateEvent = (index: number, field: keyof DatabaseEvent, val: any) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: val };
    setEvents(updated);
  };

  // Handlers for Sources
  const addSource = () => {
    setSources([
      ...sources,
      {
        id: `src-${Date.now()}`,
        caseId: id,
        publisher: 'News / Court Record',
        url: 'https://',
        sourceType: 'reputable_news',
        publicationDate: new Date().toISOString().split('T')[0],
        dateAccessed: new Date().toISOString().split('T')[0],
        verificationStatus: 'verified',
        notes: '',
      },
    ]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (
    index: number,
    field: keyof DatabaseSource,
    val: any
  ) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: val };
    setSources(updated);
  };

  const handleSave = async (pubStatus?: PublicationStatus) => {
    setErrorMsg(null);
    if (!titleBn.trim() || !titleEn.trim()) {
      setErrorMsg('Both Bangla and English titles are required.');
      return;
    }

    if (datePrecision === 'day' && !incidentDate) {
      setErrorMsg('Incident date is required when precision is set to Exact Day.');
      return;
    }

    const finalStatus = pubStatus || publicationStatus;
    if (finalStatus === 'published') {
      const allChecked = Object.values(privacyChecks).every(Boolean);
      if (!allChecked) {
        setErrorMsg('All privacy and victim-protection checks must be confirmed before publishing.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: DatabaseCase = {
        id: id.trim(),
        titleBn: titleBn.trim(),
        titleEn: titleEn.trim(),
        incidentDate: datePrecision === 'unknown' ? null : incidentDate || null,
        datePrecision,
        dateExplanation: dateExplanation.trim(),
        complaintDate: complaintDate || null,
        district,
        locationDetails: locationDetails.trim(),
        courtName: courtName.trim() || null,
        legalStatus,
        verificationStatus,
        lastVerifiedAt: new Date().toISOString().split('T')[0],
        publicationStatus: finalStatus,
        internalNotes: internalNotes.trim(),
        createdAt: initialCase?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'authorized-admin',
        events,
        sources,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save case.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#26211F]/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E4DED7]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E4DED7] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#8B1E2D] text-white px-2 py-0.5 rounded">
                {id}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B635E]">
                {initialCase?.createdAt ? 'Edit Case' : 'New Case Record'}
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl text-[#26211F] mt-1">
              {titleEn || 'Case Management Form'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-ghost !py-1.5 !px-3 text-xs flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>{previewMode ? 'Edit Fields' : 'Preview Case'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#E4DED7] text-[#6B635E]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {previewMode ? (
            /* Live Preview Box */
            <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#E4DED7] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B1E2D] border border-[#8B1E2D] px-2 py-0.5 rounded">
                  PUBLIC WEBSITE PREVIEW
                </span>
                <span className="text-xs font-mono text-[#6B635E]">{id}</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#26211F]">
                {titleBn || 'শিরোনামহীন মামলা'} / {titleEn || 'Untitled Case'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-[#6B635E]">District:</span>{' '}
                  <strong className="capitalize">{district}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#6B635E]">Incident Date:</span>{' '}
                  <strong>{datePrecision === 'unknown' ? 'Unknown' : incidentDate || 'Not set'}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#6B635E]">Legal Status:</span>{' '}
                  <span className="badge">{legalStatus}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B635E]">Verification:</span>{' '}
                  <span className="badge">{verificationStatus}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#6B635E]">Timeline Events ({events.length})</p>
                <ul className="mt-2 text-xs space-y-1">
                  {events.map((ev, i) => (
                    <li key={i} className="flex justify-between border-b border-[#E4DED7] py-1">
                      <span>{ev.titleEn} ({ev.stage})</span>
                      <span className="text-[#6B635E]">{ev.eventDate || 'Date unrecorded'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Basic Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Case ID</label>
                  <input
                    type="text"
                    className="field font-mono"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="lbl">Publication Status</label>
                  <select
                    className="field"
                    value={publicationStatus}
                    onChange={(e) =>
                      setPublicationStatus(e.target.value as PublicationStatus)
                    }
                  >
                    <option value="draft">Draft (Private to Admins)</option>
                    <option value="published">Published (Live on Public Site)</option>
                    <option value="archived">Archived (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Case Title in Bangla (বাংলা শিরোনাম)</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="যেমন: মামলা রেকর্ড - চট্টগ্রাম"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="lbl">Case Title in English</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="e.g. Case Record - Chattogram"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Dates & Location */}
              <div className="p-4 bg-[#FAF8F5] rounded-md border border-[#E4DED7] space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#26211F]">
                  Incident Date & Location Specifics
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="lbl">Date Precision</label>
                    <select
                      className="field"
                      value={datePrecision}
                      onChange={(e) =>
                        setDatePrecision(e.target.value as DatePrecision)
                      }
                    >
                      <option value="day">Exact Date</option>
                      <option value="month">Approximate (Month Only)</option>
                      <option value="unknown">Unknown / Not Reported</option>
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Incident Date</label>
                    <input
                      type="date"
                      className="field"
                      disabled={datePrecision === 'unknown'}
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="lbl">Complaint / Filing Date</label>
                    <input
                      type="date"
                      className="field"
                      value={complaintDate}
                      onChange={(e) => setComplaintDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="lbl">District / Division</label>
                    <select
                      className="field capitalize"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value as District)}
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Specific Location / Thana</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="e.g. Kotwali Thana"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="lbl">Court Name (if established)</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="e.g. Nari O Shishu Nirjatan Daman Tribunal"
                      value={courtName}
                      onChange={(e) => setCourtName(e.target.value)}
                    />
                  </div>
                </div>

                {datePrecision !== 'day' && (
                  <div>
                    <label className="lbl">Date Explanation or Uncertainty Notes</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="Explain why only approximate month or unknown date is recorded"
                      value={dateExplanation}
                      onChange={(e) => setDateExplanation(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Status and Verification */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Current Legal Status</label>
                  <select
                    className="field"
                    value={legalStatus}
                    onChange={(e) => setLegalStatus(e.target.value as CaseStatus)}
                  >
                    <option value="investigation">Under investigation (তদন্তাধীন)</option>
                    <option value="awaiting_trial">Awaiting trial (বিচার অপেক্ষমাণ)</option>
                    <option value="trial">Trial ongoing (বিচার চলমান)</option>
                    <option value="judgment">Judgment delivered (রায় ঘোষিত)</option>
                    <option value="appeal">Appeal pending (আপিল)</option>
                    <option value="other">Other procedural milestone</option>
                    <option value="unverified">Latest status unverified</option>
                  </select>
                </div>
                <div>
                  <label className="lbl">Verification Status</label>
                  <select
                    className="field"
                    value={verificationStatus}
                    onChange={(e) =>
                      setVerificationStatus(e.target.value as VerificationStatus)
                    }
                  >
                    <option value="unverified">Unverified (Preliminary lead)</option>
                    <option value="partial">Partially verified</option>
                    <option value="verified">Verified with reputable record</option>
                  </select>
                </div>
              </div>

              {/* Timeline Management */}
              <div className="border border-[#E4DED7] rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#26211F]">
                    Case Timeline Milestones ({events.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addEvent}
                    className="btn-ghost !py-1 !px-2.5 text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Event
                  </button>
                </div>
                {events.map((ev, index) => (
                  <div
                    key={ev.id || index}
                    className="p-3 bg-[#FAF8F5] rounded border border-[#E4DED7] grid sm:grid-cols-5 gap-2 items-center text-xs"
                  >
                    <div>
                      <select
                        className="field !text-xs !py-1"
                        value={ev.stage}
                        onChange={(e) =>
                          updateEvent(index, 'stage', e.target.value as TimelineStage)
                        }
                      >
                        <option value="reported">Reported</option>
                        <option value="filed">Filed</option>
                        <option value="investigation">Investigation</option>
                        <option value="trial">Trial</option>
                        <option value="judgment">Judgment</option>
                        <option value="appeal">Appeal</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="date"
                        className="field !text-xs !py-1"
                        value={ev.eventDate || ''}
                        onChange={(e) => updateEvent(index, 'eventDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="field !text-xs !py-1"
                        placeholder="Bangla description"
                        value={ev.titleBn}
                        onChange={(e) => updateEvent(index, 'titleBn', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="field !text-xs !py-1"
                        placeholder="English description"
                        value={ev.titleEn}
                        onChange={(e) => updateEvent(index, 'titleEn', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete milestone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Source Management */}
              <div className="border border-[#E4DED7] rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#26211F]">
                    Supporting Sources & Citations ({sources.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addSource}
                    className="btn-ghost !py-1 !px-2.5 text-xs flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Source
                  </button>
                </div>
                {sources.map((src, index) => (
                  <div
                    key={src.id || index}
                    className="p-3 bg-[#FAF8F5] rounded border border-[#E4DED7] grid sm:grid-cols-4 gap-2 items-center text-xs"
                  >
                    <input
                      type="text"
                      className="field !text-xs !py-1"
                      placeholder="Publisher / Organization"
                      value={src.publisher}
                      onChange={(e) => updateSource(index, 'publisher', e.target.value)}
                    />
                    <input
                      type="url"
                      className="field !text-xs !py-1"
                      placeholder="Source URL"
                      value={src.url}
                      onChange={(e) => updateSource(index, 'url', e.target.value)}
                    />
                    <select
                      className="field !text-xs !py-1"
                      value={src.sourceType}
                      onChange={(e) => updateSource(index, 'sourceType', e.target.value)}
                    >
                      <option value="reputable_news">Reputable News</option>
                      <option value="court_record">Court / Govt Record</option>
                      <option value="official_statement">Official Statement</option>
                      <option value="other">Other Documented</option>
                    </select>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Internal Reviewer Notes */}
              <div>
                <label className="lbl">Internal Reviewer & Moderation Notes (Private)</label>
                <textarea
                  rows={2}
                  className="field"
                  placeholder="Private verification details, lawyer check notes, not visible to the public"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>

              {/* Privacy Review Checklist */}
              <div className="bg-amber-50/70 p-4 rounded-md border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <ShieldCheck size={18} />
                  <span>Mandatory Privacy & Victim Protection Verification</span>
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-amber-950">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyChecks.minorProtected}
                      onChange={(e) =>
                        setPrivacyChecks({ ...privacyChecks, minorProtected: e.target.checked })
                      }
                    />
                    <span>Child / minor identity is completely protected</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyChecks.anonymizedTitle}
                      onChange={(e) =>
                        setPrivacyChecks({ ...privacyChecks, anonymizedTitle: e.target.checked })
                      }
                    />
                    <span>Title uses anonymized format for living victims</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyChecks.noPrivateAddress}
                      onChange={(e) =>
                        setPrivacyChecks({ ...privacyChecks, noPrivateAddress: e.target.checked })
                      }
                    />
                    <span>No personal phone, address, or sensitive details</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyChecks.nonSensationalist}
                      onChange={(e) =>
                        setPrivacyChecks({ ...privacyChecks, nonSensationalist: e.target.checked })
                      }
                    />
                    <span>Objective, respectful, non-sensational language</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 sm:p-6 border-t border-[#E4DED7] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !py-2 !px-4 text-sm"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="btn-ghost !py-2 !px-4 text-sm font-semibold"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="btn-primary !py-2 !px-5 text-sm font-semibold flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : 'Approve & Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
