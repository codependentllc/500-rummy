import { AVATARS } from "@/data/avatars";
import { AvatarImage } from "./AvatarImage";

type Props = {
  selectedId: string;
  onChange: (id: string) => void;
};

export function AvatarCarousel({ selectedId, onChange }: Props) {
  const index = Math.max(0, AVATARS.findIndex((avatar) => avatar.id === selectedId));
  const avatar = AVATARS[index];
  const move = (offset: number) => onChange(AVATARS[(index + offset + AVATARS.length) % AVATARS.length].id);

  return (
    <>
      <div className="avatar-carousel">
        <button className="carousel-btn" type="button" aria-label="Previous avatar" onClick={() => move(-1)}>‹</button>
        <div className="avatar-feature">
          <AvatarImage className="avatar-img" src={avatar.image} name={avatar.name} />
          <div className="avatar-name">{avatar.name}</div>
          <div className="avatar-role">{avatar.role}</div>
        </div>
        <button className="carousel-btn" type="button" aria-label="Next avatar" onClick={() => move(1)}>›</button>
      </div>
      <div className="avatar-dots" aria-label={`${avatar.name}, avatar ${index + 1} of ${AVATARS.length}`}>
        {AVATARS.map((option) => <span key={option.id} className={`avatar-dot ${option.id === avatar.id ? "active" : ""}`} />)}
      </div>
    </>
  );
}
