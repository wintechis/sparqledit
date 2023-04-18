import { 
  BuildingError, 
  UpdateError, 
  UpdateCheckError,
  DataChangeUpdateCheckError
} from '../CustomErrors';


export function initialInputCellState(sparqlSubmission, origValue) {
  return {
    origSparqlSubmission: sparqlSubmission,
    origCellValue: origValue,
    currentCellValue: null,
    buildingError: null,
    updateQuery: null,
    checkQuery: null,
    updateResult: null,
    updateError: null,
    updateCheckError: null,
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
          newState.checkQuery = action.buildCheckQuery();
          newState.updateQuery = action.buildUpdateQuery();
        } catch (error) {
          const buildingError = new BuildingError(
            `The update query building algorithm failed.\n${error.name} - ${error.message}`);
          newState.updateQuery = newState.checkQuery = null;
          newState.buildingError = buildingError;
        }
      }
      return newState;

    case "INPUTCELL_INSERT_INIT":
      const newInsertState = { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.origCellValue
      };
      try {
        newInsertState.checkQuery = action.buildCheckQuery();
        newInsertState.updateQuery = action.buildUpdateQuery();
      } catch (error) {
        const buildingError = new BuildingError(
          `The update query building algorithm failed.\n${error.name} - ${error.message}`);
        newInsertState.updateQuery = newInsertState.checkQuery = null;
        newInsertState.buildingError = buildingError;
      }
      return newInsertState;

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
        checkQuery: state.checkQuery,
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
        `The update query failed.\n${action.error.name} - ${action.error.message}`,
        state.origSparqlSubmission.endpointUpdate);
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        checkQuery: state.checkQuery,
        updateError: updateError,
        isExecutingQuery: false
      };

    case "INPUTCELL_UPDATECHECK_FAIL":
      const erMsg = `The preflight check was not successful:\n ${action.error.message}`;
      let checkError = new UpdateCheckError(erMsg, state.origSparqlSubmission.endpointUpdate);
      if (action.error instanceof DataChangeUpdateCheckError) {
        checkError = new DataChangeUpdateCheckError(erMsg, state.origSparqlSubmission.endpointUpdate);
      }
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        checkQuery: state.checkQuery,
        updateCheckError: checkError,
        isExecutingQuery: false
      };

    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}
