import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/AppThemeContext";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/Table";
import RenderIcon from "../../components/ui/RenderIcon";
import Select from "../../components/ui/Select";
import SearchBar from "../../components/ui/SearchBar";
import { differenceInHours, format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";

import { toast } from "react-toastify";
import { api_order_getOrdersByEnterprises } from "../../api/order/apiOrder";
import PageContainer from "../../components/layout/PageContainer";


const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
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
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
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

const AddressAlert = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.warning + "20"};
  border-left: 3px solid ${({ theme }) => theme.colors.warning};
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AlertText = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NewAddressCount = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.warning};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  line-height: 20px;
  text-align: center;
  margin-left: 8px;
`;

const NoDataContainer = styled.div`
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

const NoDataIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const NoDataMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const AddressIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.warning};
  margin-left: 6px;
  cursor: help;
  position: relative;

  &:hover::after {
    content: "Revisar dirección";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

// Componente principal
const CoordinadorHomeComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useAppTheme();

  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [empresaFilter, setEmpresaFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("todos");
  const [newAddressesCount, setNewAddressesCount] = useState(0);

  // Empresas a las que tiene acceso la coordinadora
  const empresasAcceso = user?.EMPRESAS || [];

  // Mapa de nombres de empresas
  const empresasMap = {
    AUTOLLANTA: "Autollanta",
    MAXXIMUNDO: "Maxximundo",
    STOX: "Stox",
    IKONIX: "Ikonix",
    AUTOMAX: "Automax",
    maxximundo: "Maxximundo",
    stox: "Stox",
    autollanta: "Autollanta",
    ikonix: "Ikonix",
  };
  // Mapa de estados
  const estadosMap = {
    PENDIENTE: "Pendiente",
    "PENDIENTE CARTERA": "Revisión",
    CONFIRMADO: "Confirmado",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        if (!user?.EMPRESAS) {
          setError("No tienes empresas asignadas");
          return;
        }

        const ordersResponse = await api_order_getOrdersByEnterprises(
          user.EMPRESAS
        );
        if (ordersResponse.success && ordersResponse.data) {
          // Transformar los datos agrupados por empresa en una lista plana
          const allOrders = [];

          Object.keys(ordersResponse.data).forEach((empresa) => {
            const empresaOrders = ordersResponse.data[empresa];

            empresaOrders.forEach((order) => {
              // Calcular el total si está vacío
              const total = order.CABECERA.TOTAL;
              const subtotal = order.CABECERA.SUBTOTAL;

              // Calcular la cantidad total de items
              const itemsCount = order.DETALLE.reduce(
                (sum, item) => sum + item.QUANTITY,
                0
              );

              // Detectar si tiene direcciones nuevas (CLIENT origin)
              const hasNewAddress =
                order.CABECERA.SHIPPING_ADDRESS?.ORIGIN === "CLIENT" ||
                order.CABECERA.BILLING_ADDRESS?.ORIGIN === "CLIENT";

              const formattedOrder = {
                id: order.CABECERA.ID_CART_HEADER,
                date: order.CABECERA.createdAt || new Date(), // Usar createdAt si existe
                clientName: order.CABECERA.USER.NAME_USER,
                email: order.CABECERA.USER.EMAIL,
                phone: order.CABECERA.USER.PHONE || "No registrado",
                total: total,
                subtotal: subtotal,
                items: itemsCount,
                status: order.CABECERA.STATUS, // Usar directamente el valor de la API
                empresaId: order.CABECERA.ENTERPRISE.toLowerCase(),
                newAddress: hasNewAddress,
                // Guardamos la información original para referencias
                originalData: order,
              };

              allOrders.push(formattedOrder);
            });
          });

          // Calcular direcciones nuevas
          const newAddressesCount = allOrders.filter(
            (order) => order.newAddress
          ).length;
          setNewAddressesCount(newAddressesCount);

          setOrders(allOrders);
          setError(null);
        } else {
          setError("No se pudieron cargar los pedidos");
        }
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        setError("Error al obtener los pedidos");

        setNewAddressesCount([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.EMPRESAS) {
      loadOrders();
    }
  }, [user]); // Función para recargar pedidos

  const handleObtainOrders = async () => {
    try {
      setLoading(true);

      if (!user?.EMPRESAS) {
        setError("No tienes empresas asignadas");
        return;
      }

      const ordersResponse = await api_order_getOrdersByEnterprises(user.EMPRESAS);

      if (ordersResponse.success && ordersResponse.data) {
        // Transformar los datos agrupados por empresa en una lista plana
        const allOrders = [];

        Object.keys(ordersResponse.data).forEach((empresa) => {
          const empresaOrders = ordersResponse.data[empresa];

          empresaOrders.forEach((order) => {
            // Calcular el total si está vacío
            const total = order.CABECERA.TOTAL || order.CABECERA.SUBTOTAL;

            // Calcular la cantidad total de items
            const itemsCount = order.DETALLE.reduce(
              (sum, item) => sum + item.QUANTITY,
              0
            );

            // Detectar si tiene direcciones nuevas (CLIENT origin)
            const hasNewAddress =
              order.CABECERA.SHIPPING_ADDRESS?.ORIGIN === "CLIENT" ||
              order.CABECERA.BILLING_ADDRESS?.ORIGIN === "CLIENT";

            const formattedOrder = {
              id: order.CABECERA.ID_CART_HEADER,
              date: order.CABECERA.createdAt || new Date(), // Usar createdAt si existe
              clientName: order.CABECERA.USER.NAME_USER,
              email: order.CABECERA.USER.EMAIL,
              phone: order.CABECERA.USER.PHONE || "No registrado",
              total: total,
              items: itemsCount,
              status: order.CABECERA.STATUS, // Usar directamente el valor de la API
              empresaId: order.CABECERA.ENTERPRISE.toLowerCase(),
              newAddress: hasNewAddress,
              // Guardamos la información original para referencias
              originalData: order,
            };

            allOrders.push(formattedOrder);
          });
        });

        // Calcular direcciones nuevas
        const newAddressesCount = allOrders.filter(
          (order) => order.newAddress
        ).length;
        setNewAddressesCount(newAddressesCount);

        setOrders(allOrders);
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

  // Aplicar filtros a los pedidos
  const filteredOrders = orders.filter((order) => {
    // 1. Filtro de estado
    if (statusFilter !== "todos" && order.status !== statusFilter) {
      return false;
    }

    // 2. Filtro de empresa
    if (empresaFilter !== "todas" && order.empresaId !== empresaFilter) {
      return false;
    }

    // 3. Filtro de fecha
    if (dateFilter !== "todos") {
      const orderDate = new Date(order.date);
      const today = new Date();

      if (dateFilter === "ultimos-30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (orderDate < thirtyDaysAgo) {
          return false;
        }
      } else if (dateFilter === "ultimos-90") {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        if (orderDate < ninetyDaysAgo) {
          return false;
        }
      } else if (dateFilter === "este-anio") {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        if (orderDate < firstDayOfYear) {
          return false;
        }
      } else if (dateFilter === "anio-anterior") {
        const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const firstDayThisYear = new Date(today.getFullYear(), 0, 1);
        if (orderDate < firstDayLastYear || orderDate >= firstDayThisYear) {
          return false;
        }
      }
    }

    // 4. Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const matchesId = order.id.toLowerCase().includes(term);
      const matchesClient = order.clientName.toLowerCase().includes(term);
      const matchesEmail = order.email.toLowerCase().includes(term);
      const matchesEmpresa = order.empresaId.toLowerCase().includes(term);

      if (!matchesId && !matchesClient && !matchesEmail && !matchesEmpresa) {
        return false;
      }
    }

    return true;
  });

  // Definición de columnas para el DataTable
  const columns = [
    {
      header: "Nº de Pedido",
      field: "id",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {row.id.substring(0, 12) + "..."}
          {row.newAddress && (
            <AddressIndicator>
              <RenderIcon name="FaExclamationTriangle" size={12} />
            </AddressIndicator>
          )}
        </div>
      ),
    },
    {
      header: "Fecha",
      field: "date",
      dataType: "date",
      width: "180px",
      render: (row) => {
        const date = new Date(row.date);
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
      },
      sortValue: (row) => new Date(row.date).getTime(),
    },
    {
      header: "Cliente",
      field: "clientName",
      render: (row) => (
        <div>
          <div style={{ fontWeight: "500" }}>{row.clientName}</div>
          <div style={{ fontSize: "0.85rem", color: theme.colors.textLight }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      header: "Empresa",
      field: "empresaId",
      render: (row) => empresasMap[row.empresaId] || row.empresaId,
    },
    // {
    //   header: "Subtotal (con iva)",
    //   field: "subtotal",
    //   dataType: "number",
    //   render: (row) => `$${row.subtotal.toFixed(2)}`,
    //   align: "right",
    // },
    {
      header: "Total (IVA incluido)",
      field: "total",
      dataType: "number",
      render: (row) => `$${row.total.toFixed(2)}`,
      align: "right",
    },
    {
      header: "Items",
      field: "items",
      dataType: "number",
      render: (row) => `${row.items} items`,
      align: "center",
    },
    {
      header: "Estado",
      field: "status",
      render: (row) => (
        <StatusBadge $status={row.status}>
          {estadosMap[row.status] || row.status}
        </StatusBadge>
      ),
      align: "center",
    },
  ];
  // Función para renderizar acciones por fila
  const rowActions = (row) => (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button
        text="Ver detalle"
        variant="outlined"
        size="small"
        leftIconName="FaEye"
        onClick={() => navigate(`/coordinadora/pedidos/${row.id}`)}
      />
      {row.newAddress && (
        <Button
          text="Confirmar dirección"
          variant="solid"
          size="small"
          backgroundColor={theme.colors.warning}
          leftIconName="FaCheck"
          onClick={() => handleConfirmAddress(row.id)}
        />
      )}
    </div>
  );

  const handleViewDetails = (row) => {
    navigate(`/coordinadora/pedidos/${row.id}`);
  };

  // Manejar confirmar dirección nueva
  const handleConfirmAddress = (orderId) => {
    toast.success(`Dirección confirmada para el pedido ${orderId}`);

    // Actualizar el estado para quitar la marca de dirección nueva
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, newAddress: false } : order
      )
    );

    // Actualizar contador
    setNewAddressesCount((prev) => Math.max(0, prev - 1));
  };
  const statusOptions = [
    { value: "todos", label: "Todos los estados" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "PENDIENTE CARTERA", label: "Revisión" },
    { value: "CONFIRMADO", label: "Confirmado" },
    { value: "ENTREGADO", label: "Entregado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  const empresaOptions = [
    { value: "todas", label: "Todas las empresas" },
    ...empresasAcceso.map((empresa) => ({
      value: empresa.toLowerCase(),
      label: empresasMap[empresa] || empresa,
    })),
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

  const handleEmpresaChange = (e) => {
    setEmpresaFilter(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  return (
    <PageContainer>
      <PageTitle>Gestión de Pedidos - Coordinadora</PageTitle>

      {/* Alerta de direcciones nuevas */}
      {newAddressesCount > 0 && (
        <AddressAlert>
          <AlertText>
            <RenderIcon
              name="FaExclamationTriangle"
              size={16}
              style={{ marginRight: "8px" }}
            />
            Hay {newAddressesCount} pedido{newAddressesCount > 1 ? "s" : ""} con
            direcciones nuevas que requieren revisión
            <NewAddressCount>{newAddressesCount}</NewAddressCount>
          </AlertText>
          <AlertActions>
            <Button
              text="Ver pedidos"
              variant="outlined"
              size="small"
              onClick={() => setSearchTerm("")}
            />
          </AlertActions>
        </AddressAlert>
      )}

      <FiltersContainer>
        <FilterGroup>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="Seleccionar estado"
            width="200px"
            name="statusFilter"
            label="Estado"
          />

          <Select
            options={empresaOptions}
            value={empresaFilter}
            onChange={handleEmpresaChange}
            placeholder="Seleccionar empresa"
            width="200px"
            name="empresaFilter"
            label="Empresa"
          />

          <Select
            options={dateOptions}
            value={dateFilter}
            onChange={handleDateChange}
            placeholder="Seleccionar período"
            width="180px"
            name="dateFilter"
            label="Período"
          />
        </FilterGroup>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por cliente, pedido o email"
          debounceTime={300}
          width="auto"
        />
      </FiltersContainer>

      {loading ? (
        <NoDataContainer>
          <NoDataIcon>⏳</NoDataIcon>
          <NoDataMessage>Cargando pedidos...</NoDataMessage>
        </NoDataContainer>
      ) : error ? (
        <NoDataContainer>
          <NoDataIcon>⚠️</NoDataIcon>
          <NoDataMessage>{error}</NoDataMessage>
          <Button
            text="Intentar nuevamente"
            variant="outlined"
            onClick={handleObtainOrders}
          />
        </NoDataContainer>
      ) : filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyMessage="No se encontraron pedidos con los filtros seleccionados"
          itemsPerPage={10}
          rowActions={rowActions}
          bordered={false}
          striped={true}
          onRowClick={handleViewDetails}
          initialSortField="date"
          initialSortDirection="desc"
        />
      ) : (
        <NoDataContainer>
          <NoDataIcon>📦</NoDataIcon>
          <NoDataMessage>
            {searchTerm ||
            statusFilter !== "todos" ||
            empresaFilter !== "todas" ||
            dateFilter !== "todos"
              ? "No se encontraron pedidos con los filtros seleccionados"
              : "No hay pedidos registrados aún"}
          </NoDataMessage>
          {statusFilter !== "todos" ||
          empresaFilter !== "todas" ||
          dateFilter !== "todos" ||
          searchTerm ? (
            <Button
              text="Limpiar filtros"
              variant="outlined"
              onClick={() => {
                setStatusFilter("todos");
                setEmpresaFilter("todas");
                setDateFilter("todos");
                setSearchTerm("");
              }}
            />
          ) : null}
        </NoDataContainer>
      )}
    </PageContainer>
  );
};

export default CoordinadorHomeComponent;
