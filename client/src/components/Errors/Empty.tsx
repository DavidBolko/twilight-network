export function Empty({ message = "The Twilight Owl is sleeping, there is nothing she can show you right now." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <img src="/empty.png" className="size-64" />
      <p className="text-sm opacity-70 p-4 max-w-72 text-center break-words">{message}</p>
    </div>
  );
}