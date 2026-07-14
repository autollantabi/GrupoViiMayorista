import React, { useRef, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import ProductCard from "./ProductCard";
import RenderIcon from "./RenderIcon";

const VISIBLE_ITEMS_DESKTOP = 5;

const CarouselWrapper = styled.div`
  position: relative;
`;

const Track = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 4 * 1.25rem) / ${VISIBLE_ITEMS_DESKTOP});
  gap: 1.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.25rem;

  /* Ocultar scrollbar visualmente mantiene el look "cinta" tipo ecommerce */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    scroll-snap-align: start;
    min-width: 0;
  }

  @media (max-width: 992px) {
    grid-auto-columns: calc((100% - 2 * 1rem) / 3);
    gap: 1rem;
  }

  @media (max-width: 576px) {
    grid-auto-columns: calc((100% - 0.75rem) / 2);
    gap: 0.75rem;
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  ${({ $direction }) => ($direction === "left" ? "left: -18px;" : "right: -18px;")}
  z-index: 3;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid
    ${({ theme }) =>
        theme.mode === "dark" ? `${theme.colors.border}40` : `${theme.colors.border}30`};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-50%) scale(1.08);
  }

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    ${({ $direction }) => ($direction === "left" ? "left: -10px;" : "right: -10px;")}
  }
`;

const RelatedProductsCarousel = ({ products = [] }) => {
    const trackRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateArrowState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateArrowState();
        const el = trackRef.current;
        if (!el) return;

        el.addEventListener("scroll", updateArrowState, { passive: true });
        window.addEventListener("resize", updateArrowState);
        return () => {
            el.removeEventListener("scroll", updateArrowState);
            window.removeEventListener("resize", updateArrowState);
        };
    }, [updateArrowState, products]);

    const scrollByPage = (direction) => {
        const el = trackRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.9;
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    };

    if (!products || products.length === 0) return null;

    return (
        <CarouselWrapper>
            <ArrowButton
                type="button"
                $direction="left"
                disabled={!canScrollLeft}
                onClick={() => scrollByPage("left")}
                aria-label="Ver productos anteriores"
            >
                <RenderIcon name="FaChevronLeft" size={16} />
            </ArrowButton>

            <Track ref={trackRef}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Track>

            <ArrowButton
                type="button"
                $direction="right"
                disabled={!canScrollRight}
                onClick={() => scrollByPage("right")}
                aria-label="Ver más productos"
            >
                <RenderIcon name="FaChevronRight" size={16} />
            </ArrowButton>
        </CarouselWrapper>
    );
};

export default RelatedProductsCarousel;