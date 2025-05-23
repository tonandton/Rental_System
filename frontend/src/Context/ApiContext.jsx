import { createContext, useContext } from "react";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (() => {
      console.error(
        "VITE_API_BASE_URL is not set. Falling back to http://localhost:3001"
      );
      return "http://localhost:3001";
    })();

  return (
    <ApiContext.Provider value={{ API_BASE_URL }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
