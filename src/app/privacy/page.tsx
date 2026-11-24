import type { Metadata } from 'next';
import SimpleMarkdown from '@/components/SimpleMarkdown';
import { POLICY_TITLE, POLICY_MD } from '@/data/legal';

export const metadata: Metadata = { title: POLICY_TITLE };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{POLICY_TITLE}</h1>
      <SimpleMarkdown source={POLICY_MD} />
    </div>
  );
}
