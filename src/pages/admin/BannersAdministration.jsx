import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppTheme } from "../../context/AppThemeContext";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import RenderIcon from "../../components/ui/RenderIcon";
import RenderLoader from "../../components/ui/RenderLoader";
import { api_banners_getAll, api_banners_uploadBanner, api_banners_updateBanner } from "../../api/banners/apiBanners";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { toast } from "react-toastify";


const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 1.8rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg || "rgba(0, 0, 0, 0.05)"};
  color: ${({ $color }) => $color || "inherit"};
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FiltersContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  min-width: 250px;
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const TabButton = styled.button`
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.textLight)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.background)};
    color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.text)};
  }
`;

const BannersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const BannerCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px ${({ theme }) => theme.colors.shadow};
  }
`;

const BannerImageWrapper = styled.div`
  height: 180px;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BannerImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderBanner = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary + "33"}, ${({ theme }) => theme.colors.primary});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 20px;
  text-align: center;
`;

const ActiveBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.success : theme.colors.error)};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const TypeBadge = styled.span`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BannerContent = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BannerTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  font-weight: 700;
`;

const BannerDescription = styled.p`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
  line-height: 1.4;
  flex: 1;
`;

const BannerMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
`;

const MetaLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  min-width: 70px;
`;

const MetaValueLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  word-break: break-all;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MetaValueText = styled.span`
  word-break: break-all;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const FormGrid = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const FileUploadContainer = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.background};
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 150px;
  border-radius: 8px;
  object-fit: contain;
  margin-top: 10px;
`;

const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

export default function BannersAdministration() {
  const { theme } = useAppTheme();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");

  // Form states for creating a new banner
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Carrito");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("AUTOLLANTA");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const TIPO_OPTIONS = [
    { label: "Carrito", value: "Carrito" },
    { label: "Catálogo", value: "Catalogo" },
  ];

  const EMPRESA_OPTIONS = [
    { label: "AUTOLLANTA", value: "AUTOLLANTA" },
    { label: "MAXXIMUNDO", value: "MAXXIMUNDO" },
    { label: "STOX", value: "STOX" },
    { label: "IKONIX", value: "IKONIX" },
    { label: "AUTOMAX", value: "AUTOMAX" },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate that the image file is WebP only
    const isWebp = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
    if (!isWebp) {
      toast.error("Únicamente se permiten imágenes en formato WebP");
      e.target.value = null;
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (banner) => {
    setIsEditMode(true);
    setSelectedBannerId(banner.DBN_ID);
    setTitle(banner.DBN_TITULO || "");
    setDescription(banner.DBN_DESCRIPCION || "");
    setType(banner.DBN_TIPO || "Carrito");
    setUrl(banner.DBN_URL || "");
    setCompany(banner.DBN_EMPRESA || "AUTOLLANTA");
    setIsActive(banner.DBN_ACTIVO);
    setExistingImageUrl(banner.DBN_RUTAIMAGEN || "");
    setImageFile(null);
    setImagePreviewUrl("");
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setIsEditMode(false);
    setSelectedBannerId(null);
    setTitle("");
    setDescription("");
    setType("Carrito");
    setUrl("");
    setCompany("AUTOLLANTA");
    setIsActive(true);
    setImageFile(null);
    setImagePreviewUrl("");
    setExistingImageUrl("");
  };

  const handleCreateBannerSubmit = async (e) => {
    e.preventDefault();

    if (!company) {
      toast.error("Por favor, selecciona una empresa");
      return;
    }
    if (!type) {
      toast.error("Por favor, selecciona un tipo");
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error("Por favor, selecciona una imagen");
      return;
    }

    setIsUploading(true);
    try {
      if (isEditMode) {
        // PATCH /banners/updateBanner/{id} using JSON body
        const payload = {
          empresa: company,
          titulo: title.trim(),
          descripcion: description.trim(),
          tipo: type,
          url: url.trim(),
          activo: isActive,
        };

        const response = await api_banners_updateBanner(selectedBannerId, payload);
        if (response.success) {
          toast.success("Banner actualizado correctamente");
          handleCloseModal();
          fetchBanners();
        } else {
          toast.error(response.message || "Error al actualizar el banner");
        }
      } else {
        // POST /banners/uploadBanner using FormData
        const formData = new FormData();
        formData.append("imagen", imageFile);
        formData.append("empresa", company);
        formData.append("titulo", title.trim());
        formData.append("descripcion", description.trim());
        formData.append("tipo", type);
        formData.append("url", url.trim());
        formData.append("activo", isActive);

        const response = await api_banners_uploadBanner(formData);
        if (response.success) {
          toast.success("Banner creado correctamente");
          handleCloseModal();
          fetchBanners();
        } else {
          toast.error(response.message || "Error al crear el banner");
        }
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      toast.error("Ocurrió un error inesperado al procesar el banner");
    } finally {
      setIsUploading(false);
    }
  };



  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api_banners_getAll();
      if (response.success && response.data) {
        setBanners(response.data);
      } else {
        toast.error(response.message || "Error al obtener los banners");
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Ocurrió un error al cargar los banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const baseUrl = import.meta.env.VITE_API_IMAGES_URL || "";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${cleanBase}${cleanPath}`;
  };

  const filteredBanners = banners.filter((banner) => {
    const title = banner.DBN_TITULO || "";
    const desc = banner.DBN_DESCRIPCION || "";
    const company = banner.DBN_EMPRESA || "";

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase());

    const isActive = banner.DBN_ACTIVO;

    if (activeTab === "ACTIVOS") return matchesSearch && isActive;
    if (activeTab === "INACTIVOS") return matchesSearch && !isActive;
    return matchesSearch;
  });

  const activeCount = banners.filter((b) => b.DBN_ACTIVO).length;
  const inactiveCount = banners.length - activeCount;

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Administración de Banners</PageTitle>
          <span style={{ color: theme.colors.textLight, fontSize: "0.9rem" }}>
            Gestiona los banners publicitarios obtenidos en tiempo real desde la API
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button
            text="Nuevo Banner"
            leftIconName="FaPlus"
            onClick={() => {
              handleCloseModal();
              setIsOpenModal(true);
            }}
            variant="solid"
          />
          <Button
            text="Recargar"
            leftIconName="FaRotate"
            onClick={fetchBanners}
            variant="outlined"
          />
        </div>

      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon $bg={theme.colors.primary + "15"} $color={theme.colors.primary}>
            <RenderIcon name="FaImages" size={20} />
          </StatIcon>
          <StatInfo>
            <StatValue>{loading ? "..." : banners.length}</StatValue>
            <StatLabel>Total Banners</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg={theme.colors.success + "15"} $color={theme.colors.success}>
            <RenderIcon name="FaCheckCircle" size={20} />
          </StatIcon>
          <StatInfo>
            <StatValue>{loading ? "..." : activeCount}</StatValue>
            <StatLabel>Activos</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg={theme.colors.error + "15"} $color={theme.colors.error}>
            <RenderIcon name="FaTimesCircle" size={20} />
          </StatIcon>
          <StatInfo>
            <StatValue>{loading ? "..." : inactiveCount}</StatValue>
            <StatLabel>Inactivos</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <FiltersContainer>
        <SearchInputWrapper>
          <Input
            placeholder="Buscar por título, descripción o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconName="FaMagnifyingGlass"
          />
        </SearchInputWrapper>

        <TabsWrapper>
          <TabButton
            $active={activeTab === "TODOS"}
            onClick={() => setActiveTab("TODOS")}
          >
            Todos
          </TabButton>
          <TabButton
            $active={activeTab === "ACTIVOS"}
            onClick={() => setActiveTab("ACTIVOS")}
          >
            Activos
          </TabButton>
          <TabButton
            $active={activeTab === "INACTIVOS"}
            onClick={() => setActiveTab("INACTIVOS")}
          >
            Inactivos
          </TabButton>
        </TabsWrapper>
      </FiltersContainer>

      {loading ? (
        <LoadingWrapper>
          <RenderLoader
            color={theme.colors.primary}
            showDots={true}
            showSpinner={false}
            text="Cargando banners desde la API..."
            size="20px"
            card={true}
          />
        </LoadingWrapper>
      ) : filteredBanners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: theme.colors.surface, borderRadius: "12px" }}>
          <RenderIcon name="FaCircleInfo" size={40} color={theme.colors.textLight} />
          <h3 style={{ marginTop: "12px", color: theme.colors.text }}>No se encontraron banners</h3>
          <p style={{ color: theme.colors.textLight }}>Prueba ajustando los filtros o el texto de búsqueda.</p>
        </div>
      ) : (
        <BannersGrid>
          {filteredBanners.map((banner) => (
            <BannerCard key={banner.DBN_ID} onClick={() => handleEditClick(banner)}>
              <BannerImageWrapper>
                {banner.DBN_RUTAIMAGEN ? (
                  <BannerImg 
                    src={getImageUrl(banner.DBN_RUTAIMAGEN)} 
                    alt={banner.DBN_TITULO} 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.style.display = "none";
                      e.target.parentNode.innerHTML = `<div style="text-align: center; color: ${theme.colors.textLight}; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"><i class="fa fa-image" style="font-size: 32px; margin-bottom: 4px;"></i><span>Error al cargar imagen</span></div>`;
                    }}
                  />
                ) : (
                  <PlaceholderBanner>
                    <RenderIcon name="FaImage" size={32} />
                    <span style={{ fontSize: "0.8rem", marginTop: "4px" }}>{banner.DBN_EMPRESA}</span>
                  </PlaceholderBanner>
                )}
                <ActiveBadge $active={banner.DBN_ACTIVO}>
                  {banner.DBN_ACTIVO ? "Activo" : "Inactivo"}
                </ActiveBadge>
                <TypeBadge>
                  <RenderIcon name="FaSliders" size={12} />
                  Tipo: {banner.DBN_TIPO || "N/A"}
                </TypeBadge>
              </BannerImageWrapper>

              <BannerContent>
                <BannerTitle>{banner.DBN_TITULO || "Sin Título"}</BannerTitle>
                <BannerDescription>{banner.DBN_DESCRIPCION || "Sin descripción"}</BannerDescription>
                
                <BannerMeta>
                  <MetaRow>
                    <MetaLabel>Empresa:</MetaLabel>
                    <MetaValueText>{banner.DBN_EMPRESA || "N/A"}</MetaValueText>
                  </MetaRow>

                  <MetaRow>
                    <MetaLabel>Tipo:</MetaLabel>
                    <MetaValueText>{banner.DBN_TIPO || "N/A"}</MetaValueText>
                  </MetaRow>

                  <MetaRow>
                    <MetaLabel>URL:</MetaLabel>
                    {banner.DBN_URL ? (
                      <MetaValueLink href={banner.DBN_URL} target="_blank" rel="noopener noreferrer">
                        {banner.DBN_URL}
                      </MetaValueLink>
                    ) : (
                      <MetaValueText style={{ fontStyle: "italic", color: theme.colors.textLight }}>No asignada</MetaValueText>
                    )}
                  </MetaRow>
                </BannerMeta>
              </BannerContent>
            </BannerCard>
          ))}
        </BannersGrid>
      )}

      <Modal
        isOpen={isOpenModal}
        onClose={handleCloseModal}
        title={isEditMode ? "Editar Banner" : "Crear Nuevo Banner"}
        titleIcon={isEditMode ? "FaPen" : "FaPlus"}
        maxWidth="600px"
      >
        <FormGrid onSubmit={handleCreateBannerSubmit}>
          {isEditMode ? (
            <FormGroup>
              <FormLabel>Imagen del Banner (No modificable)</FormLabel>
              {existingImageUrl ? (
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <ImagePreview src={getImageUrl(existingImageUrl)} alt="Banner actual" />
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "10px", color: theme.colors.textLight }}>
                  Sin imagen asignada
                </div>
              )}
            </FormGroup>
          ) : (
            <FormGroup>
              <FormLabel>Imagen del Banner (Formato WebP únicamente)</FormLabel>
              <FileUploadContainer>
                <RenderIcon name="FaCloudArrowUp" size={24} color={theme.colors.textLight} />
                <span style={{ fontSize: "0.85rem", marginTop: "8px", color: theme.colors.textLight }}>
                  {imageFile ? imageFile.name : "Seleccionar o arrastrar imagen .webp"}
                </span>
                <FileInput
                  type="file"
                  accept="image/webp, .webp"
                  onChange={handleImageChange}
                />
              </FileUploadContainer>
              {imagePreviewUrl && (
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: theme.colors.textLight, display: "block" }}>
                    Vista previa:
                  </span>
                  <ImagePreview src={imagePreviewUrl} alt="Preview" />
                </div>
              )}
            </FormGroup>
          )}

          <FormRow>
            <Input
              label="Título del Banner (Opcional)"
              placeholder="Ej. Descuentos de Julio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <Input
              label="Enlace / URL"
              placeholder="Ej. https://misitio.com/ofertas"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
            />
          </FormRow>

          <Input
            label="Descripción (Opcional)"
            placeholder="Ingresa una breve descripción del banner..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            fullWidth
          />

          <FormRow>
            <Select
              label="Empresa"
              options={EMPRESA_OPTIONS}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              width="100%"
            />
            <Select
              label="Tipo de Banner"
              options={TIPO_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value)}
              width="100%"
            />
          </FormRow>

          <FormGroup>
            <FormLabel>Estado del Banner</FormLabel>
            <ToggleSwitch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              label={isActive ? "Activo (El banner se mostrará al público)" : "Inactivo (El banner no se mostrará)"}
            />
          </FormGroup>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button
              text="Cancelar"
              variant="outlined"
              onClick={handleCloseModal}
              type="button"
              disabled={isUploading}
            />
            <Button
              text={isUploading ? (isEditMode ? "Guardando..." : "Subiendo...") : (isEditMode ? "Guardar Cambios" : "Crear Banner")}
              variant="solid"
              type="submit"
              disabled={isUploading}
            />
          </div>
        </FormGrid>
      </Modal>
    </PageContainer>
  );
}
