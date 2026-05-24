import type { User } from "../types";
import { getFromCdn } from "../utils";

interface UserProfileProps {
  data: User;
}

export const UserProfile = ({ data }: UserProfileProps) => {
  return (
    <section className="panel flex-row items-center gap-6 p-6">
      <div className="shrink-0">
        <img 
          src={data.avatar ? getFromCdn(data.avatar) : "/anonymous.png"} 
          className="w-40 h-40 border rounded-full object-cover shadow-sm" 
          alt={data.userName} 
        />
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <h1 className="font-bold text-2xl truncate">{data.userName}</h1>
        
        {data.about ? (
          <p className="text-tw-muted leading-relaxed whitespace-pre-wrap">
            {data.about}
          </p>
        ) : (
          <p className="text-tw-muted italic text-sm">No description provided.</p>
        )}
      </div>
    </section>
  );
};