import {
  FileText,
  GraduationCap,
  MessageCircle,
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  BookOpen
} from 'lucide-react';
import { MUBSREC_CONTACTS } from '../data/mubsrecData';

interface ModalsProps {
  activeModal: 'guidelines' | 'ethics' | 'contacts' | null;
  onClose: () => void;
  onAskBot: (question: string) => void;
}

export default function InfoModals({ activeModal, onClose, onAskBot }: ModalsProps) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* 1. National & Institutional Guidelines Modal */}
      {activeModal === 'guidelines' && (
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D5E6F5] my-8">
          <div className="flex items-start justify-between pb-5 border-b border-[#E8F3FA]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F3FA] border border-[#BAE0FD] flex items-center justify-center text-[#0172BB] shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">
                  National &amp; Institutional Guidelines
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Regulatory frameworks governing human research at MUBS and in Uganda
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="py-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs sm:text-sm text-slate-700">
            {/* UNCST */}
            <div className="p-5 rounded-2xl bg-[#F0F7FD] border border-[#D5E6F5]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-[#004e80] text-sm">
                  1. Uganda National Council for Science &amp; Technology (UNCST) Guidelines
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9A7000] bg-[#FFFDE6] border border-[#FFE00D]/50 px-2.5 py-1 rounded-lg">
                  National Law
                </span>
              </div>
              <p className="text-slate-600 mb-3 leading-relaxed">
                The national benchmark for ethical conduct of research involving human participants in Uganda. Outlines responsibilities of investigators, informed consent standards, vulnerable groups, and requirement for final UNCST registration after institutional REC approval.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskBot("What are the UNCST registration steps required after getting MUBSREC approval?");
                }}
                className="text-xs font-bold text-[#0172BB] hover:text-[#005691] flex items-center gap-1.5 cursor-pointer"
              >
                Ask how UNCST clearance works <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* MUBS Research Policy */}
            <div className="p-5 rounded-2xl bg-[#E8F3FA]/70 border border-[#BAE0FD]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  2. MUBS Institutional Research Policy &amp; Ethics Code
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0172BB] bg-[#E8F3FA] border border-[#0172BB]/30 px-2.5 py-1 rounded-lg">
                  Institutional
                </span>
              </div>
              <p className="text-slate-600 mb-3 leading-relaxed">
                Mandates that all staff, undergraduate, and graduate student dissertations/theses involving primary data collection from respondents must obtain MUBSREC ethical clearance prior to embarking on fieldwork.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskBot("Is REC approval required before or after my dissertation proposal defense at MUBS?");
                }}
                className="text-xs font-bold text-[#0172BB] hover:text-[#005691] flex items-center gap-1.5 cursor-pointer"
              >
                Ask about dissertation timeline <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Data Protection Act */}
            <div className="p-5 rounded-2xl bg-[#F0F7FD] border border-[#D5E6F5]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  3. Uganda Data Protection and Privacy Act (2019)
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200 px-2.5 py-1 rounded-lg">
                  Privacy &amp; Data
                </span>
              </div>
              <p className="text-slate-600 mb-3 leading-relaxed">
                Strict requirements for the collection, processing, storage, and anonymization of personal identifiers. Protocols must demonstrate secure data handling, password protection, and de-identification.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskBot("How should I describe data confidentiality and anonymization in my protocol?");
                }}
                className="text-xs font-bold text-[#0172BB] hover:text-[#005691] flex items-center gap-1.5 cursor-pointer"
              >
                Ask about data protection requirements <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* International Charters */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm mb-2">
                4. International Ethics Charters: Belmont Report &amp; Declaration of Helsinki
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Foundational international standards governing respect for autonomy, risk minimization, equitable subject selection, and informed consent.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8F3FA] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 2. New to Research Ethics? Modal */}
      {activeModal === 'ethics' && (
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D5E6F5] my-8">
          <div className="flex items-start justify-between pb-5 border-b border-[#E8F3FA]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFDE6] border border-[#FFE00D]/60 flex items-center justify-center text-[#B47A00] shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">
                  New to Research Ethics?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Beginner-friendly primer on ethics review and protecting participants
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="py-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs sm:text-sm text-slate-700">
            {/* Core Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#E8F3FA] border border-[#BAE0FD]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-[#0172BB]" />
                  <h4 className="font-bold text-[#004e80] text-xs sm:text-sm">Respect for Autonomy</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Participation is 100% voluntary. Participants must receive clear information and sign consent without coercion, intimidation, or undue inducements.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDE6] border border-[#FFE00D]/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-[#B47A00]" />
                  <h4 className="font-bold text-[#785900] text-xs sm:text-sm">Beneficence &amp; Non-Maleficence</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  "Do no harm." Researchers must identify potential psychological, social, economic, or legal risks and outline practical safeguards.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F7FD] border border-[#D5E6F5]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-[#0172BB]" />
                  <h4 className="font-bold text-[#0172BB] text-xs sm:text-sm">Justice &amp; Fairness</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fair selection of research subjects. Benefits and burdens of research must be distributed equitably across society.
                </p>
              </div>

              {/* Red Accent for Vulnerable Populations */}
              <div className="p-4 rounded-2xl bg-[#FEE8E8] border border-red-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-4 h-4 text-[#FD0808]" />
                  <h4 className="font-bold text-[#B91C1C] text-xs sm:text-sm">Vulnerable Populations</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Special protections apply to children, prisoners, pregnant women, low-literacy groups, and subordinates (e.g. employees or students).
                </p>
              </div>
            </div>

            {/* Why do I need REC approval */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm mb-2.5">
                Why is MUBSREC Approval Mandatory for Students &amp; Researchers?
              </h4>
              <ul className="space-y-2 list-disc list-inside text-slate-600 text-xs leading-relaxed">
                <li><strong className="text-slate-800">Academic Graduation Requirement:</strong> MUBS graduate degree defenses require proof of ethical clearance before dissertation submission.</li>
                <li><strong className="text-slate-800">Legal Compliance:</strong> Collecting primary data in Uganda without REC clearance violates national science policy.</li>
                <li><strong className="text-slate-800">Journal Publication:</strong> Reputable peer-reviewed journals will reject manuscripts that lack institutional ethical approval reference numbers.</li>
                <li><strong className="text-slate-800">UNCST Clearance:</strong> Required to obtain the national research permit from the President's Office.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8F3FA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskBot("I am a beginner researcher. What is the easiest way to prepare my informed consent form?");
              }}
              className="text-xs font-bold text-[#0172BB] hover:text-[#005691] flex items-center gap-1.5 cursor-pointer"
            >
              Ask bot for beginner tips <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Contact the MUBSREC Secretariat Modal */}
      {activeModal === 'contacts' && (
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D5E6F5] my-8">
          <div className="flex items-start justify-between pb-5 border-b border-[#E8F3FA]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FEE8E8] border border-red-200 flex items-center justify-center text-[#FD0808] shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">
                  Contact the MUBSREC Secretariat
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Office location, desk contacts, and visiting hours
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="py-5 space-y-3.5 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#E8F3FA] border border-[#BAE0FD]">
              <MapPin className="w-5 h-5 text-[#0172BB] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Physical Secretariat Office</div>
                <div className="text-slate-600 mt-0.5">{MUBSREC_CONTACTS.office}</div>
                <div className="text-slate-500 text-xs mt-0.5">{MUBSREC_CONTACTS.pobox}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F0F7FD] border border-[#D5E6F5]">
              <Mail className="w-5 h-5 text-[#0172BB] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Official Inquiries &amp; Electronic Dossier Email</div>
                <div className="text-slate-800 font-mono text-xs mt-0.5">
                  <a href={`mailto:${MUBSREC_CONTACTS.email}`} className="text-[#0172BB] font-bold hover:underline">
                    {MUBSREC_CONTACTS.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Phone className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Telephone / Helpdesk</div>
                <div className="text-slate-700 font-mono text-xs mt-0.5">{MUBSREC_CONTACTS.telephone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Working Hours</div>
                <div className="text-slate-600 mt-0.5">{MUBSREC_CONTACTS.workingHours}</div>
              </div>
            </div>

            {/* Note highlighting physical submission with Yellow Accent #FFE00D */}
            <div className="p-4 bg-[#FFFDE6] rounded-2xl border border-[#FFE00D]/70 text-[#785900] text-xs">
              <div className="font-bold mb-0.5 text-[#5C4300]">Physical Submissions Note:</div>
              Remember to bring <strong>2 spiral-bound physical copies</strong> of your dossier and your original bank deposit slip to the FGSR office during open hours.
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8F3FA] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  );
}
