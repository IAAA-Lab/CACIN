import { useCallback, useContext, useState } from "react";
import Context from "../context/UserContext";
import loginService from "../services/login";

export default function useUser() {
  const {jwt, setJWT} = useContext(Context);
  const [state, setState] = useState({loading: false, error: false});

  const login = useCallback(({email, password}) => {
    setState({loading: true, error: false});
    loginService({email, password})
      .then(jwt => {
        window.sessionStorage.setItem('jwt', jwt);
        setState({loading: false, error: false});
        setJWT(jwt)
      })
      .catch(err => {
        window.sessionStorage.removeItem('jwt');
        setState({loading: false, error: true});
        console.error('Error:', err)
      });
  }, [setJWT]);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem('jwt');
    setJWT(null);
  }, [setJWT]);

  return {
    isLoggedIn: Boolean(jwt),
    isLogginLoading: state.loading,
    isLogginError: state.error,
    login,
    logout
  };
}