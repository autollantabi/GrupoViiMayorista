import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Modal from "./Modal";
import RenderIcon from "./RenderIcon";
import RenderLoader from "./RenderLoader";
import { useAppTheme } from "../../context/AppThemeContext";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
`;

const PageWrapper = styled.div`
  width: 100%;
  max-height: 70vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => (theme.mode === "dark" ? theme.colors.background : "#f5f5f5")};
  border-radius: 8px;

  @media (max-width: 768px) {
    max-height: 65vh;
  }

  .react-pdf__Page__canvas {
    max-width: 100%;
    height: auto !important;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PageIndicator = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 70px;
  text-align: center;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PdfViewerModal = ({ isOpen, onClose, fileUrl, title = "Ficha técnica" }) => {
  const { theme } = useAppTheme();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const wrapperRef = useRef(null);

  // Ancho real del contenedor: react-pdf necesita px, no "100%" (CSS no le sirve
  // para decidir la resolución del canvas). Esto es lo que hace el visor
  // responsive de verdad, incluido al rotar el celular.
  useEffect(() => {
    if (!isOpen) return;
    const el = wrapperRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setNumPages(null);
      setPageNumber(1);
      setLoadError(false);
    }
  }, [isOpen, fileUrl]);

  const handleLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total);
    setLoadError(false);
  }, []);

  const handleLoadError = useCallback(() => setLoadError(true), []);

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(numPages || 1, p + 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleIcon="FaFilePdf" maxWidth="900px">
      <ViewerContainer>
        <PageWrapper ref={wrapperRef}>
          {!loadError && fileUrl && (
            <Document
              file={fileUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading={
                <div style={{ padding: "3rem" }}>
                  <RenderLoader size="40px" showSpinner floatingSpinner />
                </div>
              }
            >
              {containerWidth > 0 && (
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(containerWidth, 820)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>
          )}

          {loadError && (
            <ErrorState>
              <RenderIcon name="FaFileCircleXmark" size={32} />
              <span>No se pudo cargar la ficha técnica.</span>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, fontWeight: 600 }}>
                Abrir en una pestaña nueva
              </a>
            </ErrorState>
          )}
        </PageWrapper>

        {!loadError && numPages > 1 && (
          <ControlsBar>
            <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1} aria-label="Página anterior">
              <RenderIcon name="FaChevronLeft" size={14} />
            </IconButton>
            <PageIndicator>{pageNumber} / {numPages}</PageIndicator>
            <IconButton onClick={goToNextPage} disabled={pageNumber >= numPages} aria-label="Página siguiente">
              <RenderIcon name="FaChevronRight" size={14} />
            </IconButton>
          </ControlsBar>
        )}
      </ViewerContainer>
    </Modal>
  );
};

export default PdfViewerModal;