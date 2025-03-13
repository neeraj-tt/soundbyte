import { cleanString } from "./cleanString";

export const generateHint = (track) => {
  let toShow = cleanString(track.name, false, true, true, false, false);

  //One character songs aren't given away
  if (!toShow || track.name.length === 1) {
    return "_";
  }

  return toShow.charAt(0) + toShow.slice(1).replace(/[^ ]/g, "_");
};
