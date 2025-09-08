import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es, id } from "date-fns/locale";
import { toast } from "react-toastify";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import {
  api_order_getOrderById,
  api_order_updateOrder,
} from "../../api/order/apiOrder";
import { baseLinkImages } from "../../constants/links";
import { api_optionsCatalog_getStates } from "../../api/optionsCatalog/apiOptionsCatalog";
import { copyToClipboard } from "../../utils/utils";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import PageContainer from "../../components/layout/PageContainer";
import RenderLoader from "../../components/ui/RenderLoader";

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const OrderTitle = styled.div``;

const OrderNumber = styled.h1`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const OrderDate = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const OrderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case "PENDIENTE":
        return theme.colors.warning + "33";
      case "PENDIENTE CARTERA":
        return theme.colors.info + "33";
      case "CONFIRMADO":
        return theme.colors.info + "33";
      case "ENTREGADO":
        return theme.colors.success + "33";
      case "CANCELADO":
        return theme.colors.error + "33";
      default:
        return theme.colors.border;
    }
  }};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case "PENDIENTE":
        return theme.colors.warning;
      case "PENDIENTE CARTERA":
        return theme.colors.info;
      case "CONFIRMADO":
        return theme.colors.info;
      case "ENTREGADO":
        return theme.colors.success;
      case "CANCELADO":
        return theme.colors.error;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.p`
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Value = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const OrderSummary = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    margin-top: 12px;
    font-weight: bold;
    font-size: 1.1rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 12px;
  }
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  ${({ $operacion, theme }) =>
    $operacion &&
    `border-bottom: solid 1px ${theme.colors.border}; padding-bottom: 4px;`}
`;

const EditableSection = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.colors.primary}10;
`;

const EditableSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

const AddressAlert = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme, $confirmed }) =>
    $confirmed ? theme.colors.success + "20" : theme.colors.warning + "20"};
  border-left: 4px solid
    ${({ theme, $confirmed }) =>
      $confirmed ? theme.colors.success : theme.colors.warning};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddressAlertContent = styled.div`
  flex: 1;
`;

const AddressAlertTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const AddressAlertText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const ChangesBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.warning}22;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.warning};
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const DetallePedidoCoordinador = () => {
  const { orderId } = useParams();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados del componente
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDraft, setOrderDraft] = useState(null); // Nuevo estado para el borrador
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const [statusOptionsApi, setStatusOptionsApi] = useState([]);

  // Cargar datos del pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await api_order_getOrderById(orderId);

        if (response.success && response.data && response.data.length > 0) {
          const statusOptionsResponse = await api_optionsCatalog_getStates();
          let mapStatusOptions = [];
          if (statusOptionsResponse.success) {
            mapStatusOptions = statusOptionsResponse.data.map((item) => ({
              value: item.VALUE_CATALOG,
              label: item.LABEL_CATALOG,
              id: item.ID_CATALOG,
            }));
            setStatusOptionsApi(mapStatusOptions);
          }

          const apiOrder = response.data[0];

          const cabecera = apiOrder.CABECERA;
          const detalle = apiOrder.DETALLE || [];

          const currentStatus = mapStatusOptions.find(
            (opt) => opt.id === cabecera.STATUS
          )?.value;

          // Calcular descuentos y totales igual que en DetallePedido.jsx
          const ivaPercentage = cabecera.IVA_DETAIL?.IVA_PERCENTAGE || TAXES.IVA_PERCENTAGE;
          const items = detalle.map((item) => {
            const basePrice = item.PRICE;
            const priceWithIVA = calculatePriceWithIVA(basePrice, ivaPercentage);
            const totalWithIVA = priceWithIVA * item.QUANTITY;
            
            return {
              id: item.PRODUCT_CODE,
              name: item.MAESTRO?.DMA_NOMBREITEM || "Producto",
              sku: item.PRODUCT_CODE,
              price: priceWithIVA, // Precio con IVA incluido
              basePrice: basePrice, // Precio base sin IVA (para cálculos internos)
              quantity: item.QUANTITY,
              promotionalDiscount: item.PROMOTIONAL_DISCOUNT || 0,
              total: totalWithIVA, // Total con IVA incluido
              image: item.MAESTRO?.DMA_RUTAIMAGEN
                ? `${baseLinkImages}${item.MAESTRO.DMA_RUTAIMAGEN}`
                : "https://placehold.co/50x50/png",
            };
          });

          // 1. Subtotal sin descuentos (con IVA incluido)
          const rawSubtotal = items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );
          // 2. Total de descuentos promocionales (por producto)
          const totalPromotionalDiscount = items.reduce(
            (acc, item) =>
              acc +
              item.price *
                item.quantity *
                ((Number(item.promotionalDiscount) || 0) / 100),
            0
          );
          // 3. Subtotal después de descuentos promocionales
          const subtotalAfterPromo = rawSubtotal - totalPromotionalDiscount;
          // 4. Descuento general (cliente) sobre el subtotal con promo
          const generalDiscount =
            subtotalAfterPromo * (Number(cabecera.DISCOUNT || 0) / 100);
          // 5. Subtotal después de descuento general
          const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;
          // 6. Descuento adicional (coordinadora) sobre el subtotal con promo y general
          const aditionalDiscount =
            subtotalAfterGeneral *
            (Number(cabecera.ADITIONAL_DISCOUNT || 0) / 100);
          // 7. Total final (IVA ya incluido en precios)
          const totalFinal = subtotalAfterGeneral - aditionalDiscount;
          // IVA ya está incluido en todos los precios
          const totalConIva = (totalFinal < 0 ? 0 : totalFinal);

          // Verificar si tiene direcciones nuevas
          const hasNewAddress =
            cabecera.SHIPPING_ADDRESS?.ORIGIN === "CLIENT" ||
            cabecera.BILLING_ADDRESS?.ORIGIN === "CLIENT";

          const formattedOrder = {
            id: cabecera.ID_CART_HEADER,
            date: new Date(cabecera.createdAt),
            status: currentStatus,
            aditionalDiscount: cabecera.ADITIONAL_DISCOUNT || 0,
            discount: cabecera.DISCOUNT || 0,
            iva: ivaPercentage,
            customer: {
              name: cabecera.USER.NAME_USER,
              email: cabecera.USER.EMAIL,
              account: cabecera.ACCOUNT_USER,
              phone: cabecera.PHONE[0]?.PHONE_NUMBER || "No disponible",
            },
            shipping: {
              id: cabecera.SHIPPING_ADDRESS.ID,
              address: cabecera.SHIPPING_ADDRESS.STREET,
              city: cabecera.SHIPPING_ADDRESS.CITY,
              state: cabecera.SHIPPING_ADDRESS.STATE,
            },
            billing: {
              id: cabecera.BILLING_ADDRESS.ID,
              address: cabecera.BILLING_ADDRESS.STREET,
              city: cabecera.BILLING_ADDRESS.CITY,
              state: cabecera.BILLING_ADDRESS.STATE,
            },
            items,
            subtotal: rawSubtotal, // Ya incluye IVA
            total: totalConIva,
            empresaInfo: {
              id: cabecera.ENTERPRISE,
              name: cabecera.ENTERPRISE,
            },
            hasNewAddress: hasNewAddress,
            originalData: apiOrder,
            // Para desglose
            rawSubtotal,
            totalPromotionalDiscount,
            subtotalAfterPromo,
            generalDiscount,
            subtotalAfterGeneral,
            totalFinal,
            totalConIva,
          };

          setOrderDetails(formattedOrder);
          setOrderDraft(JSON.parse(JSON.stringify(formattedOrder))); // Inicializar draft al cargar datos
          setAddressConfirmed(!hasNewAddress);
          setError(null);
        } else {
          setError("No se encontraron detalles del pedido");
        }
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
        setError(`Error al cargar detalles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Detectar si hay cambios pendientes (estado, descuento, productos) en tiempo real
  useEffect(() => {
    if (!orderDetails || !orderDraft) return;
    // Detectar cambios entre draft y details
    const statusChanged = orderDraft.status !== orderDetails.status;
    const discountChanged =
      orderDraft.aditionalDiscount !== orderDetails.aditionalDiscount;
    const itemsChanged = (() => {
      if (deletedItems.length > 0) return true;
      if (orderDraft.items.length !== orderDetails.items.length) return true;
      for (let i = 0; i < orderDetails.items.length; i++) {
        const orig = orderDetails.items[i];
        const mod = orderDraft.items.find((it) => it.id === orig.id);
        if (!mod || mod.quantity !== orig.quantity) return true;
      }
      return false;
    })();
    setHasChanges(statusChanged || discountChanged || itemsChanged);
  }, [orderDetails, orderDraft, deletedItems]);

  // Función utilitaria para actualizar el estado correcto (draft o details)
  function updateOrderState(updater) {
    // Solo se debe actualizar el draft
    setOrderDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...prev, ...next };
    });
  }

  // Handlers para editar el draft
  const handleStatusChange = (value) => {
    updateOrderState(() => ({ status: value }));
  };

  const handleDiscountChange = (value) => {
    const discountValue = parseFloat(value) || 0;
    updateOrderState((prev) => {
      const totales = calcularTotales(prev.items, discountValue);
      return {
        aditionalDiscount: discountValue,
        ...totales,
      };
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateOrderState((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      const totales = calcularTotales(updatedItems, prev.aditionalDiscount);
      return {
        items: updatedItems,
        ...totales,
      };
    });
  };

  const handleRemoveProduct = (productId) => {
    updateOrderState((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== productId);
      const totales = calcularTotales(updatedItems, prev.aditionalDiscount);
      return {
        items: updatedItems,
        ...totales,
      };
    });
    setDeletedItems((prev) => {
      const already = prev.find((item) => item.id === productId);
      if (already) return prev;
      const removed = orderDraft.items.find((item) => item.id === productId);
      return removed ? [...prev, removed] : prev;
    });
  };

  const handleUndoRemoveProduct = (productId) => {
    const restored = deletedItems.find((item) => item.id === productId);
    if (!restored) return;
    updateOrderState((prev) => {
      // Restaurar los items del orderDetails
      const updatedItems = orderDetails.items.map((item) => ({ ...item }));
      const totales = calcularTotales(updatedItems, prev.aditionalDiscount);
      return {
        status: orderDetails.status,
        items: updatedItems,
        ...totales,
      };
    });
    setDeletedItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCancelEdit = () => {
    setOrderDraft(JSON.parse(JSON.stringify(orderDetails)));
    setDeletedItems([]);
    setEditMode(false);
  };

  // Guardar todos los cambios
  const handleSaveAllChanges = async () => {
    try {
      const newStatus = orderDraft.status;
      const newStatusObj = statusOptionsApi.find(
        (opt) => opt.value === newStatus
      );

      const body = {
        ENTERPRISE: orderDetails.empresaInfo.id,
        ACCOUNT_USER: orderDetails.customer.account,
        SHIPPING_ADDRESS_ID: orderDetails.shipping.id,
        BILLING_ADDRESS_ID: orderDetails.billing.id,
        SUBTOTAL: orderDraft.rawSubtotal,
        DISCOUNT: orderDetails.discount,
        ADITIONAL_DISCOUNT: orderDraft.aditionalDiscount,
        TOTAL: orderDraft.totalConIva,
        STATUS: newStatusObj.id,

        PRODUCTOS: orderDraft.items.map((item) => ({
          PRODUCT_CODE: item.id,
          QUANTITY: item.quantity,
          PRICE: item.price,
          PROMOTIONAL_DISCOUNT: item.promotionalDiscount || 0,
        })),
      };
      // return

      await api_order_updateOrder(orderDetails.id, body);

      const updatedOrder = {
        ...orderDetails,
        status: newStatusObj.value,
        aditionalDiscount: orderDraft.aditionalDiscount,
        items: orderDraft.items.map((item) => ({ ...item })),
        subtotal: orderDraft.rawSubtotal,
        subtotalAfterGeneral: orderDraft.subtotalAfterGeneral,
        subtotalAfterPromo: orderDraft.subtotalAfterPromo,
        total: orderDraft.totalConIva,
        totalConIva: orderDraft.totalConIva,
        totalPromotionalDiscount: orderDraft.totalPromotionalDiscount,
      };

      setOrderDetails(updatedOrder);
      setOrderDraft(JSON.parse(JSON.stringify(updatedOrder)));

      setHasChanges(false);
      setEditMode(false);
      setDeletedItems([]);
      toast.success("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast.error("Error al guardar los cambios");
    }
  };

  // Confirmar dirección nueva
  const handleConfirmAddress = async () => {
    try {
      // Aquí iría la llamada a la API para confirmar la dirección
      // await confirmOrderAddress(orderId);

      setAddressConfirmed(true);
      toast.success("Dirección confirmada correctamente");
    } catch (error) {
      console.error("Error al confirmar dirección:", error);
      toast.error("Error al confirmar la dirección");
    }
  };

  const handleProductClick = (productId) => {
    // Buscar el producto en los detalles del pedido
    const product = orderDetails?.detalle?.find(item => item.PRODUCT_ID === productId);
    
    navigate(`/productos/${productId}`, {
      state: {
        product: product ? {
          id: product.PRODUCT_ID,
          name: product.PRODUCT_NAME,
          brand: product.BRAND,
          empresaId: orderDetails?.empresaInfo?.id,
          image: product.IMAGE_URL || product.IMAGE,
          description: product.DESCRIPTION,
          price: product.PRICE,
          stock: product.QUANTITY,
          lineaNegocio: product.LINEA_NEGOCIO || "DEFAULT"
        } : null,
        empresaId: orderDetails?.empresaInfo?.id,
        prevUrl: `/coordinadora/pedidos/${orderId}`,
      },
    });
  };

  function calcularTotales(items, aditionalDiscount) {
    // Los precios ya incluyen IVA
    const rawSubtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalPromotionalDiscount = items.reduce(
      (acc, item) =>
        acc +
        item.price *
          item.quantity *
          ((Number(item.promotionalDiscount) || 0) / 100),
      0
    );
    const subtotalAfterPromo = rawSubtotal - totalPromotionalDiscount;
    const generalDiscount =
      subtotalAfterPromo * (Number(orderDetails.discount) / 100);
    const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;
    const aditionalDiscountValue =
      subtotalAfterGeneral * (Number(aditionalDiscount) / 100);
    let totalFinal = subtotalAfterGeneral - aditionalDiscountValue;
    if (totalFinal < 0) totalFinal = 0;
    // IVA ya está incluido en todos los precios
    const totalConIva = totalFinal;

    return {
      rawSubtotal,
      totalPromotionalDiscount,
      subtotalAfterPromo,
      generalDiscount,
      subtotalAfterGeneral,
      aditionalDiscountValue: aditionalDiscountValue,
      totalFinal,
      totalConIva,
    };
  }

  if (loading) {
    return (
      <PageContainer
        backButtonText="Regresar"
        backButtonOnClick={() => navigate("/coordinadora")}
      >
        <RenderLoader
          text="Cargando detalles del pedido..."
          size="32px"
          card={true}
          showDots={false}
        />
      </PageContainer>
    );
  }

  if (error || !orderDetails) {
    return (
      <PageContainer
        backButtonText="Regresar"
        backButtonOnClick={() => navigate("/coordinadora")}
      >
        <EmptyState>
          <h2>Pedido no encontrado</h2>
          <p>
            {error ||
              "No pudimos encontrar la información del pedido solicitado."}
          </p>
          <Button
            text="Volver a gestión de pedidos"
            variant="solid"
            onClick={() => navigate("/coordinadora")}
          />
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      backButtonText="Regresar"
      backButtonOnClick={() => navigate("/coordinadora")}
    >

      <PageHeader>
        <OrderTitle>
          <OrderNumber>
            Pedido #{orderDetails.id.substring(0, 12)}...
            <RenderIcon
              name="FaCopy"
              size={16}
              style={{ marginLeft: "8px", cursor: "pointer" }}
              onClick={() => copyToClipboard(orderDetails.id)}
            />
          </OrderNumber>
          <OrderDate>
            Realizado el{" "}
            {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
          </OrderDate>
        </OrderTitle>

        <OrderActions>
          {!editMode && (
            <Button
              text={"Editar"}
              leftIconName={"FaEdit"}
              size="small"
              variant="outlined"
              onClick={() => setEditMode(!editMode)}
            />
          )}
          <StatusBadge $status={orderDetails.status}>
            {
              statusOptionsApi.find((opt) => opt.value === orderDetails.status)
                ?.label
            }
          </StatusBadge>
        </OrderActions>
      </PageHeader>

      {/* Mensaje para estado PENDIENTE CARTERA */}
      {orderDetails.status === "PENDIENTE CARTERA" && (
        <div
          style={{
            background: theme.colors.info + "15",
            border: `1px solid ${theme.colors.info}30`,
            borderRadius: 6,
            padding: "12px 16px",
            marginBottom: 16,
            fontWeight: 500,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: theme.colors.info,
          }}
        >
          <RenderIcon name="FaExclamationTriangle" size={16} />
          <span>Cliente con observaciones, posible problema: cartera bloqueada</span>
        </div>
      )}

      {/* Alerta de dirección nueva */}
      {orderDetails.hasNewAddress && !addressConfirmed && (
        <AddressAlert $confirmed={addressConfirmed}>
          <RenderIcon
            name="FaExclamationTriangle"
            size={20}
            style={{ color: theme.colors.warning }}
          />
          <AddressAlertContent>
            <AddressAlertTitle>
              Dirección nueva requiere revisión
            </AddressAlertTitle>
            <AddressAlertText>
              Este pedido tiene una dirección nueva que necesita ser verificada
              antes de procesar.
            </AddressAlertText>
          </AddressAlertContent>
          <Button
            text="Confirmar dirección"
            variant="solid"
            size="small"
            backgroundColor={theme.colors.warning}
            onClick={handleConfirmAddress}
          />
        </AddressAlert>
      )}

      {/* Gestión del pedido dividido en tres cuadros */}
      {editMode && (
        <Section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionTitle>
              <RenderIcon name="FaCog" size={18} /> Gestión del pedido
              {hasChanges && (
                <ChangesBadge>
                  <RenderIcon name="FaExclamationCircle" size={12} />
                  Cambios pendientes
                </ChangesBadge>
              )}
            </SectionTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                text="Cancelar"
                variant="outlined"
                size="small"
                leftIconName="FaTimes"
                onClick={handleCancelEdit}
              />
              <Button
                text="Guardar"
                variant="solid"
                size="small"
                backgroundColor={
                  hasChanges ? theme.colors.success : theme.colors.textLight
                }
                leftIconName="FaSave"
                disabled={!hasChanges}
                onClick={handleSaveAllChanges}
              />
            </div>
          </div>

          <TwoColumns>
            <EditableSection>
              <EditableSectionTitle>
                <RenderIcon name="FaEdit" size={16} /> Cambiar estado del pedido
                {orderDraft.status !== orderDetails.status && (
                  <ChangesBadge>
                    <RenderIcon name="FaCircle" size={6} />
                    Modificado
                  </ChangesBadge>
                )}
              </EditableSectionTitle>

              <FormRow>
                {(() => {
                  // Estado numérico actual
                  const statusNum = orderDetails.originalData?.CABECERA?.STATUS;
                  let filteredOptions = [];
                  if (statusNum === 1) {
                    // PENDIENTE: solo CONFIRMADO (2) y CANCELADO (4)
                    filteredOptions = statusOptionsApi.filter(
                      (opt) => opt.id === 2 || opt.id === 4
                    );
                  } else if (statusNum === 2) {
                    // CONFIRMADO: solo ENTREGADO (3)
                    filteredOptions = statusOptionsApi.filter(
                      (opt) => opt.id === 3
                    );
                  } else if (statusNum === 6) {
                    // PENDIENTE CARTERA: solo CONFIRMADO (2) y CANCELADO (4)
                    filteredOptions = statusOptionsApi.filter(
                      (opt) => opt.id === 2 || opt.id === 4
                    );
                  }

                  if (statusNum === 3 || statusNum === 4) {
                    // ENTREGADO o CANCELADO: no mostrar select, solo mensaje
                    return (
                      <div
                        style={{ fontWeight: 500, color: theme.colors.success }}
                      >
                        El pedido ha finalizado.
                      </div>
                    );
                  }

                  return (
                    <>
                      <Select
                        options={filteredOptions}
                        value={orderDraft?.status ?? ""}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        width="200px"
                        label="Estado del pedido"
                      />
                      <div>
                        <Label>Estado original:</Label>
                        <Value>
                          {
                            statusOptionsApi.find(
                              (opt) => opt.value === orderDetails.status
                            )?.label
                          }
                        </Value>
                      </div>
                    </>
                  );
                })()}
              </FormRow>
            </EditableSection>

            <EditableSection>
              <EditableSectionTitle>
                <RenderIcon name="FaPercentage" size={16} /> Aplicar descuento
                especial
                {orderDraft.aditionalDiscount !==
                  orderDetails.aditionalDiscount && (
                  <ChangesBadge>
                    <RenderIcon name="FaCircle" size={6} />
                    Modificado
                  </ChangesBadge>
                )}
              </EditableSectionTitle>

              <FormRow>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={orderDraft?.aditionalDiscount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  label="Descuento (%)"
                  width="150px"
                />
                <div>
                  <Label>Total actual:</Label>
                  <Value>${orderDraft.totalConIva.toFixed(2)}</Value>
                </div>
              </FormRow>
            </EditableSection>

            <EditableSection>
              <EditableSectionTitle>
                <RenderIcon name="FaBox" size={16} /> Gestión de productos
                {(deletedItems.length > 0 ||
                  (orderDraft?.items ?? []).some((item) => {
                    const orig = orderDetails.items.find(
                      (it) => it.id === item.id
                    );
                    return orig && orig.quantity !== item.quantity;
                  })) && (
                  <ChangesBadge>
                    <RenderIcon name="FaCircle" size={6} /> Modificado
                  </ChangesBadge>
                )}
              </EditableSectionTitle>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Productos activos */}
                {(orderDraft?.items ?? []).map((item) => {
                  const orig = orderDetails.items.find(
                    (it) => it.id === item.id
                  );
                  const cantidadOriginal = orig ? orig.quantity : null;
                  const cantidadModificada =
                    cantidadOriginal !== null &&
                    cantidadOriginal !== item.quantity;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        background: theme.colors.surface,
                        borderRadius: 8,
                        boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                        padding: 16,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 6,
                          background: "#f6f6f6",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span
                              style={{
                                fontWeight: 500,
                                marginBottom: 4,
                                color: theme.colors.text,
                                fontSize: "1.08rem",
                              }}
                            >
                              {item.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: theme.colors.textLight,
                              }}
                            >
                              SKU: {item.sku}
                            </span>
                          </div>
                          <div style={{ textAlign: "right", minWidth: 110 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: theme.colors.primary,
                                fontSize: "1.08rem",
                              }}
                            >
                              ${item.price.toFixed(2)}/u
                            </div>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: theme.colors.textLight,
                              }}
                            >
                              Precio
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 8,
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              label="Cantidad"
                              width="100px"
                            />
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: theme.colors.textLight,
                                marginTop: 2,
                              }}
                            >
                              Total por cantidad:{" "}
                              <b>${(item.price * item.quantity).toFixed(2)}</b>
                            </div>
                            {cantidadModificada && (
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: theme.colors.textLight,
                                }}
                              >
                                Cantidad original: <b>{cantidadOriginal}</b>
                              </span>
                            )}
                          </div>
                          <Button
                            text="Eliminar"
                            variant="outlined"
                            size="small"
                            leftIconName="FaTrash"
                            onClick={() => handleRemoveProduct(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Productos eliminados con opción de deshacer */}
                {deletedItems.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        color: theme.colors.warning,
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      Productos eliminados (puedes deshacer antes de guardar):
                    </div>
                    {deletedItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: theme.colors.surface,
                          border: `1px dashed ${theme.colors.warning}`,
                          borderRadius: 6,
                          padding: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{ flex: 1, color: theme.colors.textLight }}
                        >
                          {item.name} (SKU: {item.sku})
                        </span>
                        <Button
                          text="Deshacer"
                          variant="outlined"
                          size="small"
                          leftIconName="FaUndo"
                          onClick={() => handleUndoRemoveProduct(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </EditableSection>
          </TwoColumns>
        </Section>
      )}

      {/* Información del pedido */}
      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaInfoCircle" size={18} /> Información del pedido
          </SectionTitle>

          <InfoItem>
            <Label>N° Pedido:</Label>
            <Value>{orderDetails.id}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Empresa:</Label>
            <Value>{orderDetails.empresaInfo.name}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Fecha de pedido:</Label>
            <Value>
              {format(orderDetails.date, "d 'de' MMMM, yyyy", { locale: es })}
            </Value>
          </InfoItem>
        </Section>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaUser" size={18} /> Datos del cliente
          </SectionTitle>

          <InfoItem>
            <Label>Nombre:</Label>
            <Value>{orderDetails.customer.name}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Email:</Label>
            <Value>{orderDetails.customer.email}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Contacto Principal:</Label>
            <Value>
              {(() => {
                const empresa =
                  orderDetails.empresaInfo?.name ||
                  orderDetails.empresaInfo?.id;
                const telefonosEmpresa = user.TELEFONOS?.[empresa] || [];
                if (telefonosEmpresa.length === 0) return "No disponible";
                const principal =
                  telefonosEmpresa.find((t) => t.PREDETERMINED) ||
                  telefonosEmpresa[0];
                return principal
                  ? `${principal.PHONE_NUMBER}`
                  : "No disponible";
              })()}
            </Value>
          </InfoItem>
        </Section>
      </TwoColumns>

      {/* Direcciones */}
      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaShippingFast" size={18} /> Información de envío
          </SectionTitle>

          <InfoItem>
            <Label>Dirección:</Label>
            <Value>{orderDetails.shipping.address}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Ciudad:</Label>
            <Value>{orderDetails.shipping.city}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Estado/Provincia:</Label>
            <Value>{orderDetails.shipping.state}</Value>
          </InfoItem>
        </Section>

        <Section>
          <SectionTitle>
            <RenderIcon name="FaFileInvoiceDollar" size={18} /> Información de
            facturación
          </SectionTitle>

          <InfoItem>
            <Label>Dirección:</Label>
            <Value>{orderDetails.billing.address}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Ciudad:</Label>
            <Value>{orderDetails.billing.city}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Estado/Provincia:</Label>
            <Value>{orderDetails.billing.state}</Value>
          </InfoItem>
        </Section>
      </TwoColumns>

      {/* Productos */}
      <Section>
        <SectionTitle>
          <RenderIcon name="FaBoxOpen" size={18} /> Productos
        </SectionTitle>

        {/* Mostrar descuentos si existen */}
        {(orderDetails.aditionalDiscount > 0 || orderDetails.discount > 0) && (
          <div style={{ marginBottom: 16 }}>
            {orderDetails.discount > 0 && (
              <div
                style={{
                  background: theme.colors.info + "22",
                  border: `1px solid ${theme.colors.info}`,
                  color: theme.colors.info,
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RenderIcon name="FaTag" size={16} style={{ marginRight: 6 }} />
                Descuento general de cliente aplicado:{" "}
                {orderDetails.discount}%
              </div>
            )}
            {orderDetails.aditionalDiscount > 0 && (
              <div
                style={{
                  background: theme.colors.success + "22",
                  border: `1px solid ${theme.colors.success}`,
                  color: theme.colors.success,
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RenderIcon name="FaTag" size={16} style={{ marginRight: 6 }} />
                Descuento especial aplicado por coordinadora:{" "}
                {orderDetails.aditionalDiscount}%
              </div>
            )}
          </div>
        )}

        {/* Información sobre IVA */}
        <div
          style={{
            background: theme.colors.primary + "15",
            border: `1px solid ${theme.colors.primary}30`,
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 16,
            fontWeight: 500,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: theme.colors.primary,
          }}
        >
          <RenderIcon name="FaInfoCircle" size={14} />
          <span>
            IVA incluido. Todos los precios mostrados incluyen impuestos.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {orderDetails.items.map((item) => {
            const promoPct = Number(item.promotionalDiscount) || 0;
            const price = item.price;
            const qty = Number(item.quantity);
            const promoDiscount = price * qty * (promoPct / 100);
            const subtotal = price * qty;
            const total = subtotal - promoDiscount;

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 16,
                  background: theme.colors.surface,
                  borderRadius: 8,
                  boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                  padding: 16,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 6,
                    background: "#f6f6f6",
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontWeight: 500,
                          marginBottom: 4,
                          color: theme.colors.text,
                          fontSize: "1.08rem",
                          cursor: "pointer",
                        }}
                        onClick={() => handleProductClick(item.id)}
                        onMouseEnter={(e) => {
                          e.target.style.color = theme.colors.primary;
                          e.target.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = theme.colors.text;
                          e.target.style.textDecoration = "none";
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        SKU: {item.sku}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 110 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: theme.colors.primary,
                          fontSize: "1.08rem",
                        }}
                      >
                        ${total.toFixed(2)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: theme.colors.textLight,
                        }}
                      >
                        Total (IVA incl.)
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ color: theme.colors.text, fontSize: "0.98rem" }}
                    >
                      x{qty} · ${price.toFixed(2)} c/u (IVA incl.) ={" "}
                      <b>${subtotal.toFixed(2)}</b>
                    </div>
                    {promoPct > 0 && (
                      <div
                        style={{
                          color: theme.colors.success,
                          fontWeight: 500,
                          fontSize: "0.98rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        -{promoPct}% (${promoDiscount.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <OrderSummary>
          <SummaryRow>
            <SummaryLabel>Subtotal (con iva):</SummaryLabel>
            <SummaryValue>${orderDetails.subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          {orderDetails.totalPromotionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuentos promocionales:</SummaryLabel>
                <SummaryValue $operacion>
                  -${orderDetails.totalPromotionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>
                  ${orderDetails.subtotalAfterPromo.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.discount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento general:</SummaryLabel>
                <SummaryValue $operacion>
                  -${orderDetails.generalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>
                  ${orderDetails.subtotalAfterGeneral.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.aditionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento especial:</SummaryLabel>
                <SummaryValue $operacion>
                  -${orderDetails.aditionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Subtotal tras descuento especial:</SummaryLabel>
                <SummaryValue>
                  $
                  {(orderDetails.totalFinal < 0
                    ? 0
                    : orderDetails.totalFinal
                  ).toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}

          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue>${orderDetails.total.toFixed(2)}</SummaryValue>
          </SummaryRow>
        </OrderSummary>
      </Section>
    </PageContainer>
  );
};

export default DetallePedidoCoordinador;
