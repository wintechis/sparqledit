import { fromRdf } from 'rdf-literal';

export function addInsertModeLiteralsToQueryResultBindings(sparqlResultBindingsRaw){
  // collect variables and their datatypes
  const variableLiteralMap = new Map();
  for (let i = 0; i < sparqlResultBindingsRaw.length; i++) {
    Object.keys(sparqlResultBindingsRaw[i]).forEach(variableName => {
      const binding = sparqlResultBindingsRaw[i][variableName];
      if (binding.termType === "Literal" && binding.include === true && binding.datatype) {
        variableLiteralMap.set(variableName, binding);
      }
    });
  }
  // fill every missing binding with empty literals of the variable's datatype
  for (let i = 0; i < sparqlResultBindingsRaw.length; i++) {
    variableLiteralMap.forEach((variableLiteral, variableName) => {
      if (!sparqlResultBindingsRaw[i].hasOwnProperty(variableName)) {
        sparqlResultBindingsRaw[i][variableName] = {
          termType: variableLiteral.termType, // 'Literal'
          datatype: variableLiteral.datatype,
          language: variableLiteral.language,
          value: getDefaultValueforBinding(variableLiteral),
          include: true,
          insertMode: true
        };
      }
    });
  }
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
      defaultValue = '0.0';
      break;
    case 'boolean':
      defaultValue = 'false';
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