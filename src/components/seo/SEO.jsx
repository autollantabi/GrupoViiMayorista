import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "ViiCommerce - Mayorista de Neumáticos, Lubricantes y Herramientas en Cuenca, Ecuador",
  description = "ViiCommerce es tu mayorista de confianza en Cuenca, Ecuador para neumáticos, lubricantes y herramientas. Amplio catálogo, precios mayoristas y envío a todo el Ecuador.",
  keywords = "neumáticos, llantas, lubricantes, herramientas, distribuidora, mayorista, autopartes, accesorios, Cuenca, Ecuador, ViiCommerce",
  image = "/og-image.jpg",
  url = "https://viicommerce.com",
  type = "website",
  structuredData = null,
}) => {
  const fullTitle = title.includes("ViiCommerce") ? title : `${title} | ViiCommerce`;
  const fullImage = image.startsWith("http") ? image : `${url}${image}`;

  return (
    <Helmet>
      {/* Meta tags básicos */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="ViiCommerce" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="ViiCommerce" />
      <meta property="og:locale" content="es_EC" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Datos estructurados */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
