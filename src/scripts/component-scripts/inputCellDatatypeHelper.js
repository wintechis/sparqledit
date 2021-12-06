import { fromRdf } from 'rdf-literal';

export default function getInputTypeForLiteral(binding) {
  const bindingDatatype = binding.datatype.value.toLowerCase();
  let origValue = fromRdf(binding);
  let inputType = 'text';
  let inputStep = null;
  switch (typeof(origValue)) {
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
          origValue = origValue.toISOString().substring(0,10); // only date
          inputType = 'date';
        } else if (bindingDatatype.endsWith('#datetime')) {
          const timezoneOffset = origValue.getTimezoneOffset() * 60000;
          const correctedTime = new Date(origValue.getTime() - timezoneOffset);
          origValue = correctedTime.toISOString().substring(0,19); // only date+time
          inputType = 'datetime-local';
          inputStep = 1;
        }
      }
      break;
    default:
  }
  return {
    value: origValue,
    inputType,
    inputStep
  };
}