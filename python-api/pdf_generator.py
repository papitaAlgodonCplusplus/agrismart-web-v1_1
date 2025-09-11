#!/usr/bin/env python3
"""
ENHANCED PDF GENERATOR MODULE WITH COMPLETE MICRONUTRIENT SUPPORT
Professional PDF report generation with Excel-like tables including all micronutrients
"""

from datetime import datetime
import os
from typing import Dict, List, Any, Optional

# Import fertilizer database
from fertilizer_database import EnhancedFertilizerDatabase

# PDF generation imports
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    print("WARNING: ReportLab not available. PDF generation disabled.")
    REPORTLAB_AVAILABLE = False


class EnhancedPDFReportGenerator:
    """Enhanced PDF Report Generator with complete micronutrient support"""

    def __init__(self):
        if REPORTLAB_AVAILABLE:
            self.styles = getSampleStyleSheet()
            self.title_style = ParagraphStyle(
                'CustomTitle', parent=self.styles['Heading1'], fontSize=18, spaceAfter=30,
                alignment=1, textColor=colors.darkblue
            )
            self.subtitle_style = ParagraphStyle(
                'CustomSubtitle', parent=self.styles['Heading2'], fontSize=12, spaceAfter=20,
                alignment=1, textColor=colors.darkgreen
            )
            self.micronutrient_style = ParagraphStyle(
                'MicronutrientTitle', parent=self.styles['Heading2'], fontSize=14, spaceAfter=15,
                alignment=1, textColor=colors.darkorange
            )
        else:
            self.styles = None

        # Enhanced element lists including micronutrients
        self.macro_elements = ['N', 'P', 'K', 'Ca', 'Mg', 'S']
        self.micro_elements = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        self.all_elements = self.macro_elements + self.micro_elements

        # Additional elements for complete coverage
        self.other_elements = ['Na', 'NH4', 'Cl', 'HCO3']
        self.complete_elements = self.all_elements + self.other_elements

    def generate_enhanced_pdf(self, calculation_data: Dict[str, Any], filename: str = None) -> str:
        """Generate enhanced PDF report with complete micronutrient support"""

        if not REPORTLAB_AVAILABLE:
            print("WARNING: PDF generation skipped - ReportLab not available")
            return ""

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reports/enhanced_micronutrient_report_{timestamp}.pdf"

        # Ensure reports directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        print(
            f"[DOC] Generating enhanced PDF report with micronutrients: {filename}")

        doc = SimpleDocTemplate(
            filename,
            # Add 250 points to width
            pagesize=(landscape(A4)[0] + 250, landscape(A4)[1]),
            rightMargin=12, leftMargin=12,
            topMargin=20, bottomMargin=20
        )
        story = []

        # Enhanced title (existing code)
        title = Paragraph(
            "REPORTE COMPLETO DE SOLUCIÓN NUTRITIVA CON MICRONUTRIENTES", self.title_style)
        story.append(title)

        subtitle = Paragraph(
            "Sistema Avanzado de Optimización con Cobertura Completa de Nutrientes", self.subtitle_style)
        story.append(subtitle)
        story.append(Spacer(1, 20))

        # User information section (existing code)
        user_data = calculation_data.get('user_info', {})
        if user_data:
            print("[FORM] Adding user information section...")
            user_info = self._create_enhanced_user_info_section(user_data)
            story.extend(user_info)
            story.append(Spacer(1, 15))

        # Enhanced metadata section (existing code)
        metadata = self._create_enhanced_metadata_section(calculation_data)
        story.extend(metadata)
        story.append(Spacer(1, 25))

        # *** ADD MICRONUTRIENT SUPPLEMENTATION SUMMARY ***
        supplementation_summary = self._create_micronutrient_supplementation_summary(
            calculation_data)
        if supplementation_summary:
            story.extend(supplementation_summary)
            story.append(Spacer(1, 15))

        # *** ADD REQUIRED FERTILIZERS LEGEND ***
        legend = self._create_required_fertilizers_legend()
        story.extend(legend)
        story.append(Spacer(1, 15))

        # Main enhanced calculation table with complete micronutrient coverage (existing but enhanced)
        main_table = self._create_enhanced_main_table(calculation_data)
        story.append(main_table)
        story.append(PageBreak())

        # Micronutrient analysis section (existing code)
        micronutrient_analysis = self._create_micronutrient_analysis_section(
            calculation_data)
        story.extend(micronutrient_analysis)
        story.append(PageBreak())

        # Enhanced summary and analysis tables (existing code)
        summary_tables = self._create_enhanced_summary_tables(calculation_data)
        story.extend(summary_tables)

        # Build PDF
        try:
            doc.build(story)
            print(
                f"[SUCCESS] Enhanced PDF report generated successfully: {filename}")
        except Exception as e:
            print(f"[ERROR] Enhanced PDF generation failed: {e}")

        return filename

    def _create_enhanced_user_info_section(self, user_data: Dict[str, Any]) -> List:
        """Create enhanced user information section"""
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []

        user_title = Paragraph(
            "INFORMACIÓN DEL USUARIO Y PROYECTO", self.subtitle_style)
        elements.append(user_title)
        elements.append(Spacer(1, 10))

        # Enhanced user data extraction
        user_id = user_data.get('id', user_data.get('clientId', 'N/A'))
        user_email = user_data.get('userEmail', 'N/A')
        client_id = user_data.get('clientId', 'N/A')
        profile_id = user_data.get('profileId', 'N/A')
        status_id = user_data.get('userStatusId', 'N/A')

        # Format creation date
        date_created = user_data.get('dateCreated', '')
        if date_created and len(date_created) >= 10:
            formatted_date = date_created[:10]
        else:
            formatted_date = 'N/A'

        # Enhanced user data table
        user_table_data = [
            ['ID de Usuario:', str(
                user_id), 'Email del Usuario:', str(user_email)],
            ['Cliente ID:', str(client_id), 'Perfil ID:', str(profile_id)],
            ['Estado de Usuario:', str(
                status_id), 'Fecha de Creación:', formatted_date],
            ['Tipo de Cálculo:', 'Best Model',
                'Versión del Sistema:', 'v6.0.0 Enhanced']
        ]

        user_table = Table(user_table_data, colWidths=[
                           1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        user_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1),
             [colors.lightblue, colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        elements.append(user_table)
        return elements

    def _create_enhanced_metadata_section(self, calculation_data: Dict[str, Any]) -> List:
        """Create enhanced metadata section with micronutrient info"""
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []
        metadata = calculation_data.get('integration_metadata', {})
        calc_results = calculation_data.get('calculation_results', {})
        final_solution = calc_results.get('final_solution', {})
        micronutrient_summary = calc_results.get('micronutrient_summary', {})

        # Enhanced metadata with micronutrient info
        enhanced_metadata_data = [
            ['Fecha y Hora:', datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
             'Fuente de Datos:', metadata.get('data_source', 'Enhanced API Integration')],
            ['Fertilizantes Analizados:', str(metadata.get('fertilizers_analyzed', 'N/A')),
             'Fertilizantes Procesados:', str(metadata.get('fertilizers_processed', 'N/A'))],
            ['Método de Optimización:', metadata.get('method_used', 'Enhanced Deterministic'),
             'Micronutrientes Incluidos:', 'Sí'],
            ['EC Final:', f"{final_solution.get('calculated_EC', 0):.2f} dS/m",
             'pH Final:', f"{final_solution.get('calculated_pH', 0):.1f}"],
            ['Micronutrientes Suministrados:', f"{micronutrient_summary.get('total_micronutrients_supplied', 0)}/6",
             'Volumen de Solución:', '1000 L (concentrado)']
        ]

        metadata_table = Table(enhanced_metadata_data, colWidths=[
                               2.2*inch, 2*inch, 2.2*inch, 2*inch])
        metadata_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1),
             [colors.lightgrey, colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        elements.append(metadata_table)
        return elements

    def _create_enhanced_main_table(self, calculation_data: Dict[str, Any]) -> object:
        """Create enhanced main Excel-like table with complete micronutrient coverage and proper styling"""
        if not REPORTLAB_AVAILABLE:
            return None

        calc_results = calculation_data.get('calculation_results', {})
        fertilizer_dosages = calc_results.get('fertilizer_dosages', {})
        nutrient_contributions = calc_results.get('nutrient_contributions', {})
        water_contribution = calc_results.get('water_contribution', {})
        final_solution = calc_results.get('final_solution', {})

        print(f"\n=== PDF TABLE DEBUG INFO ===")
        print(f"Fertilizer dosages received: {len(fertilizer_dosages)}")

        # Enhanced column headers including ALL micronutrients
        headers = [
            'FERTILIZANTE', '% P', 'Peso molecular\n(Sal)', 'Peso molecular\n(Elem1)',
            'Peso molecular\n(Elem2)', 'Peso de sal\n(g/L)', 'Peso de sal\n(mmol/L)',
            # Macronutrients
            'Ca', 'K', 'Mg', 'Na', 'NH4', 'NO3-', 'N', 'SO4=', 'S', 'Cl-',
            'H2PO4-', 'P', 'HCO3-',
            # MICRONUTRIENTS
            'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo',
            'SUM aniones', 'CE'
        ]

        table_data = [headers]
        fertilizer_db = calculation_data.get('fertilizer_database', {})
        fertilizer_rows_added = 0

        # Add ALL fertilizers (both used and unused)
        all_fertilizers = list(fertilizer_dosages.keys())

        # Sort fertilizers: used ones first, then unused ones
        used_fertilizers = [name for name, dosage in fertilizer_dosages.items()
                            if self._extract_dosage_value(dosage) > 0.0001]
        unused_fertilizers = [name for name, dosage in fertilizer_dosages.items()
                              if self._extract_dosage_value(dosage) <= 0.0001]

        sorted_fertilizers = used_fertilizers + unused_fertilizers

        print(
            f"Adding {len(used_fertilizers)} used and {len(unused_fertilizers)} unused fertilizers")

        for fert_name in sorted_fertilizers:
            dosage_info = fertilizer_dosages[fert_name]

            # Create row for both used and unused fertilizers
            row = self._create_enhanced_fertilizer_row_with_marking(
                fert_name, dosage_info, fertilizer_db)
            table_data.append(row)
            fertilizer_rows_added += 1

        # Add enhanced summary rows
        summary_rows = self._create_enhanced_summary_rows(calculation_data)
        table_data.extend(summary_rows)

        print(f"    Added {len(summary_rows)} enhanced summary rows")

        # Create table with enhanced styling
        table = Table(table_data, repeatRows=1)

        # Calculate column count for styling
        num_cols = len(headers)
        micronutrient_start_col = headers.index('Fe')
        micronutrient_end_col = headers.index('Mo')

        table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 6),

            # Highlight micronutrient columns
            ('BACKGROUND', (micronutrient_start_col, 0),
             (micronutrient_end_col, 0), colors.darkorange),

            # Fertilizer rows styling
            ('FONTNAME', (0, 1), (-1, fertilizer_rows_added), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, fertilizer_rows_added), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, fertilizer_rows_added),
             [colors.white, colors.lightgrey]),

            # Summary rows styling
            ('BACKGROUND', (0, fertilizer_rows_added+1),
             (-1, -1), colors.lightyellow),
            ('FONTNAME', (0, fertilizer_rows_added+1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, fertilizer_rows_added+1), (-1, -1), 5),

            # Borders and alignment
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        # *** APPLY REQUIRED FERTILIZER STYLING ***
        self._apply_required_fertilizer_styling(
            table, fertilizer_dosages, fertilizer_rows_added)

        # *** APPLY UNUSED FERTILIZER STYLING (NEW) ***
        self._apply_unused_fertilizer_styling(
            table, fertilizer_dosages, fertilizer_rows_added)

        print(f"=== PDF TABLE DEBUG COMPLETE ===\n")
        return table

    def _create_micronutrient_analysis_section(self, calculation_data: Dict[str, Any]) -> List:
        """Create detailed micronutrient analysis section with enhanced data"""
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []
        calc_results = calculation_data.get('calculation_results', {})

        # *** USE NEW MICRONUTRIENT ANALYSIS DATA ***
        micronutrient_coverage = calc_results.get('micronutrient_coverage', {})
        micronutrient_validation = calc_results.get(
            'micronutrient_validation', {})
        micronutrient_recommendations = calc_results.get(
            'micronutrient_recommendations', [])

        final_solution = calc_results.get('final_solution', {})

        # Micronutrient analysis title
        micro_title = Paragraph(
            "ANÁLISIS DETALLADO DE MICRONUTRIENTES", self.micronutrient_style)
        elements.append(micro_title)
        elements.append(Spacer(1, 15))

        # *** NEW: MICRONUTRIENT COVERAGE ANALYSIS ***
        if micronutrient_coverage:
            coverage_title = Paragraph(
                "Análisis de Cobertura de Micronutrientes", self.subtitle_style)
            elements.append(coverage_title)
            elements.append(Spacer(1, 10))

            coverage_data = [
                ['Parámetro', 'Valor', 'Estado'],
                [
                    'Cobertura de Micronutrientes',
                    f"{micronutrient_coverage.get('coverage_percentage', 0):.1f}%",
                    'Completa' if micronutrient_coverage.get(
                        'coverage_percentage', 0) >= 90 else 'Incompleta'
                ],
                [
                    'Micronutrientes Necesarios',
                    str(len(micronutrient_coverage.get(
                        'micronutrients_needed', {}))),
                    'Normal'
                ],
                [
                    'Micronutrientes Faltantes',
                    str(len(micronutrient_coverage.get(
                        'missing_micronutrients', []))),
                    'Crítico' if micronutrient_coverage.get(
                        'missing_micronutrients') else 'Bien'
                ]
            ]

            coverage_table = Table(coverage_data, colWidths=[
                                   2.5*inch, 1.5*inch, 1.5*inch])
            coverage_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkorange),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.lightgrey]),
            ]))

            elements.append(coverage_table)
            elements.append(Spacer(1, 20))

        # *** ENHANCED: MICRONUTRIENT VALIDATION STATUS ***
        if micronutrient_validation and micronutrient_validation.get('micronutrient_status'):
            validation_title = Paragraph(
                "Estado de Validación de Micronutrientes", self.subtitle_style)
            elements.append(validation_title)
            elements.append(Spacer(1, 10))

            validation_data = [
                ['Micronutriente', 'Concentración\nFinal (mg/L)', 'Objetivo\n(mg/L)',
                 'Desviación (%)', 'Estado', 'Límite Seguridad']
            ]

            status_colors = {
                'adequate': colors.green,
                'acceptable': colors.orange,
                'deficient': colors.red,
                'toxic': colors.darkred,
                'off_target': colors.yellow
            }

            for micro, status_info in micronutrient_validation['micronutrient_status'].items():
                final_conc = status_info['final']
                target_conc = status_info['target']
                deviation = status_info['deviation_percent']
                status = status_info['status']
                safety_limit = status_info['safety_limit']

                validation_data.append([
                    micro,
                    f"{final_conc:.3f}",
                    f"{target_conc:.3f}",
                    f"{deviation:+.1f}%",
                    status.title(),
                    f"{safety_limit:.1f}"
                ])

            validation_table = Table(validation_data, colWidths=[
                                     1*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])

            # Create style with color coding
            table_style = [
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkorange),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.lightgrey]),
            ]

            # Add status-specific coloring
            for i, (micro, status_info) in enumerate(micronutrient_validation['micronutrient_status'].items(), 1):
                status = status_info['status']
                if status in status_colors:
                    table_style.append(
                        ('TEXTCOLOR', (4, i), (4, i), status_colors[status]))
                    table_style.append(
                        ('FONTNAME', (4, i), (4, i), 'Helvetica-Bold'))

            validation_table.setStyle(TableStyle(table_style))
            elements.append(validation_table)
            elements.append(Spacer(1, 20))

        # *** NEW: MICRONUTRIENT RECOMMENDATIONS SECTION ***
        if micronutrient_recommendations:
            recommendations_title = Paragraph(
                "Recomendaciones de Micronutrientes", self.subtitle_style)
            elements.append(recommendations_title)
            elements.append(Spacer(1, 10))

            # Create bulleted list of recommendations
            recommendations_text = "<br/>".join(
                [f"[?] {rec}" for rec in micronutrient_recommendations[:8]])

            recommendations_paragraph = Paragraph(
                recommendations_text,
                ParagraphStyle('Recommendations', parent=self.styles['Normal'],
                               fontSize=9, leftIndent=20, spaceAfter=15)
            )
            elements.append(recommendations_paragraph)
            elements.append(Spacer(1, 15))

        # Micronutrient fertilizer summary (enhanced existing code)
        elements.append(
            Paragraph("FERTILIZANTES MICRONUTRIENTES UTILIZADOS", self.subtitle_style))
        elements.append(Spacer(1, 10))

        fertilizer_dosages = calc_results.get('fertilizer_dosages', {})
        micro_fert_data = [['Fertilizante Micronutriente',
                            'Dosificación (g/L)', 'Dosificación (mL/L)', 'Elemento Principal', 'Aporte (mg/L)', 'Tipo']]

        micro_fertilizers_used = 0
        for fert_name, dosage_info in fertilizer_dosages.items():
            dosage_g_l = self._extract_dosage_value(dosage_info)
            if dosage_g_l > 0.0001:
                # Check if it's a micronutrient fertilizer
                is_micro_fert = any(micro in fert_name.lower()
                                    for micro in ['hierro', 'iron', 'manganeso', 'zinc', 'cobre', 'copper', 'borico', 'molibdato'])

                if is_micro_fert:
                    dosage_ml_l = getattr(dosage_info, 'dosage_ml_per_L', dosage_g_l) if hasattr(
                        dosage_info, 'dosage_ml_per_L') else dosage_g_l

                    # Determine main element and contribution
                    main_element, contribution = self._get_main_micronutrient_contribution(
                        fert_name, dosage_g_l)

                    # *** ENHANCED: DETECT REQUIRED FERTILIZERS ***
                    fertilizer_type = "Requerido" if '[Fertilizante Requerido]' in fert_name else "Catálogo API"
                    clean_name = fert_name.replace(
                        ' [Fertilizante Requerido]', '')

                    micro_fert_data.append([
                        clean_name,
                        f"{dosage_g_l:.4f}",
                        f"{dosage_ml_l:.4f}",
                        main_element,
                        f"{contribution:.3f}",
                        fertilizer_type
                    ])
                    micro_fertilizers_used += 1

        if micro_fertilizers_used > 0:
            micro_fert_table = Table(micro_fert_data, colWidths=[
                                     2.2*inch, 1*inch, 1*inch, 0.8*inch, 1*inch, 1*inch])

            # Enhanced styling with required fertilizer highlighting
            table_style = [
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkorange),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.lightgrey]),
            ]

            # Highlight required fertilizers
            for i, row in enumerate(micro_fert_data[1:], 1):
                if len(row) > 5 and row[5] == "Requerido":
                    table_style.append(
                        ('BACKGROUND', (5, i), (5, i), colors.lightcyan))
                    table_style.append(
                        ('TEXTCOLOR', (5, i), (5, i), colors.darkblue))
                    table_style.append(
                        ('FONTNAME', (5, i), (5, i), 'Helvetica-Bold'))

            micro_fert_table.setStyle(TableStyle(table_style))
            elements.append(micro_fert_table)
        else:
            no_micro_text = Paragraph("[WARNING] NO SE DETECTARON FERTILIZANTES MICRONUTRIENTES EN LA FORMULACIÓN",
                                      self.styles['Normal'])
            elements.append(no_micro_text)

        return elements

    def _get_molecular_weight(self, element: str) -> float:
        """Get molecular weight for an element"""
        molecular_weights = {
            'Ca': 40.08, 'K': 39.10, 'Mg': 24.31, 'Na': 22.99, 'NH4': 18.04,
            'N': 14.01, 'S': 32.07, 'Cl': 35.45, 'P': 30.97, 'HCO3': 61.02,
            'Fe': 55.85, 'Mn': 54.94, 'Zn': 65.38, 'Cu': 63.55, 'B': 10.81,
            'Mo': 95.94
        }
        return molecular_weights.get(element, 0)
    
    def _get_valence(self, element: str) -> int:
        """Get valence for an element"""
        valences = {
            'Ca': 2, 'K': 1, 'Mg': 2, 'Na': 1, 'NH4': 1,
            'N': 1, 'S': 2, 'Cl': 1, 'P': 1, 'HCO3': 1,
            'Fe': 2, 'Mn': 2, 'Zn': 2, 'Cu': 2, 'B': 3,
            'Mo': 6
        }
        return valences.get(element, 0)

    def _create_enhanced_summary_rows(self, calculation_data: Dict) -> List[List]:
        """Create enhanced summary rows with FIXED data access patterns"""
        summary_rows = []

        print(f"\n=== SUMMARY CALCULATIONS DEBUG (FIXED) ===")
        
        # Extract data from calculation_data structure
        calc_results = calculation_data.get('calculation_results', {})
        integration_metadata = calculation_data.get('integration_metadata', {})
        
        # Get fertilizer dosages and achieved concentrations
        fertilizer_dosages = calc_results.get('fertilizer_dosages', {})
        achieved_concentrations = calc_results.get('achieved_concentrations', {})
        
        print(f"Found fertilizer_dosages: {len(fertilizer_dosages)} fertilizers")
        print(f"Found achieved_concentrations: {len(achieved_concentrations)} nutrients")

        # Enhanced element list including micronutrients
        elements_for_summary = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'NO3-', 'N', 'SO4=', 'S', 'Cl-', 'H2PO4-', 'P', 'HCO3-', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

        # Initialize arrays for summary rows
        aporte_de_iones_mg_l = []
        aporte_de_iones_mmol_l = []
        aporte_de_iones_meq_l = []
        iones_en_el_agua_mg_l = []
        iones_en_el_agua_mmol_l = []
        iones_en_el_agua_meq_l = []
        iones_en_sonu_final_mg_l = []
        iones_en_sonu_final_mmol_l = []
        iones_en_sonu_final_meq_l = []

        # Get fertilizer database for composition lookup
        fertilizer_db = calculation_data.get('fertilizer_database', {})
        
        # Calculate nutrient contributions from fertilizers
        fertilizer_contributions = self._calculate_fertilizer_contributions(fertilizer_dosages, fertilizer_db)
        
        # Get water analysis data (this should be available in the calculation context)
        # Try to get water data from multiple possible locations
        water_analysis = {}
        
        # Option 1: From integration metadata or calc results
        if 'water_analysis' in calc_results:
            water_analysis = calc_results['water_analysis']
        elif hasattr(self, '_current_water_analysis'):
            water_analysis = self._current_water_analysis
        else:
            # Default water analysis values (fallback)
            water_analysis = {
                'Ca': 10.15, 'K': 2.6, 'Mg': 4.8, 'Na': 9.4, 'NH4': 0, 'N': 1.4,
                'S': 0, 'Cl': 1.2, 'P': 0, 'HCO3': 77, 'Fe': 0, 'Mn': 0, 
                'Zn': 0.1, 'Cu': 0.1, 'B': 0, 'Mo': 0.01
            }
            print(f"[WARNING] Using default water analysis values")

        print(f"Water analysis: {len(water_analysis)} parameters")

        for element in elements_for_summary:
            print(f"Processing element: {element}")
            
            # === FERTILIZER CONTRIBUTIONS ===
            contribution_mg_l = fertilizer_contributions.get(element, 0)
            
            # Calculate mmol/L and meq/L for fertilizer contributions
            molecular_weight = self._get_molecular_weight(element)
            if molecular_weight > 0:
                contribution_mmol_l = contribution_mg_l / molecular_weight
                contribution_meq_l = contribution_mmol_l * self._get_valence(element)
            else:
                contribution_mmol_l = contribution_meq_l = 0

            aporte_de_iones_mg_l.append(round(contribution_mg_l, 3))
            aporte_de_iones_mmol_l.append(round(contribution_mmol_l, 3))
            aporte_de_iones_meq_l.append(round(contribution_meq_l, 3))

            # === WATER CONTRIBUTIONS ===
            # Map element names to water analysis keys
            water_key_mapping = {
                'Ca': 'ca', 'K': 'k', 'Mg': 'mg', 'Na': 'na', 'NH4': 'nh4', 'N': 'nO3',
                'S': 'sO4', 'Cl': 'cl', 'P': 'p', 'HCO3': 'hco3', 'Fe': 'fe', 'Mn': 'mn',
                'Zn': 'zn', 'Cu': 'cu', 'B': 'b', 'Mo': 'mo'
            }
            
            water_key = water_key_mapping.get(element, element.lower())
            water_mg_l = water_analysis.get(water_key, water_analysis.get(element, 0))

            # Calculate mmol/L and meq/L for water
            if molecular_weight > 0:
                water_mmol_l = water_mg_l / molecular_weight
                water_meq_l = water_mmol_l * self._get_valence(element)
            else:
                water_mmol_l = water_meq_l = 0

            iones_en_el_agua_mg_l.append(round(water_mg_l, 3))
            iones_en_el_agua_mmol_l.append(round(water_mmol_l, 3))
            iones_en_el_agua_meq_l.append(round(water_meq_l, 3))

            # === FINAL SOLUTION ===
            # Use achieved concentrations or calculate as water + fertilizer
            final_mg_l = achieved_concentrations.get(element, water_mg_l + contribution_mg_l)

            # Calculate mmol/L and meq/L for final solution
            if molecular_weight > 0:
                final_mmol_l = final_mg_l / molecular_weight
                final_meq_l = final_mmol_l * self._get_valence(element)
            else:
                final_mmol_l = final_meq_l = 0

            iones_en_sonu_final_mg_l.append(round(final_mg_l, 3))
            iones_en_sonu_final_mmol_l.append(round(final_mmol_l, 3))
            iones_en_sonu_final_meq_l.append(round(final_meq_l, 3))

            # Debug output for non-zero values
            if contribution_mg_l > 0 or water_mg_l > 0 or final_mg_l > 0:
                print(f"  {element}: fertilizer={contribution_mg_l:.3f}, water={water_mg_l:.3f}, final={final_mg_l:.3f}")

        # Filling columns for molecular weight columns (x values)
        filling = ['x', 'x', 'x', 'x', 'x', 'x']
        
        # Create summary rows with corrected calculations
        row_1 = ['APORTE DE IONES (mg/L)'] + filling + aporte_de_iones_mg_l + ['x', 'x']
        row_2 = ['APORTE DE IONES (mmol/L)'] + filling + aporte_de_iones_mmol_l + ['x', 'x']
        row_3 = ['APORTE DE IONES (meq/L)'] + filling + aporte_de_iones_meq_l + ['x', 'x']
        row_4 = ['IONES EN EL AGUA (mg/L)'] + filling + iones_en_el_agua_mg_l + ['x', 'x']
        row_5 = ['IONES EN EL AGUA (mmol/L)'] + filling + iones_en_el_agua_mmol_l + ['x', 'x']
        row_6 = ['IONES EN EL AGUA (meq/L)'] + filling + iones_en_el_agua_meq_l + ['x', 'x']
        row_7 = ['IONES EN SOLUCIÓN FINAL (mg/L)'] + filling + iones_en_sonu_final_mg_l + ['x', 'x']
        row_8 = ['IONES EN SOLUCIÓN FINAL (mmol/L)'] + filling + iones_en_sonu_final_mmol_l + ['x', 'x']
        row_9 = ['IONES EN SOLUCIÓN FINAL (meq/L)'] + filling + iones_en_sonu_final_meq_l + ['x', 'x']
        
        summary_rows.extend([row_1, row_2, row_3, row_4, row_5, row_6, row_7, row_8, row_9])
        
        # Summary debug info
        total_non_zero_contrib = sum(1 for val in aporte_de_iones_mg_l if val > 0)
        total_non_zero_water = sum(1 for val in iones_en_el_agua_mg_l if val > 0)
        total_non_zero_final = sum(1 for val in iones_en_sonu_final_mg_l if val > 0)
        
        print(f"Summary statistics:")
        print(f"  Non-zero contributions: {total_non_zero_contrib}/{len(elements_for_summary)}")
        print(f"  Non-zero water: {total_non_zero_water}/{len(elements_for_summary)}")
        print(f"  Non-zero final: {total_non_zero_final}/{len(elements_for_summary)}")
        print(f"Generated {len(summary_rows)} summary rows with corrected calculations")
        print(f"=== END SUMMARY CALCULATIONS DEBUG ===\n")

        return summary_rows

    def _calculate_fertilizer_contributions(self, fertilizer_dosages: Dict, fertilizer_db: Dict) -> Dict[str, float]:
        """Calculate nutrient contributions from fertilizer dosages"""
        contributions = {}
        
        # Initialize all elements to 0
        elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'NO3-', 'N', 'SO4=', 'S', 'Cl-', 'H2PO4-', 'P', 'HCO3-', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        for element in elements:
            contributions[element] = 0.0
        
        print(f"Calculating fertilizer contributions for {len(fertilizer_dosages)} fertilizers")
        
        for fert_name, dosage_info in fertilizer_dosages.items():
            dosage_g_l = self._extract_dosage_value(dosage_info)
            
            if dosage_g_l > 0:
                print(f"  Processing {fert_name}: {dosage_g_l:.4f} g/L")
                
                # Get composition data
                composition_data = self._find_enhanced_composition(fert_name, fertilizer_db)
                
                if composition_data:
                    dosage_mg_l = dosage_g_l * 1000
                    molecular_weight = composition_data['mw']
                    cations = composition_data['cations']
                    anions = composition_data['anions']
                    
                    # Calculate contributions for cations
                    for element, content_percent in cations.items():
                        if content_percent > 0:
                            contribution = (dosage_mg_l * content_percent) / 100
                            contributions[element] = contributions.get(element, 0) + contribution
                            print(f"    {element} (cation): +{contribution:.3f} mg/L")
                    
                    # Calculate contributions for anions
                    for element, content_percent in anions.items():
                        if content_percent > 0:
                            contribution = (dosage_mg_l * content_percent) / 100
                            contributions[element] = contributions.get(element, 0) + contribution
                            print(f"    {element} (anion): +{contribution:.3f} mg/L")
        
        return contributions

    def _get_molecular_weight(self, element: str) -> float:
        """Get molecular weight for elements"""
        molecular_weights = {
            'Ca': 40.078, 'K': 39.098, 'Mg': 24.305, 'Na': 22.990, 'NH4': 18.038,
            'NO3-': 62.004, 'N': 14.007, 'SO4=': 96.06, 'S': 32.065, 'Cl-': 35.453,
            'H2PO4-': 96.987, 'P': 30.974, 'HCO3-': 61.017, 'Fe': 55.845, 'Mn': 54.938,
            'Zn': 65.38, 'Cu': 63.546, 'B': 10.811, 'Mo': 95.96
        }
        return molecular_weights.get(element, 1.0)

    def _get_valence(self, element: str) -> int:
        """Get valence for elements"""
        valences = {
            'Ca': 2, 'K': 1, 'Mg': 2, 'Na': 1, 'NH4': 1,
            'NO3-': -1, 'N': 0, 'SO4=': -2, 'S': 0, 'Cl-': -1,
            'H2PO4-': -1, 'P': 0, 'HCO3-': -1, 'Fe': 2, 'Mn': 2,
            'Zn': 2, 'Cu': 2, 'B': 3, 'Mo': 6
        }
        return abs(valences.get(element, 0))  # Return absolute value for meq calculation

    def _evaluate_status(self, parameter, deviation):
        deviation_percent = abs(deviation * 100)

        if deviation_percent < 5:
            return 'Excellent'
        elif deviation_percent < 20:
            return 'Deviation'
        else:
            return 'Low'

    def _apply_unused_fertilizer_styling(self, table: object, fertilizer_dosages: Dict, fertilizer_rows_added: int) -> None:
        """
        Apply gray/red styling to unused fertilizers (zero contribution for all key elements) in the PDF table
        """
        if not REPORTLAB_AVAILABLE:
            return

        all_elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'S',
                        'Cl', 'P', 'HCO3', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        # Map header names to their column indices
        header_row = table._cellvalues[0]
        col_indices = {name: idx for idx, name in enumerate(header_row)}
        for row_idx in range(1, fertilizer_rows_added + 1):
            row_data = table._cellvalues[row_idx]
            fert_name = row_data[0]

            # Check if all key elements are zero
            try:
                if all(float(row_data[col_indices[elem]]) == 0 for elem in all_elements if elem in col_indices):
                    # Apply gray/red styling (this is a placeholder, as direct cell coloring is not supported)
                    # You may want to use TableStyle to set the background for the row instead.
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, row_idx),
                         (-1, row_idx), colors.lightgrey),
                        ('TEXTCOLOR', (0, row_idx), (-1, row_idx), colors.red),
                    ]))
            except Exception as e:
                print(f"Error applying unused fertilizer styling: {e}")
        print(
            f"Applied unused fertilizer styling to {fertilizer_rows_added} rows")

    def _create_enhanced_summary_tables(self, calculation_data: Dict[str, Any]) -> List:
        """Create enhanced summary and analysis tables with micronutrient support"""
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []
        print("DEBUG: calculation_data: ", calculation_data)  # Debugging line
        calc_results = calculation_data.get('calculation_results', {})

        # Enhanced Verification Results Table including micronutrients
        verification_results = calc_results.get('verification_results')
        if not verification_results:
            achieved = calc_results.get('achieved_concentrations', {})
            deviations = calc_results.get('deviations_percent', {})

            verification_results = []

            for param, actual in achieved.items():
                deviation = deviations.get(param)
                if deviation is None:
                    continue  # Can't calculate target

                # Reverse-engineer the target: actual = target * (1 + deviation)
                try:
                    target = actual / (1 + deviation)
                except ZeroDivisionError:
                    continue  # Extremely rare, but let's be graceful

                verification_results.append({
                    'parameter': param,
                    'target_value': target,
                    'actual_value': actual,
                    'percentage_deviation': deviation * 100,
                    # Or call your logic
                    'status': self._evaluate_status(param, deviation)
                })

        # Optionally store it for reuse
        calc_results['verification_results'] = verification_results

        # Debugging line
        print(f"DEBUG: Verification Results: {verification_results}")
        if verification_results:
            elements.append(Spacer(1, 20))
            elements.append(Paragraph("<b>RESULTADOS DE VERIFICACIÓN NUTRICIONAL COMPLETA</b>",
                                      ParagraphStyle('SectionTitle', parent=self.styles['Heading2'],
                                                     fontSize=14, textColor=colors.darkblue)))
            elements.append(Spacer(1, 10))

            verification_data = [
                ['Parámetro', 'Objetivo (mg/L)', 'Actual (mg/L)', 'Desviación (%)', 'Estado', 'Tipo']]

            # Separate macro and micronutrients in verification
            macro_results = []
            micro_results = []

            for result in verification_results:
                parameter = result.get('parameter', '')
                if parameter in self.micro_elements:
                    micro_results.append(result)
                else:
                    macro_results.append(result)

            # Add macronutrients first
            for result in macro_results:
                status = result.get('status', '')
                status_color = self._get_status_color(status)

                verification_data.append([
                    result.get('parameter', ''),
                    f"{result.get('target_value', 0):.1f}",
                    f"{result.get('actual_value', 0):.1f}",
                    f"{result.get('percentage_deviation', 0):+.1f}%",
                    status,
                    'Macro'
                ])

            # Add micronutrients
            for result in micro_results:
                status = result.get('status', '')

                verification_data.append([
                    result.get('parameter', ''),
                    # More precision for micros
                    f"{result.get('target_value', 0):.3f}",
                    f"{result.get('actual_value', 0):.3f}",
                    f"{result.get('percentage_deviation', 0):+.1f}%",
                    status,
                    'Micro'
                ])

            verification_table = Table(verification_data, colWidths=[
                                       1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 0.8*inch])

            # Enhanced styling with micronutrient differentiation
            table_style = [
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.lightgrey]),
            ]

            # Color-code micronutrient rows
            for i, result in enumerate(verification_results, 1):
                parameter = result.get('parameter', '')
                if parameter in self.micro_elements:
                    table_style.append(
                        ('BACKGROUND', (5, i), (5, i), colors.orange))
                    table_style.append(
                        ('TEXTCOLOR', (5, i), (5, i), colors.white))
                    table_style.append(
                        ('FONTNAME', (5, i), (5, i), 'Helvetica-Bold'))
                else:
                    table_style.append(
                        ('BACKGROUND', (5, i), (5, i), colors.lightblue))

            verification_table.setStyle(TableStyle(table_style))
            elements.append(verification_table)

        # Enhanced Ionic Balance Analysis
        ionic_balance = calc_results.get('ionic_balance', {})
        if ionic_balance:
            elements.append(Spacer(1, 20))
            elements.append(Paragraph("<b>ANÁLISIS DE BALANCE IÓNICO MEJORADO</b>",
                                      ParagraphStyle('SectionTitle', parent=self.styles['Heading2'],
                                                     fontSize=14, textColor=colors.darkblue)))
            elements.append(Spacer(1, 10))

            balance_data = [
                ['Parámetro', 'Valor', 'Unidad', 'Estado'],
                ['Suma de Cationes',
                    f"{ionic_balance.get('cation_sum', 0):.2f}", 'meq/L',
                    ionic_balance.get('balance_status', 'Unknown')],
                ['Suma de Aniones',
                    f"{ionic_balance.get('anion_sum', 0):.2f}", 'meq/L', ''],
                ['Diferencia Absoluta',
                    f"{ionic_balance.get('difference', 0):.2f}", 'meq/L', ''],
                ['Error de Balance',
                    f"{ionic_balance.get('difference_percentage', 0):.1f}", '%', '']
            ]

            balance_table = Table(balance_data, colWidths=[
                                  2.5*inch, 1.5*inch, 1*inch, 1.5*inch])
            balance_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.lightgrey]),
                ('TEXTCOLOR', (3, 1), (3, 1),
                 colors.green if ionic_balance.get('is_balanced') == 1 else colors.red),
                ('FONTNAME', (3, 1), (3, 1), 'Helvetica-Bold'),
            ]))

            elements.append(balance_table)

        # Enhanced Cost Analysis with micronutrient breakdown
        cost_analysis = calc_results.get('cost_analysis', {})
        if cost_analysis and cost_analysis.get('fertilizer_costs'):
            elements.append(Spacer(1, 20))
            elements.append(Paragraph("<b>ANÁLISIS ECONÓMICO DETALLADO</b>",
                                      ParagraphStyle('SectionTitle', parent=self.styles['Heading2'],
                                                     fontSize=14, textColor=colors.darkblue)))
            elements.append(Spacer(1, 10))

            # Add cost summary section
            cost_summary_data = [
                ['Métrica', 'Valor', 'Unidad'],
                ['Costo Total CRC', f"₡{cost_analysis.get('total_cost_crc', 0):.2f}", 'CRC'],
                ['Costo por Litro', f"₡{cost_analysis.get('cost_per_liter_crc', 0):.4f}", 'CRC/L'],
                ['Costo por m³', f"₡{cost_analysis.get('cost_per_m3_crc', 0):.2f}", 'CRC/m³'],
                ['Cobertura API Precios', f"{cost_analysis.get('api_price_coverage_percent', 0):.1f}%", '%'],
                ['Factor Regional', f"{cost_analysis.get('regional_factor', 1.0):.2f}", ''],
                ['Región', cost_analysis.get('region', 'N/A'), '']
            ]

            cost_summary_table = Table(cost_summary_data, colWidths=[2*inch, 1.5*inch, 1*inch])
            cost_summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            elements.append(cost_summary_table)
            elements.append(Spacer(1, 15))

            # Pricing sources information
            pricing_sources = cost_analysis.get('pricing_sources', {})
            if pricing_sources:
                pricing_info = f"Fuentes de Precios: API ({pricing_sources.get('api_prices_used', 0)} precios) | " \
                              f"Fallback ({pricing_sources.get('fallback_prices_used', 0)} precios)"
                elements.append(Paragraph(pricing_info, 
                                        ParagraphStyle('PricingInfo', parent=self.styles['Normal'],
                                                     fontSize=8, textColor=colors.grey)))
                elements.append(Spacer(1, 10))

            # Detailed fertilizer costs table
            cost_data = [
                ['Fertilizante', 'Costo por 1000L (₡)', 'Porcentaje (%)', 'Tipo', 'Dosificación (g/L)', 'Total L Usado']
            ]

            fertilizer_costs = cost_analysis.get('fertilizer_costs', {})
            cost_percentages = cost_analysis.get('cost_percentages', {})
            fertilizer_dosages = calc_results.get('fertilizer_dosages', {})

            # Separate costs by type
            macro_costs = []
            micro_costs = []

            for fert, cost in fertilizer_costs.items():
                if cost > 0:
                    percentage = cost_percentages.get(fert, 0)
                    dosage_info = fertilizer_dosages.get(fert, {})
                    dosage_g_l = self._extract_dosage_value(dosage_info)

                    is_micro_fert = any(micro in fert.lower()
                                        for micro in ['hierro', 'iron', 'manganeso', 'zinc', 'cobre', 'copper', 'borico', 'molibdato'])

                    fert_type = 'Micronutriente' if is_micro_fert else 'Macronutriente'

                    cost_row = [
                        fert, f"₡{cost:.3f}", f"{percentage:.1f}%", fert_type, f"{dosage_g_l:.4f}", f"{dosage_g_l * 1000:.2f} L"
                    ]

                    if is_micro_fert:
                        micro_costs.append(cost_row)
                    else:
                        macro_costs.append(cost_row)

            # Add macro costs first, then micro costs
            for cost_row in macro_costs:
                cost_data.append(cost_row)
            for cost_row in micro_costs:
                cost_data.append(cost_row)

            # Add totals
            total_cost = cost_analysis.get('total_cost_crc', 0)
            macro_total = sum(cost for fert, cost in fertilizer_costs.items()
                              if not any(micro in fert.lower() for micro in ['hierro', 'iron', 'manganeso', 'zinc', 'cobre', 'copper', 'borico', 'molibdato']))
            micro_total = total_cost - macro_total

            cost_data.append(
                ['SUBTOTAL MACRONUTRIENTES', f"₡{macro_total:.3f}", f"{macro_total/total_cost*100:.1f}%", 'Subtotal', ''])
            cost_data.append(
                ['SUBTOTAL MICRONUTRIENTES', f"₡{micro_total:.3f}", f"{micro_total/total_cost*100:.1f}%", 'Subtotal', ''])
            cost_data.append(
                ['TOTAL GENERAL', f"₡{total_cost:.2f}", '100.0%', 'Total', ''])

            cost_table = Table(cost_data, colWidths=[
                               2.5*inch, 1.5*inch, 1.2*inch, 1.5*inch, 1.2*inch])

            # Enhanced cost table styling
            cost_style = [
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -4), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -4),
                 [colors.white, colors.lightgrey]),

                # Subtotal rows
                ('BACKGROUND', (0, -3), (-1, -2), colors.lightyellow),
                ('FONTNAME', (0, -3), (-1, -2), 'Helvetica-Bold'),

                # Total row
                ('BACKGROUND', (0, -1), (-1, -1), colors.darkgreen),
                ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ]

            # Color-code micronutrient rows
            row_index = 1
            for fert, cost in fertilizer_costs.items():
                if cost > 0:
                    is_micro_fert = any(micro in fert.lower()
                                        for micro in ['hierro', 'iron', 'manganeso', 'zinc', 'cobre', 'copper', 'borico', 'molibdato'])
                    if is_micro_fert:
                        cost_style.append(
                            ('BACKGROUND', (3, row_index), (3, row_index), colors.orange))
                        cost_style.append(
                            ('TEXTCOLOR', (3, row_index), (3, row_index), colors.white))
                        cost_style.append(
                            ('FONTNAME', (3, row_index), (3, row_index), 'Helvetica-Bold'))
                    row_index += 1

            cost_table.setStyle(TableStyle(cost_style))
            elements.append(cost_table)
                
            # Pie graph for cost distribution
            print("Creating cost distribution pie chart")
            elements.append(Spacer(1, 20))
            print("DEBUG: Cost analysis data:", cost_analysis)
            cost_pie_graph = self._create_cost_distribution_pie_chart(cost_analysis, fertilizer_costs, cost_percentages)
            if cost_pie_graph:
                print("Cost distribution pie chart created successfully")
                elements.append(cost_pie_graph)

        return elements

    def _create_cost_distribution_pie_chart(self, cost_analysis: Dict[str, Any], fertilizer_costs: Dict[str, float], cost_percentages: Dict[str, float]) -> Optional[object]:
        """Create a pie chart for cost distribution of fertilizers"""
        if not REPORTLAB_AVAILABLE:
            print("ReportLab not available, cannot create cost distribution pie chart")
            return None

        try:
            from reportlab.graphics.shapes import Drawing
            from reportlab.graphics.charts.piecharts import Pie
            from reportlab.lib import colors

            print(f"Creating pie chart with fertilizer_costs: {len(fertilizer_costs)} items")
            print(f"Cost percentages: {len(cost_percentages)} items")

            # Prepare data for the pie chart
            pie_data = []
            for fert, cost in fertilizer_costs.items():
                if cost > 0:
                    percentage = cost_percentages.get(fert, 0)
                    if percentage > 0:  # Only include if there's a valid percentage
                        pie_data.append((fert, percentage))

            if not pie_data:
                print("No valid data available for cost distribution pie chart")
                return None

            # Limit to top 8 fertilizers to avoid cluttered chart
            pie_data = sorted(pie_data, key=lambda x: x[1], reverse=True)[:8]
            
            print(f"Final pie chart data: {pie_data}")
            
            # Create the pie chart
            print(f"Creating pie chart with {len(pie_data)} fertilizers")
            pie_chart = Pie()
            pie_chart.x = 50
            pie_chart.y = 50
            pie_chart.width = 300
            pie_chart.height = 300
            pie_chart.data = [value for _, value in pie_data]
            pie_chart.labels = [label[:15] + '...' if len(label) > 15 else label for label, _ in pie_data]
            pie_chart.slices.strokeWidth = 1
            pie_chart.slices.fontName = 'Helvetica'
            pie_chart.slices.fontSize = 8

            # Set colors only for the actual data slices
            colors_list = [colors.blue, colors.green, colors.red, colors.orange, colors.purple, colors.grey, colors.cyan, colors.magenta]
            num_slices = len(pie_data)
            print(f"Setting colors for {num_slices} slices")
            
            if num_slices > 0:
                for i in range(num_slices):
                    pie_chart.slices[i].fillColor = colors_list[i % len(colors_list)]
                    print(f"Set color for slice {i}: {colors_list[i % len(colors_list)]}")
            else:
                print("No slices to color")
                return None

            # Create drawing and add title
            drawing = Drawing(400, 380)
            drawing.add(pie_chart)
            
            # Add title
            from reportlab.graphics.shapes import String
            title = String(200, 360, 'Distribución de Costos por Fertilizante', textAnchor='middle')
            title.fontName = 'Helvetica-Bold'
            title.fontSize = 12
            drawing.add(title)

            print("Cost distribution pie chart created successfully")
            return drawing

        except ImportError as e:
            print(f"Error creating cost distribution pie chart: {e}")
            return None
        
    def _find_enhanced_composition(self, fert_name: str, fertilizer_db: Dict) -> Optional[Dict]:
        """Find enhanced fertilizer composition in database"""
        try:
            # Use the proper database method to find fertilizer composition
            enhanced_db = EnhancedFertilizerDatabase()
            composition_data = enhanced_db.find_fertilizer_composition(
                fert_name, "")

            if composition_data:
                print(
                    f"        Found composition for {fert_name}: {composition_data['formula']}")
                return composition_data

            print(f"        No composition found for: {fert_name}")
            return None

        except Exception as e:
            print(f"        Error finding composition for {fert_name}: {e}")
            return None

    def _get_main_elements(self, cations: Dict, anions: Dict) -> List:
        """Get main elements with their molecular weights"""
        elements = []

        # Add significant cations (>0)
        for elem, weight in cations.items():
            if weight > 0:
                elements.append((elem, weight))

        # Add significant anions (>0)
        for elem, weight in anions.items():
            if weight > 0:
                elements.append((elem, weight))

        # Sort by weight (descending) and return top 2
        elements.sort(key=lambda x: x[1], reverse=True)
        return elements[:2]

    def _calculate_contribution(self, dosage_mg_l: float, element_fraction: float, purity: float) -> float:
        """Calculate nutrient contribution from fertilizer"""
        return dosage_mg_l * element_fraction * purity / 100.0

    def _calculate_anion_sum(self, dosage_mg_l: float, anions: Dict, purity: float) -> float:
        """Calculate sum of anion contributions"""
        anion_sum = 0.0
        for elem, fraction in anions.items():
            anion_sum += self._calculate_contribution(
                dosage_mg_l, fraction, purity)
        return anion_sum

    def _get_main_micronutrient_contribution(self, fert_name: str, dosage_g_l: float) -> tuple:
        """Get main micronutrient and its contribution from fertilizer name"""
        micro_map = {
            'hierro': ('Fe', dosage_g_l * 0.2),  # Typical Fe content
            'iron': ('Fe', dosage_g_l * 0.2),
            'manganeso': ('Mn', dosage_g_l * 0.3),
            'zinc': ('Zn', dosage_g_l * 0.25),
            'cobre': ('Cu', dosage_g_l * 0.25),
            'copper': ('Cu', dosage_g_l * 0.25),
            'borico': ('B', dosage_g_l * 0.17),
            'molibdato': ('Mo', dosage_g_l * 0.4)
        }

        fert_lower = fert_name.lower()
        for keyword, (element, contribution) in micro_map.items():
            if keyword in fert_lower:
                return element, contribution

        return 'Unknown', 0.0

    def _extract_dosage_value(self, dosage_info) -> float:
        """ENHANCED: Extract dosage value from dosage_info with detailed debugging"""
        print(
            f"      Extracting dosage from: dosage_ml_per_L={getattr(dosage_info, 'dosage_ml_per_L', 'N/A')} dosage_g_per_L={getattr(dosage_info, 'dosage_g_per_L', 'N/A')} (type: {type(dosage_info)})")

        # Handle Pydantic model objects - prioritize dosage_g_per_L
        if hasattr(dosage_info, 'dosage_g_per_L'):
            try:
                value = getattr(dosage_info, 'dosage_g_per_L')
                if value is not None and value != 0:
                    result = float(value)
                    print(f"        Found dosage_g_per_L: {result}")
                    return result
            except (ValueError, TypeError) as e:
                print(f"        dosage_g_per_L conversion failed: {e}")

        # Try dosage_ml_per_L as backup
        if hasattr(dosage_info, 'dosage_ml_per_L'):
            try:
                value = getattr(dosage_info, 'dosage_ml_per_L')
                if value is not None and value != 0:
                    result = float(value)
                    print(f"        Found dosage_ml_per_L: {result}")
                    return result
            except (ValueError, TypeError) as e:
                print(f"        dosage_ml_per_L conversion failed: {e}")

        if isinstance(dosage_info, dict):
            # Try different possible keys with debugging
            possible_keys = ['dosage_g_per_L',
                             'dosage_g_L', 'dosage', 'dosage_ml_per_L']

            for key in possible_keys:
                if key in dosage_info:
                    value = dosage_info[key]
                    print(f"        Found key '{key}': {value}")
                    try:
                        result = float(value)
                        print(f"        Converted to float: {result}")
                        return result
                    except (ValueError, TypeError) as e:
                        print(f"        Conversion failed: {e}")
                        continue

            # If no standard keys found, try first numeric value
            for key, value in dosage_info.items():
                print(f"        Trying key '{key}': {value}")
                try:
                    result = float(value)
                    print(f"        Successfully converted: {result}")
                    return result
                except (ValueError, TypeError):
                    continue

            print(f"        No numeric values found in dict")
            return 0.0

        else:
            # Assume it's already a numeric value
            try:
                result = float(dosage_info)
                print(f"        Direct conversion: {result}")
                return result
            except (ValueError, TypeError):
                print(f"        Direct conversion failed")
                return 0.0

    def _get_status_color(self, status: str):
        """Get color based on nutrient status"""
        if REPORTLAB_AVAILABLE:
            status_lower = status.lower()
            if 'adequate' in status_lower or 'optimal' in status_lower or 'good' in status_lower:
                return colors.green
            elif 'deficient' in status_lower or 'low' in status_lower or 'insufficient' in status_lower:
                return colors.red
            elif 'excessive' in status_lower or 'high' in status_lower or 'excess' in status_lower:
                return colors.orange
            elif 'warning' in status_lower or 'caution' in status_lower:
                return colors.yellow
            else:
                return colors.black
        else:
            return None

    def generate_comprehensive_pdf(self, calculation_data: Dict[str, Any], filename: str = None) -> str:
        """Alias for generate_enhanced_pdf for backward compatibility"""
        return self.generate_enhanced_pdf(calculation_data, filename)

    def _create_enhanced_fertilizer_row_with_marking(self, fert_name: str, dosage_info, fertilizer_db: Dict) -> List:
        """
        Enhanced fertilizer row creation with special marking for required fertilizers
        """
        dosage_g_l = self._extract_dosage_value(dosage_info)

        # Check if this is a required fertilizer
        is_required_fertilizer = '[Fertilizante Requerido]' in fert_name

        print(f"      Creating enhanced row for {fert_name}: {dosage_g_l:.4f} g/L" +
              (" [REQUIRED]" if is_required_fertilizer else ""))

        # Get enhanced composition from database
        # Remove the required marker for composition lookup
        clean_name = fert_name.replace(' [Fertilizante Requerido]', '')
        composition_data = self._find_enhanced_composition(
            clean_name, fertilizer_db)

        if composition_data:
            molecular_weight = composition_data['mw']
            cations = composition_data['cations']
            anions = composition_data['anions']
            print(
                f"        Found enhanced composition: {composition_data['formula']}")
        else:
            # Default composition
            molecular_weight = 100
            cations = {elem: 0 for elem in [
                'Ca', 'K', 'Mg', 'Na', 'NH4', 'Fe', 'Mn', 'Zn', 'Cu']}
            anions = {elem: 0 for elem in [
                'N', 'S', 'Cl', 'P', 'HCO3', 'B', 'Mo']}
            print(f"        Using default composition")

        dosage_mg_l = dosage_g_l * 1000
        dosage_mmol_l = dosage_mg_l / molecular_weight if molecular_weight > 0 else 0

        # Get main elements for molecular weight display
        main_elements = self._get_main_elements(cations, anions)
        elem1_weight = main_elements[0][1] if len(main_elements) > 0 else 0
        elem2_weight = main_elements[1][1] if len(main_elements) > 1 else 0

        # Calculate nutrient contributions (including micronutrients)
        purity_factor = 98.0 / 100.0

        # Special formatting for required fertilizers
        display_name = fert_name
        if is_required_fertilizer:
            # Add special marker for required fertilizers
            display_name = f"[TEST] {clean_name} [REQ]"

        # Enhanced row with ALL elements including micronutrients
        row = [
            # FERTILIZANTE (with special marking)
            display_name,
            "98.0",                                         # % P (purity)
            # Peso molecular (Sal)
            f"{molecular_weight:.1f}",
            # Peso molecular (Elem1)
            f"{elem1_weight:.1f}",
            # Peso molecular (Elem2)
            f"{elem2_weight:.1f}",
            # Peso de sal (g/L) - enhanced precision
            f"{dosage_g_l:.4f}",
            # Peso de sal (mmol/L)
            f"{dosage_mmol_l:.4f}",

            # Macronutrient contributions
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Ca', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('K', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Mg', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Na', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('NH4', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('N', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('N', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('S', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('S', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('Cl', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('P', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('P', 0), purity_factor):.1f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('HCO3', 0), purity_factor):.1f}",

            # MICRONUTRIENT CONTRIBUTIONS (Enhanced precision for required fertilizers)
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Fe', 0), purity_factor):.3f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Mn', 0), purity_factor):.3f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Zn', 0), purity_factor):.3f}",
            f"{self._calculate_contribution(dosage_mg_l, cations.get('Cu', 0), purity_factor):.3f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('B', 0), purity_factor):.3f}",
            f"{self._calculate_contribution(dosage_mg_l, anions.get('Mo', 0), purity_factor):.3f}",

            # Summary columns
            f"{self._calculate_anion_sum(dosage_mg_l, anions, purity_factor):.1f}",
            f"{dosage_mmol_l * 0.1:.3f}"                   # CE contribution
        ]

        return row

    def _apply_required_fertilizer_styling(self, table: object, fertilizer_dosages: Dict, fertilizer_rows_added: int) -> None:
        """
        Apply special styling to required fertilizer rows in the PDF table
        """
        if not REPORTLAB_AVAILABLE:
            return

        # Count required fertilizers and apply styling
        row_index = 1  # Start after header row
        required_fertilizer_rows = []

        for fert_name, dosage_info in fertilizer_dosages.items():
            dosage_g_l = self._extract_dosage_value(dosage_info)

            if dosage_g_l > 0:  # Active fertilizer
                is_required = '[Fertilizante Requerido]' in fert_name

                if is_required:
                    required_fertilizer_rows.append(row_index)
                    print(
                        f"      Marking row {row_index} as required fertilizer: {fert_name}")

                row_index += 1

        # Apply special styling to required fertilizer rows
        additional_styles = []

        for req_row in required_fertilizer_rows:
            # Highlight entire row with special background
            additional_styles.extend([
                ('BACKGROUND', (0, req_row), (-1, req_row), colors.lightcyan),
                ('TEXTCOLOR', (0, req_row), (0, req_row), colors.darkblue),
                ('FONTNAME', (0, req_row), (0, req_row), 'Helvetica-Bold'),

                # Special highlighting for micronutrient columns (Fe, Mn, Zn, Cu, B, Mo)
                ('BACKGROUND', (20, req_row), (25, req_row),
                 colors.lightyellow),  # Micronutrient columns
                ('TEXTCOLOR', (20, req_row), (25, req_row), colors.darkred),
                ('FONTNAME', (20, req_row), (25, req_row), 'Helvetica-Bold'),
            ])

        # Apply additional styles to the table
        for style_command in additional_styles:
            table.setStyle(TableStyle([style_command]))

        print(
            f"      Applied special styling to {len(required_fertilizer_rows)} required fertilizer rows")

    def _create_required_fertilizers_legend(self) -> List:
        """
        Create a legend explaining the required fertilizer notation
        """
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []

        legend_title = Paragraph(
            "<b>LEYENDA DE FERTILIZANTES</b>",
            ParagraphStyle('LegendTitle', parent=self.styles['Heading3'],
                           fontSize=12, textColor=colors.darkblue, spaceAfter=10)
        )
        elements.append(legend_title)

        legend_data = [
            ['Símbolo', 'Significado', 'Descripción'],
            ['[TEST] [REQ]', 'Fertilizante Requerido',
                'Agregado automáticamente para completar micronutrientes'],
            ['[FORM] Normal', 'Fertilizante del Catálogo API',
                'Obtenido del catálogo principal del sistema'],
            ['Fondo Celeste', 'Fila de Fertilizante Requerido',
                'Indica suplementación automática de micronutrientes'],
            ['Texto Azul/Rojo', 'Columnas de Micronutrientes',
                'Valores de Fe, Mn, Zn, Cu, B, Mo resaltados']
        ]

        legend_table = Table(legend_data, colWidths=[
                             1.5*inch, 2.5*inch, 3.5*inch])
        legend_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1),
             [colors.white, colors.lightgrey]),

            # Special styling for required fertilizer example
            ('BACKGROUND', (0, 1), (-1, 1), colors.lightcyan),
            ('TEXTCOLOR', (0, 1), (0, 1), colors.darkblue),
            ('FONTNAME', (0, 1), (0, 1), 'Helvetica-Bold'),
        ]))

        elements.append(legend_table)
        elements.append(Spacer(1, 15))

        # Add note about micronutrient supplementation
        note_text = """
        <b>NOTA IMPORTANTE:</b> Los fertilizantes marcados como [Fertilizante Requerido] son agregados 
        automáticamente por el sistema cuando el catálogo de la API no contiene fuentes suficientes 
        de micronutrientes para alcanzar los objetivos nutricionales. Estos fertilizantes están 
        basados en las mejores prácticas de nutrición hidropónica y utilizan fuentes estándar 
        de la industria.
        """

        note_paragraph = Paragraph(
            note_text,
            ParagraphStyle('Note', parent=self.styles['Normal'],
                           fontSize=9, textColor=colors.darkgreen,
                           leftIndent=20, rightIndent=20, spaceAfter=15)
        )
        elements.append(note_paragraph)

        return elements

    def _create_micronutrient_supplementation_summary(self, calculation_data: Dict[str, Any]) -> List:
        """
        Create summary of micronutrient supplementation performed
        """
        if not REPORTLAB_AVAILABLE:
            return []

        elements = []

        # Extract supplementation info
        integration_metadata = calculation_data.get('integration_metadata', {})
        micronutrients_added = integration_metadata.get(
            'micronutrients_added', 0)

        if micronutrients_added == 0:
            return elements  # No supplementation performed

        summary_title = Paragraph(
            "<b>RESUMEN DE SUPLEMENTACIÓN AUTOMÁTICA DE MICRONUTRIENTES</b>",
            ParagraphStyle('SupplementTitle', parent=self.styles['Heading3'],
                           fontSize=12, textColor=colors.darkorange, spaceAfter=15)
        )
        elements.append(summary_title)

        # Supplementation statistics
        calc_results = calculation_data.get('calculation_results', {})
        fertilizer_dosages = calc_results.get('fertilizer_dosages', {})

        # Count and list required fertilizers
        required_fertilizers = []
        for fert_name, dosage_info in fertilizer_dosages.items():
            if '[Fertilizante Requerido]' in fert_name:
                dosage_g_l = self._extract_dosage_value(dosage_info)
                if dosage_g_l > 0:
                    clean_name = fert_name.replace(
                        ' [Fertilizante Requerido]', '')
                    micronutrient = self._identify_primary_micronutrient(
                        clean_name)
                    required_fertilizers.append({
                        'name': clean_name,
                        'micronutrient': micronutrient,
                        'dosage': dosage_g_l
                    })

        if required_fertilizers:
            summary_data = [
                ['Fertilizante Requerido', 'Micronutriente Principal',
                    'Dosificación (g/L)', 'Propósito']
            ]

            for fert in required_fertilizers:
                purpose = self._get_micronutrient_purpose(
                    fert['micronutrient'])
                summary_data.append([
                    fert['name'],
                    fert['micronutrient'],
                    f"{fert['dosage']:.4f}",
                    purpose
                ])

            summary_table = Table(summary_data, colWidths=[
                                  2.5*inch, 1.2*inch, 1.2*inch, 2.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkorange),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.lightcyan, colors.white]),
            ]))

            elements.append(summary_table)
            elements.append(Spacer(1, 15))

        return elements

    def _identify_primary_micronutrient(self, fertilizer_name: str) -> str:
        """Identify the primary micronutrient from fertilizer name"""
        name_lower = fertilizer_name.lower()

        micronutrient_map = {
            'hierro': 'Fe',
            'iron': 'Fe',
            'fe-edta': 'Fe',
            'manganeso': 'Mn',
            'manganese': 'Mn',
            'zinc': 'Zn',
            'cobre': 'Cu',
            'copper': 'Cu',
            'borico': 'B',
            'boric': 'B',
            'molibdato': 'Mo',
            'molybdate': 'Mo'
        }

        for keyword, micro in micronutrient_map.items():
            if keyword in name_lower:
                return micro

        return 'Unknown'

    def _get_micronutrient_purpose(self, micronutrient: str) -> str:
        """Get the biological purpose of each micronutrient"""
        purposes = {
            'Fe': 'Fotosíntesis y transporte de electrones',
            'Mn': 'Activación enzimática y fotosíntesis',
            'Zn': 'Síntesis de proteínas y hormonas',
            'Cu': 'Transporte de electrones y lignificación',
            'B': 'Formación de paredes celulares',
            'Mo': 'Fijación de nitrógeno y metabolismo'
        }

        return purposes.get(micronutrient, 'Función metabólica esencial')
    
        
    def generate_comprehensive_constrained_report(self, 
                                             target_concentrations: Dict[str, float],
                                             achieved_concentrations: Dict[str, float],
                                             dosages: Dict[str, float],
                                             water_analysis: Dict[str, float],
                                             volume_liters: float,
                                             cost_analysis: Dict[str, Any],
                                             constraint_analysis: Dict[str, Any],
                                             solver_info: Dict[str, Any],
                                             fertilizer_data: Dict[str, Any],
                                             verification_result: Dict[str, Any],
                                             filename: str,
                                             calculation_data: Dict[str, Any]) -> bool:
        """
        Generate comprehensive constrained fertilizer report with all standard tables plus constraint analysis
        
        This method combines:
        1. All standard calculation tables (like generate_comprehensive_pdf)
        2. Constraint-specific analysis and tables
        3. Enhanced recommendations and optimization suggestions
        """
        try:
            print(f"[PDF] Generating comprehensive constrained report: {filename}")
            
            # Create document with larger page size to accommodate more content
            doc = SimpleDocTemplate(filename, pagesize=letter, 
                                rightMargin=0.5*inch, leftMargin=0.5*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
            
            story = []
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle('CustomTitle',
                                    parent=styles['Heading1'],
                                    fontSize=18,
                                    spaceAfter=30,
                                    alignment=1,  # Center
                                    textColor=colors.darkblue)
            
            section_style = ParagraphStyle('SectionHeader',
                                        parent=styles['Heading2'],
                                        fontSize=14,
                                        spaceAfter=12,
                                        textColor=colors.darkgreen,
                                        borderWidth=1,
                                        borderColor=colors.darkgreen,
                                        borderPadding=5)
            
            subsection_style = ParagraphStyle('SubsectionHeader',
                                            parent=styles['Heading3'],
                                            fontSize=12,
                                            spaceAfter=8,
                                            textColor=colors.darkblue)
            
            # =================
            # 1. TITLE PAGE
            # =================
            story.append(Paragraph("COMPREHENSIVE CONSTRAINED FERTILIZER REPORT", title_style))
            story.append(Spacer(1, 20))
            
            # Report metadata
            story.append(Paragraph("REPORT INFORMATION", section_style))
            
            metadata_data = [
                ['Parameter', 'Value'],
                ['Report Type', 'Comprehensive Constrained Analysis'],
                ['Volume (L)', f"{volume_liters:,.0f}"],
                ['Optimization Method', solver_info.get('solver', 'Unknown')],
                ['Constraints Applied', f"{constraint_analysis.get('total_constraints', 0)}"],
                ['Constraint Priority', solver_info.get('constraint_priority', 'N/A')],
                ['Generated', datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                ['Quality Score', f"{verification_result.get('quality_metrics', {}).get('overall_score', 0):.1f}/100"],
                ['Safety Level', verification_result.get('safety_assessment', {}).get('safety_level', 'unknown')]
            ]
            
            metadata_table = Table(metadata_data, colWidths=[2.5*inch, 2*inch])
            metadata_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(metadata_table)
            story.append(PageBreak())
           
            main_table = self._create_enhanced_main_table(calculation_data)
            story.append(main_table)
            story.append(PageBreak())
            
            # ======================
            # 2. EXECUTIVE SUMMARY
            # ======================
            story.append(Paragraph("EXECUTIVE SUMMARY", section_style))
            
            # Performance metrics
            perf_summary = verification_result.get('performance_summary', {})
            avg_deviation = verification_result.get('average_deviation_percent', 0)
            total_cost = cost_analysis.get('total_cost_concentrated', 0)
            
            summary_text = f"""
            <b>Solution Performance:</b><br/>
            • Average nutrient deviation: {avg_deviation:.2f}%<br/>
            • Success rate: {perf_summary.get('success_rate_percent', 0):.1f}% (excellent + good nutrients)<br/>
            • Quality grade: {verification_result.get('quality_metrics', {}).get('grade', 'N/A')}<br/>
            <br/>
            <b>Constraint Compliance:</b><br/>
            • Total constraints applied: {constraint_analysis.get('total_constraints', 0)}<br/>
            • Constraints satisfied: {constraint_analysis.get('constraints_met', 0)}<br/>
            • Constraint violations: {len(constraint_analysis.get('violations', []))}<br/>
            <br/>
            <b>Cost Analysis:</b><br/>
            • Total solution cost: ₡{total_cost:.3f}<br/>
            • Cost per liter: ₡{cost_analysis.get('cost_per_liter_diluted', 0):.4f}<br/>
            • Total fertilizer usage: {sum(dosages.values()):.3f} g/L<br/>
            """
            
            story.append(Paragraph(summary_text, styles['Normal']))
            story.append(Spacer(1, 20))
            
            # ======================
            # 3. CONSTRAINT ANALYSIS
            # ======================
            story.append(Paragraph("CONSTRAINT ANALYSIS", section_style))
            
            if constraint_analysis.get('constraint_details'):
                # Constraint compliance table
                story.append(Paragraph("Fertilizer Constraints Compliance", subsection_style))
                
                constraint_data = [['Fertilizer', 'Min Limit', 'Max Limit', 'Actual Dosage', 'Status', 'Compliance']]
                
                for detail in constraint_analysis['constraint_details']:
                    fert_name = detail['fertilizer']
                    min_req = detail.get('min_required', 0)
                    max_allowed = detail.get('max_allowed', '∞')
                    actual = detail.get('dosage', 0)
                    status = detail.get('compliance', 'unknown')
                    
                    # Format values
                    min_str = f"{min_req:.3f} g/L" if min_req > 0 else "No limit"
                    max_str = f"{max_allowed:.3f} g/L" if max_allowed != float('inf') else "No limit"
                    actual_str = f"{actual:.3f} g/L"
                    status_str = "✓ Met" if status == 'met' else "✗ Violated"
                    
                    # Compliance percentage
                    if min_req <= actual <= (max_allowed if max_allowed != float('inf') else float('inf')):
                        compliance_pct = "100%"
                    else:
                        if actual < min_req:
                            compliance_pct = f"{(actual/min_req*100):.1f}%" if min_req > 0 else "0%"
                        else:
                            compliance_pct = f"{(max_allowed/actual*100):.1f}%" if max_allowed != float('inf') else "0%"
                    
                    constraint_data.append([fert_name, min_str, max_str, actual_str, status_str, compliance_pct])
                
                constraint_table = Table(constraint_data, colWidths=[1.8*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.7*inch, 0.7*inch])
                constraint_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                story.append(constraint_table)
                story.append(Spacer(1, 15))
            
            # Constraint violations detail (if any)
            violations = constraint_analysis.get('violations', [])
            if violations:
                story.append(Paragraph("Constraint Violations Detail", subsection_style))
                
                violation_data = [['Fertilizer', 'Violation Type', 'Required', 'Actual', 'Impact']]
                
                for violation in violations:
                    fert_name = violation['fertilizer']
                    viol_type = violation.get('violation_type', 'unknown')
                    
                    if viol_type == 'below_minimum':
                        required = f"{violation.get('min_required', 0):.3f} g/L"
                        type_str = "Below minimum"
                        impact = "May reduce nutrient delivery"
                    else:
                        required = f"{violation.get('max_allowed', 0):.3f} g/L"
                        type_str = "Above maximum"
                        impact = "May cause nutrient excess"
                    
                    actual = f"{violation.get('dosage', 0):.3f} g/L"
                    
                    violation_data.append([fert_name, type_str, required, actual, impact])
                
                violation_table = Table(violation_data, colWidths=[1.5*inch, 1.2*inch, 1*inch, 0.8*inch, 1.5*inch])
                violation_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.mistyrose),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                story.append(violation_table)
                story.append(Spacer(1, 15))
            
            story.append(PageBreak())
            
            # =============================
            # 4. STANDARD CALCULATION TABLES (from generate_comprehensive_pdf)
            # =============================
            
            # Prepare calculation data in the format expected by existing methods
            calculation_data = {
                'calculation_results': {
                    'fertilizer_dosages': dosages,
                    'achieved_concentrations': achieved_concentrations,
                    'water_analysis': water_analysis,
                    'target_concentrations': target_concentrations
                },
                'fertilizer_database': fertilizer_data,
                'integration_metadata': {
                    'volume_liters': volume_liters,
                    'solver_info': solver_info
                }
            }
            
            # Store current context for PDF generation
            self._current_water_analysis = water_analysis
            self._current_targets = target_concentrations
            
            # Generate standard calculation tables
            story.append(Paragraph("DETAILED CALCULATION TABLES", section_style))
            
            # Table 1: Fertilizer composition and dosages
            story.append(Paragraph("Fertilizer Dosages and Composition", subsection_style))
            
            fertilizer_table_data = [['Fertilizer', 'Dosage (g/L)', 'Dosage (kg/1000L)', 'Main Nutrients', 'Constrained?']]
            
            constrained_names = {detail['fertilizer'] for detail in constraint_analysis.get('constraint_details', [])}
            
            for fert_name, dosage in dosages.items():
                if dosage > 0.001:
                    dosage_g_l = f"{dosage:.3f}"
                    dosage_kg_1000l = f"{dosage:.3f}"
                    
                    # Get main nutrients from fertilizer data
                    fert_data = fertilizer_data.get(fert_name, {})
                    main_nutrients = []
                    
                    # Extract main nutrients (>5% content)
                    cations = fert_data.get('cations', {})
                    anions = fert_data.get('anions', {})
                    
                    for nutrient, content in {**cations, **anions}.items():
                        if content > 5:
                            main_nutrients.append(f"{nutrient}:{content:.1f}%")
                    
                    main_nutrients_str = ", ".join(main_nutrients[:3]) if main_nutrients else "Mixed"
                    is_constrained = "Yes" if fert_name in constrained_names else "No"
                    
                    fertilizer_table_data.append([fert_name, dosage_g_l, dosage_kg_1000l, main_nutrients_str, is_constrained])
            
            fert_table = Table(fertilizer_table_data, colWidths=[2*inch, 0.8*inch, 1*inch, 1.5*inch, 0.7*inch])
            fert_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(fert_table)
            story.append(Spacer(1, 20))
            
            # Table 2: Nutrient achievement analysis
            story.append(Paragraph("Nutrient Achievement vs Targets", subsection_style))
            
            nutrient_table_data = [['Nutrient', 'Target', 'Water', 'Fertilizer', 'Final', 'Deviation', 'Status']]
            
            for nutrient in sorted(target_concentrations.keys()):
                target = target_concentrations[nutrient]
                water_contrib = water_analysis.get(nutrient, 0)
                final = achieved_concentrations.get(nutrient, 0)
                fertilizer_contrib = final - water_contrib
                
                if target > 0:
                    deviation = ((final - target) / target) * 100
                    deviation_str = f"{deviation:+.1f}%"
                    
                    # Status based on deviation
                    if abs(deviation) <= 5:
                        status = "Excellent"
                        status_color = colors.darkgreen
                    elif abs(deviation) <= 15:
                        status = "Good"
                        status_color = colors.green
                    elif abs(deviation) <= 25:
                        status = "Fair"
                        status_color = colors.orange
                    else:
                        status = "Poor"
                        status_color = colors.red
                    
                    nutrient_table_data.append([
                        nutrient,
                        f"{target:.2f}",
                        f"{water_contrib:.2f}",
                        f"{fertilizer_contrib:.2f}",
                        f"{final:.2f}",
                        deviation_str,
                        status
                    ])
            
            nutrient_table = Table(nutrient_table_data, colWidths=[0.8*inch, 0.7*inch, 0.7*inch, 0.8*inch, 0.7*inch, 0.8*inch, 0.7*inch])
            nutrient_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(nutrient_table)
            story.append(Spacer(1, 20))
            
            # Table 3: Cost analysis
            story.append(Paragraph("Detailed Cost Analysis", subsection_style))
            
            cost_table_data = [['Fertilizer', 'Amount (kg)', 'Unit Cost', 'Total Cost', '% of Total', 'Cost/g/L']]
            
            for fert_name, dosage in dosages.items():
                if dosage > 0.001:
                    details = cost_analysis.get('dosage_details', {}).get(fert_name, {})
                    amount_kg = details.get('amount_kg', 0)
                    total_cost = details.get('cost_total', 0)
                    cost_percentage = details.get('percentage_of_total_cost', 0)
                    cost_per_g_l = details.get('cost_per_g_l', 0)
                    
                    # Calculate unit cost per kg
                    unit_cost = (total_cost / amount_kg) if amount_kg > 0 else 0
                    
                    cost_table_data.append([
                        fert_name,
                        f"{amount_kg:.3f}",
                        f"₡{unit_cost:.2f}/kg",
                        f"₡{total_cost:.3f}",
                        f"{cost_percentage:.1f}%",
                        f"₡{cost_per_g_l:.3f}"
                    ])
            
            # Add total row
            total_cost = cost_analysis.get('total_cost_concentrated', 0)
            cost_table_data.append([
                'TOTAL',
                '',
                '',
                f"₡{total_cost:.3f}",
                '100.0%',
                ''
            ])
            
            cost_table = Table(cost_table_data, colWidths=[2*inch, 0.8*inch, 1*inch, 0.8*inch, 0.6*inch, 0.8*inch])
            cost_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgoldenrod),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BACKGROUND', (0, 1), (-2, -1), colors.lightyellow),
                ('BACKGROUND', (0, -1), (-1, -1), colors.darkgoldenrod),  # Total row
                ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(cost_table)
            story.append(PageBreak())
            
            # ================================
            # 5. OPTIMIZATION RECOMMENDATIONS
            # ================================
            story.append(Paragraph("OPTIMIZATION RECOMMENDATIONS", section_style))
            
            # Constraint-specific recommendations
            recommendations = verification_result.get('recommendations', [])
            cost_suggestions = cost_analysis.get('optimization_suggestions', [])
            
            story.append(Paragraph("Solution Quality Recommendations", subsection_style))
            
            rec_text = ""
            for i, rec in enumerate(recommendations, 1):
                rec_text += f"{i}. {rec}<br/>"
            
            if rec_text:
                story.append(Paragraph(rec_text, styles['Normal']))
            else:
                story.append(Paragraph("No specific recommendations - solution appears well optimized.", styles['Normal']))
            
            story.append(Spacer(1, 15))
            
            # Cost optimization recommendations
            if cost_suggestions:
                story.append(Paragraph("Cost Optimization Suggestions", subsection_style))
                
                cost_rec_text = ""
                for i, suggestion in enumerate(cost_suggestions, 1):
                    cost_rec_text += f"{i}. {suggestion.get('message', 'Unknown suggestion')}<br/>"
                
                story.append(Paragraph(cost_rec_text, styles['Normal']))
                story.append(Spacer(1, 15))
            
            # Constraint adjustment recommendations
            if len(constraint_analysis.get('violations', [])) > 0:
                story.append(Paragraph("Constraint Adjustment Recommendations", subsection_style))
                
                constraint_rec_text = """
                <b>Constraint violations detected:</b><br/>
                • Consider relaxing overly restrictive constraints<br/>
                • Use 'medium' or 'low' constraint priority for better nutrient targeting<br/>
                • Evaluate if constraint violations significantly impact crop performance<br/>
                • Consider alternative fertilizers that better fit constraint requirements<br/>
                """
                
                story.append(Paragraph(constraint_rec_text, styles['Normal']))
            
            # ==================
            # 6. FINAL SUMMARY
            # ==================
            story.append(Spacer(1, 30))
            story.append(Paragraph("FINAL ASSESSMENT", section_style))
            
            # Overall solution assessment
            quality_score = verification_result.get('quality_metrics', {}).get('overall_score', 0)
            grade = verification_result.get('quality_metrics', {}).get('grade', 'N/A')
            safety_level = verification_result.get('safety_assessment', {}).get('safety_level', 'unknown')
            
            final_assessment = f"""
            <b>Overall Solution Quality:</b> {quality_score:.1f}/100 (Grade: {grade})<br/>
            <b>Safety Assessment:</b> {safety_level.title()}<br/>
            <b>Constraint Compliance:</b> {constraint_analysis.get('constraints_met', 0)}/{constraint_analysis.get('total_constraints', 0)} constraints satisfied<br/>
            <b>Cost Efficiency:</b> {cost_analysis.get('cost_effectiveness', {}).get('relative_cost_rating', 'Unknown')}<br/>
            <br/>
            <b>Recommendation:</b> """
            
            if quality_score >= 80 and safety_level == 'safe' and len(constraint_analysis.get('violations', [])) == 0:
                final_assessment += "Solution is well-optimized and ready for implementation."
            elif quality_score >= 70 and len(constraint_analysis.get('violations', [])) <= 1:
                final_assessment += "Solution is acceptable with minor optimizations possible."
            else:
                final_assessment += "Solution requires review and optimization before implementation."
            
            story.append(Paragraph(final_assessment, styles['Normal']))
            
            # Build PDF
            doc.build(story)
            
            print(f"[PDF] ✅ Comprehensive constrained report generated successfully: {filename}")
            return True
            
        except Exception as e:
            print(f"[PDF] ❌ Failed to generate comprehensive constrained report: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

