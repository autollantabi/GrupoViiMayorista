import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import { api_order_getOrderById } from "../../api/order/apiOrder";
import RenderIcon from "../../components/ui/RenderIcon";
import { baseLinkImages } from "../../constants/links";
import ContactModal from "../../components/ui/ContactModal";
import { copyToClipboard } from "../../utils/utils";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import { useAuth } from "../../context/AuthContext";
import { api_optionsCatalog_getStates } from "../../api/optionsCatalog/apiOptionsCatalog";
import { useCart } from "../../context/CartContext";
import { ROUTES } from "../../constants/routes";
import { useProductCatalog } from "../../context/ProductCatalogContext";
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
`;

const StatusBadge = styled.span`
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

  @media (max-width: 768px) {
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

const ProductName = styled.span`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const ProductSKU = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
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

const TrackingSteps = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;
const TrackingStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  position: relative;
  padding: 0 10px;

  // Línea horizontal entre pasos
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 15px; // Alinear con el centro del ícono
    right: calc(-50% + 10px);
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.border};
    z-index: 0;
  }

  // En modo móvil, volver al diseño vertical
  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 15px;
      top: 32px;
      bottom: -20px;
      width: 2px;
      height: calc(100% - 10px);
      right: auto;
    }
  }
`;

const StepIconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, $completed }) =>
    $completed ? theme.colors.primary : theme.colors.surface};
  border: 2px solid
    ${({ theme, $completed }) =>
      $completed ? theme.colors.primary : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $completed }) =>
    $completed ? theme.colors.white : theme.colors.textLight};
  margin-bottom: 12px;
  z-index: 1; // Para que aparezca por encima de la línea

  @media (max-width: 768px) {
    margin-right: 16px;
    margin-bottom: 0;
  }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const StepTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const StepDate = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }
`;

const ProductCardImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  background: #f6f6f6;
`;

const DetallePedido = () => {
  const { orderId } = useParams();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loadProductByCodigo } = useProductCatalog();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [statusOptionsApi, setStatusOptionsApi] = useState([]);
  const { addToCart } = useCart();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleRepeatOrder = async () => {
    // Agrega cada producto del pedido anterior
    const empresaId = orderDetails.empresaInfo.id;
    for (const item of orderDetails.items) {
      // Puedes ajustar aquí si necesitas pasar más props
      const itemToAdd = await loadProductByCodigo(item.id, empresaId);
      addToCart(itemToAdd, item.quantity);
    }
    // Redirige al carrito
    navigate(ROUTES.ECOMMERCE.CARRITO);
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
        prevUrl: `/mis-pedidos/${orderId}`, // URL del detalle del pedido para el botón de regreso
      },
    });
  };

  const estadosTracking = [
    { key: "PENDIENTE", label: "Pedido recibido" },
    { key: "PENDIENTE CARTERA", label: "Revisión" },
    { key: "CONFIRMADO", label: "Pedido confirmado" },
    { key: "ENTREGADO", label: "Entregado" },
    { key: "CANCELADO", label: "Pedido cancelado" },
  ];

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

          const statusHistory = Array.isArray(cabecera.STATUS_HISTORY)
            ? cabecera.STATUS_HISTORY
            : [];
          const currentStatus = mapStatusOptions.find(
            (opt) => opt.id === cabecera.STATUS
          )?.value;

          // Calcular el subtotal con IVA incluido
          const ivaPercentage = cabecera.IVA_DETAIL?.IVA_PERCENTAGE || TAXES.IVA_PERCENTAGE;
          
          const subtotal = detalle.reduce(
            (sum, item) => {
              const priceWithIVA = calculatePriceWithIVA(item.PRICE, ivaPercentage);
              return sum + priceWithIVA * item.QUANTITY;
            },
            0
          ); // Crear un objeto con la estructura que espera nuestro componente
          const userDiscount = user?.DESCUENTOS?.[cabecera.ENTERPRISE] || 0;

          // Crear tracking steps considerando que PENDIENTE y PENDIENTE CARTERA son estados alternativos en la misma posición
          const tracking = estadosTracking
            .map((estado) => {
              const found = statusHistory.find(
                (s) => s.VALUE_CATALOG === estado.key
              );
              return {
                step: estado.label,
                date: found ? new Date(found.createdAt) : null,
                completed: !!found,
                key: estado.key,
              };
            })
            // Filtrar para mostrar solo el estado inicial activo (PENDIENTE o PENDIENTE CARTERA)
            .filter((step) => {
              // Si el pedido está cancelado, mostrar solo PENDIENTE y CANCELADO
              if (currentStatus === "CANCELADO") {
                return step.key === "PENDIENTE" || step.key === "CANCELADO";
              }
              
              // Para estados iniciales, mostrar solo el que está activo
              if (step.key === "PENDIENTE" || step.key === "PENDIENTE CARTERA") {
                return step.key === currentStatus;
              }
              
              // Para otros estados, mostrar normalmente
              return step.key !== "CANCELADO";
            });

          const formattedOrder = {
            id: cabecera.ID_CART_HEADER,
            date: new Date(cabecera.createdAt),
            status: currentStatus,
            aditionalDiscount: cabecera.ADITIONAL_DISCOUNT || 0,
            discount: userDiscount,
            iva: cabecera.IVA_DETAIL?.IVA_PERCENTAGE || TAXES.IVA_PERCENTAGE,
            customer: {
              name: cabecera.USER.NAME_USER,
              email: cabecera.USER.EMAIL,
              phone: cabecera?.PHONE[0]?.PHONE_NUMBER || "No dispone",
            },
            shipping: {
              address: cabecera.SHIPPING_ADDRESS.STREET,
              city: cabecera.SHIPPING_ADDRESS.CITY,
              state: cabecera.SHIPPING_ADDRESS.STATE,
            },
            billing: {
              address: cabecera.BILLING_ADDRESS.STREET,
              city: cabecera.BILLING_ADDRESS.CITY,
              state: cabecera.BILLING_ADDRESS.STATE,
            },
            payment: {
              method: "Transferencia bancaria", // Este dato no viene en la API
              status: "Pendiente",
              reference: "No disponible", // Este dato no viene en la API
              date: new Date(cabecera.createdAt),
            },
            items: detalle.map((item) => {
              const basePrice = item.PRICE;
              const ivaPercentage = cabecera.IVA_DETAIL?.IVA_PERCENTAGE || TAXES.IVA_PERCENTAGE;
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
            }),
            subtotal: subtotal,
            total: cabecera.TOTAL || subtotal, // Si no hay total, usar subtotal
            tracking,
            empresaInfo: {
              id: cabecera.ENTERPRISE,
              name: cabecera.ENTERPRISE,
            },
          };
          setOrderDetails(formattedOrder);
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

  const handleCancelOrder = () => {
    const canCancel = orderDetails.status === "PENDIENTE" || orderDetails.status === "PENDIENTE CARTERA";
    if (canCancel) {
      setShowCancelModal(true);
    } else {
      // Mostrar mensaje de error
      alert(
        "Lo sentimos, no es posible cancelar este pedido ya que ha sido confirmado para su procesamiento."
      );
    }
  };

  const handleConfirmCancel = () => {
    // Implementar la lógica de cancelación
    alert("Pedido cancelado correctamente");
    setShowCancelModal(false);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <PageContainer
        backButtonText="Regresar"
        backButtonOnClick={() => navigate("/mis-pedidos")}
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
        backButtonOnClick={() => navigate("/mis-pedidos")}
      >
        <EmptyState>
          <h2>Pedido no encontrado</h2>
          <p>
            {error ||
              "No pudimos encontrar la información del pedido solicitado."}
          </p>
          <Button
            text="Volver a mis pedidos"
            variant="solid"
            onClick={() => navigate("/mis-pedidos")}
          />
        </EmptyState>
      </PageContainer>
    );
  }

  const canCancel = orderDetails.status === "PENDIENTE" || orderDetails.status === "PENDIENTE CARTERA";

  // 1. Subtotal sin descuentos
  const rawSubtotal = orderDetails.subtotal;

  // 2. Total de descuentos promocionales (por producto)
  const totalPromotionalDiscount = orderDetails.items.reduce(
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
    subtotalAfterPromo * (Number(orderDetails.discount) / 100);

  // 5. Subtotal después de descuento general
  const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;

  // 6. Descuento adicional (coordinadora) sobre el subtotal con promo y general
  const aditionalDiscount =
    subtotalAfterGeneral * (Number(orderDetails.aditionalDiscount) / 100);

  // 7. Total final antes de IVA
  const totalFinal = subtotalAfterGeneral - aditionalDiscount;

  // IVA ya está incluido en todos los precios

  return (
    <PageContainer
      backButtonText="Regresar"
      backButtonOnClick={() => navigate("/mis-pedidos")}
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
          {canCancel ? (
            <Button
              text="Cancelar pedido"
              variant="outlined"
              leftIconName="FaTimesCircle"
              onClick={handleCancelOrder}
            />
          ) : (
            <Button
              text="No se puede cancelar"
              variant="outlined"
              leftIconName="FaTimesCircle"
              onClick={() =>
                alert(
                  "Lo sentimos, no es posible cancelar este pedido ya que ha sido confirmado para su procesamiento."
                )
              }
              disabled={true}
            />
          )}
          <Button
            text="Soporte"
            variant="solid"
            backgroundColor={theme.colors.primary}
            leftIconName="FaHeadset"
            onClick={handleContactSupport}
            disabled={orderDetails.status === "CANCELADO"}
          />
          {(orderDetails.status === "CANCELADO" ||
            orderDetails.status === "ENTREGADO") && (
            <Button
              text="Pedir Nuevamente"
              variant="solid"
              backgroundColor={theme.colors.success}
              leftIconName="FaRedo"
              onClick={handleRepeatOrder}
            />
          )}
        </OrderActions>
      </PageHeader>

      <Section>
        <SectionTitle>
          Estado del pedido:
          <StatusBadge $status={orderDetails.status}>
            {
              statusOptionsApi.find((opt) => opt.value === orderDetails.status)
                ?.label
            }
          </StatusBadge>
        </SectionTitle>
        {orderDetails.status === "PENDIENTE CARTERA" && (
          <div
            style={{
              background: theme.colors.info + "15",
              border: `1px solid ${theme.colors.info}30`,
              borderRadius: 6,
              padding: "12px 16px",
              marginTop: 16,
              fontWeight: 500,
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: theme.colors.info,
            }}
          >
            <RenderIcon name="FaExclamationTriangle" size={16} />
            <span>Su pedido está en revisión</span>
          </div>
        )}
        {orderDetails.status !== "CANCELADO" ? (
          <TrackingSteps>
            {orderDetails.tracking
              .filter((step) => step.key !== "CANCELADO")
              .map((step, index) => (
                <TrackingStep key={index}>
                  <StepIconContainer $completed={step.completed}>
                    {step.completed ? "✓" : index + 1}
                  </StepIconContainer>
                  <StepContent>
                    <StepTitle>{step.step}</StepTitle>
                    <StepDate>
                      {step.date
                        ? format(step.date, "d 'de' MMMM, yyyy 'a las' HH:mm", {
                            locale: es,
                          })
                        : "Pendiente"}
                    </StepDate>
                  </StepContent>
                </TrackingStep>
              ))}
          </TrackingSteps>
        ) : (
          <div style={{ marginTop: 20 }}>
            {orderDetails.tracking
              .filter(
                (step) => step.key === "PENDIENTE" || step.key === "CANCELADO"
              )
              .map((step, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <b>{step.step}:</b>{" "}
                  {step.date
                    ? format(step.date, "d 'de' MMMM, yyyy 'a las' HH:mm", {
                        locale: es,
                      })
                    : "Pendiente"}
                </div>
              ))}
          </div>
        )}
      </Section>

      <TwoColumns>
        <Section>
          <SectionTitle>
            <RenderIcon name="FaInfoCircle" size={18} /> Información Adicional
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
              {format(orderDetails.date, "d 'de' MMMM, yyyy", {
                locale: es,
              })}
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
            <Value>{orderDetails.customer.phone}</Value>
          </InfoItem>
        </Section>
      </TwoColumns>

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
            Facturación
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
                Descuento general de cliente aplicado: {orderDetails.discount}%
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

        <ProductsList>
          {orderDetails.items.map((item) => {
            const promoPct = Number(item.promotionalDiscount) || 0;
            const price = item.price; // Ya incluye IVA
            const qty = Number(item.quantity);
            const promoDiscount = price * qty * (promoPct / 100);
            const subtotal = price * qty; // Subtotal con IVA incluido
            const total = subtotal - promoDiscount; // Total con IVA incluido

            return (
              <ProductCard key={item.id}>
                <ProductCardImage src={item.image} alt={item.name} />
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
                      <ProductName 
                        style={{ fontSize: "1.08rem" }}
                        onClick={() => handleProductClick(item.id)}
                      >
                        {item.name}
                      </ProductName>
                      <ProductSKU>SKU: {item.sku}</ProductSKU>
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
              </ProductCard>
            );
          })}
        </ProductsList>

        <OrderSummary>
          <SummaryRow>
            <SummaryLabel>Subtotal (con iva):</SummaryLabel>
            <SummaryValue>${orderDetails.subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          {totalPromotionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuentos promocionales:</SummaryLabel>
                <SummaryValue $operacion={true}>
                  -${totalPromotionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>${subtotalAfterPromo.toFixed(2)}</SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.discount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento general:</SummaryLabel>
                <SummaryValue $operacion={true}>
                  -${generalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel></SummaryLabel>
                <SummaryValue>${subtotalAfterGeneral.toFixed(2)}</SummaryValue>
              </SummaryRow>
            </>
          )}
          {orderDetails.aditionalDiscount > 0 && (
            <>
              <SummaryRow>
                <SummaryLabel>Descuento especial:</SummaryLabel>
                <SummaryValue $operacion>
                  -${aditionalDiscount.toFixed(2)}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Subtotal tras descuento especial:</SummaryLabel>
                <SummaryValue>
                  ${(totalFinal < 0 ? 0 : totalFinal).toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            </>
          )}

          <SummaryRow>
            <SummaryLabel>Total:</SummaryLabel>
            <SummaryValue style={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.colors.primary }}>
              ${orderDetails.total.toFixed(2)}
            </SummaryValue>
          </SummaryRow>
        </OrderSummary>
      </Section>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        selectedCompany={orderDetails?.empresaInfo?.id} // Filtrar por la empresa del pedido actual
        selectedOrderId={orderDetails?.id}
      />

      {/* Modal de confirmación para cancelar pedido */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              width: "90%",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.colors.text,
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RenderIcon name="FaExclamationTriangle" size={20} />
                Confirmar cancelación
              </h3>
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ margin: 0, color: theme.colors.text, fontSize: "1rem" }}>
                ¿Está seguro que desea cancelar el pedido #{orderDetails?.id?.substring(0, 12)}...?
              </p>
              <p style={{ margin: "12px 0 0 0", color: theme.colors.textLight, fontSize: "0.9rem" }}>
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                padding: "16px 24px",
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              <Button
                text="Cancelar"
                variant="outlined"
                onClick={handleCancelModalClose}
              />
              <Button
                text="Confirmar"
                variant="solid"
                backgroundColor={theme.colors.error}
                onClick={handleConfirmCancel}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DetallePedido;
