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
  updateNameQuery: (newValue: string) => loadAndEvalQueryTemplate('updateName.sparql', newValue),
  updateMotivationQuery: (newValue: string) => loadAndEvalQueryTemplate('updateMotivation.sparql', newValue),
  updateUniversityLabelQuery: (newValue: string) => loadAndEvalQueryTemplate('updateUniversityLabel.sparql', newValue),
  insertMotivationQuery: (newValue: string) => loadAndEvalQueryTemplate('insertMotivation.sparql', newValue),
  insertUniversityLabelQuery: (newValue: string) => loadAndEvalQueryTemplate('insertUniversityLabel.sparql', newValue)
}