import type { Avatar } from "../game/types";

const AVATAR_OPTIONS: Avatar[] = [
  { id: "cowboy", name: "Cowboy", image: "🤠", bio: "A steady card hand from the dusty frontier." },
  { id: "detective", name: "Detective", image: "🕵️", bio: "Reads the table and spots every tell." },
  { id: "gambler", name: "Gambler", image: "🎲", bio: "Pushes luck when the discard pile gets tempting." },
  { id: "pirate", name: "Pirate", image: "🏴‍☠️", bio: "Takes bold pickups and guards every treasure." },
  { id: "sheriff", name: "Sheriff", image: "⭐", bio: "Keeps the table honest and the turns moving." },
  { id: "aviator", name: "Aviator", image: "🧑‍✈️", bio: "Plans three moves ahead before landing a meld." },
  { id: "magician", name: "Magician", image: "🎩", bio: "Makes the perfect run appear from nowhere." },
  { id: "mechanic", name: "Mechanic", image: "🔧", bio: "Tunes a messy hand into a scoring machine." },
  { id: "chef", name: "Chef", image: "🧑‍🍳", bio: "Combines the right ingredients for big points." },
  { id: "musician", name: "Musician", image: "🎸", bio: "Finds the rhythm in every draw and discard." },
  { id: "explorer", name: "Explorer", image: "🧭", bio: "Digs through the pile for the route to victory." },
  { id: "scientist", name: "Scientist", image: "🔬", bio: "Runs the numbers before every risk." }
];

export const AVATARS: Avatar[] = AVATAR_OPTIONS.map((avatar) => ({
  ...avatar,
  src: "",
  fallback: avatar.image,
  role: avatar.name
}));

export function avatarFallback(avatar: Avatar | undefined, fallback = "🧑") {
  return avatar?.image || fallback;
}
