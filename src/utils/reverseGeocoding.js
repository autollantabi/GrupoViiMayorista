export const reverseGeocode = async (longitude, latitude) => {
  if (!longitude || !latitude || longitude === "" || latitude === "") return null;
  const token = import.meta.env.VITE_API_MAPBOX;
  if (!token) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&language=es`
    );
    const data = await response.json();
    const feature = data.features[0];

    if (feature) {
      const context = feature.context || [];
      const province = context.find(c => c.id.startsWith('region'))?.text || '';
      const city = context.find(c => c.id.startsWith('place'))?.text || '';
      const address = feature.place_name || '';

      return {
        province,
        city,
        address
      };
    }
    return null;
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    return null;
  }
};
