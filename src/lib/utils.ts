import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const playSound = () => {
  const audio = new Audio("https://res.cloudinary.com/djm9pwfzu/video/upload/v1786283504/flip_cwxe4x.mp3");
  audio.play();
};