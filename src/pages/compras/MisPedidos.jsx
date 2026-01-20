import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/Table";
import { useAppTheme } from "../../context/AppThemeContext";
import { differenceInHours, format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { api_order_getOrdersByAccount } from "../../api/order/apiOrder";
import { useAuth } from "../../context/AuthContext";
import Select from "../../components/ui/Select";
import SearchBar from "../../components/ui/SearchBar";
import PageContainer from "../../components/layout/PageContainer";
import RenderIcon from "../../components/ui/RenderIcon";
import RenderLoader from "../../components/ui/RenderLoader";

const PageTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 2rem 0;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    gap: 0.75rem;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) =>
    theme.mode === "dark"
      ? `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`
      : `linear-gradient(135deg, ${theme.colors.text} 0%, ${theme.colors.primary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    gap: 0.875rem;
    margin-bottom: 1.25rem;
    padding: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 200px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case "PENDIENTE":
        return theme.mode === "dark"
          ? theme.colors.warning + "25"
          : theme.colors.warning + "15";
      case "PENDIENTE CARTERA":
        return theme.mode === "dark"
          ? theme.colors.info + "25"
          : theme.colors.info + "15";
      case "CONFIRMADO":
        return theme.mode === "dark"
          ? theme.colors.info + "25"
          : theme.colors.info + "15";
      case "ENTREGADO":
        return theme.mode === "dark"
          ? theme.colors.success + "25"
          : theme.colors.success + "15";
      case "CANCELADO":
        return theme.mode === "dark"
          ? theme.colors.error + "25"
          : theme.colors.error + "15";
      default:
        return theme.mode === "dark"
          ? `${theme.colors.border}40`
          : `${theme.colors.border}30`;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
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
  border: 1px solid
    ${({ theme, status }) => {
      switch (status) {
        case "PENDIENTE":
          return theme.colors.warning + "40";
        case "PENDIENTE CARTERA":
          return theme.colors.info + "40";
        case "CONFIRMADO":
          return theme.colors.info + "40";
        case "ENTREGADO":
          return theme.colors.success + "40";
        case "CANCELADO":
          return theme.colors.error + "40";
        default:
          return theme.mode === "dark"
            ? `${theme.colors.border}40`
            : `${theme.colors.border}30`;
      }
    }};
`;

const NoOrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    border-radius: 16px;
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 2.5rem 1.25rem;
    border-radius: 12px;
    gap: 1rem;
  }
`;

// Componente para modo lista móvil
const MobileOrderCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)"
      : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 8px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)"};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    margin-bottom: 0.875rem;
    border-radius: 12px;
  }
`;

const MobileOrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`;

const MobileOrderId = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MobileOrderStatus = styled.div`
  flex-shrink: 0;
`;

const MobileOrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const MobileOrderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  padding: 0.5rem 0;
`;

const MobileOrderLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  font-size: 0.9rem;
`;

const MobileOrderValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 0.95rem;
`;

const MobileOrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) =>
    theme.mode === "dark" ? `${theme.colors.border}30` : `${theme.colors.border}20`};
`;

const NoOrdersIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
`;

const NoOrdersText = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  line-height: 1.6;
`;

const MisPedidos = () => {
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para los pedidos
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  // Traducir estado a español para mostrar
  const translateStatus = (status) => {
    const statusMap = {
      PENDIENTE: "Pendiente",
      "PENDIENTE CARTERA": "Revisión",
      CONFIRMADO: "Confirmado",
      ENTREGADO: "Entregado",
      CANCELADO: "Cancelado",
      RECIBIDO: "Recibido",
    };
    return statusMap[status] || status;
  };

  // Formatear línea de negocio a formato oración
  const formatBusinessLine = (businessLine) => {
    if (!businessLine || businessLine === "N/A") return businessLine;

    // Caso especial: LLANTAS MOTO se muestra como "Moto"
    const businessLineUpper = businessLine.toUpperCase().trim();
    if (businessLineUpper === "LLANTAS MOTO") {
      return "Moto";
    }

    // Convertir a formato oración: primera letra mayúscula, resto minúsculas
    return businessLine
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Función para obtener los pedidos del usuario
  const handleObtainOrders = async () => {
    try {
      setLoading(true);
      const response = await api_order_getOrdersByAccount(user.ACCOUNT_USER);
      if (response.success && response.data) {
        // Transformar los datos de la API al formato que espera nuestro componente
        const formattedOrders = response.data.map((order) => {
          // Calcular el total si está vacío
          const total = order.CABECERA.TOTAL || order.CABECERA.SUBTOTAL;
          const subtotal = order.CABECERA.SUBTOTAL;
          
          // Calcular el IVA
          const ivaPercentage = order.CABECERA.IVA_DETAIL?.IVA_PERCENTAGE || 19; // Por defecto 19%
          const ivaAmount = total - subtotal; // El IVA es la diferencia entre total y subtotal

          // Calcular la cantidad total de items
          const itemsCount = order.DETALLE.reduce(
            (sum, item) => sum + item.QUANTITY,
            0
          );
          return {
            id: order.CABECERA.ID_CART_HEADER,
            date: order.CABECERA.createdAt,
            total: total,
            subtotal: subtotal,
            iva: ivaAmount,
            ivaPercentage: ivaPercentage,
            items: itemsCount,
            status: order.CABECERA.STATUS, // Usar directamente el valor de la API
            paymentMethod: "Pendiente", // Este dato no viene en la API
            empresaId: order.CABECERA.ENTERPRISE,
            businessLine: order.CABECERA.BUSINESS_LINE || "N/A", // Línea de negocio
            // Guardamos la información original para mostrarla en detalles
            originalData: order,
          };
        });

        setOrders(formattedOrders);
        setError(null);
      } else {
        setError("No se pudieron cargar los pedidos");
      }
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
      setError("Error al obtener los pedidos");
    } finally {
      setLoading(false);
    }
  };
  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.ACCOUNT_USER) return;

      try {
        setLoading(true);
        const response = await api_order_getOrdersByAccount(user.ACCOUNT_USER);

        if (response.success && response.data) {
          // Transformar los datos de la API al formato que espera nuestro componente
          const formattedOrders = response.data.map((order) => {
            // Calcular el total si está vacío
            const total = order.CABECERA.TOTAL;
            const subtotal = order.CABECERA.SUBTOTAL;
            
            // Calcular el IVA
            const ivaPercentage =
              order.CABECERA.IVA_DETAIL?.IVA_PERCENTAGE || 19; // Por defecto 19%
            const ivaAmount = total - subtotal; // El IVA es la diferencia entre total y subtotal

            // Calcular la cantidad total de items
            const itemsCount = order.DETALLE.reduce(
              (sum, item) => sum + item.QUANTITY,
              0
            );

            return {
              id: order.CABECERA.ID_CART_HEADER,
              date: order.CABECERA.createdAt,
              total: total,
              subtotal: subtotal,
              iva: ivaAmount,
              ivaPercentage: ivaPercentage,
              items: itemsCount,
              status: order.CABECERA.STATUS, // Usar directamente el valor de la API
              paymentMethod: "Pendiente", // Este dato no viene en la API
              empresaId: order.CABECERA.ENTERPRISE,
              businessLine: order.CABECERA.BUSINESS_LINE || "N/A", // Línea de negocio
              // Guardamos la información original para mostrarla en detalles
              originalData: order,
            };
          });

          setOrders(formattedOrders);
          setError(null);
        } else {
          setError("No se pudieron cargar los pedidos");
        }
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        setError("Error al obtener los pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Aplicar filtros a los pedidos
  const filteredOrders = orders.filter((order) => {
    // 1. Filtro de estado
    if (statusFilter !== "todos" && order.status !== statusFilter) {
      return false;
    }

    // 2. Filtro de fecha
    if (dateFilter !== "todos") {
      const orderDate = new Date(order.date);
      const today = new Date();

      if (dateFilter === "ultimos-30") {
        // Últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (orderDate < thirtyDaysAgo) {
          return false;
        }
      } else if (dateFilter === "ultimos-90") {
        // Últimos 90 días
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        if (orderDate < ninetyDaysAgo) {
          return false;
        }
      } else if (dateFilter === "este-anio") {
        // Este año
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        if (orderDate < firstDayOfYear) {
          return false;
        }
      } else if (dateFilter === "anio-anterior") {
        // Año anterior
        const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const firstDayThisYear = new Date(today.getFullYear(), 0, 1);
        if (orderDate < firstDayLastYear || orderDate >= firstDayThisYear) {
          return false;
        }
      }
    }

    // 3. Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      // Buscar en ID y empresaId
      const matchesId = order.id.toLowerCase().includes(term);
      const matchesEmpresa = order.empresaId.toLowerCase().includes(term);

      if (!matchesId && !matchesEmpresa) {
        return false;
      }
    }

    // Si pasó todos los filtros, mostrar el pedido
    return true;
  });

  // Definición de columnas para el DataTable
  const columns = [
    {
      header: "Nº de Pedido",
      field: "id",
      render: (row) => {
        const idString = String(row.id || "");
        return idString.length > 8
          ? idString.substring(0, 8) + "..."
          : idString;
      },
    },
    {
      header: "Fecha",
      field: "date",
      dataType: "date",
      render: (row) => {
        const date = new Date(row.date);
        const now = new Date();
        const hoursAgo = differenceInHours(now, date);

        if (hoursAgo >= 1) {
          // Si pasó más de una hora, mostrar fecha y hora completas
          return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
        } else {
          // Si pasó menos de una hora, mostrar tiempo relativo
          return formatDistance(date, now, {
            addSuffix: true, // Añade "hace" al principio
            locale: es,
          });
        }
      },
      sortValue: (row) => new Date(row.date).getTime(),
    },
    {
      header: "Proveedor",
      field: "empresaId",
    },
    {
      header: "Línea de negocio",
      field: "businessLine",
      render: (row) => formatBusinessLine(row.businessLine),
    },
    // {
    //   header: "Subtotal",
    //   field: "subtotal",
    //   dataType: "number",
    //   render: (row) => `$${row.subtotal.toFixed(2)}`,
    //   align: "right",
    // },
    // {
    //   header: "IVA",
    //   field: "iva",
    //   dataType: "number",
    //   render: (row) => {
    //     const ivaAmount = row.iva || 0;
    //     return `$${ivaAmount.toFixed(2)}`;
    //   },
    //   align: "right",
    // },
    {
      header: "Total (con IVA)",
      field: "total",
      dataType: "number",
      render: (row) => `$${row.total.toFixed(2)}`,
      align: "right",
    },
    {
      header: "Productos",
      field: "items",
      dataType: "number",
      render: (row) => `${row.items} items`,
      align: "center",
    },
    {
      header: "Estado",
      field: "status",
      render: (row) => (
        <StatusBadge status={row.status}>
          {translateStatus(row.status)}
        </StatusBadge>
      ),
      align: "center",
    },
  ];

  // Función para renderizar acciones por fila
  const rowActions = (row) => (
    <Button
      text="Detalles"
      variant="outlined"
      size="small"
      onClick={() => navigate(`/mis-pedidos/${row.id}`)}
    />
  );

  const handleViewDetails = (row) => {
    navigate(`/mis-pedidos/${row.id}`);
  };
  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "CANCELADO", label: "Cancelado" },
    { value: "RECIBIDO", label: "Recibido" },
  ];

  const dateOptions = [
    { value: "todos", label: "Todos los períodos" },
    { value: "ultimos-30", label: "Últimos 30 días" },
    { value: "ultimos-90", label: "Últimos 90 días" },
    { value: "este-anio", label: "Este año" },
    { value: "anio-anterior", label: "Año anterior" },
  ];

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handler para cambio en select de fecha
  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Función para renderizar el modo lista móvil
  const renderMobileOrderList = () => {
    return (
      <div style={{ padding: "0 4px" }}>
        {filteredOrders.map((order) => (
          <MobileOrderCard
            key={order.id}
            onClick={() => handleViewDetails(order)}
          >
            <MobileOrderHeader>
              <MobileOrderId>
                <RenderIcon name="FaHashtag" size={16} />
                {(() => {
                  const idString = String(order.id || "");
                  return idString.length > 8
                    ? idString.substring(0, 8) + "..."
                    : idString;
                })()}
              </MobileOrderId>
              <MobileOrderStatus>
                <StatusBadge status={order.status}>
                  {translateStatus(order.status)}
                </StatusBadge>
              </MobileOrderStatus>
            </MobileOrderHeader>
            
            <MobileOrderInfo>
              <MobileOrderRow>
                <MobileOrderLabel>Fecha:</MobileOrderLabel>
                <MobileOrderValue>
                  {(() => {
                    const date = new Date(order.date);
                    const now = new Date();
                    const hoursAgo = differenceInHours(now, date);

                    if (hoursAgo >= 1) {
                      return format(date, "d 'de' MMMM, yyyy HH:mm", {
                        locale: es,
                      });
                    } else {
                      return formatDistance(date, now, {
                        addSuffix: true,
                        locale: es,
                      });
                    }
                  })()}
                </MobileOrderValue>
              </MobileOrderRow>
              
              <MobileOrderRow>
                <MobileOrderLabel>Proveedor:</MobileOrderLabel>
                <MobileOrderValue>{order.empresaId}</MobileOrderValue>
              </MobileOrderRow>
              
              <MobileOrderRow>
                <MobileOrderLabel>Total:</MobileOrderLabel>
                <MobileOrderValue>${order.total.toFixed(2)}</MobileOrderValue>
              </MobileOrderRow>
              
              <MobileOrderRow>
                <MobileOrderLabel>Productos:</MobileOrderLabel>
                <MobileOrderValue>{order.items} items</MobileOrderValue>
              </MobileOrderRow>
            </MobileOrderInfo>
            
            <MobileOrderActions>
              <Button
                text="Ver detalle"
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(order);
                }}
              />
            </MobileOrderActions>
          </MobileOrderCard>
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      style={{
        padding:
          window.innerWidth <= 768
            ? "16px"
            : window.innerWidth <= 480
            ? "12px"
            : "24px",
      }}
    >
      <PageTitleContainer>
        <RenderIcon name="FaBagShopping" size={32} />
        <PageTitle>Mis Pedidos</PageTitle>
      </PageTitleContainer>

      <FiltersContainer>
        <FilterGroup>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="Seleccionar estado"
            width="180px"
            name="statusFilter"
            label={"Estado"}
          />

          <Select
            options={dateOptions}
            value={dateFilter}
            onChange={handleDateChange}
            placeholder="Seleccionar período"
            width="180px"
            name="dateFilter"
            label={"Período"}
          />
        </FilterGroup>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por número o empresa"
          debounceTime={300}
          width="auto"
        />
      </FiltersContainer>

      {loading ? (
        <NoOrdersContainer>
          <NoOrdersIcon>
            <RenderLoader size="64px" showSpinner={true} floatingSpinner={true} />
          </NoOrdersIcon>
          <NoOrdersText>Cargando pedidos...</NoOrdersText>
        </NoOrdersContainer>
      ) : error ? (
        <NoOrdersContainer>
          <NoOrdersIcon>
            <RenderIcon name="FaTriangleExclamation" size={64} color={theme.colors.error} />
          </NoOrdersIcon>
          <NoOrdersText>{error}</NoOrdersText>
          <Button
            text="Intentar nuevamente"
            variant="outlined"
            onClick={handleObtainOrders}
            leftIconName="FaRotateRight"
          />
        </NoOrdersContainer>
      ) : filteredOrders.length > 0 ? (
        <>
          {/* Mostrar tabla en desktop, lista en móvil */}
          {isMobile ? (
            renderMobileOrderList()
          ) : (
            <DataTable
              columns={columns}
              data={filteredOrders}
              emptyMessage="No se encontraron pedidos con los filtros seleccionados"
              itemsPerPage={7}
              rowActions={rowActions}
              bordered={false}
              striped={true}
              onRowClick={handleViewDetails}
              initialSortField="date"
              initialSortDirection="desc"
            />
          )}
        </>
      ) : (
        <NoOrdersContainer>
          <NoOrdersIcon>
            <RenderIcon name="FaBoxOpen" size={64} color={theme.colors.textSecondary} />
          </NoOrdersIcon>
          <NoOrdersText>
            {searchTerm || statusFilter !== "todos" || dateFilter !== "todos"
              ? "No se encontraron pedidos con los filtros seleccionados"
              : "No tienes pedidos registrados aún"}
          </NoOrdersText>
          {statusFilter !== "todos" || dateFilter !== "todos" || searchTerm ? (
            <Button
              text="Limpiar filtros"
              variant="outlined"
              onClick={() => {
                setStatusFilter("todos");
                setDateFilter("todos");
                setSearchTerm("");
              }}
              leftIconName="FaFilterCircleXmark"
            />
          ) : (
            <Button
              text="Ir al catálogo"
              variant="solid"
              backgroundColor={theme.colors.primary}
              onClick={() => navigate("/")}
              leftIconName="FaStore"
            />
          )}
        </NoOrdersContainer>
      )}
    </PageContainer>
  );
};

export default MisPedidos;
