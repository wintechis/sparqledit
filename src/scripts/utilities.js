export function removeSpecialCharacters(string) {
  return string.replace(/[^a-zA-Z0-9\s]/g, '');
}

export function replaceWhitespacesWith(string, replaceChar = '_') {
  return string.replace(/\s+/g, replaceChar);
}

export function createDowloadFileName(name, length = 250) {
  return replaceWhitespacesWith(removeSpecialCharacters(name)).substring(0, length);
}

export function downloadJsonld(jsonldStr, fileName) {
  downloadBlob(
    jsonldStr, 
    'application/ld+json', 
    fileName || 'sparqledit.jsonld');
}

export function downloadCSV(csvStr, fileName) {
  downloadBlob(
    csvStr, 
    'text/csv', 
    fileName || 'sparqledit.csv');
}

function downloadBlob(contentStr, contentType, fileName) {
  // create data blob
  const file = new Blob([contentStr], {type: contentType});
  // create link and programmatically click it
  const element = document.createElement('a');
  element.href = URL.createObjectURL(file);
  element.download = fileName || 'sparqledit';
  document.body.appendChild(element); // required for FireFox
  element.click();
  element.remove(); // cleanup
}