export const pedidosMock = [
  {
    id: "ORD-2025-1001",
    fecha: new Date(2025, 3, 5), // 5 de abril de 2025
    estado: "Pendiente",
    cliente: {
      id: "CLI001",
      nombre: "Juan Pérez",
      email: "juan.perez@example.com",
      telefono: "555-123-4567",
      ruc: "0987654321001",
      empresaNombre: "AutopartesPro"
    },
    empresaId: "autollanta",
    empresaNombre: "Autollanta",
    total: 1250.75,
    items: [
      {
        id: 1,
        nombre: "Neumático Fortune FSR-303 225/65R17",
        sku: "FSR303-22565",
        precio: 129.99,
        cantidad: 4,
        descuento: 5,
        subtotal: 494.96,
        imagen: "https://via.placeholder.com/100x100?text=Fortune+FSR303"
      },
      {
        id: 2,
        nombre: "Neumático Roadcruza RA1100 265/70R16",
        sku: "RA1100-26570",
        precio: 145.75,
        cantidad: 2,
        descuento: 0,
        subtotal: 291.50,
        imagen: "https://via.placeholder.com/100x100?text=Roadcruza+RA1100"
      }
    ],
    envio: {
      direccion: {
        calle: "Av. Principal 123",
        ciudad: "Guayaquil",
        provincia: "Guayas",
        codigoPostal: "090150",
        esNueva: false
      },
      costoEnvio: 35.00,
      metodoEnvio: "Estándar"
    },
    subtotal: 786.46,
    descuento: 24.75,
    impuestos: 94.37,
    observaciones: "",
    historial: [
      {
        fecha: new Date(2025, 3, 5, 10, 30),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      }
    ]
  },
  {
    id: "ORD-2025-1002",
    fecha: new Date(2025, 3, 7), // 7 de abril de 2025
    estado: "En proceso",
    cliente: {
      id: "CLI002",
      nombre: "María González",
      email: "maria.gonzalez@example.com",
      telefono: "555-987-6543",
      ruc: "1234567890001",
      empresaNombre: "TallerMecánico Express"
    },
    empresaId: "maxximundo",
    empresaNombre: "Maxximundo",
    total: 785.30,
    items: [
      {
        id: 3,
        nombre: "Aceite Shell Helix Ultra 5W-40 4L",
        sku: "SH-5W40-4L",
        precio: 58.90,
        cantidad: 10,
        descuento: 10,
        subtotal: 530.10,
        imagen: "https://via.placeholder.com/100x100?text=Shell+Helix"
      },
      {
        id: 4,
        nombre: "Neumático Maxxis AT980E 245/75R16",
        sku: "MX-AT980-24575",
        precio: 189.99,
        cantidad: 1,
        descuento: 0,
        subtotal: 189.99,
        imagen: "https://via.placeholder.com/100x100?text=Maxxis+AT980E"
      }
    ],
    envio: {
      direccion: {
        calle: "Calle Comercial 456",
        ciudad: "Quito",
        provincia: "Pichincha",
        codigoPostal: "170150",
        esNueva: true
      },
      costoEnvio: 25.00,
      metodoEnvio: "Estándar"
    },
    subtotal: 720.09,
    descuento: 53.01,
    impuestos: 93.22,
    observaciones: "Cliente solicita entrega en horario matutino",
    historial: [
      {
        fecha: new Date(2025, 3, 7, 14, 15),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 8, 9, 20),
        estado: "En proceso",
        usuario: "Coord-002",
        comentario: "Pedido en preparación"
      }
    ]
  },
  {
    id: "ORD-2025-1003",
    fecha: new Date(2025, 3, 8), // 8 de abril de 2025
    estado: "En proceso con observación",
    cliente: {
      id: "CLI003",
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
      telefono: "555-456-7890",
      ruc: "1098765432001",
      empresaNombre: "Lubricantes del Valle"
    },
    empresaId: "stox",
    empresaNombre: "Stox",
    total: 926.50,
    items: [
      {
        id: 5,
        nombre: "Neumático Hahua HH301 205/60R16",
        sku: "HH301-20560",
        precio: 92.50,
        cantidad: 8,
        descuento: 5,
        subtotal: 703.00,
        imagen: "https://via.placeholder.com/100x100?text=Hahua+HH301"
      },
      {
        id: 6,
        nombre: "Aro RimTech Sport R17 Negro Mate",
        sku: "RT-R17-BK",
        precio: 210.00,
        cantidad: 1,
        descuento: 0,
        subtotal: 210.00,
        imagen: "https://via.placeholder.com/100x100?text=RimTech+R17"
      }
    ],
    envio: {
      direccion: {
        calle: "Av. Industrial 789",
        ciudad: "Cuenca",
        provincia: "Azuay",
        codigoPostal: "010150",
        esNueva: false
      },
      costoEnvio: 40.00,
      metodoEnvio: "Express"
    },
    subtotal: 913.00,
    descuento: 35.15,
    impuestos: 108.65,
    observaciones: "Stock insuficiente de neumáticos, se contactó al cliente para confirmar despacho parcial",
    historial: [
      {
        fecha: new Date(2025, 3, 8, 11, 45),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 9, 8, 30),
        estado: "En proceso",
        usuario: "Coord-003",
        comentario: "Verificando stock"
      },
      {
        fecha: new Date(2025, 3, 9, 10, 15),
        estado: "En proceso con observación",
        usuario: "Coord-003",
        comentario: "Solo hay 6 unidades disponibles de HH301-20560"
      }
    ]
  },
  {
    id: "ORD-2025-1004",
    fecha: new Date(2025, 3, 6), // 6 de abril de 2025
    estado: "Rechazado",
    cliente: {
      id: "CLI004",
      nombre: "Ana Martínez",
      email: "ana.martinez@example.com",
      telefono: "555-789-0123",
      ruc: "2109876543001",
      empresaNombre: "Autopartes Cruz"
    },
    empresaId: "autollanta",
    empresaNombre: "Autollanta",
    total: 2340.20,
    items: [
      {
        id: 7,
        nombre: "Neumático Fortune FSR-201 195/55R15",
        sku: "FSR201-19555",
        precio: 89.50,
        cantidad: 20,
        descuento: 0,
        subtotal: 1790.00,
        imagen: "https://via.placeholder.com/100x100?text=Fortune+FSR201"
      }
    ],
    envio: {
      direccion: {
        calle: "Calle Principal 234",
        ciudad: "Machala",
        provincia: "El Oro",
        codigoPostal: "070150",
        esNueva: true
      },
      costoEnvio: 120.00,
      metodoEnvio: "Envío a provincia"
    },
    subtotal: 1790.00,
    descuento: 0.00,
    impuestos: 214.80,
    observaciones: "El cliente no tiene historial crediticio aprobado para pedidos de este volumen",
    historial: [
      {
        fecha: new Date(2025, 3, 6, 9, 10),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 7, 11, 20),
        estado: "En proceso",
        usuario: "Coord-001",
        comentario: "Verificando aprobación de crédito"
      },
      {
        fecha: new Date(2025, 3, 7, 14, 45),
        estado: "Rechazado",
        usuario: "Coord-001",
        comentario: "No aprobado por departamento de crédito"
      }
    ]
  },
  {
    id: "ORD-2025-1005",
    fecha: new Date(2025, 3, 3), // 3 de abril de 2025
    estado: "Cancelado por cliente",
    cliente: {
      id: "CLI005",
      nombre: "Pedro Sánchez",
      email: "pedro.sanchez@example.com",
      telefono: "555-234-5678",
      ruc: "3210987654001",
      empresaNombre: "Taller Automotriz P&S"
    },
    empresaId: "maxximundo",
    empresaNombre: "Maxximundo",
    total: 476.95,
    items: [
      {
        id: 8,
        nombre: "Neumático CST Adreno AT 235/75R15",
        sku: "CST-235-75",
        precio: 132.75,
        cantidad: 3,
        descuento: 0,
        subtotal: 398.25,
        imagen: "https://via.placeholder.com/100x100?text=CST+Adreno"
      }
    ],
    envio: {
      direccion: {
        calle: "Av. Los Ríos 567",
        ciudad: "Ambato",
        provincia: "Tungurahua",
        codigoPostal: "180150",
        esNueva: false
      },
      costoEnvio: 30.00,
      metodoEnvio: "Estándar"
    },
    subtotal: 398.25,
    descuento: 0.00,
    impuestos: 47.79,
    observaciones: "Cliente solicitó cancelación debido a que encontró mejor precio",
    historial: [
      {
        fecha: new Date(2025, 3, 3, 15, 20),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 4, 10, 45),
        estado: "En proceso",
        usuario: "Coord-002",
        comentario: "Verificando stock"
      },
      {
        fecha: new Date(2025, 3, 5, 9, 30),
        estado: "Cancelado por cliente",
        usuario: "Coord-002",
        comentario: "Cliente solicitó cancelación vía telefónica"
      }
    ]
  },
  {
    id: "ORD-2025-1006",
    fecha: new Date(2025, 3, 1), // 1 de abril de 2025
    estado: "Completado",
    cliente: {
      id: "CLI006",
      nombre: "Luis Morales",
      email: "luis.morales@example.com",
      telefono: "555-345-6789",
      ruc: "4321098765001",
      empresaNombre: "Autoservicio Morales"
    },
    empresaId: "automax",
    empresaNombre: "Automax",
    total: 1827.25,
    items: [
      {
        id: 9,
        nombre: "Neumático Cost Roadmax 31x10.5R15",
        sku: "COST-31-10.5",
        precio: 168.75,
        cantidad: 8,
        descuento: 5,
        subtotal: 1283.00,
        imagen: "https://via.placeholder.com/100x100?text=Cost+Roadmax"
      },
      {
        id: 10,
        nombre: "Neumático Cost EcoSport 185/70R14",
        sku: "COST-185-70",
        precio: 69.99,
        cantidad: 5,
        descuento: 10,
        subtotal: 314.95,
        imagen: "https://via.placeholder.com/100x100?text=Cost+EcoSport"
      }
    ],
    envio: {
      direccion: {
        calle: "Carretera Principal km 5",
        ciudad: "Santo Domingo",
        provincia: "Santo Domingo de los Tsáchilas",
        codigoPostal: "230150",
        esNueva: false
      },
      costoEnvio: 50.00,
      metodoEnvio: "Express"
    },
    subtotal: 1597.95,
    descuento: 95.75,
    impuestos: 180.05,
    observaciones: "Cliente frecuente, entrega priorizada",
    historial: [
      {
        fecha: new Date(2025, 3, 1, 8, 15),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 1, 10, 30),
        estado: "En proceso",
        usuario: "Coord-004",
        comentario: "Preparando pedido"
      },
      {
        fecha: new Date(2025, 3, 2, 9, 20),
        estado: "Despachado",
        usuario: "Coord-004",
        comentario: "Pedido enviado con Servientrega"
      },
      {
        fecha: new Date(2025, 3, 4, 14, 50),
        estado: "Completado",
        usuario: "Coord-004",
        comentario: "Cliente confirmó recepción"
      }
    ]
  },
  {
    id: "ORD-2025-1007",
    fecha: new Date(2025, 3, 4), // 4 de abril de 2025
    estado: "Despachado",
    cliente: {
      id: "CLI007",
      nombre: "Carmen Flores",
      email: "carmen.flores@example.com",
      telefono: "555-456-7890",
      ruc: "5432109876001",
      empresaNombre: "Taller Flores & Hijos"
    },
    empresaId: "ikonix",
    empresaNombre: "Ikonix",
    total: 637.84,
    items: [
      {
        id: 11,
        nombre: "Taladro Inalámbrico Uyustools 20V",
        sku: "UYU-TAL-20V",
        precio: 145.00,
        cantidad: 2,
        descuento: 15,
        subtotal: 246.50,
        imagen: "https://via.placeholder.com/100x100?text=Uyustools+Taladro"
      },
      {
        id: 12,
        nombre: "Juego de Llaves Uyustools 40 piezas",
        sku: "UYU-LLA-40",
        precio: 89.90,
        cantidad: 3,
        descuento: 0,
        subtotal: 269.70,
        imagen: "https://via.placeholder.com/100x100?text=Uyustools+Llaves"
      }
    ],
    envio: {
      direccion: {
        calle: "Calle Sucre 123",
        ciudad: "Riobamba",
        provincia: "Chimborazo",
        codigoPostal: "060150",
        esNueva: true
      },
      costoEnvio: 45.00,
      metodoEnvio: "Estándar"
    },
    subtotal: 516.20,
    descuento: 36.97,
    impuestos: 67.61,
    observaciones: "En tránsito, entrega estimada para el 11/04/2025",
    historial: [
      {
        fecha: new Date(2025, 3, 4, 16, 10),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      },
      {
        fecha: new Date(2025, 3, 5, 10, 45),
        estado: "En proceso",
        usuario: "Coord-005",
        comentario: "Preparando pedido"
      },
      {
        fecha: new Date(2025, 3, 9, 14, 30),
        estado: "Despachado",
        usuario: "Coord-005",
        comentario: "Enviado con Tramaco, guía #TR-789456"
      }
    ]
  },
  {
    id: "ORD-2025-1008",
    fecha: new Date(2025, 3, 9), // 9 de abril de 2025
    estado: "Pendiente",
    cliente: {
      id: "CLI008",
      nombre: "Roberto Díaz",
      email: "roberto.diaz@example.com",
      telefono: "555-567-8901",
      ruc: "6543210987001",
      empresaNombre: "Lubricentro Díaz"
    },
    empresaId: "maxximundo",
    empresaNombre: "Maxximundo",
    total: 393.22,
    items: [
      {
        id: 13,
        nombre: "Refrigerante Shell Anticongelante 50/50 3.78L",
        sku: "SH-ANTI-3.78",
        precio: 22.99,
        cantidad: 15,
        descuento: 0,
        subtotal: 344.85,
        imagen: "https://via.placeholder.com/100x100?text=Shell+Anticongelante"
      }
    ],
    envio: {
      direccion: {
        calle: "Av. 9 de Octubre 234",
        ciudad: "Guayaquil",
        provincia: "Guayas",
        codigoPostal: "090150",
        esNueva: false
      },
      costoEnvio: 15.00,
      metodoEnvio: "Económico"
    },
    subtotal: 344.85,
    descuento: 0.00,
    impuestos: 41.38,
    observaciones: "",
    historial: [
      {
        fecha: new Date(2025, 3, 9, 13, 25),
        estado: "Pendiente",
        usuario: "Sistema",
        comentario: "Pedido recibido"
      }
    ]
  }
];

export const empresasDisponibles = [
  { id: "autollanta", nombre: "Autollanta" },
  { id: "maxximundo", nombre: "Maxximundo" },
  { id: "stox", nombre: "Stox" },
  { id: "automax", nombre: "Automax" },
  { id: "ikonix", nombre: "Ikonix" }
];

export const estadosPedido = [
  { id: "Pendiente", nombre: "Pendiente", color: "#FFC107" },
  { id: "En proceso", nombre: "En proceso", color: "#03A9F4" },
  { id: "En proceso con observación", nombre: "En proceso con observación", color: "#FF9800" },
  { id: "Rechazado", nombre: "Rechazado", color: "#F44336" },
  { id: "Cancelado por cliente", nombre: "Cancelado por cliente", color: "#9E9E9E" },
  { id: "Completado", nombre: "Completado", color: "#4CAF50" },
  { id: "Despachado", nombre: "Despachado", color: "#3F51B5" }
];