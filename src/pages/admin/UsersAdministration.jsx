import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaEdit, FaTrash } from "react-icons/fa";
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
  api_users_updateRole,
  api_users_updatePassword,
} from "../../api/users/apiUsers";
import { api_roles_getAll } from "../../api/users/apiRoles";
import RenderLoader from "../../components/ui/RenderLoader";
import { ROLES } from "../../constants/roles";
import PageContainer from "../../components/layout/PageContainer";
import { useNavigate } from "react-router-dom";

// Constantes
const EMPRESAS_DISPONIBLES = [
  "MAXXIMUNDO",
  "AUTOLLANTA",
  "IKONIX",
  "STOX",
  "AUTOMAX",
];

// Componente selector de empresas
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
            type="button"
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
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: "4px",
                marginRight: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selectedEmpresas.includes(empresa)
                  ? theme.colors.primary
                  : "transparent",
              }}
            >
              {selectedEmpresas.includes(empresa) && (
                <RenderIcon name="FaCheck" size={12} color="white" />
              )}
            </div>
            <span
              style={{
                fontSize: "0.9rem",
                color: theme.colors.text,
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const UsersAdministration = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();

  // Estados
  const [users, setUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [roles, setRoles] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [rolVisualizacion, setRolVisualizacion] = useState(null);

  // Estado para formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    empresas: [],
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Aquí se cargarían los usuarios desde la API
    const fetchData = async () => {
      try {
        // Cargar roles primero para obtener los IDs de los roles necesarios
        const rolesResponse = await api_roles_getAll();
        if (rolesResponse.success) {
          setRoles(rolesResponse.data);

          // Encontrar los IDs de los roles cliente, admin y visualización
          const clienteRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.CLIENTE
          );

          const adminRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.ADMIN
          );

          const visualizacionRole = rolesResponse.data.find(
            (role) => role.NAME_ROLE === ROLES.VISUALIZACION
          );

          if (visualizacionRole) {
            setRolVisualizacion(visualizacionRole.ID_ROLE);
          }

          if (clienteRole || adminRole || visualizacionRole) {
            // Ahora cargar los usuarios con rol cliente, admin o visualización
            const usersResponse = await api_users_getAll();
            if (usersResponse.success) {
              const userList = usersResponse.data.filter(
                (user) =>
                  (clienteRole && user.ROLE_USER === clienteRole.ID_ROLE) ||
                  (adminRole && user.ROLE_USER === adminRole.ID_ROLE) ||
                  (visualizacionRole &&
                    user.ROLE_USER === visualizacionRole.ID_ROLE)
              );

              setUsers(userList);
              setFilteredUsers(userList);
            } else {
              toast.error(usersResponse.message || "Error al cargar usuarios");
            }
          } else {
            toast.error("No se encontraron los roles necesarios en el sistema");
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

  // Filtrar usuarios
  useEffect(() => {
    if (!users) return;
    let result = users;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.NAME_USER.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de rol
    if (roleFilter !== "todos") {
      result = result.filter(
        (user) => user.ROLE_USER.toString() === roleFilter.toString()
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.NAME_USER,
      email: user.EMAIL,
      role: user.ROLE_USER, // Guardar el ID del rol
      password: "",
      confirmPassword: "",
      empresas: user.EMPRESAS
        ? user.EMPRESAS.split(",").map((e) => e.trim())
        : [],
    });
    setIsEditModalOpen(true);
  };
  const handleOpenDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setCurrentUser(null);
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

  // Función para abrir modal de creación
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      empresas: [],
    });
    setIsCreateModalOpen(true);
  };

  // Actualizar el manejador de roles para un solo rol
  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      role: value,
    });
  };

  // Funciones CRUD
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (!formData.empresas || formData.empresas.length === 0) {
      toast.error("Debes seleccionar al menos una empresa");
      return;
    }

    try {
      // Crear nuevo usuario con rol de visualización
      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: rolVisualizacion,
        enterprises: formData.empresas.join(","),
      };
      console.log(newUser);

      const response = await api_users_create(newUser);
      if (!response.success) {
        toast.error(response.message || "Error al crear usuario");
        return;
      }

      // Recargar la lista de usuarios para obtener los datos actualizados
      const fetchUsers = async () => {
        const response = await api_users_getAll();
        if (response.success) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        }
      };
      await fetchUsers();

      toast.success("Usuario creado correctamente");
      handleCloseModals();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error("Ocurrió un error al crear el usuario");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.role) {
      toast.error("Debes seleccionar un rol");
      return;
    }

    try {
      let roleUpdated = false;
      let passwordUpdated = false;

      // Verificar si ha cambiado el rol
      if (currentUser.ROLE_USER.toString() !== formData.role.toString()) {
        // Actualizar el rol
        const roleResponse = await api_users_updateRole(
          currentUser.ID_USER,
          formData.role
        );

        if (!roleResponse.success) {
          toast.error(roleResponse.message || "Error al actualizar el rol");
          return;
        }

        roleUpdated = true;
      }

      // Verificar si hay nueva contraseña
      if (formData.password) {
        // Actualizar la contraseña
        const passwordResponse = await api_users_updatePassword(
          currentUser.ID_USER,
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

      // Si no se actualizó nada, mostrar mensaje
      if (!roleUpdated && !passwordUpdated) {
        toast.info("No se realizaron cambios");
        handleCloseModals();
        return;
      }

      // Recargar lista de usuarios para obtener datos actualizados
      const fetchUsers = async () => {
        const response = await api_users_getAll();
        if (response.success) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        }
      };
      await fetchUsers();

      toast.success("Usuario actualizado correctamente");
      handleCloseModals();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Ocurrió un error al actualizar el usuario");
    }
  };

  const handleDeleteUser = () => {
    // Aquí se enviaría la petición a la API
    // Por ahora simulamos la eliminación
    const updatedUsers = users.filter(
      (user) => user.ID_USER !== currentUser.ID_USER
    );
    setUsers(updatedUsers);
    toast.success("Usuario eliminado correctamente");
    handleCloseModals();
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
      field: "ROLE_NAME",
      header: "Rol",
      render: (row) => row.ROLE_NAME || row.ROLE,
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
      <PageTitle>Administración de Usuarios</PageTitle>

      <ActionsContainer>
        <div style={{ display: "flex", gap: "16px" }}>
          <SearchContainer>
            <SearchIcon>
              <RenderIcon name={"FaSearch"} size={14} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FiltersContainer>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.ID_ROLE} value={role.ID_ROLE.toString()}>
                  {role.NAME_ROLE}
                </option>
              ))}
            </FilterSelect>
          </FiltersContainer>
        </div>

        <Button
          text="Crear Usuario"
          leftIconName="FaPlus"
          onClick={handleOpenCreateModal}
          backgroundColor={theme.colors.primary}
        />
      </ActionsContainer>

      {users === null ? (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <RenderLoader
            color={theme.colors.primary}
            showDots={true}
            showSpinner={false}
            text="Cargando usuarios"
            size="20px"
            card={true}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="No hay usuarios que coincidan con los criterios de búsqueda."
          rowActions={renderRowActions}
          striped={true}
        />
      )}

      {/* Modal para crear usuario */}
      {isCreateModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Crear Nuevo Usuario</ModalTitle>
              <RenderIcon
                name={"FaTimes"}
                size={20}
                onClick={handleCloseModals}
              />
            </ModalHeader>

            <form onSubmit={handleCreateUser}>
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

              <FormGroup>
                <EmpresasSelector
                  selectedEmpresas={formData.empresas}
                  onChange={handleEmpresasChange}
                />
              </FormGroup>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.9rem",
                  color: theme.colors.textLight,
                }}
              >
                Nota: El usuario se creará con el rol de VISUALIZACION.
              </div>

              <ButtonGroup>
                <Button
                  text="Cancelar"
                  variant="outlined"
                  onClick={handleCloseModals}
                />
                <Button
                  text="Crear Usuario"
                  type="submit"
                  backgroundColor={theme.colors.primary}
                />
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para editar usuario */}
      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Editar Usuario</ModalTitle>
              <RenderIcon
                name={"FaTimes"}
                size={20}
                onClick={handleCloseModals}
              />
            </ModalHeader>

            <form onSubmit={handleUpdateUser}>
              <FormRow>
                <FormGroup>
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={true} // Campo de solo lectura
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
                    disabled={true} // Campo de solo lectura
                    fullWidth
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    marginTop: "8px",
                  }}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.ID_ROLE} value={role.ID_ROLE.toString()}>
                      {role.NAME_ROLE}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Empresas Asignadas</label>
                <EmpresasSelector
                  selectedEmpresas={formData.empresas}
                  onChange={handleEmpresasChange}
                />
              </FormGroup>

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

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.9rem",
                  color: theme.colors.textLight,
                }}
              >
                Nota: Solo puedes modificar el rol, las empresas y/o la
                contraseña del usuario.
              </div>

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

      {/* Modal para eliminar usuario */}
      {isDeleteModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Eliminar Usuario</ModalTitle>
              <RenderIcon
                name={"FaTimes"}
                size={20}
                onClick={handleCloseModals}
              />
            </ModalHeader>

            <p>
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <strong>{currentUser?.NAME_USER}</strong>?
            </p>
            <p>Esta acción no se puede deshacer.</p>

            <ButtonGroup>
              <Button
                text="Cancelar"
                variant="outlined"
                onClick={handleCloseModals}
              />
              <Button
                text="Eliminar Usuario"
                backgroundColor={theme.colors.error}
                onClick={handleDeleteUser}
              />
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default UsersAdministration;
