import React from 'react';
import { QueryError } from '../scripts/CustomErrors';
import { QuerySubmissionResult } from '../scripts/models/QuerySubmission';

const defaultInitialFetchState = {
  loading: false,
  error: null,
  result: null
};

export function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { loading: true, result: state.result };
    case "FETCH_FAIL":
      return { loading: false, result: null, error: action.error };
    case "FETCH_SUCCESS":
      return { result: action.result };
    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}

function useFetchSparql(querySubmission, initialFetchState = defaultInitialFetchState) {
  const [fetchState, dispatch] = React.useReducer(fetchReducer, initialFetchState);

  React.useEffect(() => {
    async function fetchResult(abortController) {
      dispatch({ type: "FETCH_START" });

      try {
        // dyn. load sparqledit module
        const SparqlEdit = await import('../scripts/sparqledit/sparqledit');
        // execute query, build SPARQL JS object
        const queryResult = await SparqlEdit.executeSelectOrUpdateQuery(querySubmission, abortController);
        console.log("QueryResult", queryResult);
        const queryObj = SparqlEdit.buildQueryObject(querySubmission.queryString);
        // success: return Result object
        dispatch({
          type: "FETCH_SUCCESS",
          result: new QuerySubmissionResult(querySubmission, queryResult, queryObj)
        });
      } catch (error) {     
        if (error.name === 'AbortError' || abortController.signal.aborted) return;
        
        // only dispatch if fetch was not aborted
        const customError = new QueryError(
          `The query execution failed.\n${error.name} - ${error.message}`, 
          querySubmission.endpointQuery);
        dispatch({
          type: "FETCH_FAIL",
          error: customError
        });
      }
    }

    const abortController = new AbortController();

    if(querySubmission) fetchResult(abortController);

    // clean-up/abort function
    return () => {
      abortController.abort();
    };
  }, [querySubmission]);

  return fetchState;
}

export default useFetchSparql;