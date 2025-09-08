import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Pagination,
  PageButton,
} from "../../styles/TableStyles";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import styled from "styled-components";

// Estilos para el encabezado de columna ordenable
const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  > span {
    margin-right: 8px;
  }

  > svg {
    font-size: 14px;
  }
`;

/**
 * Componente de tabla de datos reutilizable con ordenación
 * @param {Object} props - Props del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {Object} props.pagination - Configuración de paginación (opcional)
 * @param {Function} props.rowActions - Función para renderizar acciones por fila (opcional)
 * @param {boolean} props.bordered - Si la tabla debe tener bordes completos (opcional)
 * @param {boolean} props.striped - Si las filas deben tener colores alternados (opcional)
 * @param {Function} props.onRowClick - Función que se ejecuta al hacer clic en una fila (opcional)
 */
const DataTable = ({
  columns,
  data = [],
  emptyMessage = "No hay datos disponibles",
  itemsPerPage = 10,
  rowActions,
  bordered = false,
  striped = true,
  onRowClick,
  initialSortField = null, // Nueva prop para campo de ordenación inicial
  initialSortDirection = "asc",
}) => {

  // Estados para ordenación
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const [currentPage, setCurrentPage] = useState(1);

  // Función para manejar la ordenación
  const handleSort = (field) => {
    // Si hacemos clic en la columna ya ordenada, invertir dirección
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Si es una nueva columna, establecer como campo de ordenación y dirección ascendente
      setSortField(field);
      setSortDirection("asc");
    }
    // Volver a la primera página al cambiar la ordenación
    setCurrentPage(1);
  };

  // Ordenar todos los datos
  const sortedData = useMemo(() => {
    if (!sortField || !data.length) return data;

    // Encontrar la definición de la columna ordenada
    const sortColumn = columns.find((col) => col.field === sortField);
    if (!sortColumn) return data;

    // Obtener el tipo de datos para la ordenación
    const dataType = sortColumn.dataType || "text";

    return [...data].sort((a, b) => {
      // Obtener los valores a comparar
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Si la columna tiene una función de ordenación personalizada, usarla
      if (sortColumn.sortValue) {
        valueA = sortColumn.sortValue(a);
        valueB = sortColumn.sortValue(b);
      }

      // Aplicar la lógica de ordenación según el tipo de datos
      let comparison = 0;

      switch (dataType) {
        case "number":
          comparison = (Number(valueA) || 0) - (Number(valueB) || 0);
          break;
        case "date": {
          const dateA = valueA ? new Date(valueA) : new Date(0);
          const dateB = valueB ? new Date(valueB) : new Date(0);
          comparison = dateA - dateB;
          break;
        }
        default: {
          // 'text'
          const strA = String(valueA || "").toLowerCase();
          const strB = String(valueB || "").toLowerCase();
          if (strA < strB) comparison = -1;
          if (strA > strB) comparison = 1;
          break;
        }
      }

      // Aplicar dirección de ordenación
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection, columns]);

  // Calcular paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Obtener los datos para la página actual después de ordenar
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <h3>No se encontraron registros</h3>
        <p>{emptyMessage}</p>
      </EmptyState>
    );
  }

  return (
    <>
      <Table $bordered={bordered}>
        <TableHeader>
          <tr>
            {columns.map((column, index) => (
              <TableHeaderCell
                key={index}
                width={column.width}
                $align={column.align}
              >
                {column.sortable !== false ? (
                  <SortableHeader onClick={() => handleSort(column.field)}>
                    <span>{column.header}</span>
                    {sortField === column.field ? (
                      sortDirection === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      )
                    ) : (
                      <FaSort />
                    )}
                  </SortableHeader>
                ) : (
                  column.header
                )}
              </TableHeaderCell>
            ))}
            {rowActions && (
              <TableHeaderCell width="120px">Acciones</TableHeaderCell>
            )}
          </tr>
        </TableHeader>
        <TableBody>
          {currentItems.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              $striped={striped}
              $clickable={!!onRowClick}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} $align={column.align}>
                  {column.render ? column.render(row) : row[column.field]}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell $align="center">{rowActions(row)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            size="small"
            text={"Primera"}
          />
          <PageButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            size="small"
            text={"Anterior"}
          />

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            // Lógica para mostrar páginas alrededor de la actual
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <PageButton
                key={pageNum}
                $active={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum)}
                size="small"
                text={pageNum}
              />
            );
          })}

          <PageButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            size="small"
            text={"Siguiente"}
          />
          <PageButton
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            size="small"
            text={"Última"}
          />
        </Pagination>
      )}
    </>
  );
};

export default DataTable;
