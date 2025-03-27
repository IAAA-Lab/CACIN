import React, { useState } from 'react';

const Context = React.createContext({});

export function UserContextProvider({ children }) {
  const [jwt, setJWT] = useState(
    // Para guardar la sesion del usuario
    () => window.sessionStorage.getItem('jwt')
  );

  return (
    <Context.Provider value={{ jwt, setJWT }}>
      {children}
    </Context.Provider>
  );
}

export default Context;