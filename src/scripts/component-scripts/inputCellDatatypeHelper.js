import { fromRdf } from 'rdf-literal';

export default function getInputTypeForLiteral(binding) {
  const language = getBindingLanguageTag(binding);
  const bindingDatatype = binding.datatype.value.toLowerCase();

  let origValue = fromRdf(binding);
  let inputType = 'text'; // default
  let inputStep = null;
  let error = null;

  switch (typeof(origValue)) {

    case 'string':
      if (bindingDatatype.endsWith('#time')) {
        // in case of valid time (e.g. 'hh:mm:ss') display time input
        const timeRegex = /(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?$|(24:00:00(\.0+)?))$/;
        if (timeRegex.test(origValue)) {
          inputType = 'time';
        }
      }
      const newlineRegex = /\r?\n|\r/gm;
      if (newlineRegex.test(origValue)) {
        inputType = 'textarea';
      }
      break;

    case 'number':
      if (isNaN(origValue)) {
        error = new Error(`Cannot convert '${binding.value}' to a number.`);
        origValue = binding.value; // fallback to raw value
      } else {
        inputType = 'number';
      }
      break;

    case 'boolean':
      inputType = 'checkbox';
      origValue = String(origValue);
      break;

    case 'object':
      if(origValue instanceof Date) {
        if (bindingDatatype.endsWith('#date')) {
          try {
            origValue = origValue.toISOString().substring(0,10); // only date
            inputType = 'date';
          } catch (e) {
            error = new Error(`Cannot convert '${binding.value}' to xsd:date.`);
            origValue = binding.value; // fallback to raw value
          }
        } else if (bindingDatatype.endsWith('#datetime')) {
          try {
            const timezoneOffset = origValue.getTimezoneOffset() * 60000;
            const correctedTime = new Date(origValue.getTime() - timezoneOffset);
            origValue = correctedTime.toISOString().replace('Z',''); // remove time zone 'Z'
            inputType = 'datetime-local';
            inputStep = 1;
          } catch (e) {
            error = new Error(`Cannot convert '${binding.value}' to xsd:dateTime.`);
            origValue = binding.value; // fallback to raw value
          }
        } else if(/#gYear(Month)?$|#gDay$|#gMonth$/gi.test(bindingDatatype)) {
          // display incomplete dates in text inputs, not as partial date
          origValue = binding.value;
        }
      }
      break;

    default: // keep default values
  }

  return {
    error,
    value: origValue,
    inputType,
    inputStep,
    language
  };
}

function getBindingLanguageTag(binding) {
  const defaultLangTag = null;
  return binding.language?.length > 0 ? binding.language : defaultLangTag;
}