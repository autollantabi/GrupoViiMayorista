import React, { createContext, useContext, useState, useEffect } from "react";
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
  const loadCartFromAPI = async () => {    
    if (!user?.ACCOUNT_USER) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api_cart_getCarrito(user.ACCOUNT_USER);

      if (response.success && response.data && response.data.length > 0) {
        // Guardar todos los cartIds por empresa
        const newCartIds = {};
        let allCartItems = [];

        // Procesar todos los carritos de todas las empresas
        for (const cartData of response.data) {
          const enterprise = cartData.CABECERA.ENTERPRISE;
          newCartIds[enterprise] = cartData.CABECERA.ID_SHOPPING_CART_HEADER;
          
          // Obtener información completa de cada producto en este carrito
          const cartItemsPromises = cartData.DETALLE.map(async (item) => {
            try {
              
              const productResponse = await api_products_getProductByCodigo(
                item.PRODUCT_CODE,
                enterprise
              );
              
              if (productResponse.success && productResponse.data) {
                const product = productResponse.data;
                
                const cartItem = {
                  id: item.PRODUCT_CODE,
                  quantity: item.QUANTITY,
                  price: product.DMA_COSTO || 0,
                  name: product.DMA_NOMBREITEM || item.PRODUCT_CODE,
                  image: product.DMA_RUTAIMAGEN || "",
                  empresaId: enterprise,
                  stock: product.DMA_STOCK || 0,
                  brand: product.DMA_MARCA || "Sin marca",
                  discount: product.DMA_DESCUENTO_PROMOCIONAL || 0, // No hay campo de descuento en la respuesta
                  iva: TAXES.IVA_PERCENTAGE, // Usar IVA por defecto
                };
                
                return cartItem;
              } else {
                // Si no se puede obtener la información del producto, usar datos básicos
                return {
                  id: item.PRODUCT_CODE,
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
            } catch (error) {
              console.error(
                `❌ Error al obtener información del producto ${item.PRODUCT_CODE}:`,
                error
              );
              // En caso de error, usar datos básicos
              return {
                id: item.PRODUCT_CODE,
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

        setCartIds(newCartIds);
        setCart(allCartItems);
      } else {
        // Si no hay carrito en la API, mantener el carrito local como respaldo
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar el carrito desde la API:", error);
      // En caso de error, usar el carrito local como respaldo
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar carrito cuando el usuario cambie
  useEffect(() => {
    if (user?.ACCOUNT_USER) {
      loadCartFromAPI();
    }
  }, [user?.ACCOUNT_USER]);

  // Función para sincronizar el carrito con la API
  const syncCartWithAPI = async (newCart) => {

    if (!user?.ACCOUNT_USER) {
      return;
    }

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

    // Sincronizar cada carrito por empresa
    const syncPromises = Object.entries(productsByEnterprise).map(
      async ([enterprise, productos]) => {
        const cartId = cartIds[enterprise];

        // Si no hay cartId para esta empresa, significa que es un carrito nuevo
        if (!cartId) {
          return;
        }

        try {
          const carritoData = {
            ENTERPRISE: enterprise,
            ACCOUNT_USER: user.ACCOUNT_USER,
            PRODUCTOS: productos,
          };

          await api_cart_updateCarrito(cartId, carritoData);
          
          // if (response.success) {
          //   console.log(`✅ Carrito sincronizado exitosamente para ${enterprise}`);
          // } else {
          //   console.error(`❌ Error en respuesta de API para ${enterprise}:`, response);
          // }
        } catch (error) {
          console.error(
            `❌ Error al sincronizar carrito de ${enterprise} con API:`,
            error
          );
        }
      }
    );

    await Promise.all(syncPromises);
  };

  useEffect(() => {
    // Guardar carrito en localStorage como respaldo
    localStorage.setItem("cart", JSON.stringify(cart));

    // Actualizar el total del carrito
    const total = cart.reduce((sum, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + itemPrice * item.quantity;
    }, 0);

    setCartTotal(total);
  }, [cart]);

  // Sincronizar automáticamente con la API cuando cambie el carrito
  useEffect(() => {

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
  const addToCart = (product, quantity = 1) => {
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
    };

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

    setCart((prevCart) => {
      
      // Buscar si el producto ya está en el carrito
      const existingProductIndex = prevCart.findIndex(
        (item) => item.id === dataToSave.id
      );

      let newCart;
      if (existingProductIndex >= 0) {
        // Si el producto ya existe, crear una nueva copia del carrito
        const updatedCart = [...prevCart];
        // Actualizar solo la cantidad del producto existente
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
      message: "Producto añadido al carrito",
    };
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Limpiar todo el carrito
  const clearCart = () => {
    setCart([]);
  };

  const removeItemsByCompany = (companyId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.empresaId !== companyId)
    );
  };

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
    syncCartWithAPI,
    cartIds,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
