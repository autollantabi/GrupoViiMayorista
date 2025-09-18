import { useMemo } from "react";

export const useProductStructuredData = (product) => {
  return useMemo(() => {
    if (!product) return null;

    const baseUrl = "https://viicommerce.com";
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `Producto ${product.name} de la marca ${product.brand}`,
      "image": product.image ? `${baseUrl}${product.image}` : undefined,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "manufacturer": {
        "@type": "Organization",
        "name": product.empresa || product.empresaId
      },
      "offers": {
        "@type": "Offer",
        "url": `${baseUrl}/productos/${product.id}`,
        "priceCurrency": "USD",
        "price": product.price || 0,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": product.empresa || product.empresaId
        }
      },
      "category": product.filtersByType ? Object.values(product.filtersByType).flat().join(", ") : "Productos automotrices",
      "sku": product.codigo || product.id,
      "mpn": product.codigo || product.id,
      "gtin": product.codigo || product.id,
      "additionalProperty": product.specs ? Object.entries(product.specs).map(([key, value]) => ({
        "@type": "PropertyValue",
        "name": key,
        "value": value
      })) : []
    };
  }, [product]);
};

export const useOrganizationStructuredData = () => {
  return useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ViiCommerce",
      "description": "Mayorista de neumáticos, lubricantes y herramientas en Cuenca, Ecuador",
      "url": "https://viicommerce.com",
      "logo": "https://viicommerce.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cuenca",
        "addressRegion": "Azuay",
        "addressCountry": "EC"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+593-XX-XXX-XXXX",
        "contactType": "customer service",
        "availableLanguage": "Spanish"
      },
      "sameAs": [
        "https://www.facebook.com/viicommerce",
        "https://www.instagram.com/viicommerce",
        "https://www.linkedin.com/company/viicommerce"
      ]
    };
  }, []);
};

export const useWebsiteStructuredData = () => {
  return useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ViiCommerce",
      "description": "ViiCommerce - Mayorista de neumáticos, lubricantes y herramientas en Cuenca, Ecuador",
      "url": "https://viicommerce.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://viicommerce.com/busqueda?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  }, []);
};
