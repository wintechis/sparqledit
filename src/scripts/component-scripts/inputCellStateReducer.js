import { BuildingError, UpdateError } from '../CustomErrors';

export function initialInputCellState(sparqlSubmission, origValue) {
  return {
    origSparqlSubmission: sparqlSubmission,
    origCellValue: origValue,
    currentCellValue: null,
    buildingError: null,
    updateQuery: null,
    updateResult: null,
    updateError: null,
    isExecutingQuery: false
  }
};

export function inputCellStateReducer(state, action) {
  switch (action.type) {
    
    case "INPUTCELL_CHANGE":
      const newState = { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
      };
      // eslint-disable-next-line
      if (action.currentCellValue != state.origCellValue) {
        newState.currentCellValue = action.currentCellValue
        try {
          const updateQu = action.buildUpdateQuery();
          newState.updateQuery = updateQu;
        } catch (error) {
          const buildingError = new BuildingError(
            `The update query building algorithm failed.\n${error.name} - ${error.message}`);
          newState.updateQuery = null;
          newState.buildingError = buildingError;
        }
      }
      return newState;

    case "INPUTCELL_RESET":
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue 
      };

    case "INPUTCELL_UPDATE_START":
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        isExecutingQuery: true
      };

    case "INPUTCELL_UPDATE_SUCCESS":
      // wrong state/value if update successful but no effect
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.currentCellValue,
        updateResult: action.result,
        isExecutingQuery: false
      };
      
    case "INPUTCELL_UPDATE_FAIL":
      const updateError = new UpdateError(
        `The update query failed.\n${action.error.name} - ${action.error.message}`);
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        updateError: updateError,
        isExecutingQuery: false
      };

    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}
