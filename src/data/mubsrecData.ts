import { QuickTopic, TemplateItem, FeeStructure } from '../types';

export const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'how-to-submit',
    label: 'How to Submit',
    query: 'How do I submit an application for ethical review to MUBSREC?',
    iconName: 'FileText'
  },
  {
    id: 'documents-needed',
    label: 'Documents Needed',
    query: 'What documents are required for a complete MUBSREC ethics review dossier?',
    iconName: 'FolderArchive'
  },
  {
    id: 'rec-fees',
    label: 'REC Fees',
    query: 'What are the current review fees for MUBSREC for students and external researchers?',
    iconName: 'CreditCard'
  },
  {
    id: 'bank-details',
    label: 'Bank Details',
    query: 'What are the bank account details and payment instructions for MUBSREC fees?',
    iconName: 'Building2'
  },
  {
    id: 'approval-time',
    label: 'Approval Time',
    query: 'How long does it take to get ethical approval from MUBSREC?',
    iconName: 'Clock'
  },
  {
    id: 'resubmission',
    label: 'Resubmission',
    query: 'How do I handle resubmission after receiving minor or major revision comments?',
    iconName: 'RefreshCw'
  },
  {
    id: 'translation',
    label: 'Translation',
    query: 'What are the requirements for informed consent translation into Luganda or other local languages?',
    iconName: 'Languages'
  },
  {
    id: 'check-status',
    label: 'Check Status',
    query: 'How can I track and check the status of my submitted protocol with MUBSREC?',
    iconName: 'Search'
  },
  {
    id: 'review-outcomes',
    label: 'Review Outcomes',
    query: 'What are the possible review decisions and outcomes from the MUBSREC board?',
    iconName: 'ShieldCheck'
  },
  {
    id: 'review-types',
    label: 'Review Types',
    query: 'What is the difference between Exempt, Expedited, and Full Board review at MUBSREC?',
    iconName: 'ListChecks'
  },
  {
    id: 'closing-out',
    label: 'Closing Out',
    query: 'What is the procedure for study close-out, annual renewals, and final report submission to MUBSREC?',
    iconName: 'CheckSquare'
  }
];

export const MUBSREC_TEMPLATES: TemplateItem[] = [
  {
    id: 'mubsrec-protocol-template',
    title: 'MUBSREC Standard Research Protocol Template',
    category: 'Protocol',
    description: 'The mandatory structured protocol format including study rationale, conceptual framework, human subject protections, and data security.',
    fileFormat: 'DOCX / PDF',
    contentSnippet: `1. Title of the Study\n2. Principal Investigator & Co-Investigators Contact Details & Affiliations\n3. Executive Summary / Structured Abstract (300 words max)\n4. Introduction, Background & Literature Review\n5. Statement of the Problem & Research Questions/Hypotheses\n6. Study Objectives (General & Specific)\n7. Methodology (Design, Study Population, Eligibility Criteria, Sampling Strategy, Sample Size determination, Data Collection Procedures)\n8. Ethical Considerations:\n   - Recruitment strategy & avoidance of coercion\n   - Informed consent / assent process\n   - Potential risks and mitigation strategies\n   - Direct and indirect benefits\n   - Confidentiality & data storage security\n   - Reimbursement / token of appreciation policy\n9. Work Plan & Budget with Justification\n10. References (APA 7th Edition)`
  },
  {
    id: 'informed-consent-template',
    title: 'Participant Information Sheet & Informed Consent Form (ICF)',
    category: 'Consent',
    description: 'Template for adult participants with plain language explanations, confidentiality guarantees, and voluntary participation clauses.',
    fileFormat: 'DOCX',
    contentSnippet: `PART I: INFORMATION SHEET\n- Study Title\n- Introduction & Purpose of the Research\n- Selection of Participants & Voluntary Nature of Participation\n- Procedures & Duration (What will happen during data collection)\n- Potential Risks, Discomforts & Mitigation\n- Direct / Indirect Benefits to Participant & Society\n- Reimbursements / Refreshment provision\n- Confidentiality, Data Protection & Anonymization\n- Sharing of Research Findings\n- Right to Refuse or Withdraw at any point without penalty\n- Contact Information of Principal Investigator and MUBSREC Secretariat\n\nPART II: CERTIFICATE OF CONSENT\n- Affirmation statement of understanding\n- Participant Signature/Thumbprint, Name & Date\n- Witness Signature (for illiterate participants)\n- Investigator Statement & Signature`
  },
  {
    id: 'minor-assent-template',
    title: 'Assent Form for Minors (Ages 8 to 17)',
    category: 'Consent',
    description: 'Simplified language assent form designed for children and adolescents, accompanied by parental/guardian consent.',
    fileFormat: 'DOCX',
    contentSnippet: `Assent Form for Minors:\n- Friendly explanation of why we are doing this study in age-appropriate wording\n- Clear statement that child can say NO and stop anytime without anyone getting upset\n- Explanation of what they will be asked to do\n- Checkboxes: [ ] Yes, I agree to take part  [ ] No, I do not want to take part\n- Child's Name and Signature / Mark\n- Date and Investigator Signature\n*Note: Must be accompanied by signed Parental Consent Form.`
  },
  {
    id: 'data-collection-checklist',
    title: 'Data Collection Instruments & Checklist',
    category: 'Review',
    description: 'Standard checklist for questionnaire formatting, interview schedules, FGD guides, and local language translations.',
    fileFormat: 'PDF',
    contentSnippet: `Checklist for Data Tools:\n[ ] Questionnaires formatted with clear headers and confidentiality notice\n[ ] In-depth Key Informant Interview (KII) Guides included\n[ ] Focus Group Discussion (FGD) Guides with moderator instructions\n[ ] Certified local translations (e.g. Luganda, Runyankole, etc.) for non-English participants\n[ ] Certificate of Translation from recognized language department or certified translator\n[ ] Back-translation copy where clinical or sensitive psychological instruments are used`
  },
  {
    id: 'pi-cv-template',
    title: 'Principal Investigator (PI) Short CV Format',
    category: 'Protocol',
    description: '2-page maximum curriculum vitae format emphasizing research ethics training certificates (e.g. CITI, TRREE, or NIH).',
    fileFormat: 'DOCX',
    contentSnippet: `Principal Investigator Short CV:\n1. Personal Biodata (Name, Official Email, Phone, Institutional Affiliation)\n2. Academic Qualifications\n3. Research Experience & Key Publications in the field\n4. Research Ethics Certification:\n   - Course Name (e.g. CITI Program, TRREE, NIH Good Clinical Practice)\n   - Certificate ID & Date of Completion (Must be within 2-3 years)`
  },
  {
    id: 'supervisor-endorsement',
    title: 'Student Recommendation & Supervisor Endorsement Form',
    category: 'Review',
    description: 'Required signature sheet signed by academic supervisor and Head of Department prior to MUBSREC submission.',
    fileFormat: 'PDF',
    contentSnippet: `Academic Endorsement Form:\n- Student Name, Registration Number, Faculty/School & Degree Program\n- Title of Approved Dissertation/Thesis Proposal\n- Date of Proposal Defense Approval at Departmental Level\n- Primary Supervisor Declaration & Signature\n- Head of Department (HOD) Endorsement Stamp & Signature`
  },
  {
    id: 'closeout-report-template',
    title: 'Study Close-Out & Final Ethical Completion Report',
    category: 'Reporting',
    description: 'Required upon completion of data collection and study closure to obtain the official REC close-out letter.',
    fileFormat: 'DOCX',
    contentSnippet: `Study Close-Out Report Format:\n1. MUBSREC Protocol Reference Number & Study Title\n2. Date of Initial Approval & Expiry Date\n3. Total Number of Participants Recruited vs Planned\n4. Summary of Study Findings & Output (Dissertation / Publications)\n5. Any Adverse Events or Ethical Challenges encountered & how they were resolved\n6. Data Archiving & Disposal Plan (Safeguarding electronic & physical records for minimum 5 years)\n7. Signature of Principal Investigator`
  }
];

export const FEE_SCHEDULE: FeeStructure[] = [
  {
    category: 'Undergraduate Students (MUBS / Makerere)',
    applicantType: 'Bachelors & Diploma Students',
    amountUGX: 'UGX 100,000',
    notes: 'Requires copy of valid student ID and departmental approval letter.'
  },
  {
    category: 'Postgraduate Students (Masters)',
    applicantType: 'MBA, MSc, MIB, MA Students (MUBS)',
    amountUGX: 'UGX 200,000',
    notes: 'Includes expedited or full review depending on study risk classification.'
  },
  {
    category: 'Doctoral Students (PhD / DBA)',
    applicantType: 'PhD / Doctoral Candidates',
    amountUGX: 'UGX 350,000',
    notes: 'Covers initial review and first annual monitoring.'
  },
  {
    category: 'Faculty / Staff Institutional Research',
    applicantType: 'MUBS Academic Staff (Self-funded)',
    amountUGX: 'UGX 250,000',
    notes: 'Subsidized institutional rate for internal staff projects.'
  },
  {
    category: 'External / Funded Local Projects',
    applicantType: 'Researchers outside MUBS or locally funded projects',
    amountUGX: 'UGX 500,000',
    notes: 'Projects funded by local NGOs, government ministries, or agencies.'
  },
  {
    category: 'Internationally Funded Projects / Clinical Trials',
    applicantType: 'International Sponsors, Multi-country studies, Foreign Investigators',
    amountUGX: 'UGX 1,500,000',
    amountUSD: 'USD 500',
    notes: 'Subject to full board review and requires subsequent UNCST clearance.'
  },
  {
    category: 'Protocol Amendments & Annual Renewals',
    applicantType: 'All Ongoing Protocols',
    amountUGX: 'UGX 100,000 - 200,000',
    amountUSD: 'USD 100 (for international projects)',
    notes: 'Minor administrative amendments may have reduced fee.'
  }
];

export const MUBSREC_CONTACTS = {
  office: 'Faculty of Graduate Studies and Research (FGSR) / REC Secretariat, MUBS Main Campus, Nakawa, Kampala',
  pobox: 'P.O. Box 1079, Kampala - Uganda',
  email: 'rec@mubs.ac.ug',
  telephone: '+256 414 338 120 / +256 772 123 456',
  workingHours: 'Monday to Friday: 8:30 AM – 5:00 PM (EAT). Closed on Public Holidays.',
  administratorName: 'The REC Administrator',
  chairpersonName: 'The Chairperson, MUBS Research Ethics Committee'
};

export const BANK_DETAILS = {
  bankName: 'Stanbic Bank Uganda Limited',
  branch: 'Makerere Branch / Lugogo Mall Branch',
  accountName: 'Makerere University Business School - Research Ethics Committee',
  accountNumber: '9030012345678',
  swiftCode: 'SBICUGKX',
  currency: 'Uganda Shillings (UGX) & USD',
  paymentProcess: 'Payment can be initiated via URA Payment Registration Number (PRN) portal or directly at any Stanbic Bank / Centenary Bank branch citing "MUBSREC Ethics Review Fees". Always present the stamped bank deposit slip or proof of payment with your submission dossier.'
};
