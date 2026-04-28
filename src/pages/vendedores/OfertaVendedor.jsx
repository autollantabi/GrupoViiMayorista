import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { DISCOUNT_LIMITS } from "../../constants/discounts";
import { ROUTES } from "../../constants/routes";
import { TAXES } from "../../constants/taxes";
import { ROLES } from "../../constants/roles";
import Button from "../../components/ui/Button";

import RenderIcon from "../../components/ui/RenderIcon";
import RenderLoader from "../../components/ui/RenderLoader";
import { toast } from "react-toastify";
import { baseLinkImages } from "../../constants/links";
import {
  api_vendedores_previsualizarDescuentos,
  api_vendedores_createProforma,
} from "../../api/vendedores/apiVendedores";
import { api_order_getOrdersBySeller } from "../../api/order/apiOrder";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// Brand Logos for Footer
import AplusLogo from "../../assets/brand/APLUS-LOGO.png";
import CstLogo from "../../assets/brand/CST-TIRES-LOGO.png";
import FortuneLogo from "../../assets/brand/FORTUNE-LOGO.png";
import HaohuaLogo from "../../assets/brand/HAOHUA-LOGO.png";
import MaxxisLogo from "../../assets/brand/MAXXIS-LOGO.png";
import AutollantaLogo from "../../assets/enterprises/AutollantaLight.png";



const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text};
  position: relative;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProductItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 80px 1fr auto auto 48px;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background: #ef444410;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const PriceTag = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OriginalPrice = styled.div`
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const FinalPrice = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const PriceInput = styled.input`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  width: 110px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary}30;
  text-align: right;
  padding: 2px;
  color: ${({ theme }) => theme.colors.primary};

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}05;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const DiscountInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  width: 80px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.background};
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const QtyButton = styled.button`
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QtyValue = styled.span`
  font-weight: 600;
  min-width: 30px;
  text-align: center;
  font-size: 0.95rem;
`;

const Summary = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 3rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;

  &.total {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid ${({ theme }) => theme.colors.border};
    font-weight: 800;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const IvaLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const CompanyTabs = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  gap: 0.5rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    height: 2px;
    background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.colors.primary}40, transparent)`
      : `linear-gradient(90deg, ${theme.colors.primary}30, transparent)`};
    width: 100%;
    pointer-events: none;
  }
`;

const CompanyTab = styled.button`
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 12px 12px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: ${({ theme, $active }) =>
    $active
      ? theme.mode === "dark"
        ? `${theme.colors.primary}10`
        : `${theme.colors.primary}08`
      : "transparent"};

  &::before {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transform: ${({ $active }) => ($active ? "scaleX(1)" : "scaleX(0)")};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
    !$active
      ? theme.mode === "dark"
        ? `${theme.colors.primary}08`
        : `${theme.colors.primary}05`
      : theme.mode === "dark"
        ? `${theme.colors.primary}15`
        : `${theme.colors.primary}12`};
  }
`;

const BrandFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5rem;
  flex-wrap: wrap;
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding: 2.5rem 1rem;
  border-top: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  border-bottom: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  background: ${({ theme }) =>
    theme.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"};
  border-radius: 16px;

  @media (max-width: 768px) {
    gap: 1.5rem;
    padding: 1.5rem 0.5rem;
  }
`;

const BrandLogoItem = styled.img`
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: ${({ theme }) => theme.mode === "dark" ? "grayscale(1) brightness(2)" : "grayscale(1) brightness(0.8)"};
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    filter: grayscale(0) brightness(1);
    opacity: 1;
    transform: scale(1.15);
  }

  @media (max-width: 768px) {
    height: 35px;
  }
`;

// ─── Componente de item de oferta (misma lógica de cantidad que CartItem en Carrito) ───
const OfertaProductItem = ({
  item,
  handleQuantityChange,
  extraDiscounts,
  handleProductDiscountChange,
  handlePriceChange,
  previewDiscount,
  removeFromCart,
  calculateProductTotal,
  DISCOUNT_LIMITS,
}) => {
  const maxQuantity = item.stock || 0;
  const quantityIntervalRef = useRef(null);
  const currentQuantityRef = useRef(item.quantity);
  const mouseDownExecutedRef = useRef(false);

  // Mantener el ref sincronizado con el prop
  useEffect(() => {
    currentQuantityRef.current = item.quantity;
  }, [item.quantity]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (quantityIntervalRef.current) {
        if (typeof quantityIntervalRef.current === "number") {
          clearTimeout(quantityIntervalRef.current);
        } else {
          clearInterval(quantityIntervalRef.current);
        }
      }
    };
  }, []);

  const clearQtyInterval = () => {
    if (quantityIntervalRef.current) {
      if (typeof quantityIntervalRef.current === "number") {
        clearTimeout(quantityIntervalRef.current);
      } else {
        clearInterval(quantityIntervalRef.current);
      }
      quantityIntervalRef.current = null;
    }
  };

  const handleDecreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    mouseDownExecutedRef.current = true;
    clearQtyInterval();
    if (currentQuantityRef.current > 1) {
      handleQuantityChange(item.id, currentQuantityRef.current - 1);
    }
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentQuantityRef.current > 1) {
          const nq = currentQuantityRef.current - 1;
          currentQuantityRef.current = nq;
          handleQuantityChange(item.id, nq);
        } else {
          clearInterval(interval);
          quantityIntervalRef.current = null;
        }
      }, 150);
      quantityIntervalRef.current = interval;
    }, 500);
  };

  const handleIncreaseMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    mouseDownExecutedRef.current = true;
    clearQtyInterval();
    if (maxQuantity === 0 || currentQuantityRef.current < maxQuantity) {
      handleQuantityChange(item.id, currentQuantityRef.current + 1);
    }
    quantityIntervalRef.current = setTimeout(() => {
      const interval = setInterval(() => {
        if (maxQuantity === 0 || currentQuantityRef.current < maxQuantity) {
          const nq = currentQuantityRef.current + 1;
          currentQuantityRef.current = nq;
          handleQuantityChange(item.id, nq);
        } else {
          clearInterval(interval);
          quantityIntervalRef.current = null;
        }
      }, 150);
      quantityIntervalRef.current = interval;
    }, 500);
  };

  const handleMouseUp = () => {
    clearQtyInterval();
    setTimeout(() => { mouseDownExecutedRef.current = false; }, 200);
  };

  const calcs = calculateProductTotal(item);
  const productSapDiscount = previewDiscount?.DESCUENTOS_PRODUCTOS?.find(
    (p) => p.PRODUCT_CODE === item.id
  )?.DISCOUNT_PRODUCTO_SAP || 0;

  // Estados locales para permitir digitar libremente sin el loop de formateo
  const [localPrice, setLocalPrice] = useState("");
  const [localDiscount, setLocalDiscount] = useState("");
  const [isPriceFocused, setIsPriceFocused] = useState(false);
  const [isDiscountFocused, setIsDiscountFocused] = useState(false);

  // Sincronizar desde el padre solo si NO hay foco
  useEffect(() => {
    if (!isPriceFocused) {
      setLocalPrice(calcs.totalWithExtra.toFixed(2));
    }
  }, [calcs.totalWithExtra, isPriceFocused]);

  useEffect(() => {
    if (!isDiscountFocused) {
      const parentVal = extraDiscounts[item.id];
      // Mostrar siempre con 2 decimales cuando no hay foco
      setLocalDiscount(parentVal !== undefined ? parentVal.toFixed(2) : "");
    }
  }, [extraDiscounts, item.id, isDiscountFocused]);

  const onPriceChange = (e) => {
    const val = e.target.value;
    setLocalPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      handlePriceChange(item.id, num / item.quantity);
    }
  };

  const onDiscountChange = (e) => {
    const val = e.target.value;
    setLocalDiscount(val);
    handleProductDiscountChange(item.id, val);
  };

  return (
    <ProductItem key={item.id}>
      <ProductImage src={item.displayImage || `${baseLinkImages}${item.image}`} alt={item.name} />
      <ProductInfo>
        <ProductName>{item.name}</ProductName>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <QuantitySelector>
            {/* Botón Decrementar */}
            <QtyButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!mouseDownExecutedRef.current) {
                  handleQuantityChange(item.id, item.quantity - 1);
                }
              }}
              onMouseDown={handleDecreaseMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleDecreaseMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={item.quantity <= 1}
            >
              <RenderIcon name="FaMinus" size={12} />
            </QtyButton>

            {/* Input de cantidad */}
            <QtyValue
              as="input"
              type="number"
              min="1"
              max={maxQuantity > 0 ? maxQuantity : undefined}
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                const limited = maxQuantity > 0 ? Math.min(val, maxQuantity) : val;
                handleQuantityChange(item.id, limited);
              }}
              style={{
                width: "48px",
                textAlign: "center",
                border: "none",
                background: "transparent",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#ffffff",
              }}
            />

            {/* Botón Incrementar */}
            <QtyButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!mouseDownExecutedRef.current) {
                  handleQuantityChange(item.id, item.quantity + 1);
                }
              }}
              onMouseDown={handleIncreaseMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleIncreaseMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={maxQuantity > 0 && item.quantity >= maxQuantity}
            >
              <RenderIcon name="FaPlus" size={12} />
            </QtyButton>
          </QuantitySelector>

          <div style={{ fontSize: "0.9rem", color: "#888" }}>
            Marca: {item.displayBrand}
          </div>
        </div>

        {productSapDiscount > 0 && (
          <div style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: "600" }}>
            Desc. SAP: {productSapDiscount}%
          </div>
        )}
      </ProductInfo>

      <DiscountInputWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Label>Desc. Extra %</Label>
          <StyledInput
            type="number"
            step="0.1"
            value={localDiscount}
            onChange={onDiscountChange}
            onFocus={() => setIsDiscountFocused(true)}
            onBlur={() => setIsDiscountFocused(false)}
            placeholder="0.0"
            style={{ width: "80px" }}
          />
        </div>
        <IvaLabel style={{ marginTop: "0.2rem", fontSize: "0.65rem", display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span>Límite permitido: {DISCOUNT_LIMITS.PRODUCT_MAX_PERCENT}%</span>
          {calcs.extraDiscount > DISCOUNT_LIMITS.PRODUCT_MAX_PERCENT && (
            <span style={{ color: '#ef4444', fontWeight: 700 }}>EXCEDE LÍMITE</span>
          )}
        </IvaLabel>
      </DiscountInputWrapper>

      <PriceTag>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {calcs.extraDiscount > 0 && (
            <OriginalPrice>${calcs.totalBeforeExtra.toFixed(2)}</OriginalPrice>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontWeight: 700, color: calcs.extraDiscount > 0 ? ({ theme }) => theme.colors.primary : 'inherit' }}>$</span>
            <PriceInput
              type="number"
              step="0.01"
              value={localPrice}
              onChange={onPriceChange}
              onFocus={() => setIsPriceFocused(true)}
              onBlur={() => setIsPriceFocused(false)}
            />
          </div>
        </div>
        <IvaLabel style={{ textAlign: 'right' }}>IVA Incl.</IvaLabel>
      </PriceTag>

      <DeleteButton
        onClick={() => removeFromCart(item.id, item.empresaId)}
        title="Eliminar producto"
      >
        <RenderIcon name="FaTrash" size={20} />
      </DeleteButton>
    </ProductItem>
  );
};

const OfertaVendedor = () => {
  const { cart, removeFromCart, updateQuantity, fetchUnifiedCartForB2B, isB2BSeller: isB2B, isLoading: cartLoading, selectedClientName } = useCart();
  const { user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [extraDiscounts, setExtraDiscounts] = useState({});
  const hasFetchedUnifiedRef = useRef(false);
  const [totalExtraDiscount, setTotalExtraDiscount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [previewDiscounts, setPreviewDiscounts] = useState({});

  const groupedItems = useMemo(() => {
    const grouped = {};
    cart.forEach((item) => {
      const company = item.empresaId || "Sin empresa";
      if (!grouped[company]) grouped[company] = [];

      // Asegurar que imagen y marca tengan fallbacks si el mapeo falló
      let finalImage = item.image && (item.image.startsWith('http')
        ? item.image
        : `${baseLinkImages}${item.image}`);

      // Si aún no hay imagen, intentar displayImage
      if (!finalImage || finalImage === baseLinkImages) {
        finalImage = item.displayImage || "";
      }

      grouped[company].push({
        ...item,
        price: item.price,
        displayImage: finalImage,
        displayBrand: item.brand && item.brand !== "Sin marca" ? item.brand : (item.displayBrand || "Sin marca")
      });
    });
    return grouped;
  }, [cart, isB2B]);

  const companies = useMemo(() => Object.keys(groupedItems), [groupedItems]);
  const isB2CSeller = user?.ROLE_NAME === ROLES.VENDEDOR_B2C;

  useEffect(() => {
    if (isB2CSeller) {
      navigate(ROUTES.ECOMMERCE.CARRITO, { replace: true });
    }
  }, [isB2CSeller, navigate]);

  // Nuevo: Cargar el carrito unificado si es B2B
  useEffect(() => {
    if (isB2B && !hasFetchedUnifiedRef.current) {
      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      const clientAccounts = stored.clientAccounts || {};
      const enterprises = Object.keys(clientAccounts);
      if (enterprises.length > 0) {
        // Usar la primera cuenta de cliente encontrada (ya que es unificado)
        const clientAccount = clientAccounts[enterprises[0]];
        if (clientAccount) {
          hasFetchedUnifiedRef.current = true;
          fetchUnifiedCartForB2B(clientAccount);
        }
      }
    }
  }, [isB2B, fetchUnifiedCartForB2B]);

  useEffect(() => {
    if (isB2B) {
      setSelectedCompany("AUTOLLANTA");
      return;
    }
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany, isB2B]);

  // Validar stock de todos los productos al entrar a la oferta
  useEffect(() => {
    if (cart.length > 0 && !cartLoading) {
      cart.forEach((item) => {
        const availableStock = item.stock || 0;
        if (availableStock > 0 && item.quantity > availableStock) {
          updateQuantity(item.id, availableStock);
        }
      });
    }
  }, [cartLoading, updateQuantity]);

  useEffect(() => {
    const fetchAllDiscounts = async () => {
      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      const clientAccounts = stored.clientAccounts || {};

      const newPreviews = { ...previewDiscounts };
      let changed = false;

      // CASO B2B: Unificar todos los productos en una sola llamada a MAXXIMUNDO
      if (isB2B) {
        if (newPreviews["AUTOLLANTA"]) return; // Ya lo tenemos

        const enterprises = Object.keys(clientAccounts);
        if (enterprises.length === 0 || cart.length === 0) return;

        const clientAccount = clientAccounts[enterprises[0]];
        const products = cart.map(item => item.id);

        try {
          const response = await api_vendedores_previsualizarDescuentos({
            ENTERPRISE: "AUTOLLANTA",
            ACCOUNT_USER: clientAccount,
            PRODUCTS: products
          });

          if (response.success) {
            newPreviews["AUTOLLANTA"] = response.data;
            setPreviewDiscounts(newPreviews);
          }
        } catch (error) {
          console.error(`Error fetching B2B discounts:`, error);
        }
        return;
      }

      // CASO B2C / Clientes: Iterar por empresa
      for (const company of companies) {
        if (newPreviews[company]) continue;

        const accountUser = clientAccounts[company] || user.ACCOUNT_USER;
        const products = groupedItems[company].map(item => item.id);

        try {
          const response = await api_vendedores_previsualizarDescuentos({
            ENTERPRISE: company,
            ACCOUNT_USER: accountUser,
            PRODUCTS: products
          });

          if (response.success) {
            newPreviews[company] = response.data;
            changed = true;
          }
        } catch (error) {
          console.error(`Error fetching discounts for ${company}:`, error);
        }
      }
      if (changed) setPreviewDiscounts(newPreviews);
    };

    if (companies.length > 0) {
      fetchAllDiscounts();
    }
  }, [companies]);

  // Cargar desde sessionStorage al montar
  useEffect(() => {
    const saved = sessionStorage.getItem("ofertaVendedor");
    if (saved) {
      const { items, total, previews } = JSON.parse(saved);
      setExtraDiscounts(items || {});
      setTotalExtraDiscount(0);
      setPreviewDiscounts(previews || {});
    }
  }, []);

  // Guardar en sessionStorage al cambiar
  useEffect(() => {
    sessionStorage.setItem(
      "ofertaVendedor",
      JSON.stringify({ items: extraDiscounts, total: totalExtraDiscount, previews: previewDiscounts })
    );
  }, [extraDiscounts, totalExtraDiscount, previewDiscounts]);


  const handleProductDiscountChange = (productId, value) => {
    const val = parseFloat(value);
    setExtraDiscounts(prev => ({ ...prev, [productId]: isNaN(val) ? undefined : val }));
  };

  const handlePriceChange = (productId, newUnitPriceWithIVA) => {
    const item = cart.find(i => i.id === productId);
    if (!item || isNaN(newUnitPriceWithIVA)) return;

    const company = item.empresaId || "Sin empresa";
    const preview = previewDiscounts[company];
    const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;
    const promoDiscount = (Number(item.promotionalDiscount) || 0) + productSapDiscount;
    const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;

    const baseUnitPriceWithIVA = item.price * (1 + ivaPct / 100);
    if (baseUnitPriceWithIVA <= 0) return;

    const targetTotalDiscount = (1 - (newUnitPriceWithIVA / baseUnitPriceWithIVA)) * 100;
    let extraDiscountNeeded = targetTotalDiscount - promoDiscount;

    if (extraDiscountNeeded < 0) extraDiscountNeeded = 0;

    // Se guarda con 2 decimales según requerimiento
    setExtraDiscounts(prev => ({ ...prev, [productId]: parseFloat(extraDiscountNeeded.toFixed(2)) }));
  };

  const handleTotalDiscountChange = (value) => {
    // El descuento extra al total ahora es siempre 0 según requerimiento
    setTotalExtraDiscount(0);
  };

  const clearOffer = () => {
    setExtraDiscounts({});
    setTotalExtraDiscount(0);
    toast.info("Se han reseteado los descuentos de la oferta");
  };

  const calculateProductTotal = (item) => {
    const company = item.empresaId || "Sin empresa";
    const preview = previewDiscounts[company];
    const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;

    const extraDiscount = extraDiscounts[item.id] || 0;
    const promoDiscount = (Number(item.promotionalDiscount) || 0) + productSapDiscount;

    const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;

    // Precio con promo pero SIN el extra del vendedor
    const subtotalBeforeExtra = item.price * item.quantity * (1 - promoDiscount / 100);
    const totalBeforeExtra = subtotalBeforeExtra * (1 + ivaPct / 100);

    // Precio con promo Y con el extra del vendedor
    const totalPct = (promoDiscount + extraDiscount) / 100;
    const subtotalWithExtra = item.price * item.quantity * (1 - totalPct);
    const totalWithExtra = subtotalWithExtra * (1 + ivaPct / 100);

    return {
      subtotal: subtotalWithExtra,
      totalBeforeExtra,
      totalWithExtra,
      extraDiscount,
      unitPriceWithExtra: totalWithExtra / item.quantity
    };
  };


  // Replicar lógica de CartContext.jsx
  const calculateOfertaDetailed = () => {
    if (!selectedCompany || !groupedItems[selectedCompany]) {
      return {
        rawSubtotal: 0,
        promoAndExtraDiscount: 0,
        generalDiscount: 0,
        totalOfferDiscount: 0,
        iva: 0,
        finalTotal: 0
      };
    }

    const items = groupedItems[selectedCompany];
    const preview = previewDiscounts[selectedCompany];

    const companyRawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let companyPromoAndExtra = 0;
    let companyGeneralDiscount = 0;

    items.forEach(item => {
      const productSapDiscount = preview?.DESCUENTOS_PRODUCTOS?.find(p => p.PRODUCT_CODE === item.id)?.DISCOUNT_PRODUCTO_SAP || 0;
      const promoPct = (Number(item.promotionalDiscount) || 0) + productSapDiscount;
      const extraPct = (Number(extraDiscounts[item.id]) || 0);

      const discountPromoExtra = item.price * item.quantity * (promoPct + extraPct) / 100;
      companyPromoAndExtra += discountPromoExtra;

      const subtotalAfterPromo = (item.price * item.quantity) - discountPromoExtra;

      // Lógica de descuento de cliente por línea de negocio
      const linea = (item.lineaNegocio || "").toUpperCase();
      let clientDiscountPct = 0;
      if (preview?.DESCUENTO_CLIENTE) {
        if (linea === "LUBRICANTES") {
          clientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT_LUBRICANTES || 0;
        } else {
          // Llantas y herramientas
          clientDiscountPct = preview.DESCUENTO_CLIENTE.DISCOUNT || 0;
        }
      } else {
        // Fallback a descuentos antiguos si no hay preview
        const potentialDiscount = user?.DESCUENTOS?.[selectedCompany];
        clientDiscountPct = typeof potentialDiscount === 'number' ? potentialDiscount : 0;
      }

      companyGeneralDiscount += (subtotalAfterPromo * clientDiscountPct / 100);
    });

    const subtotalAfterGeneral = companyRawSubtotal - companyPromoAndExtra - companyGeneralDiscount;

    const companyTotalOfferDiscount = subtotalAfterGeneral * (totalExtraDiscount / 100);
    const subtotalFinal = subtotalAfterGeneral - companyTotalOfferDiscount;

    const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;
    const companyIva = (subtotalFinal < 0 ? 0 : subtotalFinal) * (ivaPct / 100);

    return {
      rawSubtotal: companyRawSubtotal,
      promoAndExtraDiscount: companyPromoAndExtra,
      generalDiscount: companyGeneralDiscount,
      totalOfferDiscount: companyTotalOfferDiscount,
      iva: companyIva,
      finalTotal: (subtotalFinal < 0 ? 0 : subtotalFinal) + companyIva
    };
  };



  const totals = calculateOfertaDetailed();
  const isExceedingLimit = () => {
    const hasProductExceeded = Object.values(extraDiscounts).some(d => (d || 0) > DISCOUNT_LIMITS.PRODUCT_MAX_PERCENT);
    return hasProductExceeded;
  };

  const handleQuantityChange = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) return;
    const item = cart.find(i => i.id === id);
    const availableStock = item?.stock || 0;

    if (availableStock > 0 && newQuantity > availableStock) {
      updateQuantity(id, availableStock);
      toast.warn(`Cantidad ajustada al stock disponible (${availableStock})`);
    } else {
      updateQuantity(id, newQuantity);
    }
  }, [updateQuantity, cart]);

  const handleAction = async () => {
    const items = groupedItems[selectedCompany] || [];
    const preview = previewDiscounts[selectedCompany];

    if (!preview) {
      toast.error("No se han cargado los descuentos para esta empresa. Por favor, espera un momento.");
      return;
    }

    // 1. Agrupar productos por línea de negocio
    const lineGroups = {};
    items.forEach(item => {
      const line = (item.lineaNegocio || "GENERAL").toUpperCase().trim();
      if (!lineGroups[line]) lineGroups[line] = [];
      lineGroups[line].push(item);
    });

    const spancopCodeStr = sessionStorage.getItem("CODIGO_DATOS_SPANCOP");
    const spancopCode = spancopCodeStr ? parseInt(spancopCodeStr) : null;
    const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;

    // 2. Procesar cada línea de negocio por separado
    const proformaPromises = Object.entries(lineGroups).map(async ([line, products]) => {
      // Determinar descuento SAP para esta línea
      let sapDiscountPctHeader = 0;
      if (line === "LUBRICANTES") {
        sapDiscountPctHeader = preview.DESCUENTO_CLIENTE?.DISCOUNT_LUBRICANTES || 0;
      } else {
        sapDiscountPctHeader = preview.DESCUENTO_CLIENTE?.DISCOUNT || 0;
      }

      // Preparar productos y calcular totales específicos para esta línea
      let lineRawSubtotal = 0;
      const productsData = products.map(p => {
        const productBaseSubtotal = p.price * p.quantity;
        lineRawSubtotal += productBaseSubtotal;

        const productSap = preview.DESCUENTOS_PRODUCTOS?.find(dp => dp.PRODUCT_CODE === p.id)?.DISCOUNT_PRODUCTO_SAP || 0;
        const promoDiscount = (Number(p.promotionalDiscount) || 0) + productSap;

        return {
          PRODUCT_CODE: p.id,
          QUANTITY: p.quantity,
          PRICE: p.price,
          PROMOTIONAL_DISCOUNT: promoDiscount,
          EXTRA_DISCOUNT: extraDiscounts[p.id] || 0
        };
      });

      // Calcular TOTAL final siguiendo lógica encadenada
      let currentSubtotal = 0;
      productsData.forEach(p => {
        const itemBasePrice = p.PRICE * p.QUANTITY;
        // 1. Promo + Extra Producto
        const priceAfterPromoExtra = itemBasePrice * (1 - (p.PROMOTIONAL_DISCOUNT + p.EXTRA_DISCOUNT) / 100);
        // 2. Descuento General (SAP)
        const priceAfterSap = priceAfterPromoExtra * (1 - sapDiscountPctHeader / 100);
        currentSubtotal += priceAfterSap;
      });

      // 3. Descuento Extra Total
      const subtotalFinal = currentSubtotal * (1 - totalExtraDiscount / 100);
      const ivaAmount = (subtotalFinal < 0 ? 0 : subtotalFinal) * (ivaPct / 100);
      const groupFinalTotal = (subtotalFinal < 0 ? 0 : subtotalFinal) + ivaAmount;

      const proformaData = {
        ENTERPRISE: selectedCompany,
        ACCOUNT_USER: preview.ACCOUNT_USER,
        SUBTOTAL: lineRawSubtotal,
        SAP_DISCOUNT: sapDiscountPctHeader,
        ADITIONAL_DISCOUNT: 0,
        TOTAL: groupFinalTotal,
        BUSINESS_LINE: line,
        IVA: 1,
        CODE_SELLER: user.UUID || user.ID_USER || "",
        PRODUCTOS: productsData
      };

      if (spancopCode !== null && !isNaN(spancopCode)) {
        proformaData.CODE_SPANCOP = spancopCode;
      }

      return api_vendedores_createProforma(proformaData);
    });

    try {
      toast.loading("Creando proformas...", { toastId: "creating-proformas" });
      const results = await Promise.all(proformaPromises);
      toast.dismiss("creating-proformas");

      const failures = results.filter(r => !r.success);
      if (failures.length === 0) {
        // Guardar el ID_PROFORMA_HEADER (usando el del primero si hay varios, o podrías guardarlos todos)
        // Según el requerimiento, guardamos en sessionStorage.PROFORMA_HEADER
        if (results.length > 0 && results[0].data?.header?.ID_PROFORMA_HEADER) {
          sessionStorage.setItem("PROFORMA_HEADER", results[0].data.header.ID_PROFORMA_HEADER);
        }

        toast.success("Proforma(s) creada(s) correctamente");
        navigate(ROUTES.ECOMMERCE.CARRITO);
      } else {
        const errorMsg = failures.map(f => f.message).join(", ");
        toast.error(`Error en algunas proformas: ${errorMsg}`);
      }
    } catch (error) {
      toast.dismiss("creating-proformas");
      console.error("Error creating proformas:", error);
      toast.error("Ocurrió un error inesperado al procesar la oferta");
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const company = selectedCompany || "AUTOLLANTA CIA LTDA";
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES');
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Configuración de fuentes y márgenes
    doc.setFont("helvetica", "normal");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // 1. Encabezado: Nombre de la Empresa y Logo
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AUTOLLANTA CIA LTDA", margin, 15);

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
    };

    doc.setLineWidth(0.5);
    doc.line(margin, 20, pageWidth - margin, 20);

    // Agregar Logo Autollanta en la parte superior derecha
    try {
      const logoImg = await loadImage(AutollantaLogo);
      const logoWidth = 50; // Tamaño ajustado
      const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
      doc.addImage(logoImg, 'PNG', pageWidth - margin - logoWidth, 8, logoWidth, logoHeight);
    } catch (e) {
      console.error("Error al cargar el logo de Autollanta:", e);
    }

    // 2. Información de Cliente y Pedido
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Para", margin, 35);

    // Obtener nombre del cliente de useCart o sessionStorage
    const sellerData = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
    const clientName = selectedClientName || sellerData.clientName || "CLIENTE GENERAL";
    const clientRuc = sellerData.clientAccounts ? sellerData.clientAccounts[selectedCompany] : "";

    doc.setFont("helvetica", "bold");
    const splitClientName = doc.splitTextToSize(clientName, 75);
    doc.text(splitClientName, 50, 35);

    // Información a la derecha (Removido: Número de identificación)
    doc.setFont("helvetica", "normal");
    doc.text("Fecha", 130, 35);
    doc.text(dateStr, 185, 35, { align: "right" });

    doc.text("Hora", 130, 42);
    doc.text(timeStr, 185, 42, { align: "right" });

    // RUC debajo del nombre
    doc.setFontSize(9);
    const rucYOffset = 42 + ((splitClientName.length - 1) * 4);
    doc.text(`RUC/CI: ${clientRuc}`, 50, rucYOffset);

    // 3. Título del Pedido con Número de Cotización Dinámico
    let quoteNumber = "---";
    try {
      const ordersResponse = await api_order_getOrdersBySeller();
      if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
        const maxId = ordersResponse.data.reduce((max, pedido) => {
          const currentId = pedido.CABECERA?.ID_CART_HEADER || 0;
          return currentId > max ? currentId : max;
        }, 0);
        quoteNumber = maxId + 1;
      }
    } catch (e) {
      console.error("Error al obtener el número de cotización:", e);
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Cotización N° ${quoteNumber}`, pageWidth / 2, 75, { align: "center" });

    // 4. Tabla de Productos
    const items = groupedItems[selectedCompany] || [];
    const tableData = items.map((item, index) => {
      const extraDisc = extraDiscounts[item.id] || 0;
      const productPriceWithIVA = item.price * (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100);

      return [
        index + 1,
        item.id,
        item.name,
        "UNIDAD",
        item.quantity,
        `${extraDisc.toFixed(1)}%`,
        `USD ${productPriceWithIVA.toFixed(2)}`,
        `USD ${(productPriceWithIVA * item.quantity * (1 - extraDisc / 100)).toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [["#", "Código", "Descripción", "U.M.", "Cant.", "Desc %", "Precio Unit.", "Total"]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5, textColor: [0, 0, 0], lineColor: [220, 220, 220] },
      headStyles: { fillColor: [250, 250, 250], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 62 },
        3: { cellWidth: 15 },
        4: { cellWidth: 12 },
        5: { cellWidth: 15 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 }
      }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // 5. Pie de Tabla / Información de Ventas
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Asesor de ventas:", margin, currentY);
    doc.setFont("helvetica", "bold");
    doc.text(user?.NAME_USER || "Vendedor Local", 50, currentY);

    // 6. Resumen de Totales (Derecha - Reducido para evitar solapamiento)
    const summaryX = 115; // Movido a la izquierda para dar más espacio
    const valueX = 190;
    const boxWidth = 32;

    currentY = doc.lastAutoTable.finalY + 10;

    // Descuento
    const totalDescSuma = ((totals.promoAndExtraDiscount + totals.generalDiscount + totals.totalOfferDiscount) * (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100));
    doc.setFont("helvetica", "normal")

    doc.text("Subtotal", summaryX, currentY);
    doc.rect(valueX - boxWidth, currentY - 4.5, boxWidth, 6);
    doc.text(`USD ${(totals.finalTotal / (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100)).toFixed(2)}`, valueX - 2, currentY, { align: "right" });

    currentY += 7;
    doc.text("Impuesto", summaryX, currentY);
    doc.rect(valueX - boxWidth, currentY - 4.5, boxWidth, 6);
    doc.text(`USD ${totals.iva.toFixed(2)}`, valueX - 2, currentY, { align: "right" });

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Total", summaryX, currentY);
    doc.rect(valueX - boxWidth, currentY - 4.5, boxWidth, 6);
    doc.text(`USD ${totals.finalTotal.toFixed(2)}`, valueX - 2, currentY, { align: "right" });

    // 7. Firma
    currentY += 20;
    doc.setFont("helvetica", "normal");
    doc.text("Firma: ___________________________________", margin, currentY);

    // 8. Marcas en el pie de página
    const brandAssets = [
      AplusLogo, CstLogo, FortuneLogo,
      HaohuaLogo, MaxxisLogo,
    ];

    const brandWidth = 25;
    const brandHeight = 25;
    const brandSpacing = 0;

    const totalBrandsWidth = (brandAssets.length * brandWidth) + ((brandAssets.length - 1) * brandSpacing);
    const startX = (pageWidth - totalBrandsWidth) / 2;
    const brandY = doc.internal.pageSize.height - 45;

    try {
      const loadedBrands = await Promise.all(brandAssets.map(asset => loadImage(asset).catch(() => null)));

      loadedBrands.forEach((img, i) => {
        if (img) {
          doc.addImage(img, 'PNG', startX + (i * (brandWidth + brandSpacing)), brandY, brandWidth, brandHeight, undefined, 'FAST');
        } else {
          // Fallback simple por si falla loadImage pero el asset es usable directamente (ej: base64)
          try {
            doc.addImage(brandAssets[i], 'PNG', startX + (i * (brandWidth + brandSpacing)), brandY, brandWidth, brandHeight, undefined, 'FAST');
          } catch (err) {
            console.warn(`No se pudo cargar la marca en índice ${i}`);
          }
        }
      });
    } catch (e) {
      console.error("Error al cargar logos de marcas:", e);
    }

    // 9. Pie de página fijo
    const footerY = doc.internal.pageSize.height - 20;
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.text(`Página 1 / 1`, margin, footerY);
    doc.text("Autollanta Cia. Ltda.", valueX, footerY, { align: "right" });

    doc.text("Dirección: AV GONZALEZ SUAREZ 2-79 Y GONZALO ZALUMBIDE", margin, footerY + 5);
    doc.text("Autor: " + (user?.NAME_USER || "PORTAL"), 105, footerY + 5);
    doc.text("Email: info@maxximumndo.com", valueX, footerY + 5, { align: "right" });

    window.open(doc.output('bloburl'), '_blank');
  };

  // Combinar estados de carga: auth y cart
  const isPageLoading = authLoading || cartLoading;

  if (isPageLoading) {
    return (
      <Container style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RenderLoader size="64px" showSpinner={true} />
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container>
        <Title>
          <RenderIcon name="FaTag" /> Oferta de Vendedor
        </Title>
        <p>No hay productos en el carrito para generar una oferta.</p>
        <Button
          text="Volver al Catálogo"
          variant="outlined"
          onClick={() => navigate(-1)}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <RenderIcon name="FaTag" /> Oferta de Vendedor
      </Title>

      {companies.length > 0 && !isB2B && (
        <CompanyTabs>
          {companies.map((company) => (
            <CompanyTab
              key={company}
              $active={selectedCompany === company}
              onClick={() => setSelectedCompany(company)}
            >
              {company}
            </CompanyTab>
          ))}
        </CompanyTabs>
      )}

      <ProductList>
        {(groupedItems[selectedCompany] || []).map((item) => (
          <OfertaProductItem
            key={item.id}
            item={item}
            handleQuantityChange={handleQuantityChange}
            extraDiscounts={extraDiscounts}
            handleProductDiscountChange={handleProductDiscountChange}
            handlePriceChange={handlePriceChange}
            previewDiscount={previewDiscounts[selectedCompany]}
            removeFromCart={removeFromCart}
            calculateProductTotal={calculateProductTotal}
            DISCOUNT_LIMITS={DISCOUNT_LIMITS}
          />
        ))}
      </ProductList>

      <Summary>
        <SummaryRow style={{ marginBottom: "0.25rem" }}>
          <span>Subtotal base:</span>
          <span>${(totals.rawSubtotal * (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100)).toFixed(2)}</span>
        </SummaryRow>
        <IvaLabel style={{ marginBottom: "1rem" }}>IVA Incluido</IvaLabel>
        {totals.promoAndExtraDiscount > 0 && (
          <SummaryRow style={{ color: "#ef4444" }}>
            <span>Descuentos (Promo + Extra Producto) (IVA Incl.):</span>
            <span>-${(totals.promoAndExtraDiscount * (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100)).toFixed(2)}</span>
          </SummaryRow>
        )}
        {totals.generalDiscount > 0 && (
          <SummaryRow style={{ color: "#ef4444" }}>
            <span>Descuento Cliente / Empresa (IVA Incl.):</span>
            <span>-${(totals.generalDiscount * (1 + (user?.IVA || TAXES.IVA_PERCENTAGE) / 100)).toFixed(2)}</span>
          </SummaryRow>
        )}
        {/* Descuento extra al total eliminado según requerimiento */}
        <SummaryRow className="total" style={{ marginBottom: "0.25rem" }}>
          <span>Total Oferta:</span>
          <span>${totals.finalTotal.toFixed(2)}</span>
        </SummaryRow>
        <IvaLabel style={{ textAlign: "right", fontWeight: "600" }}>IVA Incluido</IvaLabel>
      </Summary>

      <ActionBar>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          text="Regresar al catálogo"
          leftIconName="FaArrowLeft"
        />
        <Button
          onClick={handleExportPDF}
          backgroundColor="#10b981"
          text="Ver PDF"
          leftIconName="FaFilePdf"
        />
        <Button
          onClick={handleAction}
          disabled={isExceedingLimit()}
          backgroundColor={isExceedingLimit() ? "#9ca3af" : undefined}
          text="Acceder al carrito"
          leftIconName="FaCartShopping"
          title={isExceedingLimit() ? "No se puede proceder: algunos descuentos superan el límite permitido" : ""}
        />
      </ActionBar>

      <BrandFooter>
        <BrandLogoItem src={AplusLogo} alt="Aplus" title="Aplus" />
        <BrandLogoItem src={CstLogo} alt="CST Tires" title="CST Tires" />
        <BrandLogoItem src={FortuneLogo} alt="Fortune" title="Fortune" />
        <BrandLogoItem src={HaohuaLogo} alt="Haohua" title="Haohua" />
        <BrandLogoItem src={MaxxisLogo} alt="Maxxis" title="Maxxis" />
      </BrandFooter>
    </Container>
  );
};

export default OfertaVendedor;
