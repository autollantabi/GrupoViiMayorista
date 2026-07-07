import api from "../../constants/api";

export const api_banners_getAll = async () => {
  try {
    const response = await api.get("/banners/getBanners/");
    return {
      success: true,
      message: response.data.message || "Banners obtenidos correctamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener banners";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const api_banners_getByTipo = async (tipo) => {
  try {
    const response = await api.get(`/banners/getBanners/${tipo}`);
    return {
      success: true,
      message: response.data?.message || "Banners obtenidos correctamente",
      data: response.data?.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener banners";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const api_banners_uploadBanner = async (formData) => {
  try {
    const response = await api.post("/banners/uploadBanner", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      message: response.data?.message || "Banner creado correctamente",
      data: response.data?.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el banner";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const api_banners_updateBanner = async (id, data) => {
  try {
    const response = await api.patch(`/banners/updateBanner/${id}`, data);
    return {
      success: true,
      message: response.data?.message || "Banner actualizado correctamente",
      data: response.data?.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al actualizar el banner";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};


