export function removeSpecialCharacters(string) {
  return string.replace(/[^a-zA-Z0-9\s]/g, '');
}
export function replaceWhitespacesWith(string, replaceChar = '_') {
  return string.replace(/\s+/g, replaceChar);
}
export function createDowloadFileName(name, length = 250) {
  return replaceWhitespacesWith(removeSpecialCharacters(name)).substring(0, length);
}