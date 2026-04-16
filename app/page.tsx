import { redirect } from 'next/navigation';

// academy.novex.finance/ should land users directly on the Academy.
// Keeps /academy addressable for internal links without 404'ing the root.
export default function RootPage() {
  redirect('/academy');
}
