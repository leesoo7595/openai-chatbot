export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6 text-zinc-300">
      conversation: <span className="text-zinc-100">{id}</span>
    </div>
  );
}
