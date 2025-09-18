import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import { useAppTheme } from "../../context/AppThemeContext";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import RenderIcon from "../../components/ui/RenderIcon";
import { api_order_createOrder } from "../../api/order/apiOrder";
import { TAXES, calculatePriceWithIVA } from "../../constants/taxes";
import PageContainer from "../../components/layout/PageContainer";
import { baseLinkImages } from "../../constants/links";

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text};
  gap: 12px;
`;

const CartEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 16px;
`;

const EmptyCartText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 24px;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 900px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const CartItemsList = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
`;

const CartItemContainer = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ImagePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.7rem;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
`;

const ItemDetails = styled.div`
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
`;

const ItemName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const ItemBrand = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ItemPricing = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 2px;
  min-width: 120px;
`;

const ItemPrice = styled.div`
  font-weight: bold;
  color: ${({ theme, $subtotal }) =>
    $subtotal ? theme.colors.text : theme.colors.primary};
  font-size: ${({ $subtotal }) => ($subtotal ? "0.9rem" : "1.2rem")};
  text-decoration: ${({ $subtotal }) => ($subtotal ? "line-through" : "none")};
`;

const ItemQuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const QuantityButton = styled(Button)`
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.surface};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textLight : theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const OrderSummary = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const SummaryValue = styled.span`
  font-weight: ${({ $bold }) => ($bold ? "bold" : "normal")};
  color: ${({ theme }) => theme.colors.text};
`;

const TotalRow = styled(SummaryRow)`
  padding-top: 2px;
  font-size: 1.1rem;
`;

const StockWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin: 4px 0 8px;
  font-weight: 500;
`;

const StockInfo = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.8rem;
  margin-top: 6px;
`;

const StockAlertBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight || "#FFEBEE"};
  color: ${({ theme }) => theme.colors.error};
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.8rem;
`;

const ShippingSection = styled.div`
  margin: 24px 0;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const AddressCard = styled.div`
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${({ theme, selected }) =>
    selected ? `${theme.colors.primary || "#E3F2FD"}15` : "transparent"};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      `${theme.colors.primary || "#E3F2FD"}15`};
  }
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const AddressDetails = styled.div`
  font-size: 0.9rem;
`;

const AddressActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(Button)`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const NewAddressButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      `${theme.colors.primaryLight || "#E3F2FD"}15`};
  }
`;

// Nuevos estilos para las pestañas de empresas
const CompanyTabs = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CompanyTab = styled(Button)`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CompanySummary = styled.div`
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
`;

const CompanyName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
`;

const ValidationWarning = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

const EmptyAddressState = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => `${theme.colors.background}80`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;

  &::before {
    content: "📍";
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
`;

// Agrega estas definiciones de componentes styled después de EmptyAddressState y antes de CompanyCheckoutButton
const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ProcessingCard = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  z-index: 1000;
`;

const ProcessingTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ProcessingMessage = styled.p`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 16px;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  gap: 8px;
`;

const CompanyCheckoutButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primaryDark || theme.colors.primary};
  }
`;

const CartItem = ({
  item,
  handleQuantityChange,
  removeFromCart,
  theme,
  navigate,
}) => {
  const discount = item?.discount || 0;
  const maxStock = item?.stock || 0;

  // Calcular precio con descuento aplicado
  const discountedPrice = discount
    ? item.price * (1 - discount / 100)
    : item.price;

  // Calcular precio con IVA incluido
  const priceWithIVA = calculatePriceWithIVA(
    discountedPrice,
    item.iva || TAXES.IVA_PERCENTAGE
  );

  const subTotal = priceWithIVA * item.quantity;

  const handleItemClick = () => {
    navigate(`/productos/${item.id}`, {
      state: {
        product: item, // Pasar el producto completo
        empresaId: item.empresaId,
        prevUrl: "/carrito", // URL del carrito para el botón de regreso
      },
    });
  };

  // Componente para manejar la imagen con fallback
  const ProductImageWithFallback = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    const imageSrc = `${baseLinkImages}${src}`;
    if (imageError || !src) {
      return (
        <ImagePlaceholder>
          <div>
            <div>Imagen no disponible</div>
          </div>
        </ImagePlaceholder>
      );
    }


    return (
      <>
        {imageLoading && (
          <ImagePlaceholder>
            <div>Cargando...</div>
          </ImagePlaceholder>
        )}
        <ItemImage
          src={imageSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? "none" : "block" }}
        />
      </>
    );
  };

  return (
    <CartItemContainer>
      <ProductImageWithFallback src={item?.image} alt={item?.name} />

      <ItemDetails>
        <ItemName onClick={handleItemClick}>{item?.name}</ItemName>
        <ItemBrand>{item?.brand}</ItemBrand>

        <ItemQuantityControl>
          <QuantityButton
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            text={"-"}
            size="small"
          />

          <QuantityInput
            type="number"
            min="1"
            max={5000}
            value={item.quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              handleQuantityChange(item.id, newQuantity);
            }}
          />
          <QuantityButton
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={item.quantity >= 5000}
            text={"+"}
            size="small"
          />
        </ItemQuantityControl>

        <StockInfo>
          {maxStock > 0 ? `${maxStock} disponibles` : "Stock a consultar"}
        </StockInfo>
      </ItemDetails>

      <ItemPricing>
        <ItemPrice>${subTotal.toFixed(2)}</ItemPrice>
        {discount > 0 && (
          <ItemPrice $subtotal>
            ${(item.price * item.quantity).toFixed(2)}
          </ItemPrice>
        )}
        <Button
          onClick={() => removeFromCart(item.id)}
          text={"Eliminar"}
          color={theme.colors.error}
          size="small"
          backgroundColor={"transparent"}
          style={{ marginTop: "auto" }}
        />
      </ItemPricing>
    </CartItemContainer>
  );
};

// Añadir esta función para encontrar la mejor dirección disponible
const findBestAvailableAddress = (addresses, company, type) => {
  // 1. Buscar predeterminada para esta empresa
  const defaultForCompany = addresses.find(
    (addr) => addr.type === type && addr.isDefault && addr.empresa === company
  );
  if (defaultForCompany) return defaultForCompany.id;

  // 2. Buscar cualquier dirección de este tipo para esta empresa
  const anyForCompany = addresses.find(
    (addr) => addr.type === type && addr.empresa === company
  );
  if (anyForCompany) return anyForCompany.id;

  // 3. Buscar predeterminada global
  const defaultGlobal = addresses.find(
    (addr) => addr.type === type && addr.isDefault
  );
  if (defaultGlobal) return defaultGlobal.id;

  // 4. Buscar cualquier dirección de este tipo
  const anyAddress = addresses.find((addr) => addr.type === type);
  if (anyAddress) return anyAddress.id;

  // No hay direcciones disponibles
  return null;
};

const Carrito = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    removeItemsByCompany,
    clearCart,
    calculateCartTotal,
    isLoading,
  } = useCart();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth(); // Obtenemos el usuario actual
  const cartTotal = calculateCartTotal(cart);

  // Estados para manejar direcciones
  const [addresses, setAddresses] = useState([]);

  // Estados para agrupar el carrito por empresa
  const [groupedCart, setGroupedCart] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Agregar estos nuevos estados para el proceso de checkout
  const [isProcessingOrders, setIsProcessingOrders] = useState(false);
  const [currentProcessingCompany, setCurrentProcessingCompany] = useState("");
  const [completedOrders, setCompletedOrders] = useState(0);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [totalOrdersToProcess, setTotalOrdersToProcess] = useState(0);
  const [lastProcessedCompanies, setLastProcessedCompanies] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [companyToCheckout, setCompanyToCheckout] = useState(null);
  const [isCheckoutAll, setIsCheckoutAll] = useState(false);

  // Nueva función para confirmar el pago de una empresa
  const handleCompanyCheckoutClick = (company) => {
    setCompanyToCheckout(company);
    setShowConfirmModal(true);
  };

  // Cuando el usuario confirma en el modal
  const handleConfirmCheckout = async () => {
    setShowConfirmModal(false);
    if (companyToCheckout) {
      await handleCheckoutSingleCompany(companyToCheckout);
      setCompanyToCheckout(null);
    }
  };

  // Cuando el usuario cancela el modal
  const handleCancelCheckout = () => {
    setShowConfirmModal(false);
    setCompanyToCheckout(null);
  };

  // Función para validar que todas las direcciones estén seleccionadas
  const isAllAddressesSelected = () => {
    return Object.values(groupedCart).every((companyData) => {
      return companyData.shippingAddressId && companyData.billingAddressId;
    });
  };

  // Cargar direcciones del usuario
  useEffect(() => {
    if (user) {
      // Si el usuario tiene direcciones guardadas o usamos las de prueba
      let userAddresses = [];

      if (user.DIRECCIONES) {
        // Obtener todas las direcciones y aplanarlas en un solo array
        const allAddresses = Object.values(user.DIRECCIONES).flat();

        userAddresses = allAddresses.map((addr) => ({
          id: addr.ID.toString(),
          name: addr.CLASIFICATION,
          street: addr.STREET,
          number: "",
          city: addr.CITY,
          state: addr.STATE,
          zipCode: "",
          phone: "",
          isDefault: addr.PREDETERMINED,
          type: addr.TYPE.trim(),
          empresa: addr.EMPRESA,
          origen: addr.ORIGIN,
        }));
      }

      setAddresses(userAddresses);
    }
  }, [user]);

  // Agrupar items del carrito por empresa
  useEffect(() => {
    const groupByCompany = () => {
      const grouped = {};

      console.log(cart);

      cart.forEach((item) => {
        const company = item.empresaId || "Sin empresa";

        if (!grouped[company]) {
          // Verificar si ya existía esta empresa en el agrupamiento anterior
          // y mantener sus direcciones seleccionadas
          grouped[company] = {
            items: [],
            total: 0,
            // Mantener las direcciones previamente seleccionadas si existían
            shippingAddressId: groupedCart[company]?.shippingAddressId || null,
            billingAddressId: groupedCart[company]?.billingAddressId || null,
          };
        }

        grouped[company].items.push(item);
        grouped[company].total += item.price * item.quantity;
      });

      // Asignar direcciones predeterminadas solo para empresas nuevas o sin dirección seleccionada
      if (addresses.length > 0) {
        Object.keys(grouped).forEach((company) => {
          // Solo asignar direcciones predeterminadas si no hay una ya seleccionada
          if (!grouped[company].shippingAddressId) {
            grouped[company].shippingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "S"
            );
          }

          if (!grouped[company].billingAddressId) {
            grouped[company].billingAddressId = findBestAvailableAddress(
              addresses,
              company,
              "B"
            );
          }
        });
      }

      setGroupedCart(grouped);

      // Actualizar selectedCompany si es necesario
      if (Object.keys(grouped).length > 0) {
        if (!selectedCompany || !grouped[selectedCompany]) {
          setSelectedCompany(Object.keys(grouped)[0]);
        }
      }
    };

    groupByCompany();
  }, [cart, addresses]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageTitle>Carrito de compras</PageTitle>
        <CartEmptyState>
          <EmptyCartIcon>⏳</EmptyCartIcon>
          <EmptyCartText>Cargando tu carrito...</EmptyCartText>
        </CartEmptyState>
      </PageContainer>
    );
  }

  if (cart.length === 0) {
    return (
      <PageContainer>
        <PageTitle>Carrito de compras</PageTitle>
        <CartEmptyState>
          <EmptyCartIcon>🛒</EmptyCartIcon>
          <EmptyCartText>Tu carrito está vacío</EmptyCartText>
          <Button
            text="Ir al Catálogo"
            variant="solid"
            onClick={() => navigate("/")}
            backgroundColor={theme.colors.primary}
          />
        </CartEmptyState>
      </PageContainer>
    );
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) return;

    // Encontrar el ítem del carrito
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return;

    // Actualizar la cantidad sin restricciones de stock
    updateQuantity(id, newQuantity);
  };

  // Eliminamos las validaciones de stock que bloquean el checkout
  const hasInsufficientStock = false;

  // Función para verificar stock insuficiente por empresa (siempre retorna false)
  const hasInsufficientStockForCompany = (company) => {
    return false;
  };
  const handleCheckoutAll = async () => {
    // Verificar que todas las empresas tienen direcciones seleccionadas
    if (!isAllAddressesSelected()) {
      toast.error(
        "Por favor, selecciona direcciones de envío y facturación para todas las empresas"
      );
      return;
    }

    // Iniciar proceso de pedidos múltiples
    const companiesToProcess = Object.keys(groupedCart);
    setTotalOrdersToProcess(companiesToProcess.length);
    setCompletedOrders(0);
    setIsProcessingOrders(true);

    // Guardar las empresas que se van a procesar
    setLastProcessedCompanies([...companiesToProcess]);

    // Procesar cada empresa secuencialmente
    for (const company of companiesToProcess) {
      // Actualizar la empresa actual que se está procesando
      setCurrentProcessingCompany(company);

      try {
        // Llamar a la función existente para procesar el pedido de esta empresa
        await handleCheckoutSingleCompanyInternal(company);

        // Incrementar contador de órdenes completadas
        setCompletedOrders((prev) => prev + 1);
      } catch (error) {
        console.error(`Error al procesar pedido para ${company}:`, error);
        toast.error(`Error al procesar pedido para ${company}`);
        setIsProcessingOrders(false);
        return;
      }
    }

    // Mostrar tarjeta de éxito cuando todos los pedidos estén procesados
    setIsProcessingOrders(false);
    setShowSuccessCard(true);
  };

  // Versión interna de handleCheckoutSingleCompany que no muestra toast individuales
  const handleCheckoutSingleCompanyInternal = async (company) => {
    const companyData = groupedCart[company];

    if (!companyData) {
      throw new Error("No se encontró información para esta empresa");
    }

    // Verificar direcciones
    if (!companyData.shippingAddressId || !companyData.billingAddressId) {
      throw new Error("Faltan direcciones para esta empresa");
    }

    // Preparar orden para esta empresa
    const shippingAddress = addresses.find(
      (addr) => addr.id === companyData.shippingAddressId
    );
    const billingAddress = addresses.find(
      (addr) => addr.id === companyData.billingAddressId
    );

    // Calcular total con IVA incluido para cada item
    const itemsWithIVA = companyData.items.map((item) => {
      const discount = item?.discount || 0;
      const discountedPrice = discount
        ? item.price * (1 - discount / 100)
        : item.price;
      const priceWithIVA = calculatePriceWithIVA(
        discountedPrice,
        item.iva || TAXES.IVA_PERCENTAGE
      );
      return {
        ...item,
        priceWithIVA,
        totalWithIVA: priceWithIVA * item.quantity,
      };
    });

    // Subtotal con IVA incluido
    const subtotalWithIVA = itemsWithIVA.reduce(
      (acc, item) => acc + item.totalWithIVA,
      0
    );

    // Aplicar descuento de empresa (userDiscount)
    const userDiscount = user?.DESCUENTOS?.[company] || 0;
    const discountAmount = subtotalWithIVA * (userDiscount / 100);
    const totalConIva = subtotalWithIVA - discountAmount;

    const productsToProcess = companyData.items.map((item) => ({
      PRODUCT_CODE: item.id,
      QUANTITY: item.quantity,
      PRICE: item.price,
      PROMOTIONAL_DISCOUNT: item.promotionalDiscount || 0,
    }));

    const orderToProcess = {
      ENTERPRISE: company,
      ACCOUNT_USER: user.ACCOUNT_USER,
      SHIPPING_ADDRESS_ID: parseInt(shippingAddress.id),
      BILLING_ADDRESS_ID: parseInt(billingAddress.id),
      SUBTOTAL: subtotalWithIVA, // Subtotal con IVA incluido
      DISCOUNT: userDiscount, // Descuento de empresa
      TOTAL: totalConIva, // Total final después del descuento
      STATUS: "PENDIENTE",
      PRODUCTOS: productsToProcess,
    };

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simular un delay para el procesamiento

    const responseOrder = await api_order_createOrder(orderToProcess);

    if (!responseOrder.success) {
      throw new Error(responseOrder.message || "Error al procesar el pedido");
    }

    return responseOrder;
  };

  // Modificar la función handleCheckoutSingleCompany existente
  const handleCheckoutSingleCompany = async (company) => {
    try {
      setCurrentProcessingCompany(company);
      setIsProcessingOrders(true);
      setTotalOrdersToProcess(1);
      setCompletedOrders(0);

      await handleCheckoutSingleCompanyInternal(company);

      setCompletedOrders(1);
      setIsProcessingOrders(false);
      setShowSuccessCard(true);

      // Guardar la empresa que se procesó para limpiarla cuando se cierre el modal
      setLastProcessedCompanies([company]);
    } catch (error) {
      console.error(`Error al procesar pedido para ${company}:`, error);
      toast.error(`Error al procesar pedido: ${error.message}`);
      setIsProcessingOrders(false);
    }
  };

  // Agregar función para cerrar la tarjeta de éxito e ir a Mis Pedidos
  const handleGoToOrders = () => {
    // Limpiar el carrito solo de las empresas procesadas
    if (lastProcessedCompanies.length === Object.keys(groupedCart).length) {
      // Si se procesaron todas las empresas, limpiar todo
      clearCart();
    } else {
      // Si solo se procesaron algunas empresas, limpiar selectivamente
      lastProcessedCompanies.forEach((company) => {
        removeItemsByCompany(company);
      });
    }

    setShowSuccessCard(false);
    navigate(ROUTES.ECOMMERCE.MIS_PEDIDOS);
  };

  // Agregar función para cerrar la tarjeta de éxito y seguir comprando
  const handleContinueShopping = () => {
    // Aplicar la misma lógica de limpieza
    if (lastProcessedCompanies.length === Object.keys(groupedCart).length) {
      clearCart();
    } else {
      lastProcessedCompanies.forEach((company) => {
        removeItemsByCompany(company);
      });
    }

    setShowSuccessCard(false);
    // navigate("/");
  };

  return (
    <PageContainer>
      <PageTitle>
        <h1>Carrito de compras</h1>
      </PageTitle>

      {/* Pestañas de empresas */}
      <CompanyTabs>
        {Object.keys(groupedCart).map((company) => (
          <CompanyTab
            key={company}
            $active={selectedCompany === company}
            onClick={() => setSelectedCompany(company)}
            text={company}
            size="small"
          />
        ))}
      </CompanyTabs>

      <CartLayout>
        <div>
          {/* Mostrar productos solo de la empresa seleccionada */}
          <CartItemsList>
            {console.log(groupedCart[selectedCompany]?.items)}	
            {selectedCompany &&
              groupedCart[selectedCompany]?.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  handleQuantityChange={handleQuantityChange}
                  removeFromCart={removeFromCart}
                  theme={theme}
                  navigate={navigate}
                />
              ))}
          </CartItemsList>

          {/* Sección de dirección de envío para la empresa seleccionada */}
          <ShippingSection>
            <SectionTitle>
              <RenderIcon name="FaMapMarkerAlt" size={20} />
              Dirección de envío para {selectedCompany}
            </SectionTitle>

            {addresses.filter(
              (addr) => addr.type === "S" && addr.empresa === selectedCompany
            ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "S" && addr.empresa === selectedCompany
                  )
                  .map((address) => (
                    <AddressCard
                      key={address.id}
                      selected={
                        groupedCart[selectedCompany]?.shippingAddressId ===
                        address.id
                      }
                      onClick={() => {
                        const updated = { ...groupedCart };
                        updated[selectedCompany].shippingAddressId = address.id;
                        setGroupedCart(updated);
                      }}
                    >
                      <AddressInfo>
                        <AddressName>
                          {address.name}{" "}
                          {address.origen === "SAP" && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                padding: "2px 6px",
                                backgroundColor: "transparent",
                                border: `solid 1px ${theme.colors.primary}`,
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: theme.colors.primary,
                              }}
                            >
                              {/* <RenderIcon name="FaLock" size={10} /> */}
                              <span>Registrada</span>
                            </span>
                          )}
                        </AddressName>
                        <AddressDetails>
                          {address.street} {address.number}, {address.city},{" "}
                          {address.state}
                          {address.zipCode && ` (${address.zipCode})`}
                          {address.isDefault && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: theme.colors.success,
                              }}
                            >
                              • Predeterminada
                            </span>
                          )}
                        </AddressDetails>
                      </AddressInfo>
                      <AddressActions>
                        {address.origen === "SAP" ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(
                                "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                              );
                            }}
                            style={{
                              color: theme.colors.textLight,
                            }}
                            // leftIconName={"FaLock"}
                            size="small"
                          />
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              // Redirigir a la página de perfil con los parámetros para editar esta dirección
                              navigate(ROUTES.ECOMMERCE.PERFIL, {
                                state: {
                                  activeTab: "addresses",
                                  editAddressId: address.id,
                                  empresa: address.empresa,
                                },
                              });
                            }}
                            leftIconName={"FaPencilAlt"}
                            size="small"
                          />
                        )}
                      </AddressActions>
                    </AddressCard>
                  ))}
              </div>
            ) : (
              <EmptyAddressState>
                No tienes direcciones de envío para esta empresa.
              </EmptyAddressState>
            )}

            <NewAddressButton
              onClick={() =>
                navigate(ROUTES.ECOMMERCE.PERFIL, {
                  state: {
                    activeTab: "addresses",
                    openAddressForm: true,
                    addressType: "S",
                    empresa: selectedCompany,
                  },
                })
              }
              text={"Ir a Perfil para agregar dirección de envío"}
              size="small"
              leftIconName={"FaPlus"}
            />
          </ShippingSection>

          {/* Sección de dirección de facturación similar a la de envío */}
          <ShippingSection style={{ marginTop: "24px" }}>
            <SectionTitle>
              <RenderIcon name="FaFileInvoice" size={20} />
              Dirección de facturación
            </SectionTitle>

            {addresses.filter(
              (addr) => addr.type === "B" && addr.empresa === selectedCompany
            ).length > 0 ? (
              <div>
                {addresses
                  .filter(
                    (addr) =>
                      addr.type === "B" && addr.empresa === selectedCompany
                  )
                  .map((address) => (
                    <AddressCard
                      key={address.id}
                      selected={
                        groupedCart[selectedCompany]?.billingAddressId ===
                        address.id
                      }
                      onClick={() => {
                        const updated = { ...groupedCart };
                        updated[selectedCompany].billingAddressId = address.id;
                        setGroupedCart(updated);
                      }}
                    >
                      <AddressInfo>
                        <AddressName>
                          {address.name}{" "}
                          {address.origen === "SAP" && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                padding: "2px 6px",
                                backgroundColor: "transparent",
                                border: `solid 1px ${theme.colors.primary}`,
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: theme.colors.primary,
                              }}
                            >
                              {/* <RenderIcon name="FaLock" size={10} /> */}
                              <span>Registrada</span>
                            </span>
                          )}
                        </AddressName>
                        <AddressDetails>
                          {address.street} {address.number}, {address.city},{" "}
                          {address.state}
                          {address.zipCode && ` (${address.zipCode})`}
                          {address.isDefault && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: theme.colors.info,
                              }}
                            >
                              • Predeterminada
                            </span>
                          )}
                        </AddressDetails>
                      </AddressInfo>
                      <AddressActions>
                        {address.origen === "SAP" ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(
                                "Las direcciones sincronizadas con el sistema no se pueden editar. Contacta a soporte para solicitar cambios."
                              );
                            }}
                            style={{ color: theme.colors.textLight }}
                            // leftIconName={"FaLock"}
                            size="small"
                          />
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(ROUTES.ECOMMERCE.PERFIL, {
                                state: {
                                  activeTab: "addresses",
                                  editAddressId: address.id,
                                  empresa: address.empresa,
                                },
                              });
                            }}
                            leftIconName={"FaPencilAlt"}
                            size="small"
                          />
                        )}
                      </AddressActions>
                    </AddressCard>
                  ))}
              </div>
            ) : (
              <EmptyAddressState>
                No tienes direcciones de facturación para esta empresa.
              </EmptyAddressState>
            )}

            <NewAddressButton
              onClick={() =>
                navigate(ROUTES.ECOMMERCE.PERFIL, {
                  state: {
                    activeTab: "addresses",
                    openAddressForm: true,
                    addressType: "B",
                    empresa: selectedCompany,
                  },
                })
              }
              text={"Ir a Perfil para agregar dirección de facturación"}
              leftIconName={"FaPlus"}
              size="small"
            />
          </ShippingSection>
        </div>

        <OrderSummary>
          <SummaryTitle>Resumen del pedido</SummaryTitle>

          {Object.keys(groupedCart).length > 1 && (
            <TotalRow>
              <SummaryLabel>Total General</SummaryLabel>
              <SummaryValue $bold>${cartTotal.toFixed(2)}</SummaryValue>
            </TotalRow>
          )}
          {/* Mostrar alerta solo si hay más de una empresa */}
          {Object.keys(groupedCart).length > 1 && (
            <StockAlertBanner style={{ marginBottom: 12 }}>
              <b>¡Importante!</b> Al pedir todo junto se generará un pedido
              independiente por cada empresa. Antes de continuar, revisa que las
              direcciones de envío y facturación estén correctas para todas las
              empresas.
            </StockAlertBanner>
          )}
          {/* Botón para pagar todo junto, solo si hay más de una empresa */}
          {Object.keys(groupedCart).length > 1 && (
            <Button
              text="Pedir todo junto"
              variant="solid"
              backgroundColor={theme.colors.success}
              style={{ width: "100%", marginTop: "0px" }}
              onClick={() => {
                setIsCheckoutAll(true);
                setShowConfirmModal(true);
              }}
              disabled={!isAllAddressesSelected()}
            />
          )}
          <Button
            text="Seguir comprando"
            variant="outlined"
            style={{ width: "100%", marginTop: "12px", marginBottom: "12px" }}
            onClick={() => navigate("/")}
          />
          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              marginBottom: "12px",
            }}
          ></div>
          {/* Resumen por empresa */}
          {Object.entries(groupedCart).map(([company, data]) => {
            // Calcular total con IVA incluido para cada item
            const itemsWithIVA = data.items.map((item) => {
              const discount = item?.discount || 0;
              const discountedPrice = discount
                ? item.price * (1 - discount / 100)
                : item.price;
              const priceWithIVA = calculatePriceWithIVA(
                discountedPrice,
                item.iva || TAXES.IVA_PERCENTAGE
              );
              return {
                ...item,
                priceWithIVA,
                totalWithIVA: priceWithIVA * item.quantity,
              };
            });

            // Subtotal con IVA incluido
            const subtotalWithIVA = itemsWithIVA.reduce(
              (acc, item) => acc + item.totalWithIVA,
              0
            );

            // Aplicar descuento de empresa (userDiscount)
            const userDiscount = user?.DESCUENTOS?.[company] || 0;
            const discountAmount = subtotalWithIVA * (userDiscount / 100);
            const totalConIva = subtotalWithIVA - discountAmount;

            return (
              <CompanySummary key={company}>
                <CompanyName>{company}</CompanyName>
                <SummaryRow>
                  <SummaryLabel>
                    Subtotal ({data.items.length} productos)
                  </SummaryLabel>
                  <SummaryValue>${subtotalWithIVA.toFixed(2)}</SummaryValue>
                </SummaryRow>
                {userDiscount > 0 && (
                  <SummaryRow>
                    <SummaryLabel>Descuento empresa:</SummaryLabel>
                    <SummaryValue>-${discountAmount.toFixed(2)}</SummaryValue>
                  </SummaryRow>
                )}
                <SummaryRow>
                  <SummaryLabel
                    style={{ fontSize: "0.8rem", fontStyle: "italic" }}
                  >
                    * Precios con IVA incluido
                  </SummaryLabel>
                </SummaryRow>
                <TotalRow>
                  <SummaryLabel>Total</SummaryLabel>
                  <SummaryValue $bold>${totalConIva.toFixed(2)}</SummaryValue>
                </TotalRow>

                {/* Validación de direcciones por empresa */}
                {!data.shippingAddressId && (
                  <ValidationWarning>
                    Falta dirección de envío
                  </ValidationWarning>
                )}
                {!data.billingAddressId && (
                  <ValidationWarning>
                    Falta dirección de facturación
                  </ValidationWarning>
                )}

                {/* Botón para pagar solo esta empresa */}
                <CompanyCheckoutButton
                  text={`Proceder al pedido`}
                  color={theme.colors.white}
                  variant="outlined"
                  size="small"
                  leftIconName={"FaShoppingCart"}
                  backgroundColor={theme.colors.primary}
                  style={{ width: "100%" }}
                  onClick={() => handleCompanyCheckoutClick(company)}
                  disabled={!data.shippingAddressId || !data.billingAddressId}
                />
              </CompanySummary>
            );
          })}
          {/* Modal de confirmación */}
          {showConfirmModal && (
            <ProcessingOverlay>
              <ProcessingCard>
                <ProcessingTitle>
                  ¿Está seguro que desea confirmar
                  {isCheckoutAll ? "todas las órdenes" : "esta orden"}?
                </ProcessingTitle>
                <ProcessingMessage>
                  {isCheckoutAll ? (
                    "Se generarán pedidos independientes para cada empresa en tu carrito."
                  ) : (
                    <>
                      Se generará el pedido para la empresa{" "}
                      <b>{companyToCheckout}</b>.
                    </>
                  )}
                </ProcessingMessage>
                <Button
                  text="Confirmar"
                  variant="solid"
                  backgroundColor={theme.colors.success}
                  style={{ width: "100%", marginBottom: "12px" }}
                  onClick={async () => {
                    setShowConfirmModal(false);
                    if (isCheckoutAll) {
                      setIsCheckoutAll(false);
                      await handleCheckoutAll();
                    } else if (companyToCheckout) {
                      await handleCheckoutSingleCompany(companyToCheckout);
                      setCompanyToCheckout(null);
                    }
                  }}
                  leftIconName="FaCheck"
                />
                <Button
                  text="Cancelar"
                  variant="outlined"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setShowConfirmModal(false);
                    setIsCheckoutAll(false);
                    setCompanyToCheckout(null);
                  }}
                  leftIconName="FaTimes"
                />
              </ProcessingCard>
            </ProcessingOverlay>
          )}
        </OrderSummary>
      </CartLayout>

      {/* Agregar estos componentes al final del return para mostrar el progreso y éxito */}
      {isProcessingOrders && (
        <>
          <ProcessingOverlay />
          <ProcessingCard>
            <ProcessingTitle>Procesando pedido</ProcessingTitle>
            <ProcessingMessage>
              Generando orden para empresa:{" "}
              <strong>{currentProcessingCompany}</strong>
            </ProcessingMessage>
            <ProgressIndicator>
              <RenderIcon
                name="FaSpinner"
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <div>
                {completedOrders} de {totalOrdersToProcess} empresas procesadas
              </div>
            </ProgressIndicator>
          </ProcessingCard>
        </>
      )}

      {showSuccessCard && (
        <>
          <ProcessingOverlay />
          <ProcessingCard>
            <SuccessIcon>
              <RenderIcon
                name="FaCheckCircle"
                size={48}
                color={theme.colors.success}
              />
            </SuccessIcon>
            <ProcessingTitle>¡Pedido realizado con éxito!</ProcessingTitle>
            <ProcessingMessage>
              {completedOrders > 1
                ? `Se han generado ${completedOrders} órdenes correctamente.`
                : "Tu pedido ha sido generado correctamente."}
            </ProcessingMessage>
            <Button
              text="Ver mis pedidos"
              variant="solid"
              backgroundColor={theme.colors.primary}
              style={{ width: "100%", marginBottom: "12px" }}
              onClick={handleGoToOrders}
              leftIconName="FaListAlt"
            />
            <Button
              text="Seguir comprando"
              variant="outlined"
              style={{ width: "100%" }}
              onClick={handleContinueShopping}
              leftIconName="FaShoppingCart"
            />
          </ProcessingCard>
        </>
      )}
    </PageContainer>
  );
};

export default Carrito;
