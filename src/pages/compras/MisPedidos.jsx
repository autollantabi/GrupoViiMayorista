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


const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 14px;
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
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ theme, status }) => {
    switch (status) {
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
`;

const NoOrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;

// Componente para modo lista móvil
const MobileOrderCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadow};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 10px;
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
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
`;

const MobileOrderStatus = styled.div`
  flex-shrink: 0;
`;

const MobileOrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const MobileOrderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const MobileOrderLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const MobileOrderValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const MobileOrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const NoOrdersIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const NoOrdersText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
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
    };
    return statusMap[status] || status;
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
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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
      render: (row) => row.id.substring(0, 8) + "...",
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
    {
      header: "Pago",
      field: "paymentMethod",
      sortable: false,
    },
  ];

  // Función para renderizar acciones por fila
  const rowActions = (row) => (
    <Button
      text="Ver detalle"
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
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "PENDIENTE CARTERA", label: "Revisión" },
    { value: "CONFIRMADO", label: "Confirmado" },
    { value: "ENTREGADO", label: "Entregado" },
    { value: "CANCELADO", label: "Cancelado" },
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
      <div style={{ padding: '0 4px' }}>
        {filteredOrders.map((order) => (
          <MobileOrderCard key={order.id} onClick={() => handleViewDetails(order)}>
            <MobileOrderHeader>
              <MobileOrderId>
                #{order.id.substring(0, 8)}...
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
                      return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
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
        padding: window.innerWidth <= 768 ? "16px" : 
                window.innerWidth <= 480 ? "12px" : "24px"
      }}
    >
      <PageTitle>Mis Pedidos</PageTitle>

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
          <NoOrdersIcon>⏳</NoOrdersIcon>
          <NoOrdersText>Cargando pedidos...</NoOrdersText>
        </NoOrdersContainer>
      ) : error ? (
        <NoOrdersContainer>
          <NoOrdersIcon>⚠️</NoOrdersIcon>
          <NoOrdersText>{error}</NoOrdersText>
          <Button
            text="Intentar nuevamente"
            variant="outlined"
            onClick={handleObtainOrders}
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
          <NoOrdersIcon>📦</NoOrdersIcon>
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
            />
          ) : (
            <Button
              text="Ir al catálogo"
              variant="solid"
              backgroundColor={theme.colors.primary}
              onClick={() => navigate("/")}
            />
          )}
        </NoOrdersContainer>
      )}
    </PageContainer>
  );
};

export default MisPedidos;
