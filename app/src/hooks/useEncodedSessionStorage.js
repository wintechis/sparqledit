import React from 'react';

/**
 * save objecs in sessionStorage; json, character and base64 encoded
 * sessionStorage is deleted after closing the browser tab
 */
export default function useEncodedSessionStorage(key, defaultValue) {
  const [value, setValue] = React.useState(() => {
    return getValueFromStorage(key, defaultValue);
  });

  function getValueFromStorage(key, defaultValue) {
    // get data from sessionStorage
    const storedData = sessionStorage.getItem(key);
    if (storedData) {
      try {
        return JSON.parse(decodeFromBase64(sessionStorage.getItem(key)));
      } catch (error) {
        return defaultValue;
      }
    }
    return defaultValue;
  }
  
  React.useEffect(() => {
    // save encoded data in sessionStorage
    sessionStorage.setItem(key, encodeToBase64(JSON.stringify(value)));
  }, [key, value]);

  return [value, setValue];
};

function encodeToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
  return btoa(binString);
}

function decodeFromBase64(base64) {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
  return new TextDecoder().decode(bytes);
}