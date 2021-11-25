import React from 'react';

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
    // save data in localStorage
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};