import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import RenderIcon from "../ui/RenderIcon";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import { baseLinkImages } from "../../constants/links";
import { useProductCatalog } from "../../context/ProductCatalogContext";

const ProductDetailContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ProductDetailContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  @media (max-width: 768px) {
    gap: 24px;
    margin-top: 20px;
  }
`;

const ProductDetail = ({
  product,
  onBack,
  onLineaSelect,
  onFilterSelect,
  onProductsSelect,
  catalogState,
  isAtProductView,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isClient, isVisualizacion } = useAuth();
  const { loadProductByCodigo } = useProductCatalog();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [productData, setProductData] = useState(product);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  useEffect(() => {
    setProductData(product);
  }, [product]);

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    const empresaId =
      product?.empresaId || product?.empresa || product?.ENTERPRISE;
    if (!empresaId) {
      return;
    }

    let isCancelled = false;

    const fetchProduct = async () => {
      if (!loadProductByCodigo) {
        return;
      }

      setIsLoadingProduct(true);
      try {
        const formattedProduct = await loadProductByCodigo(
          product.id,
          empresaId
        );

        if (formattedProduct && !isCancelled) {
          setProductData((prev) => {
            const previous = prev || {};
            return {
              ...previous,
              ...formattedProduct,
              id: product.id,
              empresaId: formattedProduct.empresaId || empresaId,
              empresa:
                formattedProduct.empresa ||
                previous.empresa ||
                product.empresa ||
                empresaId,
              discount:
                formattedProduct.discount ??
                previous.discount ??
                product.discount ??
                0,
              promotionalDiscount:
                formattedProduct.promotionalDiscount ??
                previous.promotionalDiscount ??
                product.promotionalDiscount ??
                0,
              iva:
                formattedProduct.iva ??
                previous.iva ??
                product.iva ??
                TAXES.IVA_PERCENTAGE,
              specs:
                formattedProduct.specs ||
                previous.specs ||
                product.specs ||
                null,
            };
          });
        }
      } catch (error) {
        console.error("Error al consultar producto desde detalle:", error);
      } finally {
        if (!isCancelled) {
          setIsLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isCancelled = true;
    };
  }, [product, loadProductByCodigo]);

  const resolvedProduct = productData;

  const resolvedImageSrc = useMemo(() => {
    if (!resolvedProduct?.image) return "";
    const trimmed = resolvedProduct.image.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `${baseLinkImages}${
      trimmed.startsWith("/") ? trimmed.slice(1) : trimmed
    }`;
  }, [resolvedProduct?.image]);

  if (!resolvedProduct) {
    return (
      <ProductDetailContainer>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <RenderIcon name="FaExclamationTriangle" size={48} />
          <h2>Producto no encontrado</h2>
          <Button text="Volver al catálogo" onClick={onBack} />
        </div>
      </ProductDetailContainer>
    );
  }

  // Calcular precio con descuento aplicado
  const discountedPrice =
    resolvedProduct.discount && resolvedProduct.price !== null
      ? resolvedProduct.price * (1 - resolvedProduct.discount / 100)
      : resolvedProduct.price || 0;

  // Calcular precio con IVA incluido
  const priceWithIVA = calculatePriceWithIVA(
    discountedPrice,
    resolvedProduct.iva || TAXES.IVA_PERCENTAGE
  );

  // Manejar agregar al carrito
  const handleAddToCart = async () => {
    if (!isClient || isVisualizacion) {
      toast.error("Tu rol no permite realizar compras");
      return;
    }

    if (quantity < 1) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    setIsAddingToCart(true);

    try {
      const result = await addToCart(resolvedProduct, quantity);
      if (result?.success) {
        toast.success("Producto agregado al carrito");
      } else {
        toast.error(
          result?.message || "No se pudo agregar el producto al carrito"
        );
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("Error al agregar al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Manejar ver carrito
  const handleViewCart = () => {
    navigate("/carrito");
  };

  return (
    <ProductDetailContainer>
      <CatalogBreadcrumb
        selectedLinea={catalogState?.selectedLinea}
        selectedValues={catalogState?.selectedValues}
        availableLines={catalogState?.availableLines}
        onLineaSelect={onLineaSelect}
        onFilterSelect={onFilterSelect}
        onProductsSelect={onProductsSelect}
        currentStep={null}
        flowConfig={catalogState?.flowConfig}
        isAtProductView={isAtProductView}
      />

      {isLoadingProduct && (
        <div
          style={{
            margin: "16px 0",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          Actualizando información del producto...
        </div>
      )}

      <ProductDetailContent>
        <div>
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              background: "#f5f5f5",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {resolvedImageSrc ? (
              <img
                src={resolvedImageSrc}
                alt={resolvedProduct.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#666" }}>
                <RenderIcon name="FaImage" size={48} />
                <div>Imagen no disponible</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              marginBottom: "24px",
              paddingBottom: "24px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                color: "#007bff",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              {resolvedProduct.brand}
            </div>
            <h1
              style={{
                fontSize: "1.8rem",
                margin: "0 0 12px 0",
                fontWeight: "700",
              }}
            >
              {resolvedProduct.name}
            </h1>
            <div
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "16px",
              }}
            >
              {resolvedProduct.empresa || resolvedProduct.empresaId}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#007bff",
                  }}
                >
                  ${priceWithIVA.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    marginTop: "4px",
                  }}
                >
                  IVA incluido
                </div>
              </div>
              {resolvedProduct.discount > 0 &&
                resolvedProduct.price != null && (
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: "#666",
                      textDecoration: "line-through",
                    }}
                  >
                    ${resolvedProduct.price.toFixed(2)}
                  </div>
                )}
              {resolvedProduct.discount > 0 && (
                <div
                  style={{
                    background: "#007bff",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  -{resolvedProduct.discount}%
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
                padding: "12px 16px",
                background: resolvedProduct.stock > 0 ? "#d4edda" : "#f8d7da",
                borderRadius: "8px",
                border: `1px solid ${
                  resolvedProduct.stock > 0 ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}
            >
              <RenderIcon
                name={
                  resolvedProduct.stock > 0 ? "FaCheckCircle" : "FaTimesCircle"
                }
                size={16}
              />
              <span
                style={{
                  color: resolvedProduct.stock > 0 ? "#155724" : "#721c24",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {resolvedProduct.stock > 0
                  ? `${resolvedProduct.stock} unidades disponibles`
                  : "Sin stock"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {isClient && !isVisualizacion && resolvedProduct.stock > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={resolvedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    style={{
                      width: "80px",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      textAlign: "center",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <Button
                  text={isAddingToCart ? "Agregando..." : "Agregar al carrito"}
                  variant="solid"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  leftIconName="FaShoppingCart"
                />

                <Button
                  text="Ver carrito"
                  variant="outlined"
                  onClick={handleViewCart}
                  leftIconName="FaCartArrowDown"
                />
              </>
            )}

            <Button
              text="Volver al catálogo"
              variant="outlined"
              onClick={onBack}
              leftIconName="FaArrowLeft"
            />
          </div>
        </div>
      </ProductDetailContent>
    </ProductDetailContainer>
  );
};

export default ProductDetail;
