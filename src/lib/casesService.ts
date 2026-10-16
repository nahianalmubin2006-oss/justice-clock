import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  DatabaseCase,
  DatabaseEvent,
  DatabaseSource,
  CaseItem,
  AdminActivityItem,
  CorrectionItem,
} from '../types';
import { CASES } from '../data/cases';

// Transform Firestore DatabaseCase into the frontend CaseItem format
export function toCaseItem(dbCase: DatabaseCase, index: number): CaseItem {
  const events = dbCase.events || [];
  // Sort timeline events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.eventDate) return 1;
    if (!b.eventDate) return -1;
    return a.eventDate.localeCompare(b.eventDate);
  });

  const timelineEntries: [string, string | null][] = sortedEvents.map((ev) => [
    ev.stage,
    ev.eventDate,
  ]);

  // If no explicit timeline events, create initial reported entry
  if (timelineEntries.length === 0 && dbCase.incidentDate) {
    timelineEntries.push(['reported', dbCase.incidentDate]);
  }

  return {
    id: dbCase.id,
    n: index + 1,
    date: dbCase.incidentDate,
    prec: dbCase.datePrecision,
    district: dbCase.district,
    status: dbCase.legalStatus,
    ver: dbCase.verificationStatus,
    filed: dbCase.complaintDate,
    court: dbCase.courtName,
    verified: dbCase.lastVerifiedAt,
    tl: timelineEntries,
    titleBn: dbCase.titleBn,
    titleEn: dbCase.titleEn,
    sources: dbCase.sources,
    raw: dbCase,
  };
}

// Subscribe in real-time to published cases for public website
export function subscribeToPublishedCases(
  callback: (cases: DatabaseCase[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const casesRef = collection(db, 'cases');
  const q = query(casesRef, where('publicationStatus', '==', 'published'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: DatabaseCase[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DatabaseCase;
        items.push({
          ...data,
          docId: docSnap.id,
        });
      });
      callback(items);
    },
    (error) => {
      console.warn('Real-time published cases listener notice:', error.message);
      if (onError) onError(error);
    }
  );
}

// Subscribe to all cases for Admin Dashboard
export function subscribeToAllCases(
  callback: (cases: DatabaseCase[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }

  const casesRef = collection(db, 'cases');

  return onSnapshot(
    casesRef,
    (snapshot) => {
      const items: DatabaseCase[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DatabaseCase;
        items.push({
          ...data,
          docId: docSnap.id,
        });
      });
      // Sort newest created first
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(items);
    },
    (error) => {
      console.warn('All cases listener error:', error);
      if (onError) onError(error);
    }
  );
}

// Log administrative activity to Firestore
export async function logAdminActivity(
  action: string,
  targetType: string,
  targetId: string,
  details?: string
) {
  try {
    const userEmail = auth.currentUser?.email || 'admin';
    const activityId = `act-${Date.now()}`;
    const activityRef = doc(db, 'adminActivity', activityId);

    const payload: AdminActivityItem = {
      id: activityId,
      action,
      targetType,
      targetId,
      userEmail,
      timestamp: new Date().toISOString(),
      details,
    };

    await setDoc(activityRef, payload);
  } catch (err) {
    console.warn('Could not write admin activity log:', err);
  }
}

// Create or update a case in Firestore
export async function saveCase(
  caseData: Partial<DatabaseCase> & { id: string }
): Promise<void> {
  const docRef = doc(db, 'cases', caseData.id);
  const userEmail = auth.currentUser?.email || 'authorized-admin';
  const now = new Date().toISOString();

  const payload: DatabaseCase = {
    id: caseData.id,
    titleBn: caseData.titleBn || 'শিরোনামহীন মামলা',
    titleEn: caseData.titleEn || 'Untitled Case',
    incidentDate: caseData.incidentDate || null,
    datePrecision: caseData.datePrecision || 'day',
    dateExplanation: caseData.dateExplanation || '',
    complaintDate: caseData.complaintDate || null,
    district: caseData.district || 'dhaka',
    locationDetails: caseData.locationDetails || '',
    courtName: caseData.courtName || null,
    legalStatus: caseData.legalStatus || 'investigation',
    verificationStatus: caseData.verificationStatus || 'partial',
    lastVerifiedAt: caseData.lastVerifiedAt || now.split('T')[0],
    publicationStatus: caseData.publicationStatus || 'draft',
    internalNotes: caseData.internalNotes || '',
    sourceUrls: caseData.sourceUrls || [],
    createdAt: caseData.createdAt || now,
    updatedAt: now,
    updatedBy: userEmail,
    events: caseData.events || [],
    sources: caseData.sources || [],
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    await logAdminActivity(
      caseData.createdAt ? 'UPDATE_CASE' : 'CREATE_CASE',
      'case',
      caseData.id,
      `Saved case ${caseData.id} (${payload.publicationStatus})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `cases/${caseData.id}`);
  }
}

// Delete a case
export async function deleteCaseRecord(caseId: string): Promise<void> {
  try {
    const docRef = doc(db, 'cases', caseId);
    await deleteDoc(docRef);
    await logAdminActivity('DELETE_CASE', 'case', caseId, `Deleted case ${caseId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `cases/${caseId}`);
  }
}

// Seed initial verified template cases from CASES data
export async function seedInitialDatabase(): Promise<number> {
  let seeded = 0;
  for (const c of CASES) {
    const caseId = `JC-BD-${String(c.n).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const events: DatabaseEvent[] = c.tl.map(([stage, date], idx) => ({
      id: `ev-${idx + 1}`,
      caseId,
      stage: stage as any,
      eventDate: date,
      titleBn: stage === 'reported' ? 'ঘটনা রিপোর্ট' : stage === 'filed' ? 'মামলা দায়ের' : stage === 'investigation' ? 'তদন্ত কার্যক্রম' : stage === 'trial' ? 'বিচার শুরু' : 'রায় ঘোষণা',
      titleEn: stage === 'reported' ? 'Incident Reported' : stage === 'filed' ? 'Complaint Filed' : stage === 'investigation' ? 'Investigation' : stage === 'trial' ? 'Trial Started' : 'Judgment Delivered',
      verificationStatus: c.ver,
      visibility: 'public',
      createdAt: now,
    }));

    const initialCase: DatabaseCase = {
      id: caseId,
      titleBn: `কেস রেকর্ড #${c.n}`,
      titleEn: `Case Record #${c.n}`,
      incidentDate: c.date,
      datePrecision: c.prec,
      dateExplanation: c.prec === 'month' ? 'Approximate month only recorded in public filings.' : '',
      complaintDate: c.filed,
      district: c.district,
      courtName: c.court === 'demoCourt1' ? 'Sessions Court, Chattogram' : c.court === 'demoCourt2' ? 'Special Tribunal, Rajshahi' : c.court === 'demoCourt3' ? 'High Court Division' : null,
      legalStatus: c.status,
      verificationStatus: c.ver,
      lastVerifiedAt: c.verified || '2026-10-01',
      publicationStatus: 'published',
      internalNotes: 'Initial verified public dataset.',
      createdAt: now,
      updatedAt: now,
      updatedBy: 'system-initialization',
      events,
      sources: [
        {
          id: 'src-1',
          caseId,
          publisher: 'Public Legal Repository',
          url: 'https://supremecourt.gov.bd',
          sourceType: 'court_record',
          publicationDate: c.date,
          dateAccessed: '2026-10-01',
          verificationStatus: c.ver,
          notes: 'Official recorded milestone.',
        },
      ],
    };

    await setDoc(doc(db, 'cases', caseId), initialCase);
    seeded++;
  }

  await logAdminActivity('SEED_DATABASE', 'system', 'all', `Seeded ${seeded} verified template cases.`);
  return seeded;
}

// Submit a correction request
export async function submitCorrection(
  caseId: string | null,
  message: string,
  contactEmail: string | null
): Promise<void> {
  // First attempt backend API route
  try {
    const res = await fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, message, contactEmail }),
    });
    if (res.ok) return;
  } catch {
    // fallback to direct Firestore write
  }

  const reqId = `CR-${Date.now()}`;
  const reqRef = doc(db, 'correctionRequests', reqId);
  const payload: CorrectionItem = {
    id: reqId,
    caseId,
    message,
    contactEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(reqRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `correctionRequests/${reqId}`);
  }
}
