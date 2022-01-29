import { fromRdf } from 'rdf-literal';

export default function getInputTypeForLiteral(binding) {
  const bindingDatatype = binding.datatype.value.toLowerCase();
  let origValue = fromRdf(binding);
  let inputType = 'text'; // default
  let inputStep = null;
  let error = null;
  switch (typeof(origValue)) {
    case 'string':
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
            origValue = correctedTime.toISOString().substring(0,19); // only date+time
            inputType = 'datetime-local';
            inputStep = 1;
          } catch (e) {
            error = new Error(`Cannot convert '${binding.value}' to xsd:dateTime.`);
            origValue = binding.value; // fallback to raw value
          }
        }
      }
      break;
    default:
  }
  return {
    error,
    value: origValue,
    inputType,
    inputStep
  };
}