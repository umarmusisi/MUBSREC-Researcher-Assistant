import fs from 'fs';
import path from 'path';

export interface StoredDocument {
  id: string;
  title: string;
  category: 'Protocol' | 'Consent' | 'Checklist' | 'Fee Schedule' | 'Guidelines' | 'Other';
  description: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  downloadCount: number;
  url: string;
  isOfficial: boolean;
}

export interface StoredKnowledgeEntry {
  id: string;
  title: string;
  category: 'General' | 'Submission' | 'Review Process' | 'Fees & Banking' | 'Post-Approval' | 'Contacts';
  keywords: string[];
  content: string;
  lastUpdated: string;
  author: string;
}

export interface FeedbackRecord {
  id: string;
  type: 'up' | 'down';
  messageId?: string;
  timestamp: string;
  note?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

// Ensure directories exist
export function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Init Admin Config
  if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
    fs.writeFileSync(
      ADMIN_CONFIG_FILE,
      JSON.stringify(
        {
          passcode: 'mubsrec2026',
          secretariatEmail: 'rec@mubs.ac.ug',
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
  }

  // Init Documents
  if (!fs.existsSync(DOCUMENTS_FILE)) {
    const initialDocs: StoredDocument[] = [
      {
        id: 'doc-protocol-template',
        title: 'MUBSREC Standard Research Protocol Submission Template',
        category: 'Protocol',
        description: 'Complete institutional protocol format including problem statement, methodology, ethical considerations, and risk mitigation plan.',
        fileName: 'mubsrec_standard_protocol_template.docx',
        originalName: 'MUBSREC_Standard_Protocol_Template.docx',
        fileSize: 48200,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2026-09-01',
        downloadCount: 142,
        url: '/api/documents/download/doc-protocol-template',
        isOfficial: true
      },
      {
        id: 'doc-consent-form',
        title: 'Participant Information Sheet & Informed Consent Form (ICF)',
        category: 'Consent',
        description: 'Standard institutional ICF template in plain language covering voluntary participation, confidentiality, risks, and compensation.',
        fileName: 'mubsrec_informed_consent_form.docx',
        originalName: 'MUBSREC_Informed_Consent_Form.docx',
        fileSize: 36400,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2026-09-01',
        downloadCount: 198,
        url: '/api/documents/download/doc-consent-form',
        isOfficial: true
      },
      {
        id: 'doc-assent-form',
        title: 'Minor Assent Form Template (Ages 8–17)',
        category: 'Consent',
        description: 'Simplified child/adolescent assent form required when recruiting participants under 18 years, accompanied by parental consent.',
        fileName: 'mubsrec_minor_assent_template.docx',
        originalName: 'MUBSREC_Minor_Assent_Template.docx',
        fileSize: 28900,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2026-09-02',
        downloadCount: 76,
        url: '/api/documents/download/doc-assent-form',
        isOfficial: true
      },
      {
        id: 'doc-resubmission-matrix',
        title: 'Protocol Resubmission Response Matrix Form',
        category: 'Checklist',
        description: 'Required 3-column response matrix for addressing minor or major committee revision comments in revised applications.',
        fileName: 'mubsrec_resubmission_response_matrix.docx',
        originalName: 'MUBSREC_Resubmission_Response_Matrix.docx',
        fileSize: 24100,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2026-09-02',
        downloadCount: 89,
        url: '/api/documents/download/doc-resubmission-matrix',
        isOfficial: true
      },
      {
        id: 'doc-fee-schedule',
        title: 'Official Review Fee Schedule & Stanbic Bank Slip Guide',
        category: 'Fee Schedule',
        description: 'Official schedule of ethics review fees by study category and step-by-step instructions for Stanbic Bank & URA PRN deposits.',
        fileName: 'mubsrec_fee_schedule_and_payment_guide.pdf',
        originalName: 'MUBSREC_Fee_Schedule_and_Payment_Guide.pdf',
        fileSize: 112000,
        fileType: 'application/pdf',
        uploadDate: '2026-09-03',
        downloadCount: 231,
        url: '/api/documents/download/doc-fee-schedule',
        isOfficial: true
      },
      {
        id: 'doc-close-out-report',
        title: 'Study Close-Out & Annual Continuing Review Form',
        category: 'Guidelines',
        description: 'Mandatory form for reporting study completion or applying for 1-year annual approval renewal before protocol expiration.',
        fileName: 'mubsrec_study_close_out_and_renewal_form.docx',
        originalName: 'MUBSREC_Study_Close_Out_and_Renewal_Form.docx',
        fileSize: 31500,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2026-09-03',
        downloadCount: 64,
        url: '/api/documents/download/doc-close-out-report',
        isOfficial: true
      }
    ];

    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(initialDocs, null, 2));

    // Ensure sample files exist in uploads
    initialDocs.forEach((doc) => {
      const filePath = path.join(UPLOADS_DIR, doc.fileName);
      if (!fs.existsSync(filePath)) {
        const dummyContent = `================================================================================
MAKERERE UNIVERSITY BUSINESS SCHOOL (MUBS)
RESEARCH ETHICS COMMITTEE (MUBSREC)
================================================================================
Document Title : ${doc.title}
Category       : ${doc.category}
Official Desk  : Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa
Contact Email  : rec@mubs.ac.ug
Contact Phone  : +256 414 338 120
================================================================================

DOCUMENT DESCRIPTION:
${doc.description}

INSTITUTIONAL GUIDELINES FOR USE:
1. Complete all required fields indicated in brackets [like this].
2. Ensure signatures are appended from the Principal Investigator and Department Supervisor.
3. Submit 2 spiral-bound physical copies to the Secretariat desk at FGSR, MUBS Nakawa.
4. Email your electronic digital package (PDF bundle) to rec@mubs.ac.ug.

For queries or assistance, contact the MUBSREC Secretariat during business hours.
================================================================================`;
        fs.writeFileSync(filePath, dummyContent);
      }
    });
  }

  // Init Knowledge Base
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    const initialKnowledge: StoredKnowledgeEntry[] = [
      {
        id: 'kb-uncst-accreditation',
        title: 'MUBSREC Institutional Accreditation & UNCST Mandate',
        category: 'General',
        keywords: ['uncst', 'accreditation', 'mandate', 'national clearance', 'approval'],
        content: 'MUBSREC is formally accredited by the Uganda National Council for Science and Technology (UNCST). Following ethical approval from MUBSREC, all researchers must proceed to register with UNCST and obtain the national research clearance permit from the Research Secretariat before initiating field data collection.',
        lastUpdated: '2026-09-04',
        author: 'Secretariat Admin'
      },
      {
        id: 'kb-expedited-criteria',
        title: 'Expedited Review Eligibility for Student Dissertations',
        category: 'Review Process',
        keywords: ['expedited', 'eligibility', 'minimal risk', 'business studies', 'mba', 'msc'],
        content: 'Most business, management, finance, and social sciences dissertations qualify for Expedited Review if participant risk is minimal (risk not greater than that encountered in daily life). Expedited applications are evaluated by two designated reviewers with a typical turnaround time of 2 to 3 weeks.',
        lastUpdated: '2026-09-04',
        author: 'Secretariat Admin'
      },
      {
        id: 'kb-hard-copy-submission',
        title: 'Submission Formats: Dual Hard Copy and Digital Electronic Copy',
        category: 'Submission',
        keywords: ['submission', 'copies', 'spiral bound', 'fgsr', 'electronic copy', 'pdf'],
        content: 'Researchers must submit two (2) spiral-bound physical copies of their complete dossier to the MUBSREC Secretariat office located in the Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Main Campus. Concurrently, email the consolidated digital PDF dossier to rec@mubs.ac.ug.',
        lastUpdated: '2026-09-04',
        author: 'Secretariat Admin'
      },
      {
        id: 'kb-fee-exemption-policy',
        title: 'Fee Payment Guidelines & Account Verification',
        category: 'Fees & Banking',
        keywords: ['fees', 'stanbic', 'bank slip', 'prn', 'waiver', 'ugx'],
        content: 'Ethics review fees are mandatory and non-refundable. They cover protocol processing, external independent reviewers, and institutional oversight. Payments are remitted to Stanbic Bank Uganda (Account Name: Makerere University Business School - Research Ethics Committee, Account No: 9030012345678). The stamped bank slip must be submitted alongside the application.',
        lastUpdated: '2026-09-04',
        author: 'Secretariat Admin'
      },
      {
        id: 'kb-consent-translation',
        title: 'Informed Consent Translation and Sworn Certification',
        category: 'Submission',
        keywords: ['translation', 'luganda', 'language', 'certificate', 'consent'],
        content: 'Whenever study participants include non-English speakers (such as informal traders, community members, or artisans), all participant-facing instruments (Information Sheet, ICF, interview questionnaires) must be translated into the local language (predominantly Luganda). A signed Certificate of Translation from a university language department or certified translator must be appended.',
        lastUpdated: '2026-09-04',
        author: 'Secretariat Admin'
      }
    ];
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(initialKnowledge, null, 2));
  }

  // Init Feedback
  if (!fs.existsSync(FEEDBACK_FILE)) {
    const initialFeedback: FeedbackRecord[] = [
      { id: 'fb-1', type: 'up', timestamp: '2026-09-04T08:45:00.000Z', note: 'Clear submission guidance' },
      { id: 'fb-2', type: 'up', timestamp: '2026-09-04T08:50:00.000Z', note: 'Fast template information' },
      { id: 'fb-3', type: 'up', timestamp: '2026-09-04T09:12:00.000Z', note: 'Helpful fee details' },
      { id: 'fb-4', type: 'up', timestamp: '2026-09-04T10:05:00.000Z', note: 'Accurate office directions' }
    ];
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(initialFeedback, null, 2));
  }
}

// Documents operations
export function getDocuments(): StoredDocument[] {
  try {
    const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function saveDocuments(docs: StoredDocument[]) {
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2));
}

export function addDocument(doc: StoredDocument): StoredDocument {
  const docs = getDocuments();
  docs.unshift(doc);
  saveDocuments(docs);
  return doc;
}

export function deleteDocument(id: string): boolean {
  const docs = getDocuments();
  const index = docs.findIndex((d) => d.id === id);
  if (index === -1) return false;

  const doc = docs[index];
  docs.splice(index, 1);
  saveDocuments(docs);

  // Attempt to delete physical file if not initial sample or if exists
  try {
    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Could not delete physical file:', err);
  }

  return true;
}

export function incrementDocumentDownload(id: string): StoredDocument | null {
  const docs = getDocuments();
  const doc = docs.find((d) => d.id === id);
  if (!doc) return null;
  doc.downloadCount = (doc.downloadCount || 0) + 1;
  saveDocuments(docs);
  return doc;
}

// Knowledge operations
export function getKnowledgeEntries(): StoredKnowledgeEntry[] {
  try {
    const data = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function saveKnowledgeEntries(entries: StoredKnowledgeEntry[]) {
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(entries, null, 2));
}

export function addKnowledgeEntry(entry: StoredKnowledgeEntry): StoredKnowledgeEntry {
  const entries = getKnowledgeEntries();
  entries.unshift(entry);
  saveKnowledgeEntries(entries);
  return entry;
}

export function updateKnowledgeEntry(id: string, updated: Partial<StoredKnowledgeEntry>): StoredKnowledgeEntry | null {
  const entries = getKnowledgeEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  entries[index] = {
    ...entries[index],
    ...updated,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  saveKnowledgeEntries(entries);
  return entries[index];
}

export function deleteKnowledgeEntry(id: string): boolean {
  const entries = getKnowledgeEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return false;
  entries.splice(index, 1);
  saveKnowledgeEntries(entries);
  return true;
}

export function searchCustomKnowledge(query: string): StoredKnowledgeEntry[] {
  const entries = getKnowledgeEntries();
  const lower = query.toLowerCase();
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      e.content.toLowerCase().includes(lower) ||
      e.keywords.some((k) => lower.includes(k.toLowerCase()))
  );
}

// Admin passcode verification
export function verifyAdminPasscode(inputPasscode: string): boolean {
  try {
    if (!fs.existsSync(ADMIN_CONFIG_FILE)) return inputPasscode === 'mubsrec2026';
    const config = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
    return config.passcode === inputPasscode.trim();
  } catch {
    return inputPasscode === 'mubsrec2026';
  }
}

export function updateAdminPasscode(currentPasscode: string, newPasscode: string): boolean {
  if (!verifyAdminPasscode(currentPasscode)) return false;
  try {
    const config = fs.existsSync(ADMIN_CONFIG_FILE)
      ? JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'))
      : { secretariatEmail: 'rec@mubs.ac.ug' };

    config.passcode = newPasscode.trim();
    config.updatedAt = new Date().toISOString();
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch {
    return false;
  }
}

// Feedback stats
export function recordFeedback(type: 'up' | 'down', messageId?: string, note?: string): FeedbackRecord {
  let records: FeedbackRecord[] = [];
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      records = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    }
  } catch {
    records = [];
  }

  const record: FeedbackRecord = {
    id: `fb-${Date.now()}`,
    type,
    messageId,
    timestamp: new Date().toISOString(),
    note
  };

  records.unshift(record);
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(records, null, 2));
  return record;
}

export function getFeedbackStats() {
  let records: FeedbackRecord[] = [];
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      records = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    }
  } catch {
    records = [];
  }

  const total = records.length;
  const up = records.filter((r) => r.type === 'up').length;
  const down = records.filter((r) => r.type === 'down').length;
  const satisfaction = total > 0 ? Math.round((up / total) * 100) : 100;

  return {
    total,
    thumbsUp: up,
    thumbsDown: down,
    satisfactionRate: satisfaction,
    recentFeedback: records.slice(0, 10)
  };
}
