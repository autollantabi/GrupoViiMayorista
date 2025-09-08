import React, { createContext, useState, useContext } from "react";

const ProductCacheContext = createContext();

export function ProductCacheProvider({ children }) {
  // Estado para almacenar productos por empresa
  const [productCache, setProductCache] = useState({});
  
  // Estado para almacenar la última vez que se actualizó el caché por empresa
  const [lastFetch, setLastFetch] = useState({});

  // Tiempo de expiración del caché en milisegundos (10 minutos)
  const CACHE_EXPIRY_TIME = 10 * 60 * 1000; 

  // Verificar si el caché para una empresa está actualizado
  const isCacheValid = (empresaName) => {
    if (!lastFetch[empresaName]) return false;
    
    const now = new Date().getTime();
    return now - lastFetch[empresaName] < CACHE_EXPIRY_TIME;
  };

  // Guardar productos en caché para una empresa
  const cacheProducts = (empresaName, products) => {
    setProductCache(prevCache => ({
      ...prevCache,
      [empresaName]: products
    }));
    
    setLastFetch(prevFetch => ({
      ...prevFetch,
      [empresaName]: new Date().getTime()
    }));
  };

  // Obtener productos del caché
  const getCachedProducts = (empresaName) => {
    return productCache[empresaName] || null;
  };

  // Invalidar caché para una empresa específica
  const invalidateCache = (empresaName) => {
    setLastFetch(prevFetch => ({
      ...prevFetch,
      [empresaName]: null
    }));
  };

  // Invalidar todo el caché
  const clearAllCache = () => {
    setProductCache({});
    setLastFetch({});
  };

  return (
    <ProductCacheContext.Provider
      value={{
        isCacheValid,
        cacheProducts,
        getCachedProducts,
        invalidateCache,
        clearAllCache
      }}
    >
      {children}
    </ProductCacheContext.Provider>
  );
}

export function useProductCache() {
  return useContext(ProductCacheContext);
}