import React from 'react';
import QuerySubmissionResult from '../scripts/QuerySubmissionResult';
import { executeSelectOrUpdateQuery } from '../scripts/sparqledit';

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
    async function fetchResult() {
      dispatch({ type: "FETCH_START" });
      try {
        const queryResult = await executeSelectOrUpdateQuery(querySubmission);
        dispatch({
          type: "FETCH_SUCCESS",
          result: new QuerySubmissionResult(querySubmission, queryResult)
        });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          error
        });
      }
    }
    if(querySubmission) fetchResult();
  }, [querySubmission]);

  return fetchState;
}

export default useFetchSparql;