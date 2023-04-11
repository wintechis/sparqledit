import * as fs from 'fs';
import * as path from 'path';

function loadAndEvalQueryTemplate(fileName: string, newValue: string): string {
  // construct file path
  const filePath = path.resolve(__dirname, './queries', fileName);
  // load query string template from files
  const queryTemplate = fs.readFileSync(filePath, {encoding: 'utf8'});
  // use eval to fill out ${newValue} in the template
  return eval('`' + queryTemplate + '`');
}

export default {
  selectQuery: () => loadAndEvalQueryTemplate('selectQuery.sparql', ''),
  updateBirthdateQuery: (newValue: string) => loadAndEvalQueryTemplate('updateBirthdate.sparql', newValue),
  updateWeightQuery: (newValue: string) => loadAndEvalQueryTemplate('updateWeight.sparql', newValue),
  updatePostalcodeQuery: (newValue: string) => loadAndEvalQueryTemplate('updatePostalcode.sparql', newValue),
  insertFamilynameQuery: (newValue: string) => loadAndEvalQueryTemplate('insertFamilyname.sparql', newValue),
  insertWeightQuery: (newValue: string) => loadAndEvalQueryTemplate('insertWeight.sparql', newValue),
}