import React, { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import RenderIcon from "./RenderIcon";
import { useAppTheme } from "../../context/AppThemeContext";

const DatePickerContainer = styled.div`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  text-align: left;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const DateInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}20`};
  border-radius: 12px;
  padding: 0.625rem 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: ${({ theme }) =>
    theme.mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) =>
      theme.mode === "dark"
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 4px 12px rgba(0, 0, 0, 0.06)"};
  }

  ${({ $isOpen, theme }) =>
    $isOpen &&
    `
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  `}
`;

const DateText = styled.span`
  flex: 1;
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: ${({ theme, $hasValue }) =>
    $hasValue ? theme.colors.text : theme.colors.textSecondary};
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme }) =>
      theme.mode === "dark"
        ? `${theme.colors.border}40`
        : `${theme.colors.border}20`};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: 1.25rem;
  width: 290px;
  animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const NavigationButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}15`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const MonthYearTitle = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayCell = styled.button`
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : "transparent"};
  color: ${({ $isSelected, $isToday, $isCurrentMonth, theme }) => {
    if ($isSelected) return "#ffffff";
    if (!$isCurrentMonth) return theme.mode === "dark" ? "#666" : "#ccc";
    if ($isToday) return theme.colors.primary;
    return theme.colors.text;
  }};
  font-weight: ${({ $isSelected, $isToday }) =>
    $isSelected || $isToday ? "700" : "500"};
  border: ${({ $isToday, $isSelected, theme }) =>
    $isToday && !$isSelected ? `1.5px solid ${theme.colors.primary}` : "none"};
  border-radius: 50%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary : `${theme.colors.primary}15`};
    color: ${({ $isSelected, theme }) =>
      $isSelected ? "#ffffff" : theme.colors.primary};
  }
`;

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEKDAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export default function DatePicker({
  label,
  value, // formato YYYY-MM-DD
  onChange,
  fullWidth = false,
}) {
  const { theme } = useAppTheme();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parsear fecha YYYY-MM-DD
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [value]);

  // Fecha que controla qué mes/año se muestra en el calendario
  const [viewDate, setViewDate] = useState(parsedDate);

  // Sincronizar viewDate con el valor seleccionado cuando cambia
  useEffect(() => {
    setViewDate(parsedDate);
  }, [parsedDate]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    );
  };

  const handleSelectDay = (dayObj) => {
    const selected = new Date(dayObj.year, dayObj.month, dayObj.day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (onChange) {
      // Simula el formato del target de HTML input para compatibilidad drop-in
      onChange({ target: { value: dateStr } });
    }
    setIsOpen(false);
  };

  // Generar la grilla de días (filler anterior + días del mes + filler posterior)
  const daysGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // día de la semana de inicio
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDaysCount = new Date(year, month, 0).getDate();

    const daysArray = [];

    // Relleno de días del mes anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthDaysCount - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Relleno de días del mes siguiente (para completar 42 celdas de cuadrícula)
    const remaining = 42 - daysArray.length;
    for (let i = 1; i <= remaining; i++) {
      daysArray.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return daysArray;
  }, [viewDate]);

  // Formato legible para el input visible
  const displayFormattedDate = useMemo(() => {
    if (!value) return "Seleccione una fecha";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }, [value]);

  const isSelected = (dayObj) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return dayObj.day === d && dayObj.month === m - 1 && dayObj.year === y;
  };

  const isToday = (dayObj) => {
    const now = new Date();
    return (
      dayObj.day === now.getDate() &&
      dayObj.month === now.getMonth() &&
      dayObj.year === now.getFullYear()
    );
  };

  return (
    <DatePickerContainer $fullWidth={fullWidth} ref={containerRef}>
      {label && <Label>{label}</Label>}
      <DateInputWrapper $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <DateText $hasValue={!!value}>{displayFormattedDate}</DateText>
        <RenderIcon name="FaCalendarDays" size={16} color={theme.colors.primary} />
      </DateInputWrapper>

      {isOpen && (
        <CalendarPopover>
          <CalendarHeader>
            <NavigationButton onClick={handlePrevMonth}>
              <RenderIcon name="FaChevronLeft" size={12} color={theme.colors.text} />
            </NavigationButton>
            <MonthYearTitle>
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </MonthYearTitle>
            <NavigationButton onClick={handleNextMonth}>
              <RenderIcon name="FaChevronRight" size={12} color={theme.colors.text} />
            </NavigationButton>
          </CalendarHeader>

          <WeekdaysRow>
            {WEEKDAY_NAMES.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </WeekdaysRow>

          <DaysGrid>
            {daysGrid.map((dayObj, index) => (
              <DayCell
                key={index}
                $isCurrentMonth={dayObj.isCurrentMonth}
                $isSelected={isSelected(dayObj)}
                $isToday={isToday(dayObj)}
                onClick={() => handleSelectDay(dayObj)}
              >
                {dayObj.day}
              </DayCell>
            ))}
          </DaysGrid>
        </CalendarPopover>
      )}
    </DatePickerContainer>
  );
}
