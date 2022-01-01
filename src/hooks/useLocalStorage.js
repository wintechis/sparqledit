import React from 'react';

/**
 * localStorage usually has a 5 MB size limit (more than 5 million characters)
 */
export default function useLocalStorage(key, defaultValue) {
  const [value, setValue] = React.useState(() => {
    return getValueFromStorage(key, defaultValue);
  });

  function getValueFromStorage(key, defaultValue) {
    // get data from localStorage
    const storedData = JSON.parse(localStorage.getItem(key));
    return storedData || defaultValue;
  }
  
  React.useEffect(() => {
    const valueSerialization = JSON.stringify(value);

    // save data in localStorage
    localStorage.setItem(key, valueSerialization);
  }, [key, value]);

  return [value, setValue];
};