import React, { useState } from "react";
import { downloadBonoPDF } from "../../utils/bonoUtils";

const PDFGenerator = ({ bono, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Extraer datos del cliente desde el objeto bono
  const cliente = bono.customerRetread || {};

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      await downloadBonoPDF(bono, cliente);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Modal de confirmación */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            textAlign: "center",
            maxWidth: "400px",
            width: "90%",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: "0 0 15px 0" }}>Generar PDF del Bono</h3>
          <p style={{ margin: "0 0 20px 0", color: "#666" }}>
            Se generará un PDF con toda la información del bono y código QR
          </p>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: isGenerating ? "#ccc" : "#007bff",
                color: "white",
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? "Generando..." : "Generar PDF"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFGenerator;
