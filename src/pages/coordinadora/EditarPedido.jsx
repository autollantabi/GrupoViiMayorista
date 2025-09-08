import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { pedidosMock } from "../../mock/coordinadora/pedidosMock";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import { ROUTES } from "../../constants/routes";

// Estilos
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary + "10"};
  }
`;

const DangerButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};

  &:hover {
    background-color: ${({ theme }) => theme.colors.error + "10"};
  }
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
  font-size: 0.9rem;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const ProductCell = styled(TableCell)`
  display: flex;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
  object-fit: cover;
`;

const NumberInput = styled(Input)`
  max-width: 80px;
`;

const AlertBox = styled.div`
  background-color: ${({ theme }) => theme.colors.warning}20;
  border-left: 4px solid ${({ theme }) => theme.colors.warning};
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AlertIcon = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 1.5rem;
  margin-top: 2px;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const AlertText = styled.div`
  font-size: 0.9rem;
`;

const EditarPedidoCoordinador = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    estado: "",
    observaciones: "",
    items: [],
    envio: {
      direccion: {},
    },
  });

  useEffect(() => {
    // Simular carga desde API
    setTimeout(() => {
      const pedidoEncontrado = pedidosMock.find((p) => p.id === orderId);

      if (pedidoEncontrado) {
        setPedido(pedidoEncontrado);
        setFormData({
          estado: pedidoEncontrado.estado,
          observaciones: pedidoEncontrado.observaciones || "",
          items: [...pedidoEncontrado.items],
          envio: {
            ...pedidoEncontrado.envio,
          },
        });
      }

      setLoading(false);
    }, 800);
  }, [orderId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      envio: {
        ...prev.envio,
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      envio: {
        ...prev.envio,
        direccion: {
          ...prev.envio.direccion,
          [name]: value,
        },
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === "cantidad" || field === "precio" || field === "descuento") {
      value = parseFloat(value) || 0;

      // Recalcular subtotal
      const item = updatedItems[index];
      const precio = field === "precio" ? value : item.precio;
      const cantidad = field === "cantidad" ? value : item.cantidad;
      const descuento = field === "descuento" ? value : item.descuento;

      // Actualizar el subtotal
      const precioConDescuento = precio * (1 - descuento / 100);
      updatedItems[index] = {
        ...item,
        [field]: value,
        subtotal: Number((precioConDescuento * cantidad).toFixed(2)),
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calcular totales
    const subtotal = formData.items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
    const totalDescuento = formData.items.reduce(
      (total, item) =>
        total + item.precio * item.cantidad * (item.descuento / 100),
      0
    );
    const impuestos = subtotal * 0.12; // Ejemplo: IVA del 12%
    const totalFinal = subtotal + impuestos + formData.envio.costoEnvio;

    const updatedPedido = {
      ...pedido,
      estado: formData.estado,
      observaciones: formData.observaciones,
      items: formData.items,
      envio: formData.envio,
      subtotal: Number(subtotal.toFixed(2)),
      descuento: Number(totalDescuento.toFixed(2)),
      impuestos: Number(impuestos.toFixed(2)),
      total: Number(totalFinal.toFixed(2)),
      historial: [
        {
          fecha: new Date(),
          estado: formData.estado,
          usuario: "Coordinador",
          comentario: "Pedido editado",
        },
        ...pedido.historial,
      ],
    };

    // En un caso real, aquí harías una llamada a la API
    console.log("Pedido actualizado:", updatedPedido);
    alert(
      "Pedido actualizado correctamente. El cliente recibirá una notificación para revisar los cambios."
    );
    navigate(`/coordinador/pedidos/${orderId}`);
  };

  const getAvailableStatuses = () => {
    return [
      "Pendiente",
      "En proceso",
      "En proceso con observación",
      "Completado",
      "Despachado",
      "Rechazado",
      "Cancelado por cliente",
    ];
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
    const totalDescuento = formData.items.reduce(
      (total, item) =>
        total + item.precio * item.cantidad * (item.descuento / 100),
      0
    );
    const impuestos = subtotal * 0.12; // Ejemplo: IVA del 12%
    const costoEnvio = parseFloat(formData.envio.costoEnvio) || 0;
    const totalFinal = subtotal + impuestos + costoEnvio;

    return {
      subtotal: subtotal.toFixed(2),
      descuento: totalDescuento.toFixed(2),
      impuestos: impuestos.toFixed(2),
      costoEnvio: costoEnvio.toFixed(2),
      total: totalFinal.toFixed(2),
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <PageContainer>
        <div>Cargando información del pedido...</div>
      </PageContainer>
    );
  }

  if (!pedido) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate(ROUTES.COORDINADOR.PEDIDOS)}>
          <FaArrowLeft /> Volver a pedidos
        </BackButton>
        <div>Pedido no encontrado</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(`/coordinador/pedidos/${orderId}`)}>
        <FaArrowLeft /> Volver al detalle del pedido
      </BackButton>

      <PageHeader>
        <PageTitle>Editar Pedido {pedido.id}</PageTitle>

        <ButtonContainer>
          <DangerButton
            onClick={() => navigate(`/coordinador/pedidos/${orderId}`)}
          >
            <FaTimes /> Cancelar
          </DangerButton>
          <PrimaryButton onClick={handleSubmit}>
            <FaSave /> Guardar cambios
          </PrimaryButton>
        </ButtonContainer>
      </PageHeader>

      <AlertBox>
        <AlertIcon>
          <FaExclamationTriangle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Atención</AlertTitle>
          <AlertText>
            Los cambios realizados en este pedido deberán ser aprobados por el
            cliente. Se enviará una notificación solicitando su confirmación.
          </AlertText>
        </AlertContent>
      </AlertBox>

      <Section>
        <SectionTitle>Estado del pedido</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label>Estado</Label>
            <Select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
            >
              {getAvailableStatuses().map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Ingrese observaciones adicionales sobre este pedido"
            />
          </FormGroup>
        </FormRow>
      </Section>

      <Section>
        <SectionTitle>Información de envío</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label>Método de envío</Label>
            <Select
              name="metodoEnvio"
              value={formData.envio.metodoEnvio}
              onChange={handleShippingChange}
            >
              <option value="Estándar">Estándar</option>
              <option value="Express">Express</option>
              <option value="Recogida en tienda">Recogida en tienda</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Costo de envío ($)</Label>
            <Input
              type="number"
              name="costoEnvio"
              min="0"
              step="0.01"
              value={formData.envio.costoEnvio}
              onChange={handleShippingChange}
            />
          </FormGroup>
        </FormRow>

        <SectionTitle>Dirección de envío</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label>Dirección</Label>
            <Input
              name="calle"
              value={formData.envio.direccion.calle || ""}
              onChange={handleAddressChange}
            />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup>
            <Label>Ciudad</Label>
            <Input
              name="ciudad"
              value={formData.envio.direccion.ciudad || ""}
              onChange={handleAddressChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Provincia</Label>
            <Input
              name="provincia"
              value={formData.envio.direccion.provincia || ""}
              onChange={handleAddressChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Código postal</Label>
            <Input
              name="codigoPostal"
              value={formData.envio.direccion.codigoPostal || ""}
              onChange={handleAddressChange}
            />
          </FormGroup>
        </FormRow>
      </Section>

      <Section>
        <SectionTitle>Productos del pedido</SectionTitle>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Producto</TableHeaderCell>
              <TableHeaderCell>Precio</TableHeaderCell>
              <TableHeaderCell>Cantidad</TableHeaderCell>
              <TableHeaderCell>Descuento (%)</TableHeaderCell>
              <TableHeaderCell>Subtotal</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {formData.items.map((item, index) => (
              <TableRow key={index}>
                <ProductCell>
                  <ProductImage src={item.imagen} alt={item.nombre} />
                  <div>
                    <div>{item.nombre}</div>
                    <div style={{ fontSize: "0.85rem", color: "#777" }}>
                      SKU: {item.sku}
                    </div>
                  </div>
                </ProductCell>
                <TableCell>
                  <NumberInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precio}
                    onChange={(e) =>
                      handleItemChange(index, "precio", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      handleItemChange(index, "cantidad", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    type="number"
                    min="0"
                    max="100"
                    value={item.descuento}
                    onChange={(e) =>
                      handleItemChange(index, "descuento", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                <TableCell>
                  <DangerButton onClick={() => removeItem(index)}>
                    <FaTrash /> Eliminar
                  </DangerButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        <div
          style={{
            marginTop: "24px",
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "300px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal:</span>
                <span>${totals.subtotal}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Descuentos:</span>
                <span>-${totals.descuento}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Impuestos:</span>
                <span>${totals.impuestos}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Envío:</span>
                <span>${totals.costoEnvio}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #eee",
                  fontSize: "1.1rem",
                }}
              >
                <span>Total:</span>
                <span>${totals.total}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
};

export default EditarPedidoCoordinador;
