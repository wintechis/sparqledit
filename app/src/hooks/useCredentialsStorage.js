import useEncodedSessionStorage from './useEncodedSessionStorage';

const defaultCredentials = { username: '', password: ''};

export default function useCredentialsStorage(sparqlView) {
  const [credentials, setCredentials] = useEncodedSessionStorage(`sparqledit-${sparqlView.id}`, defaultCredentials);

  if (sparqlView.requiresBasicAuth) {
    return [credentials, setCredentials];
  } else {
    return [defaultCredentials, () => {}];
  }
};