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
          newState.updateQuery = null;
          newState.buildingError = error;
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
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        updateError: action.error,
        isExecutingQuery: false
      };

    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}
