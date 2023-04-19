// import types
import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
import { SparqlEditResult } from '../src/types';

import * as sparqleditalgorithm from '../src/sparqleditalgorithm';

// import testcases and their data

import testcase_example from './testdata/example/example-testcase';
import * as results_example from './testdata/example/example-result.json';

const selectqueryobj_example = parseQueryString(testcase_example.selectQuery());

import testcase_nobelprizes from './testdata/nobelprizes/nobelprizes-testcase';
import * as results_nobelprizes from './testdata/nobelprizes/nobelprizes-result.json';

const selectqueryobj_nobelprizes = parseQueryString(testcase_nobelprizes.selectQuery());

// tests

test('example - change literal value', () => {
  // prepare
  const variableName = 'birthdate';
  const resultRowIndex = 2;
  const newLiteralValue = '1980-05-01';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_example, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_example.updateBirthdateQuery(newLiteralValue);

  // execute
  console.time('timeAlgo');
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_example, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);
  console.timeEnd('timeAlgo');

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(updateQueryStr).toEqual(expectedUpdateQueryStr);
});

test('example - change literal value inside blank node inside optional', () => {
  // prepare
  const variableName = 'weight';
  const resultRowIndex = 0;
  const newLiteralValue = '88.44';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_example, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_example.updateWeightQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_example, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(normalizeBlankNodeVariableNames(updateQueryStr)).toEqual(expectedUpdateQueryStr);
});

test('example - change literal value inside blank node inside optional 2', () => {
  // prepare
  const variableName = 'medoffice_zip';
  const resultRowIndex = 0;
  const newLiteralValue = '98765';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_example, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_example.updatePostalcodeQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_example, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(normalizeBlankNodeVariableNames(updateQueryStr)).toEqual(expectedUpdateQueryStr);
});

test('example - insert literal value', () => {
  // prepare
  const variableName = 'family';
  const resultRowIndex = 1;
  const newLiteralValue = 'Doe';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_example, resultRowIndex, variableName, newLiteralValue);
  const expectedInsertQueryStr = testcase_example.insertFamilynameQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_example, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(updateQueryStr).toEqual(expectedInsertQueryStr);
});

test('example - insert literal value inside blank node inside optional', () => {
  // prepare
  const variableName = 'weight';
  const resultRowIndex = 1;
  const newLiteralValue = '66';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_example, resultRowIndex, variableName, newLiteralValue);
  const expectedInsertQueryStr = testcase_example.insertWeightQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_example, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(normalizeBlankNodeNamesInInsertBlock(updateQueryStr)).toEqual(expectedInsertQueryStr);
});

test('nobelprizes - change literal value', () => {
  // prepare
  const variableName = 'name';
  const resultRowIndex = 1;
  const newLiteralValue = 'test';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_nobelprizes, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_nobelprizes.updateNameQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_nobelprizes, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(updateQueryStr).toEqual(expectedUpdateQueryStr);
});

test('nobelprizes - change literal value inside optional', () => {
  // prepare
  const variableName = 'prizeMotivation';
  const resultRowIndex = 2;
  const newLiteralValue = 'test motivation';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_nobelprizes, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_nobelprizes.updateMotivationQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_nobelprizes, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(updateQueryStr).toEqual(expectedUpdateQueryStr);
});

test('nobelprizes - change literal value inside blank node inside optional', () => {
  // prepare
  const variableName = 'university';
  const resultRowIndex = 5;
  const newLiteralValue = 'test university';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_nobelprizes, resultRowIndex, variableName, newLiteralValue);
  const expectedUpdateQueryStr = testcase_nobelprizes.updateUniversityLabelQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_nobelprizes, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(normalizeBlankNodeVariableNames(updateQueryStr)).toEqual(expectedUpdateQueryStr);
});

test('nobelprizes - insert query for literal inside optional', () => {
  // prepare
  const variableName = 'prizeMotivation';
  const resultRowIndex = 0;
  const newLiteralValue = 'test motivation';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_nobelprizes, resultRowIndex, variableName, newLiteralValue);
  const expectedInsertQueryStr = testcase_nobelprizes.insertMotivationQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_nobelprizes, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(updateQueryStr).toEqual(expectedInsertQueryStr);
});

test('nobelprizes - insert query for blank node value inside optional', () => {
  // prepare
  const variableName = 'university';
  const resultRowIndex = 5;
  const newLiteralValue = 'test university';

  const sparqleditQueryResults = copyResultsAndInsertNewLiteralValue(results_nobelprizes, resultRowIndex, variableName, newLiteralValue, true);
  const expectedInsertQueryStr = testcase_nobelprizes.insertUniversityLabelQuery(newLiteralValue);

  // execute
  const updateQueryObj = sparqleditalgorithm.buildUpdateQuery(selectqueryobj_nobelprizes, sparqleditQueryResults[resultRowIndex]);
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // assert
  expect(updateQueryObj).toBeTruthy();
  expect(normalizeBlankNodeNamesInInsertBlock(updateQueryStr)).toEqual(expectedInsertQueryStr);
});

// helper functions

function copyResultsAndInsertNewLiteralValue(
  rawSparqleditQueryResults: any, 
  resultRowIndex: number, 
  variableName: string, 
  newLiteralValue: string,
  addInsertMode?: boolean
): SparqlEditResult {
  
  // clone (deep copy) the query results
  const sparqleditQueryResults: SparqlEditResult = cloneObject(rawSparqleditQueryResults);
  // insert the edited value
  const editedTerm = sparqleditQueryResults[resultRowIndex][variableName];
  if (isLiteralTerm(editedTerm)) {
    editedTerm.valueNew = newLiteralValue;
    if (addInsertMode) {
      editedTerm.insertMode = true;      
    }
  } else {
    throw new Error('Invalid literal term.');    
  }
  return sparqleditQueryResults;
}

function isLiteralTerm(term: RDF.Term): term is RDF.Literal {
  return term.termType === 'Literal';
}

function cloneObject<T extends Object>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

function parseQueryString(queryStr: string): SparqlJS.SelectQuery {
  // parse query string into JS object
  const SparqlParser = require('sparqljs').Parser;
  return new SparqlParser().parse(queryStr);
}

function stringifyQueryObject(queryObject: SparqlJS.SparqlQuery): string {
  // generate SPARQL query string from JS object
  const SparqlGenerator = require('sparqljs').Generator;
  return new SparqlGenerator().stringify(queryObject);
}

function normalizeBlankNodeVariableNames(updateQueryStr: string) {
  return updateQueryStr.replace(/(\s)(\?g_\d{1,3})([\s\.])/g, '$1?g_1$3');
}

function normalizeBlankNodeNamesInInsertBlock(updateQueryStr: string) {
  return updateQueryStr.replace(/(\s)(_:g_\d{1,3})([\s\.])/g, '$1_:g_1$3');
}