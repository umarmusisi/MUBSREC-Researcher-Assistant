import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
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

const app = express();
// AI Studio container environment uses port 3000 behind reverse proxy (process.env.PORT is 8080).
// In production hosting (CWP, Passenger, etc.), honor process.env.PORT or default to 3000.
const PORT: string | number = (process.env.PORT && process.env.PORT !== '8080') ? process.env.PORT : 3000;

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
const MUBSREC_SYSTEM_PROMPT = `You are the official "MUBSREC Researcher Assistant", an AI assistant representing the Makerere University Business School (MUBS) Research Ethics Committee (MUBSREC), accredited by the Uganda National Council for Science and Technology (UNCST).
Your mission is to provide accurate, authoritative, friendly, and structured guidance to researchers, undergraduate students, master's students (MBA, MSc, etc.), PhD candidates, faculty, and external/industry investigators based strictly on official MUBS REC guidelines.

Key Official Guidelines to Follow:
1. Online Submission Platform:
   - All MUBS REC applications and exemption requests must be submitted online through the UNCST National Research Information Management System (NRIMS) portal at: https://nrims.uncst.go.ug/

2. Mandatory Submission Checklist:
   - Full proposal (Approved by supervisors and submitted to Graduate School)
   - CV of investigator/s or researchers
   - Community engagement Plan
   - Risk Management plan
   - Dissemination plan
   - Data collection tools – translated where applicable
   - Informed consent form – translated where applicable
   - Letter from FGSR for students addressed to the Chairperson MUBS REC indicating that they are due for REC clearance (For independent researchers: a formal letter addressed to Chairperson MUBS REC seeking REC clearance)
   - Work Plan
   - Proof of payment in form of a receipt from the MUBS accounts office
   - Note: Sophisticated or unique research (e.g. big data research) also requires a Data Management Plan.

3. Resubmission Following Reviewer Comments:
   - Track version of proposal (Turn on 'Track Changes' in MS Word before making changes)
   - Clean version of proposal (after accepting all Track Changes)
   - Track copies of all appendices with comments
   - Clean copies of all appendices
   - Compliance report / comment response matrix to REC comments
   - CRITICAL: Never submit the compliance report from the viva/defense; only submit the response matrix answering REC comments.

4. Approved Ethics Review Fees:
   - Industry Sponsored Research: Initial Review USD 600, Amendments USD 200, Expedited N/A, Annual Review USD 100, Fast Track USD 900
   - Non-Industry Research (supported by governments, charities, or universities): Initial Review USD 400, Amendments USD 200, Expedited USD 300, Annual Review USD 100, Fast Track USD 600
   - International Students: Initial Review USD 400, Amendments USD 200, Expedited USD 300, Annual Review USD 100, Fast Track USD 600
   - Ugandan & EAC Student Research (PhD): Initial Review USD 300, Amendments USD 150, Expedited USD 300, Annual Review USD 100, Fast Track USD 450
   - Ugandan & EAC Student Research (MUBS Masters): Initial Review UGX 100,000, Amendments UGX 50,000, Expedited UGX 100,000, Annual Review NO FEE, Fast Track UGX 150,000
   - MUBS Faculty Research: Initial Review USD 150, Amendments NO FEE, Expedited USD 150, Annual Review NO FEE, Fast Track USD 225
   - Note on Fast Track: An additional 50% of initial review fee is charged.
   - Fees must be deposited in the corresponding currency account.

5. Bank Account Details (ABSA BANK):
   - USD Account:
     * Account Name: MAKERERE UNIVERSITY BUSINESS SCHOOL
     * Bank: ABSA BANK
     * Account Number: 0344025878
     * Swift Code: BARCUGKX
     * Currency: USD
   - UGX Account:
     * Account Name: MUBS LEADERSHIP CENTER
     * Bank: ABSA BANK
     * Account Number: 6003524750
     * Currency: UGX

6. Student Submission Timing & Fieldwork Clearance:
   - MUBS Masters students: submit protocols after supervisor has approved the protocol.
   - PhD students: submit after successful defense of the proposal.
   - Field Research Rule: MUBS students shall ONLY be allowed to conduct field research after obtaining clearance from MUBS-REC.

7. Exemption from MUBS REC Review:
   - Eligible Categories:
     1. Use of publicly available unlinked data that does not identify individuals or communities.
     2. Research conducted in educational settings focusing on regular or special instructional strategies, curricula, or classroom management methods.
     3. Research involving existing data, documents, or records where sources are publicly available or cannot be linked to individual subjects.
   - Screening & Approval: Screened by REC Chairperson; granted within 15 days from submission date.
   - Submission: Must be submitted through NRIMS with proof of payment receipt and a formal letter addressed to the Chairperson requesting exemption.

Formatting guidelines:
- Use clear bullet points, bold key terms, and well-structured headings.
- Be warm, professional, encouraging, and clear.
- Always guide researchers to the NRIMS portal (https://nrims.uncst.go.ug/) and provide accurate ABSA Bank details.`;

// Helper for comprehensive local knowledge fallback when API key is not configured or in test environments
function generateFallbackResponse(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();

  // If the user asks about BOTH bank details AND fees, provide a clean consolidated response
  if ((lower.includes('bank') || lower.includes('account') || lower.includes('absa')) &&
      (lower.includes('fee') || lower.includes('cost') || lower.includes('pay') || lower.includes('rate'))) {
    return `### 💳 MUBSREC Fees & Official Bank Account Details

#### 1. Official Approved Review Fees:
• **Ugandan & EAC MUBS Masters Students:** **UGX 100,000** (Amendments: UGX 50,000 | Expedited: UGX 100,000 | Annual Review: Free | Fast Track: UGX 150,000)
• **Ugandan & EAC PhD Candidates:** **USD 300** (Amendments: USD 150 | Expedited: USD 300 | Annual Review: USD 100 | Fast Track: USD 450)
• **MUBS Faculty Research:** **USD 150** (Amendments: Free | Expedited: USD 150 | Annual Review: Free | Fast Track: USD 225)
• **Non-Industry Research (NGOs, Gov, Universities):** **USD 400** (Amendments: USD 200 | Fast Track: USD 600)
• **International Students:** **USD 400** (Amendments: USD 200 | Fast Track: USD 600)
• **Industry Sponsored Research:** **USD 600** (Amendments: USD 200 | Fast Track: USD 900)

*Note: Fast track review is charged an additional 50% of the initial review fee.*

---

#### 2. Official ABSA Bank Payment Details:
• **USD Account (International, PhD, Faculty, Industry):**
  - **Account Name:** MAKERERE UNIVERSITY BUSINESS SCHOOL
  - **Bank:** ABSA BANK
  - **Account Number:** 0344025878
  - **Swift Code:** BARCUGKX
  - **Currency:** USD

• **UGX Account (MUBS Masters Students):**
  - **Account Name:** MUBS LEADERSHIP CENTER
  - **Bank:** ABSA BANK
  - **Account Number:** 6003524750
  - **Currency:** UGX

⚠️ **Proof of Payment:** Attach your official receipt from the MUBS accounts office when submitting your protocol on the **NRIMS portal** (https://nrims.uncst.go.ug/).`;
  }

  // Handle specific single-topic custom knowledge queries cleanly without raw dump
  const customMatches = searchCustomKnowledge(userPrompt);
  if (customMatches.length > 0) {
    const primary = customMatches[0];
    return `### 📌 ${primary.title}\n\n${primary.content}\n\n*For further details, submit via NRIMS at https://nrims.uncst.go.ug/ or contact the Secretariat at rec@mubs.ac.ug.*`;
  }

  if (lower.includes('fee') || lower.includes('cost') || lower.includes('pay') || lower.includes('price') || lower.includes('charge')) {
    return `### 💳 MUBSREC Approved Review Fees

Fees depend on the review type and researcher category:

| Type of Review | Industry Sponsored | Non-Industry | International Students | Ugandan & EAC (PhD) | Ugandan & EAC (MUBS Masters) | MUBS Faculty Research |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Review** | USD 600 | USD 400 | USD 400 | USD 300 | **UGX 100,000** | USD 150 |
| **Amendments** | USD 200 | USD 200 | USD 200 | USD 150 | **UGX 50,000** | **NO FEE** |
| **Expedited** | N/A | USD 300 | USD 300 | USD 300 | **UGX 100,000** | USD 150 |
| **Annual Review** | USD 100 | USD 100 | USD 100 | USD 100 | **NO FEE** | **NO FEE** |
| **Fast Track** | USD 900 | USD 600 | USD 600 | USD 450 | **UGX 150,000** | USD 225 |

**Important Notes:**
• **Fast-Track Review:** Charged an additional 50% of the initial review fee.
• **Non-Industry Research:** Study supported by governments, charities, or universities rather than private companies.
• **Industry Sponsored Research:** Study supported by private companies or businesses.
• **Banking:** Fees must be deposited to the corresponding account according to the currency applicable (USD vs UGX in ABSA Bank). Attach your proof of payment receipt from the MUBS accounts office on NRIMS.`;
  }

  if (lower.includes('bank') || lower.includes('account') || lower.includes('absa') || lower.includes('slip') || lower.includes('receipt') || lower.includes('deposit')) {
    return `### 🏦 MUBSREC Official Bank Account Details (ABSA Bank)

Payments for MUBSREC must be deposited to the corresponding ABSA Bank account according to the currency applicable to the researcher:

**1. USD Account (International, PhD, Faculty, Industry):**
• **Account Name:** MAKERERE UNIVERSITY BUSINESS SCHOOL
• **Bank Name:** ABSA BANK
• **Account Number:** 0344025878
• **Swift Code:** BARCUGKX
• **Currency:** USD

**2. UGX Account (Ugandan & EAC MUBS Masters Students):**
• **Account Name:** MUBS LEADERSHIP CENTER
• **Bank Name:** ABSA BANK
• **Account Number:** 6003524750
• **Currency:** UGX

**Payment Verification Note:**
• Proof of payment in the form of an official receipt from the MUBS accounts office must be uploaded with your submission dossier on the NRIMS portal (https://nrims.uncst.go.ug/).`;
  }

  if (lower.includes('how to submit') || lower.includes('procedure') || lower.includes('process') || lower.includes('step') || lower.includes('nrims')) {
    return `### 📋 How to Submit to MUBSREC via NRIMS

All MUBSREC protocol applications and exemption requests must be submitted online via the **UNCST NRIMS portal**:
🔗 **UNCST Website for REC Application:** [https://nrims.uncst.go.ug/](https://nrims.uncst.go.ug/)

**Submission Steps:**
1. **Prepare All 10 Dossier Documents:**
   - Full proposal approved by supervisor(s) & submitted to Graduate School.
   - CVs of investigator(s) / researchers.
   - Community Engagement Plan.
   - Risk Management Plan.
   - Dissemination Plan.
   - Data collection tools (translated where applicable).
   - Informed consent form (translated where applicable).
   - Letter from FGSR for students addressed to Chairperson MUBS REC (or formal letter seeking clearance for independent researchers).
   - Work Plan.
   - Proof of payment receipt from the MUBS accounts office.
2. **Timing of Submission:**
   - **MUBS Masters students:** Submit after supervisor approval of the protocol.
   - **PhD students:** Submit after successful oral defense of the proposal.
3. **Pay Required Review Fees:**
   - Deposit in ABSA Bank (USD Account '0344025878' or UGX Account '6003524750' for MUBS Masters).
   - Obtain official receipt from the MUBS accounts office.
4. **Upload Dossier on NRIMS:**
   - Log into https://nrims.uncst.go.ug/, select Makerere University Business School REC (MUBSREC), fill in protocol fields, and upload all required documents.

⚠️ **Mandatory Rule:** MUBS students shall ONLY be allowed to conduct field research after obtaining clearance from MUBS-REC.`;
  }

  if (lower.includes('document') || lower.includes('checklist') || lower.includes('requirement') || lower.includes('dossier')) {
    return `### 📂 MUBSREC Mandatory Submission Checklist

When applying for ethical clearance on the UNCST NRIMS portal (https://nrims.uncst.go.ug/), you must provide the following 10 items:

1. **Full Proposal:** Approved by your supervisors and submitted to Graduate School.
2. **CV of Investigator/s:** Complete curriculum vitae for all principal and co-researchers.
3. **Community Engagement Plan:** Detailed outline of how study communities will be consulted and involved.
4. **Risk Management Plan:** Identification of potential participant hazards and practical safeguards.
5. **Dissemination Plan:** Strategy for sharing findings with participants, stakeholders, and academic bodies.
6. **Data Collection Tools:** Questionnaires, interview guides, FGD tools (translated into local language where applicable).
7. **Informed Consent Form:** Participant information sheet & consent certificate (translated where applicable).
8. **Endorsement / Request Letter:**
   - *For students:* Letter from FGSR addressed to Chairperson MUBS REC indicating they are due for REC clearance.
   - *For researchers:* Formal letter addressed to Chairperson MUBS REC seeking REC clearance.
9. **Work Plan:** Comprehensive project timeline and milestones.
10. **Proof of Payment:** Official receipt from the MUBS accounts office (ABSA Bank deposit).

💡 *Note: Sophisticated research (e.g. big data studies) also requires a Data Management Plan. Inquire with the Secretariat for unique projects.*`;
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

  if (lower.includes('exemption') || lower.includes('exempt') || lower.includes('review type')) {
    return `### 🛡️ Exemption from MUBS REC Review: Criteria & Procedure

**Categories Eligible for Exemption:**
1. **Publicly Available Unlinked Data:** Use of publicly available unlinked data that does not identify individuals or communities.
2. **Educational Settings Research:** Research conducted in educational settings focusing on regular or special instructional strategies, curricula, or classroom management methods.
3. **Existing Documents & Records:** Research involving existing data, documents, or records where sources are publicly available or where information cannot be linked to individual subjects.

**Screening and Approval:**
• The REC Chairperson shall screen all exemption applications to ensure the protocol satisfies the requirements.
• Exemption decisions are granted within **fifteen (15) days** from the date of submission.

**Mandatory Application Requirements:**
• All exemption applications must be submitted through **NRIMS** (https://nrims.uncst.go.ug/).
• Proof of payment receipt must be attached as required.
• A formal letter addressed to the Chairperson requesting exemption must accompany the application.
• All required supporting information and documentation must be attached for consideration.`;
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
1. **Online Submission (NRIMS):** Applications must be submitted online at https://nrims.uncst.go.ug/.
2. **Review Category:** Most business and social science student dissertations qualify for **Expedited Review** (2-3 weeks turnaround).
3. **Fees & Banking:** Deposit review fees in ABSA Bank (UGX 100,000 for MUBS Masters; USD accounts for PhD/Faculty/International/Industry). Attach proof of payment receipt from the MUBS accounts office.
4. **Timeline:** Masters students submit after supervisor approval; PhD students submit after proposal defense. Fieldwork is strictly prohibited prior to REC clearance.

Would you like to review the specific **submission checklist**, download **templates**, or see the **approved fee schedule**?`;
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
        const ai = new GoogleGenAI({ apiKey });
        const contents: any[] = [];

        if (Array.isArray(history)) {
          history.slice(-8).forEach((h: any) => {
            if (h.sender && h.text) {
              contents.push({
                role: h.sender === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.text }]
              });
            }
          });
        }

        // Add current message with instruction
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: MUBSREC_SYSTEM_PROMPT,
            temperature: 0.3
          }
        });

        const replyText = response.text || generateFallbackResponse(message);
        res.json({ reply: replyText });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API error, falling back to local knowledge base:', geminiError?.message || geminiError);
      }
    }

    // Fallback response using comprehensive local institutional knowledge
    const fallbackText = generateFallbackResponse(message);
    res.json({ reply: fallbackText });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Documents Management Endpoints
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
    const { title, category, description, passcode } = req.body;

    if (!verifyAdminPasscode(passcode || '')) {
      res.status(401).json({ error: 'Invalid administrator passcode' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!title || !category) {
      res.status(400).json({ error: 'Title and category are required' });
      return;
    }

    const newDoc: StoredDocument = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      category: category || 'Other',
      description: (description || '').trim(),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      url: `/api/documents/download/doc-${Date.now()}`,
      isOfficial: true
    };

    addDocument(newDoc);
    res.json({ success: true, document: newDoc });
  } catch (err: any) {
    console.error('Upload document error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { passcode } = req.body;

  if (!verifyAdminPasscode(passcode || '')) {
    res.status(401).json({ error: 'Invalid administrator passcode' });
    return;
  }

  const success = deleteDocument(id);
  if (success) {
    res.json({ success: true, message: 'Document deleted successfully' });
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

app.get('/api/documents/download/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const docs = getDocuments();
  const doc = docs.find((d) => d.id === id);

  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  incrementDocumentDownload(id);
  const filePath = path.join(uploadsDir, doc.fileName);

  if (!fs.existsSync(filePath)) {
    const sampleText = `================================================================================
MAKERERE UNIVERSITY BUSINESS SCHOOL (MUBS)
RESEARCH ETHICS COMMITTEE (MUBSREC)
================================================================================
Document Title : ${doc.title}
Category       : ${doc.category}
Portal URL     : https://nrims.uncst.go.ug/
Secretariat    : Faculty of Graduate Studies and Research (FGSR), MUBS Nakawa
Contact Email  : rec@mubs.ac.ug
================================================================================
${doc.description}
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

  if (typeof PORT === 'string' && isNaN(Number(PORT))) {
    // Unix socket (used by some Phusion Passenger / hosting setups)
    app.listen(PORT, () => {
      console.log(`MUBSREC Assistant Server running on socket: ${PORT}`);
    });
  } else {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`MUBSREC Assistant Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();
