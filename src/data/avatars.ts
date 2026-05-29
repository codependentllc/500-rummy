import type { CharacterOption } from "../game/types";

export const AVATARS: CharacterOption[] = [
  { id: "father", name: "Frank", role: "Father", avatar: "/avatars/father.png", src: "/avatars/father.png", fallback: "👨" },
  { id: "mother", name: "Elaine", role: "Mother", avatar: "/avatars/mother.png", src: "/avatars/mother.png", fallback: "👩" },
  { id: "grandma", name: "Rose", role: "Grandma", avatar: "/avatars/grandma.png", src: "/avatars/grandma.png", fallback: "👵" },
  { id: "grandpa", name: "Arthur", role: "Grandpa", avatar: "/avatars/grandpa.png", src: "/avatars/grandpa.png", fallback: "👴" },
  { id: "uncle", name: "Ray", role: "Uncle", avatar: "/avatars/uncle.png", src: "/avatars/uncle.png", fallback: "👨" },
  { id: "aunt", name: "Clara", role: "Aunt", avatar: "/avatars/woman2.png", src: "/avatars/woman2.png", fallback: "👩" },
  { id: "cousin", name: "Ben", role: "Cousin", avatar: "/avatars/ben.png", src: "/avatars/ben.png", fallback: "👨🏼" },
  { id: "neighbor", name: "Maya", role: "Neighbor", avatar: "/avatars/maya.png", src: "/avatars/maya.png", fallback: "👩🏽" },
  { id: "club-friend", name: "Maria", role: "Card Club Friend", avatar: "/avatars/maria.png", src: "/avatars/maria.png", fallback: "👩🏽" },
  { id: "card-shark", name: "Vic", role: "Retired Card Shark", avatar: "/avatars/shark.png", src: "/avatars/shark.png", fallback: "🃏" },
  { id: "dealer", name: "Sam", role: "Friendly Dealer", avatar: "/avatars/dealer.png", src: "/avatars/dealer.png", fallback: "🙂" },
  { id: "family-dog", name: "Buddy", role: "Family Dog", avatar: "", src: "", fallback: "🐶" }
];
