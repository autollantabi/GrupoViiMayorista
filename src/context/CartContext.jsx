import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { TAXES } from "../constants/taxes";
import { ROLES } from "../constants/roles";
import {
  api_cart_getCarrito,
  api_cart_updateCarrito,
} from "../api/cart/apiCart";
import { api_products_getProductByCodigo } from "../api/products/apiProducts";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cartIds, setCartIds] = useState({}); // Múltiples cartIds por empresa
  const skipAutoSyncRef = useRef(false); // Ref para evitar sincronización automática durante checkout

  const { user, isClient, isVisualizacion } = useAuth(); // Obtener el usuario actual

  const calculateCartTotal = (cart) => {
    // Agrupa los productos por empresa
    const grouped = {};
    cart.forEach((item) => {
      const company = item.empresaId || "Sin empresa";
      if (!grouped[company]) grouped[company] = [];
      grouped[company].push(item);
    });

    let total = 0;

    Object.entries(grouped).forEach(([company, items]) => {
      // 1. Subtotal sin descuentos
      const rawSubtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      // 2. Total de descuentos promocionales (por producto)
      const totalPromotionalDiscount = items.reduce(
        (acc, item) =>
          acc +
          item.price *
            item.quantity *
            ((Number(item.promotionalDiscount) || 0) / 100),
        0
      );

      // 3. Subtotal después de descuentos promocionales
      const subtotalAfterPromo = rawSubtotal - totalPromotionalDiscount;
      // 4. Descuento general (usuario) sobre el subtotal con promo
      const userDiscount = user?.DESCUENTOS?.[company] || 0;
      const generalDiscount = subtotalAfterPromo * (Number(userDiscount) / 100);
      // 5. Subtotal después de descuento general
      const subtotalAfterGeneral = subtotalAfterPromo - generalDiscount;
      // 6. Descuento especial (coordinadora) sobre el subtotal con promo y general
      // Si tienes aditionalDiscount por empresa, úsalo aquí, si no, pon 0
      const aditionalDiscount = 0;
      const subtotalAfterAditional = subtotalAfterGeneral - aditionalDiscount;
      // 7. IVA (si tienes un valor por empresa, úsalo, si no, pon 0)
      const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;
      const valorIVA =
        (subtotalAfterAditional < 0 ? 0 : subtotalAfterAditional) *
        (ivaPct / 100);
      // 8. Total con IVA
      const totalConIva =
        (subtotalAfterAditional < 0 ? 0 : subtotalAfterAditional) + valorIVA;

      total += totalConIva;
    });

    return total;
  };

  // Función para cargar el carrito desde la API
  const loadCartFromAPI = useCallback(
    async (forceReplace = false) => {
      if (!user?.ACCOUNT_USER) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await api_cart_getCarrito(user.ACCOUNT_USER);

        if (
          response.success &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const incomingCartIds = {};
          let allCartItems = [];

          for (const cartData of response.data) {
            const enterprise = cartData.CABECERA.ENTERPRISE;
            incomingCartIds[enterprise] =
              cartData.CABECERA.ID_SHOPPING_CART_HEADER;

            const cartItemsPromises = cartData.DETALLE.map(async (item) => {
              try {
                const productResponse = await api_products_getProductByCodigo(
                  item.PRODUCT_CODE,
                  enterprise
                );

                if (productResponse.success && productResponse.data) {
                  const product = productResponse.data;

                  return {
                    id: item.PRODUCT_CODE,
                    idShoppingCartDetail: item.ID_SHOPPING_CART_DETAIL,
                    quantity: item.QUANTITY,
                    price: product.DMA_COSTO || 0,
                    name: product.DMA_NOMBREITEM || item.PRODUCT_CODE,
                    image: product.DMA_RUTAIMAGEN || "",
                    empresaId: enterprise,
                    stock: product.DMA_STOCK || 0,
                    brand: product.DMA_MARCA || "Sin marca",
                    discount: product.DMA_DESCUENTO_PROMOCIONAL || 0,
                    iva: TAXES.IVA_PERCENTAGE,
                    lineaNegocio: product.DMA_LINEANEGOCIO || "DEFAULT",
                  };
                }

                return {
                  id: item.PRODUCT_CODE,
                  idShoppingCartDetail: item.ID_SHOPPING_CART_DETAIL,
                  quantity: item.QUANTITY,
                  price: item.PRICE,
                  name: item.PRODUCT_CODE,
                  image: "",
                  empresaId: enterprise,
                  stock: 0,
                  brand: "Sin marca",
                  discount: 0,
                  iva: TAXES.IVA_PERCENTAGE,
                };
              } catch (error) {
                console.error(
                  `❌ Error al obtener información del producto ${item.PRODUCT_CODE}:`,
                  error
                );
                return {
                  id: item.PRODUCT_CODE,
                  idShoppingCartDetail: item.ID_SHOPPING_CART_DETAIL,
                  quantity: item.QUANTITY,
                  price: item.PRICE,
                  name: item.PRODUCT_CODE,
                  image: "",
                  empresaId: enterprise,
                  stock: 0,
                  brand: "Sin marca",
                  discount: 0,
                  iva: TAXES.IVA_PERCENTAGE,
                };
              }
            });

            const cartItems = await Promise.all(cartItemsPromises);
            allCartItems = [...allCartItems, ...cartItems];
          }

          setCartIds(incomingCartIds);

          // Si forceReplace es true, reemplazar completamente el carrito
          // Esto es útil después de eliminar productos del backend
          if (forceReplace) {
            // Deshabilitar sincronización automática temporalmente
            skipAutoSyncRef.current = true;
            setCart(allCartItems);
            // Rehabilitar sincronización automática después de un momento
            setTimeout(() => {
              skipAutoSyncRef.current = false;
            }, 1000);
          } else {
            setCart((prevCart) => {
              if (prevCart.length === 0) {
                return allCartItems;
              }

              // Usar siempre la misma clave basada en empresaId-id para identificar el mismo producto
              // Esto evita duplicados cuando un item se agrega desde el catálogo (sin idShoppingCartDetail)
              // y luego se recarga desde la API (con idShoppingCartDetail)
              const mergedMap = new Map();

              // Primero agregar items del carrito actual
              prevCart.forEach((item) => {
                const key = `${item.empresaId || ""}-${item.id}`;
                mergedMap.set(key, item);
              });

              // Luego agregar/actualizar con items de la API (la API es la fuente de verdad)
              // Si un item de la API tiene el mismo empresaId-id, actualizar el item local
              // con el idShoppingCartDetail y otros datos de la API
              allCartItems.forEach((item) => {
                const key = `${item.empresaId || ""}-${item.id}`;
                const existingItem = mergedMap.get(key);

                if (existingItem) {
                  // Si ya existe, actualizar con los datos de la API (que tienen idShoppingCartDetail)
                  // Usar la cantidad de la API (es la fuente de verdad) pero si el item local
                  // no tiene idShoppingCartDetail, significa que es nuevo y debemos usar la cantidad local
                  if (
                    !existingItem.idShoppingCartDetail &&
                    item.idShoppingCartDetail
                  ) {
                    // Item nuevo que se acaba de sincronizar, usar cantidad local
                    mergedMap.set(key, {
                      ...item,
                      quantity: existingItem.quantity,
                    });
                  } else {
                    // Item existente, usar datos de la API (incluyendo cantidad)
                    mergedMap.set(key, {
                      ...item,
                      quantity: item.quantity,
                    });
                  }
                } else {
                  // Si no existe, agregarlo
                  mergedMap.set(key, item);
                }
              });

              return Array.from(mergedMap.values());
            });
          }
        } else {
          setCartIds({});
          // Si forceReplace es true y no hay items, limpiar el carrito
          if (forceReplace) {
            setCart([]);
          } else {
            setCart((prevCart) => prevCart);
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar el carrito desde la API:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.ACCOUNT_USER]
  );

  // Cargar automáticamente el carrito cuando el usuario esté disponible
  useEffect(() => {
    if (user?.ACCOUNT_USER && isClient && !isVisualizacion) {
      loadCartFromAPI();
    }
  }, [user?.ACCOUNT_USER, isClient, isVisualizacion, loadCartFromAPI]);

  // Función para sincronizar el carrito con la API
  const syncCartWithAPI = async (newCart) => {
    if (!user?.ACCOUNT_USER) {
      return;
    }

    // Verificar si hay items sin idShoppingCartDetail que necesitan ser sincronizados
    const hasItemsWithoutDetailId = newCart.some(
      (item) => !item.idShoppingCartDetail
    );

    // Agrupar productos por empresa
    const productsByEnterprise = {};
    newCart.forEach((item) => {
      const enterprise = item.empresaId || user.ENTERPRISE || "MAXXIMUNDO";
      if (!productsByEnterprise[enterprise]) {
        productsByEnterprise[enterprise] = [];
      }
      productsByEnterprise[enterprise].push({
        PRODUCT_CODE: item.id,
        QUANTITY: item.quantity,
        PRICE: item.price,
      });
    });

    // Incluir todas las empresas que tenían cartIds, incluso si ahora están vacías
    Object.keys(cartIds).forEach((enterprise) => {
      if (!productsByEnterprise[enterprise]) {
        productsByEnterprise[enterprise] = []; // Array vacío para empresas sin productos
      }
    });

    // Sincronizar cada carrito por empresa
    const syncPromises = Object.entries(productsByEnterprise).map(
      async ([enterprise, productos]) => {
        const cartId = cartIds[enterprise];

        try {
          const carritoData = {
            ENTERPRISE: enterprise,
            ACCOUNT_USER: user.ACCOUNT_USER,
            PRODUCTOS: productos,
          };

          let response;
          if (!cartId) {
            // Si no hay cartId para esta empresa, no podemos sincronizar

            return; // Saltar esta empresa
          } else {
            // Si ya existe cartId, actualizar el carrito existente
            response = await api_cart_updateCarrito(cartId, carritoData);
          }

          if (!response.success) {
            console.error(
              `❌ Error en respuesta de API para ${enterprise}:`,
              response
            );
          }
        } catch (error) {
          console.error(
            `❌ Error al sincronizar carrito de ${enterprise} con API:`,
            error
          );
        }
      }
    );

    await Promise.all(syncPromises);

    // Si hay items sin idShoppingCartDetail, recargar el carrito desde la API
    // para obtener los idShoppingCartDetail actualizados
    if (hasItemsWithoutDetailId && !skipAutoSyncRef.current) {
      // Esperar un momento para que el backend procese la actualización
      setTimeout(async () => {
        await loadCartFromAPI();
      }, 500);
    }

    // NO limpiar cartIds, mantener todos los existentes para futuras operaciones
  };

  useEffect(() => {
    // Actualizar el total del carrito usando la función de cálculo completa
    const total = calculateCartTotal(cart);
    setCartTotal(total);
  }, [cart]);

  // Sincronizar automáticamente con la API cuando cambie el carrito
  useEffect(() => {
    // No sincronizar si estamos en proceso de checkout o si se está forzando un reemplazo
    if (skipAutoSyncRef.current) {
      return;
    }

    // Solo sincronizar si tenemos un usuario y cartIds cargados
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER) {
      // Usar un debounce para evitar demasiadas llamadas a la API
      const timeoutId = setTimeout(() => {
        syncCartWithAPI(cart);
      }, 500); // Esperar 500ms después del último cambio

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [cart, cartIds, user?.ACCOUNT_USER]);

  // Agregar producto al carrito con verificación de rol
  const addToCart = async (product, quantity = 1) => {
    // Si el usuario es admin, coordinadora o visualización, no permitir añadir al carrito
    if (!isClient || isVisualizacion) {
      console.warn(
        "❌ Administradores, coordinadores y usuarios de visualización no pueden realizar compras"
      );
      return {
        success: false,
        message: "Tu rol no permite realizar compras en el sistema",
      };
    }

    try {
      // Obtener información completa del producto desde la API
      const enterprise = product.empresaId || user?.ENTERPRISE || "MAXXIMUNDO";
      const productResponse = await api_products_getProductByCodigo(
        product.id,
        enterprise
      );

      let productData = product; // Usar datos del producto si no se puede obtener de la API

      if (productResponse.success && productResponse.data) {
        const apiProduct = productResponse.data;
        productData = {
          id: product.id,
          name: apiProduct.DMA_NOMBREITEM || product.name,
          discount: product.discount || 0,
          price: apiProduct.DMA_COSTO || product.price,
          image: apiProduct.DMA_RUTAIMAGEN || product.image,
          empresaId: enterprise,
          stock: apiProduct.DMA_STOCK || product.stock || 0,
          brand: apiProduct.DMA_MARCA || product.brand || "Sin marca",
          iva: product.iva || TAXES.IVA_PERCENTAGE,
          promotionalDiscount:
            apiProduct.DMA_DESCUENTO_PROMOCIONAL ||
            product.promotionalDiscount ||
            0,
          lineaNegocio:
            apiProduct.DMA_LINEANEGOCIO || product.lineaNegocio || "DEFAULT",
        };
      } else {
        console.warn(
          `⚠️ No se pudo obtener información completa del producto ${product.id}, usando datos disponibles`
        );
      }

      const dataToSave = {
        ...productData,
        quantity: quantity,
      };

      setCart((prevCart) => {
        // Buscar si el producto ya está en el carrito
        // Usar empresaId + id para identificar correctamente el mismo producto
        const existingProductIndex = prevCart.findIndex(
          (item) =>
            item.id === dataToSave.id && item.empresaId === dataToSave.empresaId
        );

        let newCart;
        if (existingProductIndex >= 0) {
          // Si el producto ya existe, crear una nueva copia del carrito
          const updatedCart = [...prevCart];
          // Actualizar la cantidad y también refrescar los datos del producto
          // Mantener idShoppingCartDetail si ya existe
          updatedCart[existingProductIndex] = {
            ...dataToSave,
            idShoppingCartDetail:
              updatedCart[existingProductIndex].idShoppingCartDetail,
            quantity: updatedCart[existingProductIndex].quantity + quantity,
          };
          newCart = updatedCart;
        } else {
          // Si es un producto nuevo, añadirlo al carrito
          newCart = [...prevCart, dataToSave];
        }

        // Sincronizar inmediatamente con la API solo si hay cartIds disponibles
        setTimeout(() => {
          if (Object.keys(cartIds).length > 0) {
            syncCartWithAPI(newCart);
          }
        }, 100); // Pequeño delay para asegurar que el estado se actualice

        return newCart;
      });

      return {
        success: true,
        message: "Producto añadido al carrito",
      };
    } catch (error) {
      console.error("❌ Error al obtener información del producto:", error);

      // En caso de error, usar los datos del producto disponibles
      const dataToSave = {
        id: product.id,
        name: product.name,
        discount: product.discount || 0,
        price: product.price,
        image: product.image,
        empresaId: product.empresaId,
        stock: product.stock || 0,
        quantity: quantity,
        brand: product.brand || "Sin marca",
        iva: product.iva || TAXES.IVA_PERCENTAGE,
        promotionalDiscount: product.promotionalDiscount || 0,
        lineaNegocio: product.lineaNegocio || "DEFAULT",
      };

      setCart((prevCart) => {
        // Buscar si el producto ya está en el carrito
        // Usar empresaId + id para identificar correctamente el mismo producto
        const existingProductIndex = prevCart.findIndex(
          (item) =>
            item.id === dataToSave.id && item.empresaId === dataToSave.empresaId
        );

        let newCart;
        if (existingProductIndex >= 0) {
          // Si el producto ya existe, crear una nueva copia del carrito
          const updatedCart = [...prevCart];
          // Actualizar solo la cantidad del producto existente
          // Mantener idShoppingCartDetail si ya existe
          updatedCart[existingProductIndex] = {
            ...updatedCart[existingProductIndex],
            quantity: updatedCart[existingProductIndex].quantity + quantity,
          };
          newCart = updatedCart;
        } else {
          // Si es un producto nuevo, añadirlo al carrito
          newCart = [...prevCart, { ...dataToSave, quantity }];
        }

        return newCart;
      });

      return {
        success: true,
        message: "Producto añadido al carrito (información limitada)",
      };
    }
  };

  // Eliminar producto del carrito
  const removeFromCart = async (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);

    setCart(newCart);

    // Sincronizar inmediatamente con la API si tenemos usuario y cartIds
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER) {
      try {
        await syncCartWithAPI(newCart);
      } catch (error) {
        console.error("❌ Error al sincronizar eliminación con la API:", error);
      }
    }
  };

  // Actualizar cantidad de un producto
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);

    // Sincronizar inmediatamente con la API si tenemos usuario y cartIds
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER) {
      try {
        await syncCartWithAPI(newCart);
      } catch (error) {
        console.error(
          "❌ Error al sincronizar actualización de cantidad con la API:",
          error
        );
      }
    }
  };

  // Limpiar todo el carrito
  const clearCart = async () => {
    setCart([]);
    // NO limpiar cartIds, mantenerlos para futuras operaciones

    // Sincronizar inmediatamente con la API si tenemos usuario y cartIds
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER) {
      try {
        await syncCartWithAPI([]);
      } catch (error) {
        console.error(
          "❌ Error al sincronizar limpieza del carrito con la API:",
          error
        );
      }
    }
  };

  const removeItemsByCompany = async (companyId) => {
    const newCart = cart.filter((item) => item.empresaId !== companyId);
    setCart(newCart);

    // Sincronizar inmediatamente con la API si tenemos usuario y cartIds
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER) {
      try {
        await syncCartWithAPI(newCart);
      } catch (error) {
        console.error(
          "❌ Error al sincronizar eliminación por empresa con la API:",
          error
        );
      }
    }
  };

  // Función para forzar la recarga del carrito desde la API
  const reloadCartFromAPI = useCallback(async () => {
    if (user?.ACCOUNT_USER) {
      await loadCartFromAPI();
    }
  }, [loadCartFromAPI, user?.ACCOUNT_USER]);

  // Función para eliminar items del carrito por idShoppingCartDetail
  const removeFromCartByDetailIds = useCallback(
    async (detailIds) => {
      if (!Array.isArray(detailIds) || detailIds.length === 0) {
        return;
      }

      const detailIdsSet = new Set(detailIds);
      const newCart = cart.filter(
        (item) => !detailIdsSet.has(item.idShoppingCartDetail)
      );

      setCart(newCart);

      // No sincronizar con la API aquí porque ya se eliminaron del backend
      // Solo actualizar el estado local
    },
    [cart]
  );

  const value = {
    cart,
    cartTotal,
    isLoading,
    addToCart,
    calculateCartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    removeItemsByCompany,
    loadCartFromAPI,
    reloadCartFromAPI,
    removeFromCartByDetailIds,
    cartIds,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    hasItems: cart.length > 0, // Indicador simple de si hay items
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
