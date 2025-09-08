import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";

import styled from "styled-components";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import { api_users_getAll } from "../../api/users/apiUsers";
import { api_roles_getAll } from "../../api/users/apiRoles";

import RenderLoader from "../../components/ui/RenderLoader";
import Button from "../../components/ui/Button";
import RenderIcon from "../../components/ui/RenderIcon";
import { toast } from "react-toastify";
import PageContainer from "../../components/layout/PageContainer";


const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${({ theme, color }) =>
    color ? `${color}22` : theme.colors.primary + "22"};
  color: ${({ theme, color }) => color || theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const StatFooter = styled.div`
  font-size: 0.9rem;
  color: ${({ theme, $positive }) =>
    $positive
      ? theme.colors.success
      : $positive === false
      ? theme.colors.error
      : theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionCard = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + "15"};
    transform: translateX(5px);
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ theme, color }) =>
    color ? `${color}22` : theme.colors.primary + "22"};
  color: ${({ theme, color }) => color || theme.colors.primary};
  margin-right: 16px;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const ActionDescription = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const RecentActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme, color }) =>
    color ? `${color}22` : theme.colors.primary + "22"};
  color: ${({ theme, color }) => color || theme.colors.primary};
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  justify-content: space-between;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
`;

const AdminDashboardComponent = () => {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoordinadores: 0,
    totalClientes: 0,
    totalPedidos: 0,
    nuevasSolicitudes: 0,
    pedidosPendientes: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersResponse = await api_users_getAll();
        if (!usersResponse.success) {
          throw new Error(usersResponse.message || "Error al cargar usuarios");
        }

        // Obtener roles
        const rolesResponse = await api_roles_getAll();
        if (!rolesResponse.success) {
          throw new Error(rolesResponse.message || "Error al cargar roles");
        }

        // Identificar IDs de roles
        const roleIDs = {};
        rolesResponse.data.forEach((role) => {
          if (role.NAME_ROLE === ROLES.COORDINADOR) {
            roleIDs.coordinador = role.ID_ROLE;
          } else if (role.NAME_ROLE === ROLES.CLIENTE) {
            roleIDs.cliente = role.ID_ROLE;
          }
        });

        // Contar usuarios por rol
        const users = usersResponse.data;
        const coordinadores = users.filter(
          (user) => user.ROLE_USER === roleIDs.coordinador
        );
        const clientes = users.filter(
          (user) => user.ROLE_USER === roleIDs.cliente
        );

        // Actualizar estadísticas
        setStats({
          totalUsers: users.length,
          totalCoordinadores: coordinadores.length,
          totalClientes: clientes.length,
          totalPedidos: 128, // Datos simulados
          nuevasSolicitudes: 5, // Datos simulados
          pedidosPendientes: 12, // Datos simulados
        });

        // Actividad reciente simulada
        setRecentActivity([
          {
            type: "new_user",
            title: "Nuevo usuario registrado",
            user: "Carlos Mendoza",
            time: "10 min",
            icon: <RenderIcon name="FaUsers" size={16} />,
            color: theme.colors.primary,
          },
          {
            type: "new_order",
            title: "Nuevo pedido realizado",
            description: "Pedido #ORD-2025-1010",
            user: "María García",
            time: "35 min",
            icon: <RenderIcon name="FaShoppingCart" size={16} />,
            color: theme.colors.success,
          },
          {
            type: "alert",
            title: "Alerta de inventario bajo",
            description: "3 productos con stock crítico",
            time: "1 hora",
            icon: <RenderIcon name="FaExclamationTriangle" size={16} />,
            color: theme.colors.warning,
          },
          {
            type: "status_change",
            title: "Pedido marcado como completado",
            description: "Pedido #ORD-2025-1005",
            user: "Luis Coordinador",
            time: "2 horas",
            icon: <RenderIcon name="FaCheck" size={16} />,
            color: theme.colors.success,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        toast.error("Ocurrió un error al cargar los datos");
        setLoading(false);
      }
    };

    fetchData();
  }, [theme.colors]);

  // Navegar a otras secciones
  const navigateToSection = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageTitle>Dashboard Administrativo</PageTitle>
        <LoadingContainer>
          <RenderLoader
            color={theme.colors.primary}
            showDots={true}
            showSpinner={false}
            text="Cargando dashboard"
            size="20px"
            card={true}
          />
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Dashboard Administrativo</PageTitle>

      {/* Tarjetas de estadísticas */}
      <StatisticsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Usuarios totales</StatTitle>
            <StatIcon color={theme.colors.primary}>
              <RenderIcon name="FaUsers" size={16} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatFooter $positive={true}>
            <RenderIcon name="FaChartLine" size={16} /> 8% más que el mes pasado
          </StatFooter>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Coordinadores</StatTitle>
            <StatIcon color={theme.colors.info}>
              <RenderIcon name="FaUserTie" size={16} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalCoordinadores}</StatValue>
          <StatFooter>Activos en el sistema</StatFooter>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Clientes</StatTitle>
            <StatIcon color={theme.colors.success}>
              <RenderIcon name="FaUsers" size={16} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalClientes}</StatValue>
          <StatFooter $positive={true}>
            <RenderIcon name="FaChartLine" size={16} /> 12% más que el mes
            pasado
          </StatFooter>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Pedidos totales</StatTitle>
            <StatIcon color={theme.colors.warning}>
              <RenderIcon name="FaShoppingCart" size={16} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalPedidos}</StatValue>
          <StatFooter>
            {stats.pedidosPendientes} pendientes de procesar
          </StatFooter>
        </StatCard>
      </StatisticsGrid>

      {/* Secciones principales y actividad reciente */}
      <SectionsGrid>
        <SectionCard>
          <SectionTitle>
            <RenderIcon
              name="FaUsers"
              library={4}
              size={16}
              color={({ theme }) => theme.colors.primary}
            />{" "}
            Administración
          </SectionTitle>

          <ActionList>
            <ActionCard
              onClick={() => navigateToSection(ROUTES.ADMIN.USER_ADMIN)}
            >
              <ActionIcon color={theme.colors.primary}>
                <RenderIcon name="FaUsers" size={16} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Administrar Usuarios</ActionTitle>
                <ActionDescription>
                  Gestionar usuarios y permisos
                </ActionDescription>
              </ActionContent>
            </ActionCard>

            <ActionCard
              onClick={() => navigateToSection(ROUTES.ADMIN.COORDINADOR_ADMIN)}
            >
              <ActionIcon color={theme.colors.info}>
                <RenderIcon name="FaUserTie" size={16} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Administrar Coordinadores</ActionTitle>
                <ActionDescription>
                  Gestionar coordinadores y sus empresas asignadas
                </ActionDescription>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon color={theme.colors.warning}>
                <RenderIcon name="FaBox" size={16} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Productos y Catálogos</ActionTitle>
                <ActionDescription>
                  Gestionar productos y catálogos por empresa
                </ActionDescription>
              </ActionContent>
            </ActionCard>

            <ActionCard>
              <ActionIcon color={theme.colors.success}>
                <RenderIcon name="FaShoppingCart" size={16} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Pedidos</ActionTitle>
                <ActionDescription>
                  Ver todos los pedidos del sistema
                </ActionDescription>
              </ActionContent>
            </ActionCard>
          </ActionList>
        </SectionCard>

        <SectionCard>
          <SectionTitle>
            <RenderIcon name="FaChartLine" size={16} /> Actividad Reciente
          </SectionTitle>

          <RecentActivityList>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon color={activity.color}>
                  {activity.icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  {activity.description && (
                    <div style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                      {activity.description}
                    </div>
                  )}
                  <ActivityMeta>
                    <div>{activity.user && `Por: ${activity.user}`}</div>
                    <div>Hace {activity.time}</div>
                  </ActivityMeta>
                </ActivityContent>
              </ActivityItem>
            ))}
          </RecentActivityList>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Button
              text="Ver todas las actividades"
              variant="outlined"
              size="small"
            />
          </div>
        </SectionCard>
      </SectionsGrid>
    </PageContainer>
  );
};

export default AdminDashboardComponent;
