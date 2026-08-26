export function NothingFound({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <img src="/sad.png" className="size-64" />
      <p className="text-sm opacity-70 p-4">{message}</p>
    </div>
  );
}