export function capitalizeFirstLetter(text: string) {
  if (!text) return text;
  return `${text[0]?.toUpperCase()}${text.substring(1)}`;
}
