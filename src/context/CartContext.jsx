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
  api_cart_createCarrito,
  api_cart_deleteProductsFromCart,
} from "../api/cart/apiCart";
import { api_products_getProductByCodigo } from "../api/products/apiProducts";
import { api_vendedores_getCarritoUnificado } from "../api/vendedores/apiVendedores";
import { baseLinkImages } from "../constants/links";
import { toast } from "react-toastify";

const CartContext = createContext();
const normalizeProductData = (data) => {
  if (!data) return null;

  // Si data tiene un campo MAESTRO anidado (común en carrito unificado), extraerlo
  const maestro = data.MAESTRO && Array.isArray(data.MAESTRO) ? data.MAESTRO[0] : (data.MAESTRO || {});
  const combined = { ...data, ...maestro };

  // Nombres: Priorizar prefijo DMA_, luego ITEM_, luego NAME
  const name = combined.DMA_NOMBREITEM || combined.ITEM_NAME || combined.PRODUCT_NAME || combined.NAME || combined.nombre || combined.producto || combined.PRODUCT_CODE || "Producto";

  // Imágenes: Revisar múltiples campos y formatos, y convertir a URL completa
  const imagePath = combined.DMA_RUTAIMAGEN || combined.DMA_RUTAIMAGENPNG || combined.IMAGE_URL || combined.IMAGE || combined.ruta_imagen || combined.imagen || "";
  const image = imagePath && !imagePath.startsWith('http') ? `${baseLinkImages}${imagePath}` : imagePath;

  // Marcas
  const brand = combined.DMA_MARCA || combined.BRAND || combined.MARCA || combined.marca || "Sin marca";

  // Precios: PRIORIDAD dma_PRECIO (nuevo backend), luego los anteriores
  const rawPrice = combined.dma_PRECIO || combined.DMA_PRECIO || combined.DMA_COSTO || combined.PRICE || combined.COSTO || combined.precio || combined.DMA_PRECIOMAX || 0;
  const price = !isNaN(parseFloat(rawPrice)) ? parseFloat(rawPrice) : 0;

  // Stock
  const rawStock = combined.DMA_STOCK || combined.STOCK || combined.stock || combined.DMA_EXISTENCIA || combined.QUANTITY_AVAILABLE || 0;
  const stock = !isNaN(parseInt(rawStock)) ? parseInt(rawStock) : 0;

  // Código de Barras: VITAL para B2B Price Map
  const codigoBarras = combined.DMA_CODIGOBARRAS || combined.BARCODE || combined.CODIGO_BARRAS || combined.barcode || combined.EAN || combined.UPC || combined.id || null;

  // Línea de Negocio
  const lineaNegocio = combined.DMA_LINEANEGOCIO || combined.BUSINESS_LINE || combined.LINEA_NEGOCIO || combined.linea || "DEFAULT";

  return {
    name,
    image,
    imagePath,
    brand,
    price,
    stock,
    codigoBarras,
    lineaNegocio
  };
};

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [cartIds, setCartIds] = useState({}); // Múltiples cartIds por empresa
  const skipAutoSyncRef = useRef(false); // Ref para evitar sincronización automática durante checkout
  const sellerCartIdsRef = useRef({}); // Ref para cartIds del vendedor
  const sellerCartClientAccountRef = useRef({}); // Ref para ACCOUNT_USER del cliente por empresa
  const [selectedClientName, setSelectedClientName] = useState(""); // Nombre del cliente seleccionado para vendedores
  const hasRecoveredSellerCartRef = useRef(false);

  const { user, isClient, isSeller, isB2CSeller, isB2BSeller, isVisualizacion } = useAuth();


  // Hidratar los refs del vendedor desde sessionStorage al montar
  // Necesario porque StrictMode desmonta y remonta CartProvider, borrando los refs
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      if (stored.cartIds) {
        Object.entries(stored.cartIds).forEach(([k, v]) => { sellerCartIdsRef.current[k] = v; });
      }
      if (stored.clientAccounts) {
        Object.entries(stored.clientAccounts).forEach(([k, v]) => { sellerCartClientAccountRef.current[k] = v; });
      }
      if (stored.clientName) {
        setSelectedClientName(stored.clientName);
      }
      if (Object.keys(stored).length > 0) {
        // Hydrated
      }
    } catch (e) {
      // ignore
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateCartTotal = (cart) => {
    // Agrupa los productos por empresa
    const grouped = {};
    cart.forEach((item) => {
      const company = item.empresaId || "Sin empresa";
      if (!grouped[company]) grouped[company] = [];
      grouped[company].push(item);
    });

    let total = 0;

    // Obtener descuentos extra de la oferta si es vendedor
    const offerData = isB2BSeller ? JSON.parse(sessionStorage.getItem("ofertaVendedor") || "{}") : null;

    const extraProductDiscounts = offerData?.items || {};
    const extraTotalDiscount = offerData?.total || 0;

    Object.entries(grouped).forEach(([company, items]) => {
      // 1. Subtotal sin descuentos
      const rawSubtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      // 2. Total de descuentos promocionales (por producto) + descuentos extra de la oferta
      const totalPromotionalAndExtraProductDiscount = items.reduce(
        (acc, item) => {
          const promoPct = (Number(item.promotionalDiscount) || 0);
          const extraPct = (Number(extraProductDiscounts[item.id]) || 0);
          // Los descuentos suelen ser acumulativos o sobre el precio base. 
          // Aquí los sumamos como porcentajes del precio base por simplicidad, 
          // o puedes encadenarlos. El requerimiento dice "descuento extra".
          const totalPct = (promoPct + extraPct) / 100;

          return acc + (item.price * item.quantity * totalPct);
        },
        0
      );

      // 3. Subtotal después de descuentos promocionales y extra
      const subtotalAfterPromoAndExtra = rawSubtotal - totalPromotionalAndExtraProductDiscount;
      // 4. Descuento general (usuario) sobre el subtotal con promo
      const userDiscount = user?.DESCUENTOS?.[company];
      const userDiscountNum = typeof userDiscount === 'number' ? userDiscount : 0;
      const generalDiscount = subtotalAfterPromoAndExtra * (userDiscountNum / 100);
      // 5. Subtotal después de descuento general
      const subtotalAfterGeneral = subtotalAfterPromoAndExtra - generalDiscount;
      // 6. Descuento especial (coordinadora) sobre el subtotal con promo y general
      const aditionalDiscount = 0;
      const subtotalAfterAditional = subtotalAfterGeneral - aditionalDiscount;

      // 6.1 Aplicar descuento extra al TOTAL si existe (solo para vendedores)
      const totalDiscountValue = subtotalAfterAditional * (extraTotalDiscount / 100);
      const subtotalFinalConDescuentoTotal = subtotalAfterAditional - totalDiscountValue;

      // 7. IVA (si tienes un valor por empresa, úsalo, si no, pon 0)
      const ivaPct = user?.IVA || TAXES.IVA_PERCENTAGE;
      const valorIVA =
        (subtotalFinalConDescuentoTotal < 0 ? 0 : subtotalFinalConDescuentoTotal) *
        (ivaPct / 100);
      // 8. Total con IVA
      const totalConIva =
        (subtotalFinalConDescuentoTotal < 0 ? 0 : subtotalFinalConDescuentoTotal) + valorIVA;

      total += totalConIva;
    });

    return total;
  };

  // Función para cargar el carrito desde la API
  const loadCartFromAPI = useCallback(
    async (forceReplace = false) => {
      let accountToFetch = user?.ACCOUNT_USER;

      // Para vendedores con cliente seleccionado, usar el endpoint unificado (B2B) o el normal con la cuenta del cliente
      if (isSeller) {
        const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
        const clientAccounts = stored.clientAccounts || {};
        const enterprises = Object.keys(clientAccounts);

        if (enterprises.length > 0) {
          const clientAccount = clientAccounts[enterprises[0]];
          if (clientAccount) {
            if (isB2BSeller) {
              return await fetchUnifiedCartForB2B(clientAccount);
            } else {
              // Para B2C Seller, guardamos la cuenta del cliente para usarla abajo
              accountToFetch = clientAccount;
            }
          }
        }
      }

      if (!accountToFetch) {
        return;
      }

      setIsLoading(true);
      setIsHydrating(true);
      try {
        const response = await api_cart_getCarrito(accountToFetch);

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
          if (forceReplace) {
            skipAutoSyncRef.current = true;
            setCart(allCartItems);
            setTimeout(() => {
              skipAutoSyncRef.current = false;
            }, 1000);
          } else {
            setCart((prevCart) => {
              // Si la API no devuelve nada, solo conservamos lo que sea local y nuevo
              if (allCartItems.length === 0) {
                return prevCart.filter(item => !item.idShoppingCartDetail);
              }

              const mergedMap = new Map();

              // 1. La API es la fuente de verdad para items que ya están sincronizados
              allCartItems.forEach((item) => {
                const key = `${item.empresaId || "DEFAULT"}-${item.id}`;
                mergedMap.set(key, item);
              });

              // 2. Conservar items locales que son NUEVOS (sin ID de detalle) 
              // y que no están ya en la respuesta de la API (por si acaso)
              prevCart.forEach((localItem) => {
                const key = `${localItem.empresaId || "DEFAULT"}-${localItem.id}`;
                if (!localItem.idShoppingCartDetail && !mergedMap.has(key)) {
                  mergedMap.set(key, localItem);
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
        setIsHydrating(false);
      }
    },
    [user?.ACCOUNT_USER]
  );

  // Cargar automáticamente el carrito cuando el usuario esté disponible
  useEffect(() => {
    if (user?.ACCOUNT_USER && (isClient || isSeller) && !isVisualizacion) {
      loadCartFromAPI();
    }
  }, [user?.ACCOUNT_USER, isClient, isSeller, isVisualizacion, loadCartFromAPI]);

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
        const cartId = isSeller ? (sellerCartIdsRef.current[enterprise] || cartIds[enterprise]) : cartIds[enterprise];
        const clientAccount = isSeller ? (sellerCartClientAccountRef.current[enterprise] || user?.ACCOUNT_USER) : user?.ACCOUNT_USER;

        try {
          const carritoData = {
            ENTERPRISE: enterprise,
            ACCOUNT_USER: clientAccount,
            PRODUCTOS: productos,
          };


          let response;
          if (!cartId || !clientAccount) {
            // Si no hay cartId o cuenta para esta empresa, no podemos sincronizar
            return;
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
    // Además, evitar sincronización estándar para vendedores (tienen su propio useEffect)
    if (Object.keys(cartIds).length > 0 && user?.ACCOUNT_USER && !isSeller) {
      // Usar un debounce para evitar demasiadas llamadas a la API
      const timeoutId = setTimeout(() => {
        syncCartWithAPI(cart);
      }, 500); // Esperar 500ms después del último cambio

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [cart, cartIds, user?.ACCOUNT_USER]);

  // Sincronizar carrito del VENDEDOR (B2B y B2C) con la API
  // Usa refs para cartId y ACCOUNT_USER del cliente (datos del header de createCarrito),
  // que persisten aunque loadCartFromAPI borre el estado cartIds.
  useEffect(() => {
    if (!isSeller || skipAutoSyncRef.current) {
      return;
    }

    // Agrupar productos por empresa
    const productsByEnterprise = {};

    // Asegurar que todas las empresas que tienen un cartId registrado se incluyan (incluso con array vacío)
    Object.keys(sellerCartIdsRef.current).forEach(ent => {
      productsByEnterprise[ent] = [];
    });

    cart.forEach((item) => {
      const enterprise = item.empresaId || user?.EMPRESAS?.[0] || "";
      if (!enterprise) return;
      if (!productsByEnterprise[enterprise]) productsByEnterprise[enterprise] = [];
      productsByEnterprise[enterprise].push({
        PRODUCT_CODE: item.id,
        QUANTITY: item.quantity,
        PRICE: item.price,
      });
    });

    const timeoutId = setTimeout(async () => {
      const hasItemsWithoutDetailId = cart.some((item) => !item.idShoppingCartDetail);

      const syncPromises = Object.entries(productsByEnterprise).map(
        async ([enterprise, productos]) => {
          const cartId = sellerCartIdsRef.current[enterprise];
          const clientAccount = sellerCartClientAccountRef.current[enterprise];
          if (!cartId || !clientAccount) {
            return;
          }
          try {
            const payload = {
              ENTERPRISE: enterprise,
              ACCOUNT_USER: clientAccount,
              PRODUCTOS: productos,
            };

            // El usuario indicó usar el cartId (header.ID_SHOPPING_CART_HEADER) para el endpoint patch
            const response = await api_cart_updateCarrito(cartId, payload);
          } catch (e) {
            /* silent catch */
          }
        }
      );

      await Promise.all(syncPromises);

      // Si hay items sin idShoppingCartDetail, forzar una recarga rápida
      // para obtener los IDs del backend
      if (hasItemsWithoutDetailId) {
        const recoverCart = async () => {
          const stored = JSON.parse(sessionStorage.getItem("sellerCartData") || "{}");
          const clientAccounts = stored.clientAccounts || {};
          for (const enterprise of Object.keys(clientAccounts)) {
            const clientAccount = clientAccounts[enterprise];
            const cartResult = await api_cart_createCarrito(clientAccount, enterprise);
            if (cartResult?.success && cartResult?.data?.details) {
              await loadSellerCartFromDetails(cartResult.data.details, enterprise);
            }
          }
        };
        setTimeout(recoverCart, 500);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, isSeller]);


  // Agregar producto al carrito con verificación de rol
  const addToCart = async (product, quantity = 1) => {
    // Solo clientes y vendedores pueden agregar al carrito (no visualización ni otros roles)
    if ((!isClient && !isSeller) || isVisualizacion) {
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
        const normalized = normalizeProductData(apiProduct);

        productData = {
          id: product.id,
          name: normalized.name || product.name,
          discount: product.discount || 0,
          price: isSeller
            ? (product.price ?? normalized.price ?? 0)
            : (normalized.price ?? product.price ?? 0),
          image: normalized.image || product.image,
          empresaId: enterprise,
          stock: normalized.stock || product.stock || 0,
          brand: normalized.brand || product.brand || "Sin marca",
          iva: product.iva || TAXES.IVA_PERCENTAGE,
          promotionalDiscount:
            apiProduct.DMA_DESCUENTO_PROMOCIONAL ||
            product.promotionalDiscount ||
            0,
          lineaNegocio: normalized.lineaNegocio || product.lineaNegocio || "DEFAULT",
          codigoBarras: normalized.codigoBarras || product.codigoBarras || product.barcode || null,
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
          const currentItem = prevCart[existingProductIndex];
          const totalRequested = currentItem.quantity + quantity;
          const availableStock = productData.stock || 0;

          // Validar contra stock
          let finalQuantity = totalRequested;
          if (totalRequested > availableStock) {
            finalQuantity = availableStock;
            console.warn(`⚠️ Cantidad limitada al stock disponible (${availableStock}) para el producto ${dataToSave.id}`);
            toast.warn(`Solo hay ${availableStock} unidades disponibles. Se ha ajustado la cantidad en el carrito.`);
          }

          // Si el producto ya existe, crear una nueva copia del carrito
          const updatedCart = [...prevCart];
          // Actualizar la cantidad y también refrescar los datos del producto
          // Mantener idShoppingCartDetail si ya existe
          updatedCart[existingProductIndex] = {
            ...dataToSave,
            idShoppingCartDetail: currentItem.idShoppingCartDetail,
            quantity: finalQuantity,
          };
          newCart = updatedCart;
        } else {
          // Si es un producto nuevo, validar stock inicial
          const availableStock = dataToSave.stock || 0;
          if (quantity > availableStock) {
            dataToSave.quantity = availableStock;
            toast.warn(`Solo hay ${availableStock} unidades disponibles. Se ha ajustado la cantidad.`);
          }
          newCart = [...prevCart, dataToSave];
        }

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
        codigoBarras: product.codigoBarras || product.barcode || null,
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
          const currentItem = prevCart[existingProductIndex];
          const totalRequested = currentItem.quantity + quantity;
          const availableStock = dataToSave.stock || 0;

          let finalQuantity = totalRequested;
          if (totalRequested > availableStock) {
            finalQuantity = availableStock;
            toast.warn(`Stock insuficiente. Cantidad ajustada a ${availableStock}.`);
          }

          // Si el producto ya existe, crear una nueva copia del carrito
          const updatedCart = [...prevCart];
          // Actualizar solo la cantidad del producto existente
          // Mantener idShoppingCartDetail si ya existe
          updatedCart[existingProductIndex] = {
            ...updatedCart[existingProductIndex],
            quantity: finalQuantity,
          };
          newCart = updatedCart;
        } else {
          // Si es un producto nuevo, añadirlo al carrito
          const availableStock = dataToSave.stock || 0;
          let finalQuantity = quantity;
          if (quantity > availableStock) {
            finalQuantity = availableStock;
            toast.warn(`Stock insuficiente. Cantidad ajustada a ${availableStock}.`);
          }
          newCart = [...prevCart, { ...dataToSave, quantity: finalQuantity }];
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
  const removeFromCart = async (productId, empresaId = null) => {
    // Buscar el item para obtener su ID de detalle si lo tiene
    const itemToRemove = cart.find(
      (item) => item.id === productId && (!empresaId || item.empresaId === empresaId)
    );

    if (!itemToRemove) return;

    // Filtrar el carrito localmente
    const newCart = cart.filter(
      (item) => !(item.id === productId && (!empresaId || item.empresaId === empresaId))
    );

    setCart(newCart);


    // Si el item tiene un id de detalle válido, eliminarlo del backend explícitamente
    if (itemToRemove.idShoppingCartDetail) {
      try {
        await api_cart_deleteProductsFromCart([itemToRemove.idShoppingCartDetail]);
      } catch (error) {
        console.error("❌ Error al eliminar el producto del backend:", error);
      }
    }

    // Sincronizar inmediatamente con la API
    const hasIds = isSeller ? (Object.keys(sellerCartIdsRef.current).length > 0 || Object.keys(cartIds).length > 0) : Object.keys(cartIds).length > 0;
    if (hasIds) {
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

    // Usamos el patrón: asignar dentro del callback de setCart (que recibe prevCart fresco)
    // y guardar el resultado en una variable del scope externo para sincronizar con la API.
    let updatedCart;
    setCart((prevCart) => {
      updatedCart = prevCart.map((item) => {
        if (item.id === productId) {
          const availableStock = item.stock || 0;
          let finalQuantity = newQuantity;

          // IMPORTANTE: solo restringir si el stock es conocido (> 0).
          if (availableStock > 0 && newQuantity > availableStock) {
            finalQuantity = availableStock;
            toast.warn(`Solo hay ${availableStock} unidades disponibles.`);
          }

          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
      return updatedCart;
    });

    // Sincronizar inmediatamente con la API si tenemos cartIds
    const hasIds = isSeller
      ? Object.keys(sellerCartIdsRef.current).length > 0 || Object.keys(cartIds).length > 0
      : Object.keys(cartIds).length > 0;

    if (hasIds && updatedCart) {
      try {
        await syncCartWithAPI(updatedCart);
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

    // Sincronizar inmediatamente con la API si tenemos cartIds
    const hasIds = isSeller ? (Object.keys(sellerCartIdsRef.current).length > 0 || Object.keys(cartIds).length > 0) : Object.keys(cartIds).length > 0;
    if (hasIds) {
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

  /**
   * Registra manualmente el ID del carrito de una empresa en cartIds.
   * Necesario cuando el carrito se crea externamente (ej. handleClientSelect para vendedores)
   * y el ID devuelto debe quedar disponible para que syncCartWithAPI pueda usarlo.
   *
   * @param {string} enterprise - Nombre de la empresa (MAXXIMUNDO, TRACTOCENTRO, etc.)
   * @param {string|number} cartId - ID del carrito creado en el backend
   */
  const registerCartIdForEnterprise = useCallback((enterprise, cartId) => {
    if (!enterprise || !cartId) return;
    setCartIds((prev) => ({ ...prev, [enterprise]: cartId }));
    sellerCartIdsRef.current[enterprise] = cartId;
  }, []);

  /**
   * Limpia todos los datos del vendedor (refs y sessionStorage).
   * Útil cuando se cambia de cliente.
   */
  const clearSellerData = useCallback(() => {
    sellerCartIdsRef.current = {};
    sellerCartClientAccountRef.current = {};
    sessionStorage.removeItem('sellerCartData');
    setSelectedClientName("");
    setCart([]);
    setCartIds({});
  }, []);

  /**
   * Registra los datos del carrito del vendedor usando los datos del header de createCarrito:
   * - cartId (ID_SHOPPING_CART_HEADER)
   * - enterprise (ENTERPRISE)
   * - clientAccount (ACCOUNT_USER del CLIENTE, no del vendedor)
   * - clientName (Nombre del cliente)
   */
  const registerSellerCart = useCallback((cartId, enterprise, clientAccount, clientName) => {
    if (!cartId || !enterprise || !clientAccount) {
      return;
    }

    // Si detectamos un cliente diferente al que ya tenemos registrado,
    // limpiamos todo para empezar de cero con el nuevo cliente.
    const existingAccounts = Object.values(sellerCartClientAccountRef.current);
    if (existingAccounts.length > 0 && existingAccounts[0] !== clientAccount) {
      sellerCartIdsRef.current = {};
      sellerCartClientAccountRef.current = {};
      // No limpiamos el carrito aquí porque registerSellerCart se llama justo antes de cargar
      // los nuevos items. Pero sí limpiamos sessionStorage para que no se mezclen.
      sessionStorage.removeItem('sellerCartData');
    }

    sellerCartIdsRef.current[enterprise] = cartId;
    sellerCartClientAccountRef.current[enterprise] = clientAccount;
    if (clientName) setSelectedClientName(clientName);
    setCartIds((prev) => ({ ...prev, [enterprise]: cartId }));

    // Persistir en sessionStorage para sobrevivir re-mounts de StrictMode y navegaciones
    try {
      const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
      stored.cartIds = { ...(stored.cartIds || {}), [enterprise]: cartId };
      stored.clientAccounts = { ...(stored.clientAccounts || {}), [enterprise]: clientAccount };
      if (clientName) stored.clientName = clientName;
      sessionStorage.setItem('sellerCartData', JSON.stringify(stored));
    } catch (e) { /* ignore */ }
  }, []);

  // Función para eliminar items del carrito por idShoppingCartDetail
  const removeFromCartByDetailIds = useCallback(
    async (detailIds) => {
      if (!Array.isArray(detailIds) || detailIds.length === 0) {
        return;
      }

      const detailIdsSet = new Set(detailIds);
      const newCart = cart.filter(
        (item) => !detailIdsSet.has(item.idShoppingCartDetail) && !detailIdsSet.has(item.id)
      );

      setCart(newCart);

      // No sincronizar con la API aquí porque ya se eliminaron del backend
      // Solo actualizar el estado local
    },
    [cart]
  );

  /**
   * Carga el carrito del vendedor desde los detalles devueltos por createCarrito.
   * Llama a la API de productos para enriquecer cada item con nombre, precio, stock, etc.
   * @param {Array} details - Array de items de cartResult.data.details
   * @param {string} enterprise - Empresa (ej. "MAXXIMUNDO")
   */
  const loadSellerCartFromDetails = useCallback(async (details, enterprise) => {
    if (!Array.isArray(details) || details.length === 0) return;

    const cartItemsPromises = details.map(async (detail) => {
      try {
        let normalized = null;

        // 1. Intentar normalizar directamente desde el detalle si trae info suficiente
        const fromDetail = normalizeProductData(detail);
        if (fromDetail.name !== "Producto" && fromDetail.imagePath) {
          normalized = fromDetail;
        } else {
          // 2. Si no, consultar API de productos
          const productResponse = await api_products_getProductByCodigo(
            detail.PRODUCT_CODE,
            enterprise
          );
          if (productResponse.success && productResponse.data) {
            normalized = normalizeProductData(productResponse.data);
          }
        }

        if (normalized) {
          const mappedItem = {
            id: detail.PRODUCT_CODE,
            idShoppingCartDetail: detail.ID_SHOPPING_CART_DETAIL,
            quantity: detail.QUANTITY,
            price: normalized.price,
            name: normalized.name,
            image: normalized.image,
            empresaId: enterprise,
            stock: normalized.stock,
            brand: normalized.brand,
            discount: detail.PROMOTIONAL_DISCOUNT || detail.DISCOUNT || 0,
            iva: TAXES.IVA_PERCENTAGE,
            lineaNegocio: normalized.lineaNegocio,
            codigoBarras: normalized.codigoBarras,
          };


          return mappedItem;
        }
      } catch (e) { /* fallback null */ }

      return {
        id: detail.PRODUCT_CODE,
        idShoppingCartDetail: detail.ID_SHOPPING_CART_DETAIL,
        quantity: detail.QUANTITY,
        price: 0,
        name: detail.PRODUCT_CODE,
        image: "",
        empresaId: enterprise,
        stock: 0,
        brand: "Sin marca",
        discount: 0,
        iva: TAXES.IVA_PERCENTAGE,
        codigoBarras: null,
      };
    });

    const cartItems = (await Promise.all(cartItemsPromises)).filter(Boolean);
    if (cartItems.length === 0) return;

    // Deshabilitar auto-sync temporalmente para no re-enviar lo que ya está en backend
    skipAutoSyncRef.current = true;
    setCart((prevCart) => {
      // Mantener items de OTRAS empresas, reemplazar items de ESTA empresa
      const otherItems = prevCart.filter((item) => item.empresaId !== enterprise);
      return [...otherItems, ...cartItems];
    });
    setTimeout(() => { skipAutoSyncRef.current = false; }, 1000);
  }, []);


  const fetchInProgressRef = useRef(null);

  /**
   * Carga el carrito unificado para vendedores B2B desde el nuevo endpoint.
   * @param {string} clientAccount - Cuenta del cliente (ACCOUNT_USER)
   */
  const fetchUnifiedCartForB2B = useCallback(async (clientAccount) => {
    if (!clientAccount || !isB2BSeller) return { success: false, message: "No es B2B o falta cuenta" };

    // Evitar llamadas duplicadas SI ya hay una en curso para la misma cuenta
    if (fetchInProgressRef.current === clientAccount) {
      return { success: true, message: "Ya en proceso para esta cuenta" };
    }

    fetchInProgressRef.current = clientAccount;
    setIsLoading(true);
    setIsHydrating(true);
    try {
      const response = await api_vendedores_getCarritoUnificado(clientAccount);
      if (response.success && response.data) {
        const { header, details } = response.data;

        // Registrar el header unificado (siempre bajo AUTOLLANTA para B2B)
        const enterprise = isB2BSeller ? "AUTOLLANTA" : (header.ENTERPRISE || "AUTOLLANTA");
        registerSellerCart(
          header.ID_SHOPPING_CART_HEADER,
          enterprise,
          header.ACCOUNT_USER || clientAccount,
          selectedClientName
        );

        // Mapear detalles: usamos la información que ya viene en el endpoint unificado (DMA_STOCK) 
        // para evitar llamadas redundantes y lentas a la API de productos por cada item.
        const mappedItems = (details || []).map((item) => {
          try {
            // Normalizar el item (que ya incluye el MAESTRO con DMA_STOCK y demás info)
            const normalized = normalizeProductData(item);
            
            if (normalized) {
              return {
                id: item.PRODUCT_CODE,
                idShoppingCartDetail: item.ID_SHOPPING_CART_DETAIL || null,
                quantity: item.QUANTITY,
                price: normalized.price || item.PRICE || 0,
                name: normalized.name || item.PRODUCT_CODE,
                image: normalized.image || "",
                empresaId: enterprise,
                stock: normalized.stock || 0, // normalizeProductData ya prioriza DMA_STOCK
                brand: normalized.brand || "Sin marca",
                discount: item.PROMOTIONAL_DISCOUNT || 0,
                iva: TAXES.IVA_PERCENTAGE,
                lineaNegocio: normalized.lineaNegocio || "DEFAULT",
                promotionalDiscount: item.PROMOTIONAL_DISCOUNT || 0,
                codigoBarras: normalized.codigoBarras || null,
              };
            }
          } catch (err) {
            console.error(`❌ Error al mapear producto ${item.PRODUCT_CODE} para B2B:`, err);
          }
          return null;
        }).filter(Boolean);

        // Deshabilitar sincronización automática durante este reemplazo masivo para evitar race conditions
        skipAutoSyncRef.current = true;
        setCart(mappedItems);
        setTimeout(() => {
          skipAutoSyncRef.current = false;
        }, 1000);

        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error("Error en fetchUnifiedCartForB2B:", error);
      return { success: false, message: "Error interno" };
    } finally {
      setIsLoading(false);
      setIsHydrating(false);
      fetchInProgressRef.current = null;
    }
  }, [isB2BSeller, isSeller, registerSellerCart, selectedClientName]);

  // Recuperar carrito del vendedor al montar o recargar
  // Centralizado en el Contexto para que funcione en Catálogo, Carrito, etc.
  useEffect(() => {
    // Solo para vendedores y cuando el carrito está vacío (posible recarga inicial)
    if (!isSeller || cart.length > 0 || hasRecoveredSellerCartRef.current) return;

    hasRecoveredSellerCartRef.current = true;

    const recoverCart = async () => {
      setIsLoading(true);
      setIsHydrating(true);
      try {
        const stored = JSON.parse(sessionStorage.getItem('sellerCartData') || '{}');
        const clientAccounts = stored.clientAccounts || {};
        const enterprises = Object.keys(clientAccounts);

        if (enterprises.length === 0) {
          setIsLoading(false);
          return;
        }

        for (const enterprise of enterprises) {
          const clientAccount = clientAccounts[enterprise];
          if (!clientAccount) continue;

          const cartResult = await api_cart_createCarrito(clientAccount, enterprise);

          if (cartResult?.success && cartResult?.data) {
            const header = cartResult.data.header;
            const details = cartResult.data.details;

            if (header?.ID_SHOPPING_CART_HEADER) {
              registerSellerCart(header.ID_SHOPPING_CART_HEADER, enterprise, clientAccount);
            }

            if (Array.isArray(details) && details.length > 0) {
              await loadSellerCartFromDetails(details, enterprise);
            }
          }
        }
      } catch (e) {
        // silent catch
      } finally {
        setIsLoading(false);
        setIsHydrating(false);
      }
    };

    recoverCart();
  }, [isSeller, cart.length, registerSellerCart, loadSellerCartFromDetails]);

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
    registerCartIdForEnterprise,
    registerSellerCart,
    selectedClientName,
    clearSellerData,
    fetchUnifiedCartForB2B,
    loadSellerCartFromDetails,
    cartIds,
    isSeller,
    isB2BSeller,
    isB2CSeller,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    hasItems: cart.length > 0, // Indicador simple de si hay items
    isHydrating,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
