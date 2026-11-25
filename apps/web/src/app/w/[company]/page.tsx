import { redirect } from 'next/navigation';

export default async function WorkspaceHome({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  redirect(`/w/${company}/pipeline`);
}
