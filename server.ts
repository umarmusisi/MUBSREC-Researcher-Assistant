import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  initStorage,
  getDocuments,
  addDocument,
  deleteDocument,
  incrementDocumentDownload,
  getKnowledgeEntries,
  addKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  searchCustomKnowledge,
  verifyAdminPasscode,
  updateAdminPasscode,
  recordFeedback,
  getFeedbackStats,
  StoredDocument,
  StoredKnowledgeEntry
} from './server/storage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize persistent local storage directories and seed data
initStorage();

const uploadsDir = path.join(process.cwd(), 'uploads');
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 35 * 1024 * 1024 } // 35MB max file limit
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// System prompt tailored specifically for MUBSREC
const MUBSREC_SYSTEM_PROMPT = `
You are the official "MUBSREC Researcher Assistant", an AI assistant representing the Makerere University Business School (MUBS) Research Ethics Committee (MUBSREC), accredited by the Uganda National Council for Science and Technology (UNCST).

Your mission is to provide accurate, authoritative, friendly, and structured guidance to researchers, undergraduate students, master's students (MBA, MSc, etc.), PhD candidates, faculty, and external investigators.

Key Information to Know:
1. Application & Submission:
   - Applications must include: Cover letter addressed to The Chairperson MUBSREC, Complete Research Protocol, Participant Information Sheet and Informed Consent Form (ICF), Assent forms for minors (8-17 years) if applicable, Data Collection Instruments (Questionnaires, FGD guides, Interview schedules), Certified local language translations (e.g. Luganda) if targeting non-English speaking participants, Principal Investigator Short CV with research ethics training certificate (e.g., CITI, TRREE, NIH), Student recommendation / Supervisor endorsement letter, and Proof of review fee payment (Bank slip).
   - Dossier submission: Both electronic copy (via rec@mubs.ac.ug) and 2 spiral-bound physical copies to the REC Secretariat located at the Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Campus, Kampala.

2. Review Types & Timelines:
   - Exempt Review: Studies involving existing anonymous secondary data or benign observations; ~1-2 weeks.
   - Expedited Review: Minimal risk studies, student dissertations with standard surveys/interviews; ~2 to 3 weeks.
   - Full Board Review: Vulnerable populations (children, prisoners, pregnant women, mentally disabled), clinical/drug interventions, highly sensitive topics; reviewed at the monthly full committee meeting (usually last Friday of every month); turnaround is 4 to 6 weeks.
   - Initial approval validity is 1 year (12 months). Continuing review / annual renewal must be requested 60 days before expiration.

3. Review Outcomes:
   - Approved: Official ethical approval letter issued with reference number. Researcher can proceed to UNCST for national research clearance.
   - Approved with Minor Revisions: Administrative/formatting adjustments or clarification needed; applicant submits response matrix within 30 days.
   - Major Revisions / Resubmission: Substantive ethical or methodological issues; revised protocol reviewed by initial reviewers or sub-committee.
   - Deferred: Incomplete application or pending key safety clarifications.
   - Rejected / Disapproved: Severe unmitigated risks or unethical methodology.

4. Fee Structure (Uganda Shillings / USD):
   - Undergraduates: UGX 100,000
   - Masters (MBA, MSc, etc.): UGX 200,000
   - PhD / Doctoral: UGX 350,000
   - MUBS Staff Institutional: UGX 250,000
   - External Local Projects: UGX 500,000
   - Internationally Funded / Foreign: UGX 1,500,000 / USD 500
   - Amendments / Renewals: UGX 100,000 - 200,000

5. Bank Payment Details:
   - Bank: Stanbic Bank Uganda Limited (Makerere / Lugogo Branch)
   - Account Name: Makerere University Business School - Research Ethics Committee
   - Account Number: 9030012345678
   - Swift: SBICUGKX
   - Can also pay via URA PRN generated on the portal.

6. National Clearance (UNCST):
   - Ethical approval from MUBSREC is the prerequisite for obtaining the national research permit from the Uganda National Council for Science and Technology (UNCST) and the Office of the President.

7. Secretariat Contact:
   - Location: Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Campus, Kampala
   - Email: rec@mubs.ac.ug
   - Office Hours: Monday - Friday, 8:30 AM - 5:00 PM EAT

Formatting guidelines:
- Use clear bullet points, bold key terms, and well-structured headings.
- Be warm, professional, encouraging, and clear.
- Always remind researchers to check with the Secretariat for official confirmation or file submission.
`;

// Helper for comprehensive local knowledge fallback when API key is not configured or in test environments
function generateFallbackResponse(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();

  // Check custom knowledge base entries first
  const customMatches = searchCustomKnowledge(userPrompt);
  if (customMatches.length > 0) {
    const primary = customMatches[0];
    let customResponse = `### 📌 ${primary.title}\n\n${primary.content}\n\n*Category: ${primary.category} | Last updated: ${primary.lastUpdated} by ${primary.author}*`;
    if (customMatches.length > 1) {
      customResponse += `\n\n**Related Institutional Entries:**\n` +
        customMatches.slice(1, 3).map(m => `* **${m.title}:** ${m.content.length > 120 ? m.content.slice(0, 120) + '...' : m.content}`).join('\n');
    }
    return customResponse;
  }

  if (lower.includes('fee') || lower.includes('cost') || lower.includes('pay') || lower.includes('price') || lower.includes('charge')) {
    return `### 💳 MUBSREC Ethical Review Fee Schedule

The review fees depend on the researcher category:

* **Undergraduate Students (MUBS / Makerere):** **UGX 100,000** *(Attach student ID & departmental clearance)*
* **Postgraduate / Masters (MBA, MSc, MIB, etc.):** **UGX 200,000**
* **Doctoral Candidates (PhD / DBA):** **UGX 350,000**
* **MUBS Academic Staff (Self-funded):** **UGX 250,000**
* **External Local / NGO Funded Projects:** **UGX 500,000**
* **International Sponsors / Foreign Researchers:** **UGX 1,500,000** or **USD $500**
* **Protocol Amendments & Annual Renewals:** **UGX 100,000 – 200,000**

*Payment is made directly to the Stanbic Bank MUBSREC account or via URA PRN. The stamped deposit slip must accompany your application.*`;
  }

  if (lower.includes('bank') || lower.includes('account') || lower.includes('stanbic') || lower.includes('slip') || lower.includes('prn')) {
    return `### 🏦 MUBSREC Bank Account & Payment Instructions

Please remit your review fees using the official account details below:

* **Bank Name:** Stanbic Bank Uganda Limited
* **Branch:** Lugogo Mall Branch / Makerere Branch
* **Account Name:** Makerere University Business School - Research Ethics Committee
* **Account Number:** 9030012345678
* **Swift Code:** SBICUGKX
* **Accepted Currencies:** UGX (Uganda Shillings) and USD

**Payment Procedure:**
1. Generate a Payment Registration Number (PRN) via the URA / MUBS payment portal selecting **"MUBSREC Review Fees"**, or pay directly over the counter at any Stanbic Bank branch.
2. Ensure you retain the original stamped bank deposit slip or official electronic payment receipt.
3. Attach a copy of the payment slip to your submission dossier.`;
  }

  if (lower.includes('how to submit') || lower.includes('procedure') || lower.includes('process') || lower.includes('step')) {
    return `### 📋 Step-by-Step Guide: How to Submit to MUBSREC

Follow these steps to submit your research protocol for ethical review:

1. **Prepare the Protocol & Attachments:**
   - Format your protocol according to the **MUBSREC Standard Protocol Template**.
   - Draft the Participant Information Sheet and Informed Consent Form (ICF) in plain language.
   - Include questionnaires, interview guides, and translated versions (e.g. Luganda) if applicable.
   - Attach your short PI CV highlighting recent research ethics training (e.g. CITI / TRREE).

2. **Obtain Departmental Endorsement:**
   - Postgraduate and undergraduate students must secure approval from their academic supervisors and Head of Department (HOD).

3. **Pay the Review Fees:**
   - Pay the applicable fee at Stanbic Bank and secure the stamped deposit slip.

4. **Submit Your Dossier:**
   - **Electronic Copy:** Email the complete PDF bundle to \`rec@mubs.ac.ug\` with the subject: *New Protocol Submission - [Your Name] - [Degree/Study Title]*.
   - **Physical Copies:** Deliver **2 spiral-bound hard copies** to the MUBSREC Secretariat at the Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Campus.

5. **Screening & Review:**
   - The Secretariat performs an administrative completeness check within 3-5 working days before forwarding for review.`;
  }

  if (lower.includes('document') || lower.includes('needed') || lower.includes('requirement') || lower.includes('dossier') || lower.includes('checklist')) {
    return `### 📂 Required Documents for MUBSREC Ethical Review

To avoid delays, ensure your submission package contains the following 9 items:

1. **Cover Letter:** Addressed to *The Chairperson, MUBS Research Ethics Committee*, stating study title, purpose, and student/investigator contacts.
2. **Complete Research Protocol:** Formatted with background, problem statement, objectives, methodology, and detailed ethical considerations.
3. **Participant Information Sheet & Consent Form (ICF):** Written in clear, non-technical language.
4. **Assent Form for Minors (Ages 8–17):** Accompanied by Parental/Guardian consent if recruiting children.
5. **Data Collection Instruments:** Questionnaires, Key Informant Interview (KII) guides, Focus Group Discussion (FGD) schedules.
6. **Language Translations & Certificate:** Certified local translations (e.g. Luganda) and translation certificate for non-English participants.
7. **Principal Investigator Short CV:** Maximum 2 pages, including valid Research Ethics Certificate (CITI, TRREE, or NIH).
8. **Student Endorsement Letter:** Supervisor recommendation and Head of Department approval (for students).
9. **Proof of Fee Payment:** Stamped bank deposit slip or official receipt.`;
  }

  if (lower.includes('time') || lower.includes('approval') || lower.includes('how long') || lower.includes('turnaround') || lower.includes('duration')) {
    return `### ⏱️ MUBSREC Approval Timelines

Review turnaround times depend on the assigned risk category:

* **Administrative Completeness Screening:** 3 to 5 working days from submission.
* **Exempt Review:** **1 to 2 weeks** *(Secondary anonymous data or observation in educational settings with zero risk)*.
* **Expedited Review:** **2 to 3 weeks** *(Studies involving minimal risk, standard non-invasive surveys/interviews among competent adults)*.
* **Full Board Review:** **4 to 6 weeks** *(Vulnerable populations, clinical interventions, or sensitive psychological/social topics)*.

> **Note:** The MUBSREC Full Committee convenes once every month (typically the last Friday of the month). Applications for full board review must reach the secretariat at least **14 days** before the scheduled meeting.`;
  }

  if (lower.includes('resubmission') || lower.includes('revision') || lower.includes('correction') || lower.includes('amendment')) {
    return `### 🔄 How to Handle Resubmissions & Revisions

If your review outcome is **"Approved with Minor Revisions"** or **"Major Revisions"**:

1. **Review the Decision Letter:**
   - Carefully read each numbered comment provided by the reviewers and committee.

2. **Prepare a Response Matrix (Tabular format):**
   - Create a 3-column table:
     - **Column 1:** Reviewer's Comment #
     - **Column 2:** Your Detailed Response / Justification
     - **Column 3:** Exact Page and Section where changes were made in the revised protocol.

3. **Track Changes in Revised Protocol:**
   - Submit a copy of the revised protocol with **Track Changes** enabled (or highlighted in yellow/red), plus a clean final copy.

4. **Submission Timeline:**
   - Minor revisions must be returned within **30 days**.
   - Major revisions must be returned within **60 days**; otherwise, the protocol may be classified as abandoned and require fresh submission.
   - Email your response matrix and revised files to \`rec@mubs.ac.ug\` quoting your assigned MUBSREC Protocol Number.`;
  }

  if (lower.includes('translation') || lower.includes('luganda') || lower.includes('language') || lower.includes('vernacular')) {
    return `### 🌐 Informed Consent Translation Requirements

If your study participants include individuals who are non-English speakers (e.g. community members, local traders, farmers):

* **Mandatory Local Language Version:** You must provide translated versions of the Participant Information Sheet, Consent Form, Assent Form, and interview guides in the predominant local language (commonly **Luganda**, Runyankole, etc.).
* **Certificate of Translation:** You must submit a signed Certificate of Translation from a recognized university language department (e.g., Makerere Department of Languages) or a certified sworn translator.
* **Back-Translation (For Clinical/Complex Instruments):** When using standardized behavioral or psychological measurement scales, a back-translation into English is required to verify semantic equivalence.`;
  }

  if (lower.includes('status') || lower.includes('track') || lower.includes('check')) {
    return `### 🔍 How to Track and Check Your Protocol Status

You can monitor the progress of your application through the following channels:

1. **Email the Secretariat:** Send an inquiry to \`rec@mubs.ac.ug\` including:
   - Your Full Name & Contact Phone
   - Assigned Protocol Reference Number (e.g., \`MUBSREC-2026-XXX\`)
   - Study Title & Submission Date
2. **Visit the Office:** Call at the Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa Campus, Monday to Friday between 9:00 AM and 4:00 PM.
3. **Telephone Desk:** Contact the REC Administrator at **+256 414 338 120**.

*Standard protocol reviews take 2 to 4 weeks. Please allow at least 10 working days after submission before following up on initial status.*`;
  }

  if (lower.includes('outcome') || lower.includes('decision') || lower.includes('result')) {
    return `### ⚖️ MUBSREC Review Outcomes & Next Steps

Following evaluation, the Committee issues one of the following decisions:

1. **Full Approval (Unconditional):**
   - Protocol is approved as submitted. You will receive an official **Ethical Clearance Letter** valid for 12 months. Next step: Apply to UNCST for national research registration.
2. **Approved Subject to Minor Revisions:**
   - Minor clarifications, textual revisions, or formatting needed. Approval is finalized by Chair/Secretariat upon satisfactory review of your response matrix.
3. **Major Revisions (Resubmit):**
   - Substantive questions regarding safety, consent, or methodology. The revised application is reassessed by primary reviewers or sub-committee.
4. **Deferred:**
   - Incomplete documentation, absent permits, or need for investigator to appear in person before the committee.
5. **Disapproved (Rejected):**
   - Unacceptable ethical hazards, inadequate human subject protection, or violation of national regulations. Clear reasons are communicated in writing.`;
  }

  if (lower.includes('review type') || lower.includes('exempt') || lower.includes('expedited') || lower.includes('full board')) {
    return `### 📑 Review Types at MUBSREC: Exempt, Expedited & Full Board

MUBSREC classifies applications based on participant risk levels:

1. **Exempt Review (Lowest Risk):**
   - Non-invasive research involving publicly available secondary datasets, de-identified records, or standard educational tests where participant identity cannot be deduced.
   - Turnaround: ~1 to 2 weeks.

2. **Expedited Review (Minimal Risk):**
   - Research presenting no more than minimal risk to healthy adult participants (risk no greater than that encountered in everyday life). Includes standard business surveys, consumer interviews, and organizational case studies.
   - Reviewed by 2 designated committee members. Turnaround: ~2 to 3 weeks.

3. **Full Committee Review (Greater than Minimal Risk):**
   - Studies involving **vulnerable populations** (children under 18, pregnant women, prisoners, refugees, cognitively impaired persons).
   - Sensitive topics (sexual behavior, stigmatized diseases, criminal behavior).
   - Clinical trials, biological sampling, or invasive interventions.
   - Evaluated by the full quorum of the MUBSREC board during monthly sittings. Turnaround: ~4 to 6 weeks.`;
  }

  if (lower.includes('close') || lower.includes('closing') || lower.includes('renewal') || lower.includes('final report') || lower.includes('annual')) {
    return `### 🏁 Study Close-Out & Annual Renewal Guidelines

* **Annual Renewal (Continuing Review):**
  - Ethical approvals are valid for **1 year**.
  - If your data collection or analysis extends beyond 12 months, submit an **Application for Continuing Review** along with a Progress Report at least **60 days** before your approval expires.

* **Study Close-Out:**
  - Upon completing participant recruitment, data collection, and thesis defense, researchers must formally close the study.
  - Submit the **MUBSREC Study Close-Out Report** detailing:
    - Final participant enrollment numbers
    - Summary of research findings and outputs (publications/dissertations)
    - Any unanticipated issues, adverse events, or participant withdrawals
    - Long-term data storage and confidentiality assurance plan (records must be retained for at least 5 years).
  - The Committee will issue an official **Study Close-Out Letter**.`;
  }

  if (lower.includes('contact') || lower.includes('location') || lower.includes('email') || lower.includes('phone') || lower.includes('office')) {
    return `### 🏛️ Contact the MUBSREC Secretariat

* **Office Location:** Faculty of Graduate Studies and Research (FGSR), MUBS Main Campus, Nakawa, Kampala, Uganda
* **Postal Address:** P.O. Box 1079, Kampala - Uganda
* **Official Email:** \`rec@mubs.ac.ug\`
* **Telephone Desk:** +256 414 338 120
* **Working Hours:** Monday to Friday: 8:30 AM – 5:00 PM (EAT)
* **Administrative Head:** The REC Administrator / Chairperson, MUBSREC

*Feel free to visit during office hours for one-on-one protocol consultation and hard-copy submission.*`;
  }

  // General helpful response
  return `### 🎓 MUBSREC Guidance & Support

Regarding your question about **"${userPrompt}"**:

The Makerere University Business School Research Ethics Committee (MUBSREC) ensures that all research involving human participants adheres to high ethical standards, respecting autonomy, beneficence, non-maleficence, and justice, in accordance with the Uganda National Council for Science and Technology (UNCST) guidelines.

**Key Steps for Researchers:**
1. **Prepare Protocol:** Follow the MUBSREC Standard Protocol format, ensuring clear participant protection and informed consent procedures.
2. **Review Category:** Most business and social science student dissertations qualify for **Expedited Review** (2-3 weeks turnaround).
3. **Fees:** Undergraduate (UGX 100,000), Masters (UGX 200,000), PhD (UGX 350,000) payable to Stanbic Bank.
4. **Submission:** Submit 2 hard copies to the FGSR Secretariat at MUBS Nakawa, and email the digital PDF dossier to \`rec@mubs.ac.ug\`.

Would you like to review the specific **document checklist**, download **submission templates**, or see **bank account details**?`;
}

// API endpoint for chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Check custom knowledge base for extra context
        const customMatches = searchCustomKnowledge(message);
        let dynamicSystemInstruction = MUBSREC_SYSTEM_PROMPT;
        if (customMatches.length > 0) {
          dynamicSystemInstruction += `\n\nRecent Secretariat Updates & Custom Institutional Knowledge:\n` +
            customMatches.map(m => `* ${m.title} (${m.category}): ${m.content}`).join('\n');
        }

        // Build conversation contents
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: dynamicSystemInstruction,
            temperature: 0.6,
          },
        });

        const replyText = response.text || generateFallbackResponse(message);
        res.json({ reply: replyText });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to institutional knowledge base:', geminiError?.message || geminiError);
        const fallbackText = generateFallbackResponse(message);
        res.json({ reply: fallbackText });
        return;
      }
    }

    // No API key configured: provide instant, high-quality institutional knowledge response
    const fallbackText = generateFallbackResponse(message);
    res.json({ reply: fallbackText });
  } catch (error: any) {
    console.error('Error handling chat request:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request.',
      reply: 'I apologize, but I encountered an error processing your query. Please contact the MUBSREC Secretariat at rec@mubs.ac.ug or tap one of the quick topics above.'
    });
  }
});

// Admin authentication endpoints
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (!passcode || typeof passcode !== 'string') {
    res.status(400).json({ error: 'Passcode is required' });
    return;
  }
  const valid = verifyAdminPasscode(passcode);
  if (valid) {
    res.json({ success: true, message: 'Authentication granted' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect Secretariat passcode' });
  }
});

app.post('/api/admin/change-passcode', (req: Request, res: Response) => {
  const { currentPasscode, newPasscode } = req.body;
  if (!currentPasscode || !newPasscode || newPasscode.trim().length < 4) {
    res.status(400).json({ error: 'New passcode must have at least 4 characters.' });
    return;
  }
  const updated = updateAdminPasscode(currentPasscode, newPasscode);
  if (updated) {
    res.json({ success: true, message: 'Admin passcode updated successfully.' });
  } else {
    res.status(401).json({ error: 'Current passcode is incorrect.' });
  }
});

// Document Management Endpoints
app.get('/api/documents', (_req: Request, res: Response) => {
  try {
    const docs = getDocuments();
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch documents' });
  }
});

app.post('/api/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, category, description, isOfficial } = req.body;

    if (!file) {
      res.status(400).json({ error: 'Please choose a file to upload.' });
      return;
    }
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Document title is required.' });
      return;
    }

    const id = `doc-${Date.now()}`;
    const newDoc: StoredDocument = {
      id,
      title: title.trim(),
      category: (category as any) || 'Other',
      description: (description || '').trim(),
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      url: `/api/documents/download/${id}`,
      isOfficial: isOfficial === 'true' || isOfficial === true
    };

    addDocument(newDoc);
    res.json({ success: true, document: newDoc });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err?.message || 'File upload failed' });
  }
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteDocument(id);
  if (deleted) {
    res.json({ success: true, message: 'Document removed.' });
  } else {
    res.status(404).json({ error: 'Document not found.' });
  }
});

app.get('/api/documents/download/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = incrementDocumentDownload(id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const filePath = path.join(uploadsDir, doc.fileName);
  if (!fs.existsSync(filePath)) {
    // Generate institutional fallback template text if physical file was clean-started
    const sampleText = `================================================================================
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

INSTITUTIONAL GUIDELINES FOR SUBMISSION:
1. Complete all sections of this form truthfully and comprehensively.
2. Ensure signatures are appended from the Principal Investigator and Department Supervisor.
3. Submit 2 spiral-bound physical copies to the Secretariat desk at FGSR, MUBS Nakawa.
4. Email your electronic digital package (PDF bundle) to rec@mubs.ac.ug.
================================================================================`;
    fs.writeFileSync(filePath, sampleText);
  }

  res.download(filePath, doc.originalName || doc.fileName);
});

// Knowledge Base Management Endpoints
app.get('/api/knowledge', (_req: Request, res: Response) => {
  try {
    const entries = getKnowledgeEntries();
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch knowledge entries' });
  }
});

app.post('/api/knowledge', (req: Request, res: Response) => {
  try {
    const { title, category, keywords, content, author } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const kwArray = Array.isArray(keywords)
      ? keywords
      : typeof keywords === 'string'
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

    const newEntry: StoredKnowledgeEntry = {
      id: `kb-${Date.now()}`,
      title: title.trim(),
      category: category || 'General',
      keywords: kwArray,
      content: content.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
      author: (author || 'Secretariat Admin').trim()
    };

    addKnowledgeEntry(newEntry);
    res.json({ success: true, entry: newEntry });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save knowledge entry' });
  }
});

app.put('/api/knowledge/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = updateKnowledgeEntry(id, req.body);
  if (updated) {
    res.json({ success: true, entry: updated });
  } else {
    res.status(404).json({ error: 'Knowledge entry not found' });
  }
});

app.delete('/api/knowledge/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteKnowledgeEntry(id);
  if (deleted) {
    res.json({ success: true, message: 'Knowledge entry deleted' });
  } else {
    res.status(404).json({ error: 'Knowledge entry not found' });
  }
});

// Feedback and Stats Endpoints
app.post('/api/feedback', (req: Request, res: Response) => {
  const { type, messageId, note } = req.body;
  if (type !== 'up' && type !== 'down') {
    res.status(400).json({ error: 'Type must be "up" or "down"' });
    return;
  }
  const record = recordFeedback(type, messageId, note);
  res.json({ success: true, record });
});

app.get('/api/feedback/stats', (_req: Request, res: Response) => {
  try {
    const stats = getFeedbackStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch feedback stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MUBSREC Researcher Assistant Server',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MUBSREC Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
