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

export function toISODateWithTimezone(date) {
  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneOffsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60;
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const padZero = (number) => ('0' + number).slice(-2);

  return date.getFullYear() +
    '-' + padZero(date.getMonth() + 1) +
    '-' + padZero(date.getDate()) +
    'T' + padZero(date.getHours()) +
    ':' + padZero(date.getMinutes()) +
    ':' + padZero(date.getSeconds()) +
    sign + padZero(timezoneOffsetHours) +
    ':' + padZero(timezoneOffsetMinutes);
}