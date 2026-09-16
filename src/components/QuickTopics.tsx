import {
  FileText,
  FolderArchive,
  CreditCard,
  Building2,
  Clock,
  RefreshCw,
  Languages,
  Search,
  ShieldCheck,
  ListChecks,
  CheckSquare
} from 'lucide-react';
import { QUICK_TOPICS } from '../data/mubsrecData';

interface QuickTopicsProps {
  onSelectTopic: (query: string) => void;
  isLoading: boolean;
}

export default function QuickTopics({ onSelectTopic, isLoading }: QuickTopicsProps) {
  const getIcon = (iconName: string) => {
    const iconClass = "w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0172BB] group-hover:scale-110 transition-transform shrink-0";
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'FolderArchive':
        return <FolderArchive className={iconClass} />;
      case 'CreditCard':
        return <CreditCard className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Clock':
        return <Clock className={iconClass} />;
      case 'RefreshCw':
        return <RefreshCw className={iconClass} />;
      case 'Languages':
        return <Languages className={iconClass} />;
      case 'Search':
        return <Search className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'ListChecks':
        return <ListChecks className={iconClass} />;
      case 'CheckSquare':
        return <CheckSquare className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {QUICK_TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectTopic(topic.query)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-[#D5E6F5] hover:border-[#0172BB] text-slate-800 hover:text-[#0172BB] hover:bg-[#E8F3FA] transition-all text-xs sm:text-[13px] font-bold shadow-xs hover:shadow-md hover:shadow-[#0172BB]/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer group"
          >
            {getIcon(topic.iconName)}
            <span>{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
