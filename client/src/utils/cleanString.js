export const cleanString = (
  trackName,
  toLower = true,
  parentheses = true,
  apostrophes = true,
  normalize = true,
  replacements = true,
  periods = true
) => {
  const wordReplacements = {
    " & ": " and ",
    comin: "coming",
    " n ": " and ",
    " 4 ": " for ",
    " 2 ": " to ",
  };

  let cleanedName = trackName;

  // Convert to all lowercase letters
  if (toLower) {
    cleanedName = cleanedName.toLowerCase();
  }

  // Remove text inside (parentheses) and [square brackets]
  if (parentheses) {
    cleanedName = cleanedName
      .replace(/\s*\([^)]*\)/g, "") // Remove (parentheses) and surrounding spaces
      .replace(/\s*\[[^\]]*\]/g, ""); // Remove [square brackets] and surrounding spaces
  }

  // Remove apostrophes if enabled
  if (apostrophes) {
    cleanedName = cleanedName.replace(/'/g, "");
  }

  // Normalize: Remove special characters (accents, diacritics, etc.)
  if (normalize) {
    cleanedName = cleanedName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Handle common word replacements
  if (replacements) {
    Object.entries(wordReplacements).forEach(([key, value]) => {
      cleanedName = cleanedName.replace(new RegExp(key, "gi"), value);
    });
  }

  if (periods) {
    cleanedName = cleanedName.replace(/\./g, "");
    // cleanedName = cleanedName.replace(/\.(?=\S)/g, "");
  }

  // Remove extra spaces
  cleanedName = cleanedName.replace(/\s+/g, " ").trim();

  return cleanedName;
};
