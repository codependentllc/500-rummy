import { AVATARS } from "@/data/avatars";
import type { SeatConfig } from "@/types/rummy";
import { AvatarImage } from "./AvatarImage";

type Props = {
  label: string;
  seat: SeatConfig;
  excludedAvatarIds?: string[];
  onChange: (seat: SeatConfig) => void;
};

export function SeatEditor({ label, seat, excludedAvatarIds = [], onChange }: Props) {
  const avatarIndex = Math.max(0, AVATARS.findIndex((avatar) => avatar.id === seat.avatarId));
  const avatar = AVATARS[avatarIndex];
  const move = (offset: number) => {
    for (let distance = 1; distance <= AVATARS.length; distance += 1) {
      const next = AVATARS[(avatarIndex + offset * distance + AVATARS.length) % AVATARS.length];
      if (!excludedAvatarIds.includes(next.id)) {
        onChange({ avatarId: next.id, name: next.name });
        return;
      }
    }
  };

  return (
    <section className="seat-editor">
      <div className="seat-editor-label">{label}</div>
      <div className="seat-avatar-row">
        <button type="button" aria-label={`Previous avatar for ${label}`} onClick={() => move(-1)}>‹</button>
        <AvatarImage className="seat-avatar" src={avatar.image} name={avatar.name} />
        <button type="button" aria-label={`Next avatar for ${label}`} onClick={() => move(1)}>›</button>
      </div>
      <div className="seat-avatar-name">{avatar.name}</div>
      <input aria-label={`${label} display name`} maxLength={18} value={seat.name} placeholder={avatar.name} onChange={(event) => onChange({ ...seat, name: event.target.value })} />
    </section>
  );
}
