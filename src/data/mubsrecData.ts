import { QuickTopic, TemplateItem, FeeStructure } from '../types';

export const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'how-to-submit',
    label: 'How to Submit (NRIMS)',
    query: 'How do I submit an application for ethical review to MUBSREC on the NRIMS portal?',
    iconName: 'FileText'
  },
  {
    id: 'documents-needed',
    label: 'Submission Checklist',
    query: 'What documents are required in the MUBSREC submission checklist?',
    iconName: 'FolderArchive'
  },
  {
    id: 'rec-fees',
    label: 'Review Fees',
    query: 'What are the official MUBSREC review fees for initial review, amendments, expedited, and fast track?',
    iconName: 'CreditCard'
  },
  {
    id: 'bank-details',
    label: 'Bank Accounts (ABSA)',
    query: 'What are the ABSA Bank account details for paying MUBSREC fees in USD and UGX?',
    iconName: 'Building2'
  },
  {
    id: 'student-timing',
    label: 'Masters vs PhD Timeline',
    query: 'When should MUBS Masters and PhD students submit their research protocols to MUBSREC?',
    iconName: 'Clock'
  },
  {
    id: 'resubmission',
    label: 'Resubmission & Track Changes',
    query: 'What are the resubmission requirements following response to REC reviewer comments?',
    iconName: 'RefreshCw'
  },
  {
    id: 'exemptions',
    label: 'REC Exemption Guidelines',
    query: 'Which research categories qualify for exemption from MUBS REC review, and how do I apply?',
    iconName: 'ShieldCheck'
  },
  {
    id: 'fast-track',
    label: 'Fast Track Review',
    query: 'How does fast-track review work at MUBSREC and what are the fees?',
    iconName: 'ListChecks'
  },
  {
    id: 'fieldwork-clearance',
    label: 'Fieldwork Clearance',
    query: 'Are MUBS students allowed to conduct field data collection before obtaining REC clearance?',
    iconName: 'CheckSquare'
  }
];

export const MUBSREC_TEMPLATES: TemplateItem[] = [
  {
    id: 'mubsrec-submission-checklist',
    title: 'MUBSREC Official Submission Checklist',
    category: 'Protocol',
    description: 'Mandatory 10-point checklist required for submitting on the UNCST NRIMS portal.',
    fileFormat: 'PDF',
    contentSnippet: `MUBSREC SUBMISSION CHECKLIST (Submit via NRIMS: https://nrims.uncst.go.ug/):
1. Full proposal (Approved by supervisors and submitted to Graduate School)
2. CV of investigator/s or researchers
3. Community engagement Plan
4. Risk Management plan
5. Dissemination plan
6. Data collection tools – translated where applicable
7. Informed consent form – translated where applicable
8. Letter from FGSR for students addressed to Chairperson MUBS REC (or formal letter seeking clearance for independent researchers)
9. Work Plan
10. Proof of payment in form of a receipt from the MUBS accounts office

*Note: Specialized research (e.g. big data) requires a Data Management Plan.`
  },
  {
    id: 'resubmission-response-matrix',
    title: 'REC Resubmission & Comment Response Matrix',
    category: 'Review',
    description: 'Guidelines and matrix for addressing REC reviewer comments (Track Changes + Clean copies).',
    fileFormat: 'DOCX',
    contentSnippet: `MUBSREC RESUBMISSION CHECKLIST (Following REC Reviewer Comments):
[ ] Track version of proposal (Turn on 'Track Changes' in MS Word before editing)
[ ] Clean version of proposal (after accepting all Track Changes)
[ ] Track copies of all appendices with comments
[ ] Clean copies of all appendices
[ ] Compliance report / Comment response matrix addressing every REC comment point-by-point

*CRITICAL NOTE: Do NOT submit the compliance report from your viva/defense. Only submit the response matrix responding directly to REC comments.`
  },
  {
    id: 'informed-consent-template',
    title: 'Participant Information Sheet & Informed Consent Form (ICF)',
    category: 'Consent',
    description: 'Template for adult participants with plain language explanations, confidentiality guarantees, and translation requirements.',
    fileFormat: 'DOCX',
    contentSnippet: `PART I: INFORMATION SHEET
- Study Title
- Introduction & Purpose of the Research
- Selection of Participants & Voluntary Nature of Participation
- Procedures & Duration (What will happen during data collection)
- Potential Risks, Discomforts & Mitigation (Risk Management Plan)
- Direct / Indirect Benefits to Participant & Society
- Community Engagement Strategy
- Confidentiality, Data Protection & Anonymization
- Dissemination Plan
- Right to Refuse or Withdraw at any point without penalty
- Contact Information of Principal Investigator and MUBSREC Secretariat

PART II: CERTIFICATE OF CONSENT
- Affirmation statement of understanding
- Participant Signature/Thumbprint, Name & Date
- Witness Signature (for non-English or illiterate participants)
- Investigator Statement & Signature`
  },
  {
    id: 'exemption-request-template',
    title: 'Formal Exemption Application Letter Format',
    category: 'Review',
    description: 'Application template for research involving publicly available unlinked data or educational instructional methods.',
    fileFormat: 'DOCX',
    contentSnippet: `FORMAL REQUEST FOR EXEMPTION FROM MUBS REC REVIEW:
Addressed to: The Chairperson, MUBS Research Ethics Committee
Submitted via: NRIMS (https://nrims.uncst.go.ug/)

Qualifying Exemption Categories:
1. Use of publicly available unlinked data that does not identify individuals or communities.
2. Research conducted in educational settings focusing on regular or special instructional strategies, curricula, or classroom management methods.
3. Research involving existing data, documents, or records where sources are publicly available or cannot be linked to individual subjects.

Application Enclosures:
- Formal Exemption Request Letter addressed to REC Chairperson
- Summary Protocol Description & Methodology
- Proof of Payment receipt
- Supporting documentation

Screening & Decision: Granted within fifteen (15) days from submission.`
  },
  {
    id: 'pi-cv-template',
    title: 'Principal Investigator (PI) CV Format',
    category: 'Protocol',
    description: 'Investigator curriculum vitae highlighting research ethics background, affiliations, and qualifications.',
    fileFormat: 'DOCX',
    contentSnippet: `Principal Investigator / Co-Investigator CV Format:
1. Personal Biodata (Full Name, Institutional Affiliation, Official Email, Phone)
2. Academic & Professional Qualifications
3. Research Experience & Publications
4. Research Ethics & Human Subjects Protection Training Certification`
  },
  {
    id: 'closeout-report-template',
    title: 'Annual Review & Study Close-Out Report',
    category: 'Reporting',
    description: 'Format for annual ethical review continuation and final study close-out reporting.',
    fileFormat: 'DOCX',
    contentSnippet: `MUBSREC Annual Review / Close-Out Report:
1. MUBSREC Protocol Reference Number & Approved Study Title
2. Date of Initial Clearance & Expiry
3. Participant Recruitment Progress vs Planned Targets
4. Summary of Study Activities & Key Findings
5. Adverse Events / Ethical Issues Encountered & Mitigations
6. Plan for Data Storage, Confidentiality & Archiving
7. Signature of Principal Investigator`
  }
];

export const FEE_SCHEDULE: FeeStructure[] = [
  {
    category: 'Ugandan & EAC Student Research (MUBS Masters)',
    applicantType: 'MUBS Masters Students (Uganda & EAC)',
    amountUGX: 'UGX 100,000',
    notes: 'Initial: UGX 100,000 | Amendments: UGX 50,000 | Expedited: UGX 100,000 | Annual Review: NO FEE | Fast Track: UGX 150,000'
  },
  {
    category: 'Ugandan & EAC Student Research (PhD)',
    applicantType: 'PhD Candidates (Uganda & EAC)',
    amountUGX: 'USD 300 equivalent',
    amountUSD: 'USD 300',
    notes: 'Initial: USD 300 | Amendments: USD 150 | Expedited: USD 300 | Annual Review: USD 100 | Fast Track: USD 450'
  },
  {
    category: 'MUBS Faculty Research',
    applicantType: 'MUBS Academic Faculty Members',
    amountUSD: 'USD 150',
    amountUGX: 'USD 150 equivalent',
    notes: 'Initial: USD 150 | Amendments: NO FEE | Expedited: USD 150 | Annual Review: NO FEE | Fast Track: USD 225'
  },
  {
    category: 'Non-Industry Research',
    applicantType: 'Supported by governments, charities, or universities (rather than private companies)',
    amountUSD: 'USD 400',
    amountUGX: 'USD 400 equivalent',
    notes: 'Initial: USD 400 | Amendments: USD 200 | Expedited: USD 300 | Annual Review: USD 100 | Fast Track: USD 600'
  },
  {
    category: 'International Students',
    applicantType: 'International / Non-EAC Student Researchers',
    amountUSD: 'USD 400',
    amountUGX: 'USD 400 equivalent',
    notes: 'Initial: USD 400 | Amendments: USD 200 | Expedited: USD 300 | Annual Review: USD 100 | Fast Track: USD 600'
  },
  {
    category: 'Industry Sponsored Research',
    applicantType: 'Studies supported by private companies or commercial businesses',
    amountUSD: 'USD 600',
    amountUGX: 'USD 600 equivalent',
    notes: 'Initial: USD 600 | Amendments: USD 200 | Expedited: N/A | Annual Review: USD 100 | Fast Track: USD 900'
  }
];

export const BANK_DETAILS = {
  submissionPlatform: {
    name: 'National Research Information Management System (NRIMS)',
    url: 'https://nrims.uncst.go.ug/',
    description: 'UNCST website for all REC applications and exemption submissions.'
  },
  usdAccount: {
    accountName: 'MAKERERE UNIVERSITY BUSINESS SCHOOL',
    bankName: 'ABSA BANK',
    accountNumber: '0344025878',
    swiftCode: 'BARCUGKX',
    currency: 'USD'
  },
  ugxAccount: {
    accountName: 'MUBS LEADERSHIP CENTER',
    bankName: 'ABSA BANK',
    accountNumber: '6003524750',
    currency: 'UGX'
  },
  paymentProcess: 'Payments for MUBSREC must be deposited to the corresponding ABSA Bank account according to the currency applicable to the researcher (USD for international/PhD/faculty/industry, UGX for MUBS Masters). Proof of payment in the form of a receipt from the MUBS accounts office must be uploaded with your NRIMS application.'
};

export const MUBSREC_CONTACTS = {
  office: 'Faculty of Graduate Studies and Research (FGSR) / REC Secretariat, MUBS Main Campus, Nakawa, Kampala',
  pobox: 'P.O. Box 1079, Kampala - Uganda',
  email: 'rec@mubs.ac.ug',
  telephone: '+256 414 338 120 / +256 772 123 456',
  workingHours: 'Monday to Friday: 8:30 AM – 5:00 PM (EAT). Closed on Public Holidays.',
  platformUrl: 'https://nrims.uncst.go.ug/',
  administratorName: 'The REC Administrator',
  chairpersonName: 'The Chairperson, MUBS Research Ethics Committee'
};
