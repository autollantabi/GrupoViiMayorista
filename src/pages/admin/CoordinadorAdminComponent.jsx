import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAppTheme } from "../../context/AppThemeContext";
import { useAuth } from "../../context/AuthContext";
import RenderIcon from "../../components/ui/RenderIcon";
import DataTable from "../../components/ui/Table";
import {
  api_users_create,
  api_users_getAll,
  api_users_updatePassword,
  api_users_update,
  api_users_updateStatus,
} from "../../api/users/apiUsers";
import { api_roles_getAll } from "../../api/users/apiRoles";
import RenderLoader from "../../components/ui/RenderLoader";
import { ROLES } from "../../constants/roles";
import PageContainer from "../../components/layout/PageContainer";
import { useNavigate } from "react-router-dom";


const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 1;
  max-width: 500px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  padding-left: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled(Button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + "22"};
  }

  &.delete {
    color: ${({ theme }) => theme.colors.error};

    &:hover {
      background-color: ${({ theme }) => theme.colors.error + "22"};
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

// Definir las empresas disponibles
const EMPRESAS_DISPONIBLES = [
  "AUTOLLANTA",
  "MAXXIMUNDO",
  "STOX",
  "IKONIX",
  "AUTOMAX",
];

// Componente mejorado para la selección de empresas con checkboxes
const EmpresasSelector = ({ selectedEmpresas, onChange }) => {
  const { theme } = useAppTheme();

  const handleCheckboxChange = (empresa) => {
    if (selectedEmpresas.includes(empresa)) {
      onChange(selectedEmpresas.filter((e) => e !== empresa));
    } else {
      onChange([...selectedEmpresas, empresa]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmpresas.length === EMPRESAS_DISPONIBLES.length) {
      onChange([]);
    } else {
      onChange([...EMPRESAS_DISPONIBLES]);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <label
          style={{
            fontWeight: "500",
            fontSize: "1rem",
            color: theme.colors.text,
          }}
        >
          Empresas asignadas
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: theme.colors.textLight,
            }}
          >
            {selectedEmpresas.length} de {EMPRESAS_DISPONIBLES.length}{" "}
            seleccionadas
          </span>
          <Button
            text={
              selectedEmpresas.length === EMPRESAS_DISPONIBLES.length
                ? "Deseleccionar todas"
                : "Seleccionar todas"
            }
            size="small"
            variant="outlined"
            onClick={handleSelectAll}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
          padding: "16px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: "8px",
          backgroundColor: theme.colors.surface,
        }}
      >
        {EMPRESAS_DISPONIBLES.map((empresa) => (
          <div
            key={empresa}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: selectedEmpresas.includes(empresa)
                ? `${theme.colors.primary}15`
                : "transparent",
              transition: "all 0.2s ease",
              cursor: "pointer",
              border: selectedEmpresas.includes(empresa)
                ? `1px solid ${theme.colors.primary}40`
                : `1px solid transparent`,
            }}
            onClick={() => handleCheckboxChange(empresa)}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                border: `2px solid ${
                  selectedEmpresas.includes(empresa)
                    ? theme.colors.primary
                    : theme.colors.border
                }`,
                backgroundColor: selectedEmpresas.includes(empresa)
                  ? theme.colors.primary
                  : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
                transition: "all 0.2s ease",
              }}
            >
              {selectedEmpresas.includes(empresa) && (
                <RenderIcon name="FaCheck" size={14} color="#ffffff" />
              )}
            </div>
            <span
              style={{
                fontWeight: selectedEmpresas.includes(empresa)
                  ? "500"
                  : "normal",
                userSelect: "none",
                color: selectedEmpresas.includes(empresa)
                  ? theme.colors.text
                  : theme.colors.textLight,
              }}
            >
              {empresa}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CoordinadorAdminComponent = () => {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [coordinadores, setCoordinadores] = useState(null);
  const [filteredCoordinadores, setFilteredCoordinadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolCoordinador, setRolCoordinador] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCoordinador, setCurrentCoordinador] = useState(null);

  // Estado para formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    empresas: [],
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar roles primero para obtener el ID del rol coordinador
        const rolesResponse = await api_roles_getAll();
        if (rolesResponse.success) {
          setRoles(rolesResponse.data);

          // Encontrar el ID del rol coordinador
          const coordinadorRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.COORDINADOR
          );

          if (coordinadorRole) {
            setRolCoordinador(coordinadorRole.ID_ROLE);

            // Ahora cargar solo los usuarios con rol de coordinador
            const usersResponse = await api_users_getAll();
            if (usersResponse.success) {
              const coordinadoresList = usersResponse.data.filter(
                (user) => user.ROLE_USER === coordinadorRole.ID_ROLE
              );

              setCoordinadores(coordinadoresList);
              setFilteredCoordinadores(coordinadoresList);
            } else {
              toast.error(
                usersResponse.message || "Error al cargar coordinadores"
              );
            }
          } else {
            toast.error("No se encontró el rol de coordinador en el sistema");
          }
        } else {
          toast.error(rolesResponse.message || "Error al cargar roles");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Ocurrió un error al cargar los datos");
      }
    };

    fetchData();
  }, []);

  // Filtrar coordinadores
  useEffect(() => {
    if (!coordinadores) return;

    let result = coordinadores;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(
        (coord) =>
          coord.NAME_USER.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coord.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoordinadores(result);
  }, [coordinadores, searchTerm]);

  // Manejadores de modales
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      empresas: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (coordinador) => {
    setCurrentCoordinador(coordinador);

    // Asegurarse de que EMPRESAS sea un array
    let empresasArray = [];
    if (coordinador.EMPRESAS) {
      // Si es un string, convertirlo a array
      if (typeof coordinador.EMPRESAS === "string") {
        empresasArray = coordinador.EMPRESAS.split(",").map((e) => e.trim());
      } else if (Array.isArray(coordinador.EMPRESAS)) {
        empresasArray = [...coordinador.EMPRESAS];
      }
    }
    setFormData({
      name: coordinador.NAME_USER,
      email: coordinador.EMAIL,
      password: "",
      confirmPassword: "",
      empresas: empresasArray,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (coordinador) => {
    setCurrentCoordinador(coordinador);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentCoordinador(null);
  };

  // Manejadores para formularios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejador específico para la selección de empresas
  const handleEmpresasChange = (selectedEmpresas) => {
    setFormData({
      ...formData,
      empresas: selectedEmpresas,
    });
  };

  // Funciones CRUD
  const handleCreateCoordinador = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      // Crear nuevo coordinador
      const newCoordinador = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: rolCoordinador,
        enterprises: formData.empresas.join(","),
      };

      const response = await api_users_create(newCoordinador);
      if (!response.success) {
        toast.error(response.message || "Error al crear coordinador");
        return;
      }

      // Recargar la lista de coordinadores
      const usersResponse = await api_users_getAll();
      if (usersResponse.success) {
        const coordinadoresList = usersResponse.data.filter(
          (user) => user.ROLE_USER === rolCoordinador
        );

        setCoordinadores(coordinadoresList);
        setFilteredCoordinadores(coordinadoresList);
      }

      toast.success("Coordinador creado correctamente");
      handleCloseModals();
    } catch (error) {
      console.error("Error al crear coordinador:", error);
      toast.error("Ocurrió un error al crear el coordinador");
    }
  };

  const handleUpdateCoordinador = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      let passwordUpdated = false;
      let userDataUpdated = false;

      // 1. Actualizar datos del usuario (nombre, email y empresas)
      // Verificar si hay cambios en los datos o empresas asignadas
      const currentEmpresas = currentCoordinador.EMPRESAS || [];
      let empresasArray = [];

      if (typeof currentEmpresas === "string") {
        empresasArray = currentEmpresas.split(",").map((e) => e.trim());
      } else if (Array.isArray(currentEmpresas)) {
        empresasArray = [...currentEmpresas];
      }

      // Comprobar si hay cambios en las empresas asignadas
      const empresasChanged =
        JSON.stringify(empresasArray.sort()) !==
        JSON.stringify([...formData.empresas].sort());

      // Comprobar si hay cambios en nombre o email
      const nameChanged = formData.name !== currentCoordinador.NAME_USER;
      const emailChanged = formData.email !== currentCoordinador.EMAIL;

      // Si hay cambios en los datos, actualizarlos
      if (nameChanged || emailChanged || empresasChanged) {
        const userData = {
          id: currentCoordinador.ID_USER,
          name: formData.name,
          email: formData.email,
          enterprises: formData.empresas.join(","),
        };

        // Llamar al servicio de actualización de datos
        const userResponse = await api_users_update(userData);

        if (!userResponse.success) {
          toast.error(
            userResponse.message || "Error al actualizar datos del coordinador"
          );
          return;
        }

        userDataUpdated = true;
      }

      // 2. Actualizar contraseña si se proporcionó una nueva
      if (formData.password) {
        const passwordResponse = await api_users_updatePassword(
          currentCoordinador.ID_USER,
          formData.password
        );

        if (!passwordResponse.success) {
          toast.error(
            passwordResponse.message || "Error al actualizar la contraseña"
          );
          return;
        }

        passwordUpdated = true;
      }

      // Verificar si se realizó alguna actualización
      if (!passwordUpdated && !userDataUpdated) {
        toast.info("No se realizaron cambios");
        handleCloseModals();
        return;
      }

      // Recargar lista de coordinadores para reflejar los cambios
      const usersResponse = await api_users_getAll();
      if (usersResponse.success) {
        const coordinadoresList = usersResponse.data.filter(
          (user) => user.ROLE_USER === rolCoordinador
        );

        setCoordinadores(coordinadoresList);
        setFilteredCoordinadores(coordinadoresList);
      }

      // Mostrar mensaje de éxito
      if (passwordUpdated && userDataUpdated) {
        toast.success("Datos y contraseña actualizados correctamente");
      } else if (passwordUpdated) {
        toast.success("Contraseña actualizada correctamente");
      } else {
        toast.success("Datos del coordinador actualizados correctamente");
      }

      handleCloseModals();
    } catch (error) {
      console.error("Error al actualizar coordinador:", error);
      toast.error("Ocurrió un error al actualizar el coordinador");
    }
  };

  const handleDeleteCoordinador = async () => {
    try {
      // Aquí iría la llamada a la API para eliminar el coordinador
      // Por ahora solo actualizamos la lista local
      const updatedCoordinadores = coordinadores.filter(
        (coord) => coord.ID_USER !== currentCoordinador.ID_USER
      );
      setCoordinadores(updatedCoordinadores);
      setFilteredCoordinadores(updatedCoordinadores);

      toast.success("Coordinador eliminado correctamente");
      handleCloseModals();
    } catch (error) {
      console.error("Error al eliminar coordinador:", error);
      toast.error("Ocurrió un error al eliminar el coordinador");
    }
  };

  // Función para cambiar el estado del coordinador (activo/inactivo)
  const handleToggleStatus = async (coordinador) => {
    try {
      const newStatus = !coordinador.STATUS_USER;

      // Llamar al servicio para actualizar el estado
      const response = await api_users_updateStatus(coordinador.ID_USER, newStatus);

      if (!response.success) {
        throw new Error(
          response.message || "Error al cambiar el estado del coordinador"
        );
      }

      // Actualizar el estado en la lista local
      const updatedCoordinadores = coordinadores.map((coord) => {
        if (coord.ID_USER === coordinador.ID_USER) {
          return { ...coord, STATUS_USER: newStatus };
        }
        return coord;
      });

      setCoordinadores(updatedCoordinadores);
      setFilteredCoordinadores(
        filteredCoordinadores.map((coord) => {
          if (coord.ID_USER === coordinador.ID_USER) {
            return { ...coord, STATUS_USER: newStatus };
          }
          return coord;
        })
      );

      // Mostrar notificación de éxito
      toast.success(
        `Coordinador ${newStatus ? "activado" : "desactivado"} correctamente`
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error(error.message || "Ocurrió un error al cambiar el estado");
    }
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      field: "NAME_USER",
      header: "Nombre",
      render: (row) => row.NAME_USER,
    },
    {
      field: "EMAIL",
      header: "Email",
    },
    {
      field: "EMPRESAS",
      header: "Empresas asignadas",
      width: "250px",
      render: (row) => {
        let empresas = [];

        if (row.EMPRESAS) {
          if (typeof row.EMPRESAS === "string") {
            empresas = row.EMPRESAS.split(",").map((e) => e.trim());
          } else if (Array.isArray(row.EMPRESAS)) {
            empresas = row.EMPRESAS;
          }
          // Ordenar alfabéticamente
          empresas.sort((a, b) => a.localeCompare(b));
        }

        return empresas.length > 0
          ? empresas.join(", ")
          : "Sin empresas asignadas";
      },
    },
    {
      field: "STATUS_USER",
      header: "Estado",
      render: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: row.STATUS_USER ? theme.colors.success : theme.colors.error,
          }}
        >
          <RenderIcon
            name={row.STATUS_USER ? "FaCheckCircle" : "FaMinusCircle"}
            size={18}
          />
        </div>
      ),
    },
  ];

  // Renderizar acciones por fila
  const renderRowActions = (coordinador) => (
    <ActionsGroup>
      <ActionButton
        title={
          coordinador.STATUS_USER
            ? "Desactivar coordinador"
            : "Activar coordinador"
        }
        onClick={() => handleToggleStatus(coordinador)}
        leftIconName={
          coordinador.STATUS_USER ? "FaToggleOn" : "FaToggleOff"
        }
      />

      <ActionButton
        title="Editar coordinador"
        onClick={() => handleOpenEditModal(coordinador)}
        leftIconName={"FaEdit"}
      />
      <ActionButton
        title="Eliminar coordinador"
        onClick={() => handleOpenDeleteModal(coordinador)}
        leftIconName={"FaTrash"}
      />
    </ActionsGroup>
  );

  return (
    <PageContainer
      backButtonText="Regresar"
      backButtonOnClick={() => navigate("/admin/dashboard")}
    >
      <PageTitle>Administración de Coordinadores</PageTitle>

      <ActionsContainer>
        <div style={{ display: "flex", gap: "16px" }}>
          <SearchContainer>
            <SearchIcon>
              <RenderIcon name={"FaSearch"} library={4} size={14} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar coordinadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </div>

        <Button
          text="Nuevo Coordinador"
          leftIconName={"FaUserPlus"}
          onClick={handleOpenCreateModal}
        />
      </ActionsContainer>

      {coordinadores === null ? (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <RenderLoader
            color={theme.colors.primary}
            showDots={true}
            showSpinner={false}
            text="Cargando coordinadores"
            size="20px"
            card={true}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCoordinadores}
          emptyMessage="No hay coordinadores que coincidan con los criterios de búsqueda."
          rowActions={renderRowActions}
          striped={true}
        />
      )}

      {/* Modal para crear coordinador */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Crear Nuevo Coordinador</ModalTitle>
              <RenderIcon name="FaTimes" size={20} onClick={handleCloseModals}/>
            </ModalHeader>

            <form onSubmit={handleCreateCoordinador}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Correo electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              {/* Aquí se podría agregar un selector de empresas */}
              <FormGroup>
                <EmpresasSelector
                  selectedEmpresas={formData.empresas}
                  onChange={handleEmpresasChange}
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  text="Cancelar"
                  variant="outlined"
                  onClick={handleCloseModals}
                />
                <Button
                  text="Crear Coordinador"
                  type="submit"
                  backgroundColor={theme.colors.primary}
                />
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para editar coordinador */}
      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Editar Coordinador</ModalTitle>
              <RenderIcon name="FaTimes" size={20} onClick={handleCloseModals}/>
            </ModalHeader>

            <form onSubmit={handleUpdateCoordinador}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    // disabled={true}
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Correo electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    // disabled={true}
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Input
                    label="Nueva contraseña (opcional)"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              {/* Aquí se podría agregar un selector de empresas */}
              <FormGroup>
                <EmpresasSelector
                  selectedEmpresas={formData.empresas}
                  onChange={handleEmpresasChange}
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  text="Cancelar"
                  variant="outlined"
                  onClick={handleCloseModals}
                />
                <Button
                  text="Guardar Cambios"
                  type="submit"
                  backgroundColor={theme.colors.primary}
                />
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para eliminar coordinador */}
      {isDeleteModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Eliminar Coordinador</ModalTitle>
              <RenderIcon name="FaTimes" size={20} onClick={handleCloseModals}  />
            </ModalHeader>

            <p>
              ¿Estás seguro de que deseas eliminar al coordinador{" "}
              <strong>{currentCoordinador?.NAME_USER}</strong>?
            </p>
            <p>Esta acción no se puede deshacer.</p>

            <ButtonGroup>
              <Button
                text="Cancelar"
                variant="outlined"
                onClick={handleCloseModals}
              />
              <Button
                text="Eliminar Coordinador"
                backgroundColor={theme.colors.error}
                onClick={handleDeleteCoordinador}
              />
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default CoordinadorAdminComponent;
