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

export function getTableColumnsFromResultBindings(sparqlResultBindings) {
  const columnNames = new Set(
    sparqlResultBindings.flatMap( binding => 
      Object.keys(binding)
        .filter(key => binding[key].include === true)
    )
  );
  return [...columnNames]; // transform Set to Array
}

export function createCSVStringFromResultBindings(sparqlResultBindings) {
  // get the table columns
  const tableColumns = getTableColumnsFromResultBindings(sparqlResultBindings);

  // create data array for CSV
  const csvData = [[...tableColumns]];
  sparqlResultBindings.forEach((bindingsRow,i) => {
    csvData.push(
      tableColumns.map(columnName => sparqlResultBindings[i][columnName]?.value || '')
    );
  });

  // transform data array to CSV string
  const CSV_DELIMITER = ',';
  let csvString = ''; // maybe add heading line
  csvData.forEach(row => {
    csvString += row
      .map(cell => cell.includes(CSV_DELIMITER) ? `"${cell}"` : cell)
      .join(CSV_DELIMITER) + '\n';
  });

  return csvString;
};