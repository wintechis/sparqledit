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
      inputType = 'number';
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

export function getDefaultValueforBinding(binding) {
  let defaultValue = '';
  const bindingDatatype = binding.datatype.value.toLowerCase();
  let castedValue = fromRdf(binding);
  switch (typeof(castedValue)) {
    case 'string':
      defaultValue = '';
      break;
    case 'number':
      defaultValue = 0.0;
      break;
    case 'boolean':
      defaultValue = false;
      break;
    case 'object':
      if(castedValue instanceof Date) {
        if (bindingDatatype.endsWith('#date')) {
          defaultValue = '1970-01-01';
        } else if (bindingDatatype.endsWith('#datetime')) {
          defaultValue = '1970-01-01T00:00:00';
        }
      }
      break;
    default:
  }
  return defaultValue;
}