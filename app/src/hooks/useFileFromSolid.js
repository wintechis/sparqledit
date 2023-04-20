import React from 'react';
import { SolidError } from '../scripts/CustomErrors';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { getFile, isRawData, getContentType, getSourceUrl, } from "@inrupt/solid-client";

const defaultInitialFetchState = {
  loading: false,
  error: null,
  file: null
};

export function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { loading: true, file: state.result };
    case "FETCH_FAIL":
      return { loading: false, file: null, error: action.error };
    case "FETCH_SUCCESS":
      return { file: action.file };
    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}

function useFileFromSolid(fileURL, initialFetchState = defaultInitialFetchState) {
  const [fetchState, dispatch] = React.useReducer(fetchReducer, initialFetchState);

  React.useEffect(() => {
    async function fetchFileFromSolidPod(abortController) {
      dispatch({ type: "FETCH_START" });

      // create a custom fetch handler
      const myfetch = (url) => fetch(url, {signal: abortController.signal});

      try {
        // fetch raw file
        const file = await getFile(fileURL, { fetch: myfetch });
        console.log( `Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`);
        console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);
        dispatch({
          type: "FETCH_SUCCESS",
          file: file
        });
      } catch (error) {
        if (error.name === 'AbortError' || abortController.signal.aborted) return;
        
        // only dispatch if fetch was not aborted
        const customError = new SolidError(
          `The file could not be loaded from the Solid Pod.\n${error.name} - ${error.message}`,
          fileURL);
        dispatch({
          type: "FETCH_FAIL",
          error: customError
        });
      }
    }

    const abortController = new AbortController();

    if(fileURL && fileURL.length > 0) fetchFileFromSolidPod(abortController);

    // clean-up/abort function
    return () => {
      abortController.abort();
    };
  }, [fileURL]);

  return fetchState;
}

export default useFileFromSolid;