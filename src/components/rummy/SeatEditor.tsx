import { AVATARS } from "@/data/avatars";
import type { SeatConfig } from "@/types/rummy";
import { AvatarImage } from "./AvatarImage";

type Props = {
  index: number;
  seat: SeatConfig;
  onChange: (seat: SeatConfig) => void;
};

export function SeatEditor({ index, seat, onChange }: Props) {
  const avatarIndex = Math.max(0, AVATARS.findIndex((avatar) => avatar.id === seat.avatarId));
  const avatar = AVATARS[avatarIndex];
  const move = (offset: number) => {
    const next = AVATARS[(avatarIndex + offset + AVATARS.length) % AVATARS.length];
    onChange({ ...seat, avatarId: next.id });
  };

  return (
    <section className="seat-editor">
      <div className="seat-editor-label">{index === 0 ? "You" : `CPU ${index}`}</div>
      <div className="seat-avatar-row">
        <button type="button" aria-label={`Previous avatar for ${index === 0 ? "you" : `CPU ${index}`}`} onClick={() => move(-1)}>‹</button>
        <AvatarImage className="seat-avatar" src={avatar.image} name={avatar.name} />
        <button type="button" aria-label={`Next avatar for ${index === 0 ? "you" : `CPU ${index}`}`} onClick={() => move(1)}>›</button>
      </div>
      <div className="seat-avatar-name">{avatar.name}</div>
      <input aria-label={`${index === 0 ? "Your" : `CPU ${index}`} display name`} maxLength={18} value={seat.name} placeholder={avatar.name} onChange={(event) => onChange({ ...seat, name: event.target.value })} />
    </section>
  );
}
