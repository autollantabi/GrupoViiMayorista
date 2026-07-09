import os
import re
import sys
import json
import argparse
import urllib.request
import urllib.parse
from datetime import datetime

# Intento de importar reportlab. Si falla, se muestra un mensaje informativo.
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# ==============================================================================
# 1. PARSER DEL ARCHIVO .env
# ==============================================================================
def load_env(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    # Quitar comillas si existen
                    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                        v = v[1:-1]
                    env_vars[k] = v
    return env_vars

# ==============================================================================
# 2. PROCESAMIENTO DE DATOS (Misma lógica de EstadoCuenta.jsx)
# ==============================================================================
def process_data(api_data, selected_company, today):
    if not selected_company or not api_data:
        return [], {
            "totalAbono": 0.0,
            "totalSaldoCuota": 0.0,
            "totalProtesto": 0.0,
            "documentosVencidos": 0
        }

    # Agrupar por documento para calcular maxCuota y saldoFactura
    docs_map = {}
    for item in api_data:
        doc_num = item.get("HCAD_NUMERODOCUMENTO")
        if not doc_num:
            continue
        if doc_num not in docs_map:
            docs_map[doc_num] = {
                "maxCuota": 0,
                "saldoFactura": 0.0
            }
        
        valor_cuota = float(item.get("HCAD_CUOTATOTAL") or 0.0)
        abono = float(item.get("HCAD_MONTOPAGADO") or 0.0)
        saldo_cuota = valor_cuota - abono
        
        docs_map[doc_num]["maxCuota"] = max(docs_map[doc_num]["maxCuota"], int(item.get("HCAD_NUMEROCUOTA") or 1))
        docs_map[doc_num]["saldoFactura"] += saldo_cuota

    processed_list = []
    total_abono = 0.0
    total_saldo_cuota = 0.0
    total_protesto = 0.0
    doc_vencidos_count = 0

    for item in api_data:
        doc_num = item.get("HCAD_NUMERODOCUMENTO") or "-"
        
        # Limpiar y parsear fechas
        fecha_creacion_raw = item.get("HCAD_FECHADOCUMENTO", "").split("T")[0].split(" ")[0]
        fecha_vencimiento_raw = item.get("HCAD_FECHAVENCIMIENTO", "").split("T")[0].split(" ")[0]

        dias_vencidos = 0
        if fecha_vencimiento_raw:
            try:
                due_date = datetime.strptime(fecha_vencimiento_raw, "%Y-%m-%d").date()
                dias_vencidos = (today.date() - due_date).days
            except Exception:
                pass

        valor_cuota = float(item.get("HCAD_CUOTATOTAL") or 0.0)
        abono = float(item.get("HCAD_MONTOPAGADO") or 0.0)
        saldo_cuota = valor_cuota - abono
        protesto = float(item.get("HCAD_PROTESTO") or 0.0)

        # Totales
        total_abono += abono
        total_saldo_cuota += saldo_cuota
        total_protesto += protesto
        if dias_vencidos > 0 and saldo_cuota > 0:
            doc_vencidos_count += 1

        max_cuota = docs_map[doc_num]["maxCuota"] if doc_num in docs_map else 1
        num_cuota = int(item.get("HCAD_NUMEROCUOTA") or 1)
        cuota_str = f"{num_cuota}/{max_cuota}"

        processed_list.append({
            "numero": doc_num,
            "lineaNegocio": item.get("HCAD_LINEANEGOCIO") or "",
            "fechaCreacion": fecha_creacion_raw,
            "fechaVencimiento": fecha_vencimiento_raw,
            "diasVencidos": dias_vencidos,
            "cuota": cuota_str,
            "valorCuota": valor_cuota,
            "abono": abono,
            "saldoCuota": saldo_cuota,
            "saldoFactura": docs_map[doc_num]["saldoFactura"] if doc_num in docs_map else 0.0,
            "totalFactura": float(item.get("HCAD_TOTAL_DOCUMENTO") or 0.0),
            "protesto": protesto
        })

    kpi_totals = {
        "totalAbono": total_abono,
        "totalSaldoCuota": total_saldo_cuota,
        "totalProtesto": total_protesto,
        "documentosVencidos": doc_vencidos_count
    }

    return processed_list, kpi_totals

# ==============================================================================
# 3. CANVAS PARA NUMERACIÓN DE PÁGINAS ("Página X de Y")
# ==============================================================================
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#646464"))
        
        # Pie de página Izquierdo
        self.drawString(14*mm, 10*mm, "Impreso por SAP Business One")
        
        # Pie de página Derecho: "Página X de Y"
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(A4[0] - 14*mm, 10*mm, page_str)
        self.restoreState()

# ==============================================================================
# 4. GENERACIÓN DEL PDF CON REPORTLAB
# ==============================================================================
def format_currency(value):
    return f"${value:,.2f}"

def format_date(date_str):
    if not date_str or date_str == "-":
        return "-"
    try:
        parts = date_str.split("-")
        if len(parts) == 3:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except Exception:
        pass
    return date_str

def build_pdf(output_path, selected_company, processed_data, kpi_totals, user_info, report_meta, today_str, logo_path):
    # Formatear fechas para mostrar en cabecera
    formatted_corte = format_date(today_str)
    report_date = report_meta["fechaHoraInforme"].split(" ")[0]
    report_time = report_meta["fechaHoraInforme"].split(" ")[1] if len(report_meta["fechaHoraInforme"].split(" ")) > 1 else "12:00:00"

    # Callback para pintar el encabezado de la primera página
    def draw_header_and_client_info(canvas_obj, doc_obj):
        canvas_obj.saveState()
        
        # 1. Dibujar Logotipo
        if logo_path and os.path.exists(logo_path):
            canvas_obj.drawImage(logo_path, 14*mm, A4[1] - 22*mm, width=42*mm, height=12*mm, mask='auto')
        
        # 2. Título con divisor vertical naranja
        canvas_obj.setStrokeColor(colors.HexColor("#FD4703")) # Naranja
        canvas_obj.setLineWidth(1.5)
        canvas_obj.line(90*mm, A4[1] - 22*mm, 90*mm, A4[1] - 10*mm)
        
        canvas_obj.setFont("Helvetica-Bold", 13)
        canvas_obj.setFillColor(colors.black)
        canvas_obj.drawString(95*mm, A4[1] - 18*mm, "Estado de cuenta por documentar para ventas")
        
        # 3. Subcabecera con Fechas
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(14*mm, A4[1] - 32*mm, "Fecha de corte:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(42*mm, A4[1] - 32*mm, formatted_corte)
        
        # Línea divisoria debajo de fecha de corte
        canvas_obj.setStrokeColor(colors.HexColor("#B4B4B4"))
        canvas_obj.setLineWidth(0.2)
        canvas_obj.line(42*mm, A4[1] - 33*mm, 70*mm, A4[1] - 33*mm)
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(135*mm, A4[1] - 32*mm, "Fecha de Informe:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(168*mm, A4[1] - 32*mm, report_date)
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(135*mm, A4[1] - 38*mm, "Hora de Informe:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(168*mm, A4[1] - 38*mm, report_time)
        
        # 4. Panel de Información del Cliente
        canvas_obj.setFont("Helvetica-Bold", 10)
        canvas_obj.drawString(14*mm, A4[1] - 48*mm, "ZONA: L1")
        
        canvas_obj.setFont("Helvetica-Bold", 11)
        canvas_obj.drawString(14*mm, A4[1] - 55*mm, f"{user_info['ACCOUNT_USER']} - {user_info['NAME_USER']}")
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(14*mm, A4[1] - 63*mm, "Teléfono:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(32*mm, A4[1] - 63*mm, user_info['TELEFONO'])
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(14*mm, A4[1] - 69*mm, "Dirección:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(32*mm, A4[1] - 69*mm, user_info['DIRECCION'][:85])
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(115*mm, A4[1] - 63*mm, "Vendedor:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(135*mm, A4[1] - 63*mm, report_meta['vendedorAsignado'])
        
        canvas_obj.setFont("Helvetica-Bold", 9)
        canvas_obj.drawString(115*mm, A4[1] - 69*mm, "Ciudad:")
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.drawString(135*mm, A4[1] - 69*mm, user_info['CIUDAD'])
        
        # Subtítulo "DETALLE DE FACTURA"
        canvas_obj.setFont("Helvetica-Bold", 10)
        canvas_obj.setFillColor(colors.HexColor("#FD4703"))
        canvas_obj.drawString(14*mm, A4[1] - 78*mm, "DETALLE DE FACTURA")
        
        canvas_obj.restoreState()

    # Ordenar por número (ascendente) y días vencidos (descendente: de más alto a más bajo)
    # Coaccionamos a string e int para evitar errores de tipo '<' not supported entre int y str
    processed_data.sort(key=lambda x: (str(x["numero"]), -int(x["diasVencidos"]) if x["diasVencidos"] is not None else 0))

    # Configuración del documento
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=14*mm,
        rightMargin=14*mm,
        topMargin=15*mm,
        bottomMargin=20*mm
    )

    story = []
    # Espaciador en la primera página para dejar lugar al encabezado dibujado dinámicamente
    story.append(Spacer(1, 67*mm))

    # Estilos de párrafo para headers
    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'TableHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.0,
        leading=8.0,
        textColor=colors.black,
        alignment=0 # Left
    )
    header_style_center = ParagraphStyle(
        'TableHeaderStyleCenter',
        parent=header_style,
        alignment=1 # Center
    )
    header_style_right = ParagraphStyle(
        'TableHeaderStyleRight',
        parent=header_style,
        alignment=2 # Right
    )

    # Cabeceras de la tabla con Paragraph para soportar saltos de línea (como "Fecha\nFactura")
    headers = [
        Paragraph("Número", header_style),
        Paragraph("Fecha<br/>Factura", header_style),
        Paragraph("Vencimiento", header_style),
        Paragraph("Días Ven.", header_style_center),
        Paragraph("Cuota", header_style_center),
        Paragraph("Valor cuota", header_style_right),
        Paragraph("Abono", header_style_right),
        Paragraph("Saldo Cuota", header_style_right),
        Paragraph("Saldo Factura", header_style_right),
        Paragraph("Total Factura", header_style_right),
        Paragraph("Protesto", header_style_right)
    ]
    table_data = [headers]

    # Filas de datos
    for item in processed_data:
        table_data.append([
            item["numero"],
            format_date(item["fechaCreacion"]),
            format_date(item["fechaVencimiento"]),
            str(item["diasVencidos"]),
            item["cuota"],
            format_currency(item["valorCuota"]),
            format_currency(item["abono"]),
            format_currency(item["saldoCuota"]),
            format_currency(item["saldoFactura"]),
            format_currency(item["totalFactura"]),
            format_currency(item["protesto"])
        ])

    # Filas de totales
    total_valor_cuota = sum(i["valorCuota"] for i in processed_data)
    total_abono = sum(i["abono"] for i in processed_data)
    total_saldo_cuota = sum(i["saldoCuota"] for i in processed_data)

    table_data.append([
        "TOTAL FACTURA", "", "", "", "",
        format_currency(total_valor_cuota),
        format_currency(total_abono),
        format_currency(total_saldo_cuota),
        "", "", ""
    ])

    table_data.append([
        f"TOTAL {user_info['NAME_USER']}", "", "", "", "",
        format_currency(total_valor_cuota),
        format_currency(total_abono),
        format_currency(total_saldo_cuota),
        "", "", ""
    ])

    table_data.append([
        "TOTAL L1", "", "", "", "",
        format_currency(total_valor_cuota),
        format_currency(total_abono),
        format_currency(total_saldo_cuota),
        "", "", ""
    ])

    # Anchos de columna en mm (Ajustado para ReportLab en base a los anchos de EstadoCuenta.jsx)
    col_widths = [w * mm for w in [25, 16, 16, 12, 10, 18, 15, 17, 18, 18, 15]]

    # Definir los estilos de la tabla
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F0F0F0")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (3, 0), (4, -1), 'CENTER'),
        ('ALIGN', (5, 0), (10, -1), 'RIGHT'),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, colors.HexColor("#C8C8C8")),
    ]

    # Aplicar estilos fila por fila
    for idx in range(1, len(table_data)):
        cell_val = str(table_data[idx][0])
        if cell_val.startswith("TOTAL"):
            # Fila de Totales
            t_style.append(('FONTNAME', (0, idx), (-1, idx), 'Helvetica-Bold'))
            t_style.append(('TEXTCOLOR', (0, idx), (-1, idx), colors.black))
            t_style.append(('BACKGROUND', (0, idx), (-1, idx), colors.white))
            t_style.append(('LINEABOVE', (0, idx), (-1, idx), 0.5, colors.HexColor("#0056B3")))
        else:
            # Fila normal
            data_idx = idx - 1
            dias_vencidos = processed_data[data_idx]["diasVencidos"]
            
            # Rojo si días vencidos es mayor a 0, negro de lo contrario
            text_color = colors.HexColor("#DC3545") if dias_vencidos > 0 else colors.black
            bg_color = colors.HexColor("#FFFFFF") if idx % 2 == 1 else colors.HexColor("#DCDCDC")
            
            t_style.append(('BACKGROUND', (0, idx), (-1, idx), bg_color))
            t_style.append(('TEXTCOLOR', (0, idx), (-1, idx), text_color))

    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle(t_style))
    story.append(table)

    # Generar el documento
    doc.build(story, onFirstPage=draw_header_and_client_info, canvasmaker=NumberedCanvas)

# ==============================================================================
# 5. PUNTO DE ENTRADA PRINCIPAL
# ==============================================================================
def main():
    nombres = ["PINEL BRAVO DANIELA ELOISA", "QUINDE SANTIAGO JORGE SALVADOR", "ZHAGÑAY POMAQUIZA MARIA ORFELINA", "IMPORT MOTORS CIA LTDA", "CLORID S.A.", "MOLINA ARTEAGA VERONICA PATRICIA", "CORRALES VACA MARIA ISABEL", "DUCHI SANCHEZ ROSA EMPERATRIZ", "SIBRI MEJIA JULIA MATILDE", "ROLDAN ROLDAN JUAN CARLOS", "MUNDOLLANTA S.A.S."]
    clientes = ['2300404387001',  '1400572655001', "0301353363001", "0190451186001", "0190121534001", "1718112434001", "0102249976001", "0300642592001", "0103556155", "1793112935001"]
    empresa = ['MAXXIMUNDO', 'MAXXIMUNDO', "MAXXIMUNDO", "AUTOLLANTA", "AUTOLLANTA", "STOX", "IKONIX", "STOX", "IKONIX", "MAXXIMUNDO"]

    for i in range(0, 10):
        parser = argparse.ArgumentParser(description="Generar PDF del Estado de Cuenta con Datos Reales")
        parser.add_argument("--session", default="f2ebb3a1-badb-4b84-973a-fbd3557a42f6", help="ID de la sesión de usuario (id-session)")
        parser.add_argument("--empresa", default=f"{empresa[i]}", help="Empresa (MAXXIMUNDO, STOX, IKONIX, AUTOLLANTA)")
        parser.add_argument("--id", default=f"{clientes[i]}", help="ID de socio o cuenta de usuario")
        parser.add_argument("--nombre", default=f"{nombres[i]}", help="Nombre del cliente")
        parser.add_argument("--direccion", default="PRUEBA", help="Dirección del cliente")
        parser.add_argument("--telefono", default="PRUEBA", help="Teléfono del cliente")
        parser.add_argument("--ciudad", default="PRUEBA", help="Ciudad del cliente")
        args = parser.parse_args()

        # Cargar archivo .env
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        env_path = os.path.join(project_root, ".env")
        env_vars = load_env(env_path)

        # Configuración de la API
        api_url = env_vars.get("VITE_API_URL") or "http://localhost:3102"
        session_id = args.session or env_vars.get("SESSION_ID")

        print("====================================================")
        print("  GENERADOR DE ESTADO DE CUENTA (VERSIÓN PYTHON)    ")
        print("====================================================")
        print(f"API Base URL: {api_url}")
        print(f"Empresa:      {args.empresa}")
        print(f"ID Socio:     {args.id}")
        print(f"Nombre:       {args.nombre}")
        print(f"Session ID:   {session_id[:10] + '...' if session_id else 'NO PROPORCIONADO'}")
        print("====================================================\n")

        if not session_id:
            print("⚠️  ADVERTENCIA: No se detectó SESSION_ID.")
            print("Las peticiones a la API real podrían ser rechazadas si el backend requiere autenticación.")
            print("Proporciónalo con: --session=TU_TOKEN o en el archivo .env\n")

        if not HAS_REPORTLAB:
            print("❌ Error: No se encuentra la librería 'reportlab'.")
            print("Por favor, instálala ejecutando:")
            print("  pip3 install reportlab --break-system-packages (o en un entorno virtual)")
            sys.exit(1)

        # Realizar llamada a la API
        url = f"{api_url.rstrip('/')}/estado-cuenta/{urllib.parse.quote(args.empresa)}/{urllib.parse.quote(args.id)}"
        print(f"1. Conectando al endpoint: {url} ...")
        
        req = urllib.request.Request(url)
        if session_id:
            req.add_header("id-session", session_id)
            
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                status_code = response.getcode()
                response_body = response.read().decode("utf-8")
                
            if status_code != 200:
                print(f"❌ Error al consultar la API. Código de estado HTTP: {status_code}")
                sys.exit(1)
                
            res_json = json.loads(response_body)
            # Si la API retorna success=False de forma explícita, se considera error.
            # De lo contrario (ej. success no existe pero status es 200), se asume éxito.
            if res_json.get("success") is False:
                print(f"❌ Error retornado por la API: {res_json.get('message', 'Desconocido')}")
                sys.exit(1)
                
            api_data = res_json.get("data", [])
            print(f"✅ Conexión exitosa. Se obtuvieron {len(api_data)} facturas/cuotas.")
            
        except Exception as e:
            print(f"❌ Error al realizar la petición HTTP: {e}")
            print("Verifica que la URL del API sea correcta y que la VPN o conexión al servidor esté activa.")
            sys.exit(1)

        # Procesar la información
        print("2. Procesando información...")
        today = datetime.today()
        today_str = today.strftime("%Y-%m-%d")
        processed_data, kpi_totals = process_data(api_data, args.empresa, today)

        print(f"   - Total Saldo a Pagar:  {format_currency(kpi_totals['totalSaldoCuota'])}")
        print(f"   - Total Abono Realizado: {format_currency(kpi_totals['totalAbono'])}")
        print(f"   - Documentos Vencidos:   {kpi_totals['documentosVencidos']}")

        # Resolver logotipo local
        logo_file_name = f"{args.empresa.capitalize()}Light.png"
        logo_path = os.path.join(project_root, "src", "assets", "enterprises", logo_file_name)
        if not os.path.exists(logo_path):
            print(f"⚠️  Logotipo no encontrado en {logo_path}. Se generará el PDF sin logo.")
            logo_path = None
        else:
            print(f"✅ Logotipo encontrado: {logo_path}")

        # Generar el PDF
        dist_dir = os.path.join(project_root, "dist")
        if not os.path.exists(dist_dir):
            os.makedirs(dist_dir)

        out_file_name = f"Estado_de_Cuenta_{args.empresa}_{args.id}.pdf"
        output_path = os.path.join(dist_dir, out_file_name)

        user_info = {
            "ACCOUNT_USER": args.id,
            "NAME_USER": args.nombre,
            "TELEFONO": args.telefono,
            "DIRECCION": args.direccion,
            "CIUDAD": args.ciudad
        }

        report_meta = {
            "vendedorAsignado": "PRUEBA",
            "fechaHoraInforme": today.strftime("%Y-%m-%d %H:%M:%S")
        }

        print("3. Construyendo el documento PDF...")
        try:
            build_pdf(
                output_path=output_path,
                selected_company=args.empresa,
                processed_data=processed_data,
                kpi_totals=kpi_totals,
                user_info=user_info,
                report_meta=report_meta,
                today_str=today_str,
                logo_path=logo_path
            )
            print("\n🎉 ¡PDF GENERADO CON ÉXITO!")
            print(f"📂 Guardado en: {output_path}")
            print("====================================================\n")
        except Exception as e:
            print(f"❌ Error al construir el PDF: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
