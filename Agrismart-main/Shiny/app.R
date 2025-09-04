# ---- Libraries Loading----

if(!require(shiny)){
  install.packages("shiny")
  library(shiny)
}

if(!require(shinydashboard)){
  install.packages("shinydashboard")
  library(shinydashboard)
}

if(!require(shinydashboard)){
  install.packages("shinydashboard")
  library(shinydashboard)
}

if(!require(rsconnect)){
  install.packages("rsconnect")
  library(rsconnect)
}

if(!require(askpass)){
  install.packages("askpass")
  library(askpass)
}

if(!require(httr)){
  install.packages("httr")
  library(httr)
}

if(!require(jsonlite)){
  install.packages("jsonlite")
  library(jsonlite)
}

if(!require(bslib)){
  install.packages("bslib")
  library(bslib)
}

if(!require(DT)){
  install.packages("DT")
  library(DT)
}

if(!require(ggplot2)){
  install.packages("ggplot2")
  library(ggplot2)
}

if(!require(skimr)){
  install.packages("skimr")
  library(skimr)
}

if(!require(dplyr)){
  install.packages("dplyr")
  library(dplyr)
}

if(!require(tidyr)){
  install.packages("tidyr")
  library(tidyr)
}

if(!require(highcharter)){
  install.packages("highcharter")
  library(highcharter)
}

if(!require(stringr)){
  install.packages("stringr")
  library(stringr)
}

if(!require(lubridate)){
  install.packages("lubridate")
  library(lubridate)
}

if(!require(tibble)){
  install.packages("tibble")
  library(tibble)
}

if(!require(colourpicker)){
  install.packages("colourpicker")
  library(colourpicker)
}

if(!require(RColorBrewer)){
  install.packages("RColorBrewer")
  library(RColorBrewer)
}

if(!require(colorspace)){
  install.packages("colorspace")
  library(colorspace)
}

if(!require(stringr)){
  install.packages("stringr")
  library(stringr)
}

if(!require(jsonlite)){
  install.packages("jsonlite")
  library(jsonlite)
}

if(!require(shinyAce)){
  install.packages("shinyAce")
  library(shinyAce)
}

if(!require(magrittr)){
  install.packages("magrittr")
  library(magrittr)
}


# ---- Translation lists----
# ---- translation Login Form lists----
translationsLoginForm <- list(
  en = list(
    LoginForm_Caption = "Login Form",
    Username = "User (email)",
    Password = "Password",
    Login = "Login"
  ),
  es = list(
    LoginForm_Caption = "Pantalla de Autenticación",
    Username = "Usuario (email)",
    Password = "Contraseña",
    Login = "Login"
  )
)

# ---- translation Main Form lists----
translations <- list(
  en = list(
    Apptitle = "AgriSmart",
    selectInput_language_label = "Select a selectInput_language:",
    sideBarMenuItemDashBoard_label = "DashBoard Hourly",
    sideBarMenuItemClimateDashBoard_label = "DashBoard Climate",
    sideBarMenuItemOther_label = "Other",
    selectInput_farm_label = "Select a Farm:",
    selectInput_productionUnit_label = "Select a Production Unit:",
    selectInput_cropProduction_label = " Select a Crop Production:",
    selectInput_measurementVariable_label = "Select a Variable:",
    boxAmbit_tittle_label = "Ambit",
    boxTrend_tittle_label = "Trend",
    checkboxGroupInput_plot_elements_label = "Plot Elements",
    selectInput_graphs_available_label = "Graphs Available",
    selectInput_series_available_label = "Series Available",
    checkboxGroupInput_series_available_label = "Series Available",
    actionButton_newGraph_label = "New Graph",
    actionButton_editGraphLabel = "Edit Graph",
    actionButton_newSeries_label = "New Series",
    actionButton_EditSeries_label = "Edit Series",
    sliderInput_data_range_label = "Select a date range:",
    boxSummary_label = "Summary",    
    LegendTitle = "Type",
    selectInput_script_graphs_available_label = "Select a Graph", 
    actionButton_newGraph_Script_label = "New Graph",
    actionButton_editGraph_Script_label = "Edit Graph", 
    selectInput_script_reports_available_label = "Select a Report",
    actionButton_newReport_Script_label = "New Report",
    actionButton_editReport_Scriptt_label = "Edit a Report"
  ),
  es = list(
    Apptitle = "AgriSmart",
    selectInput_language_label = "Seleccione un idioma:",
    sideBarMenuItemDashBoard_label = "DashBoard Horario",
    sideBarMenuItemClimateDashBoard_label = "DashBoard Clima",
    sideBarMenuItemOther_label = "Otro",
    selectInput_farm_label = "Seleccione una Finca:",
    selectInput_productionUnit_label = "Selecciona una Unidad de Producción:",
    selectInput_cropProduction_label = "Selecciona una Producción de Cultivo:",
    selectInput_measurementVariable_label = "Seleccione una Variable:",
    boxAmbit_tittle_label = "Ambito",
    boxTrend_tittle_label = "Tendencia",
    checkboxGroupInput_plot_elements_label = "Elementos",
    selectInput_graphs_available_label = "Gráficos Disponibles",
    selectInput_series_available_label = "Series Disponibles",
    checkboxGroupInput_series_available_label = "Series Disponibles",
    actionButton_newGraph_label = "Nuevo Gráfico",
    actionButton_editGraphLabel = "Edit Graph",
    actionButton_newSeries_label = "Nueva Serie",
    actionButton_EditSeries_label = "Edit Series",
    sliderInput_data_range_label = "Seleccione un Rango de Fechas",
    boxSummary_label = "Resumen",    
    LegendTitle = "Tipo",
    selectInput_script_graphs_available_label = "Seleccione un Gráfico", 
    actionButton_newGraph_Script_label = "Nuevo Gráfico",
    actionButton_editGraph_Script_label = "Editar Gráfico", 
    selectInput_script_reports_available_label = "Seleccione un Reporte",
    actionButton_newReport_Script_label = "Nuevo Reporte",
    actionButton_editReport_Scriptt_label = "Editar Reporte"
  )
)

# ---- translation Graph Form lists----
translationGraphForm <- list(
  en = list(
    GraphFormCaption = "Form for Graph Options",
    textInput_graphName_label = "Enter a Graph Name",
    selectInput_summary_time_scale_label = "Select a data Summarization Scale",
    selectInput_axis_scales_label = "Select a Y Axis Scale Type",
    graph_form_actionButton_accept_label = "Accept",
    graph_form_cancel_button_label = "Cancel"
  ),
  es = list(
    form_graph_label = "Pantalla de definición de Optiones de Gráfico",
    textInput_graphName_label = "Nombre del Gráfico",
    selectInput_summary_time_scale_label = "Seleccione una escala de resumen de datos:",
    selectInput_axis_scales_label = "Selecciones un tipo de escala para el axis Y",
    graph_form_actionButton_accept_label = "Aceptar",
    graph_form_cancel_button_label = "Cancelar"
  )
)
# ---- translation Analitic Entity Form lists----
translationAnaliticalEntityForm <- list(
  en = list(
    analitical_entity_form_caption = "Form for Analitical Entity Options",
    textInput_name_label = "Enter a Name for the Entity",
    selectInput_EntityType_label = "Select an Entity Type",
    analitical_entity_form_actionButton_accept_label = "Accept",
    analitical_entity_form_cancel_button_label = "Cancel"
  ),
  es = list(
    analitical_entity_form_caption = "Forma de Definición de Entidad de Análisis",
    textInput_name_label = "Ingrese un Nombre para la Entidad",
    selectInput_EntityType_label = "Seleccione un Topo de Entidad",
    analitical_entity_form_actionButton_accept_label = "Aceptar",
    analitical_entity_form_cancel_button_label = "Cancelar"
  )
)
# ---- translation Series Form lists----
translationSeriesForm <- list(
  en = list(
    SeriesFormCaption = "Form for Series Options",
    selectInput_measurement_variable_label = "Variable",
    selectInput_geomtype_label = "Geom type",
    selectInput_axis_label = "Y Axis",
    colourInput_series_Color_label = "Series color",
    checkboxInput_series_visible_label = "Visible",
    checkboxInput_series_create_stats_label = "Create Stats (Min, Max, Sum)",
    geom_line_info_group_label = "Line Parameters",
    sliderInput_line_width_label  = "Width",
    sliderInput_size_PointRange_label = "Line Width",
    sliderInput_width_PointRange_label = "Width of the Whisker",
    selectInput_line_type_label = "Type",
    selectInput_linetype_PointRange_label = "Line Type",
    sliderInput_Line_Transparency_label = "Transparency",
    sliderInput_Alpha_PointRange_label = "Transparency",
    sliderInput_Alpha_RefLine_label = "Transparency",
    numericInput_value_refLine_label = "Define a value",
    selectInput_line_type_refLine_label = "Line Type",
    sliderInput_line_width_refLine_label = "Line Width",
    geom_point_info_group_label = "Point Parameters",
    selectInput_shape_type_label = "Shape",
    selectInput_shape_PointRange_label = "Shape",
    colourInput_shape_fill_color_label = "Shape fill colour",
    colourInput_colour_PointRange_label = "Shape fill colour",
    colourInput_fill_PointRange_label = "Shape fill colour",
    sliderInput_shape_size_label ="Shape Size",
    sliderInput_point_transparency_label = "Transparency",
    GeomBarInfoGroup = "Bar Parameters",
    colourInput_bar_fill_color_label = "Fill Color",
    sliderInput_bar_border_thickness_label = "Border Thickness",
    sliderInput_bar_thickness_label = "Thickness",
    Geom_Bar_Info_Group_label = "Bar Parameters",
    Geom_PointRange_Info_Group_label = "Point Range Parameters",
    Geom_RefLine_label = "Reference Line",
    sliderInput_bar_Transparency_label = "Transparency",
    colourInput_bar_border_color_label = "Color of the Border",
    series_form_cancel_buttom_label = "Cancel",
    series_form_accept_label = "Accept",
    series_form_delete_label = "Delete",
    Title_Confirm_Series_Delete_Label = "Confirm action",
    Confirm_Series_Delete_Message = "Are you sure to delete this series",
    selectInput_stat_label = "Type of Stat",
    selectInput_position_label = "Bar Position",
    textInput_series_name_refline_label = "Series Name"
  ),
  es = list(
    SeriesFormCaption = "Pantalla de definición de Optiones de Serie",
    selectInput_measurement_variable_label = "Variable",
    selectInput_geomtype_label = "Tipo de geometria",
    selectInput_axis_label = "Eje Y",
    colourInput_series_Color_label = "Color de la serie",
    checkboxInput_series_visible_label = "Visible",
    checkboxInput_series_create_stats_label = "Incluir Estadísticas (Min, Max, Suma)",
    geom_line_info_group_label = "Parámetros de Línea",
    sliderInput_line_width_label  ="Grosor de la Línea",
    sliderInput_size_PointRange_label = "Grosor de la Línea",
    sliderInput_width_PointRange_label = "Grosor del Whisker",
    selectInput_line_type_label = "Tipo de Línea",
    selectInput_linetype_PointRange_label = "Tipo de Líena",
    sliderInput_Line_Transparency_label = "Transparencia",
    sliderInput_Alpha_PointRange_label = "Transparencia",
    sliderInput_Alpha_RefLine_label = "Transparencia",
    numericInput_value_refLine_label = "Defina un valor",
    selectInput_line_type_refLine_label = "Tipo de Linea",
    sliderInput_line_width_refLine_label = "Grosor de la Línea",
    geom_point_info_group_label = "Parámetros de Punto",
    selectInput_shape_type_label = "Figura",
    selectInput_shape_PointRange_label = "Figura",
    colourInput_shape_fill_color_label = "Color de relleno de Símbolo",
    colourInput_colour_PointRange_label = "Color de relleno de Símbolo",
    colourInput_fill_PointRange_label = "Color de relleno de Símbolo",
    sliderInput_shape_size_label ="Tamaño",
    sliderInput_point_transparency_label = "Transparencia",
    Geom_Bar_Info_Group_label = "Parámetros de Barra",
    Geom_PointRange_Info_Group_label = "Parámetros de Punto y Rango",
    Geom_RefLine_label = "Reference Line",
    colourInput_bar_fill_color_label = "Color de Relleno",
    sliderInput_bar_border_thickness_label = "Grosor del Borde",
    sliderInput_bar_thickness_label = "Grosor",
    sliderInput_bar_Transparency_label = "Transparencia",
    colourInput_bar_border_color_label = "Color del Borde",
    series_form_cancel_label = "Cancelar",
    series_form_accept_label = "Aceptar",
    series_form_delete_label = "Borrar",
    Title_Confirm_Series_Delete_Label = "Confirmar Acción",
    Confirm_Series_Delete_Message = "Seguro de Borrar esta serie?",
    selectInput_stat_label = "Tipo de Stat",
    selectInput_position_label = "Posición",
    textInput_series_name_refline_label = "Nombre de la Serie"
  )
)

# ---- statistics Types Dictionary----
statisticsTypesDictionary <- list(
  en = list(
    AvgValue = "Mean",
    MinValue = "Min",
    MaxValue = "Max",
    SumValue = "Sum",
    SdValue = "Sd",	
    MissingValue = "Missing Values"
  ),
  es = list(
    AvgValue = "Med",
    MinValue = "Mín",
    MaxValue = "Máx",
    SumValue = "Sum",
    SdValue = "DE",
    MissingValue = "Valores Perdidos"
  )
)

# ---- Axis Types Dictionary----
axisTypesDictionary <- list(    
en = list(
  AxisOptionMain = "Primary",
  AxisOptionSecondary = "Secondary"),
es = list(
  AxisOptionMain = "Primario",
  AxisOptionSecondary = "Secundario")
) 

# ---- Analitical Entity Types Dictionary----
analiticalEntityTypesDictionary <- list(    
  en = list(
    graph = "Graph",
    report = "Report"),
  es = list(
    AxisOptionMain = "Gráfico",
    AxisOptionSecondary = "Reporte")
) 

# ---- Geoms Types Dictionary----
geomsTypesDictionary <- list(    
  en = list(
    GeomTypePoint = "Point",
    GeomTypeLine = "Line", 
    GeomTypeBar = "Bar",
    GeomTypePointRange = "Point Range",
    GeomTypeRefLine = "Reference Line"), 
  es = list(
    GeomTypePoint = "Punto",
    GeomTypeLine = "Línea", 
    GeomTypeBar = "Barra",
    GeomTypePointRange = "Punto y Rango",
    GeomTypeRefLine = "Línea de Referencia")
)

# ---- Bar Stat Dictionary----
BarStatDictionary <- list(    
  en = list(
    identity = "Identity",
    count = "Count"),
  es = list(
    identity = "Identidad",
    count = "Conteo")
)

# ---- Bar Position Dictionary----
BarPositionDictionary <- list(    
  en = list(
    stack = "Stack",
    dodge = "dodge",
    fill = "Fill"),
  es = list(
    stack = "Pila",
    dodge = "Dodge",
    fill = "Relleno")
)

# ---- Shape Types Dictionary----
ShapeTypesDictionary <- list(
  en = list(
    SquareOpen = "Square (open)",
    CircleOpen = "Circle (open)",
    TriangleUp = "Triangle (up)",
    Plus = "Plus",
    Cross = "Cross",
    DiamondOpen = "Diamond (open)",
    TriangleDown = "Triangle (down)",
    SquareFilled = "Square (filled)",
    CircleFilled = "Circle (filled)",
    TriangleFilled = "Triangle (filled)",
    PlusFilled = "Plus (filled)",
    CrossFilled = "Cross (filled)",
    DiamondFilled = "Diamond (filled)",
    TriangleDownFilled = "Triangle (down) (filled)",
    SquareFilledBorderThick = "Square (filled, border thick)",
    SolidSquare = "Solid Square",
    SolidCircle = "Solid Circle",
    SolidTriangle = "Solid Triangle",
    SolidDiamond = "Solid Diamond",
    SolidCircleThicker = "Solid Circle (thicker)",
    BulletPoint = "Bullet Point",
    CircleFilledBorder = "Circle (filled, border)",
    SquareFilledBorder = "Square (filled, border)",
    DiamondFilledBorder = "Diamond (filled, border)",
    TriangleFilledBorder = "Triangle (filled, border)",
    CircleLargeBorder = "Circle (large, border)"
  ),
  es = list(
    SelectShape = "Seleccione una figura para la serie",
    SeriesVisible = "Visible",
    SquareOpen = "Cuadro Abierto",
    CircleOpen = "Cículo Abierto",
    TriangleUp = "Triángulo Arriba",
    Plus = "Mas",
    Cross = "Cruz",
    DiamondOpen = "Diamanter Abierto",
    TriangleDown = "Triángulo Abajo",
    SquareFilled = "Cuadro Relleno",
    CircleFilled = "Círcolo Relleno",
    TriangleFilled = "Triángulo Relleno",
    PlusFilled = "Mas Relleno",
    CrossFilled = "Cruz Rellena",
    DiamondFilled = "Diamante Relleno",
    TriangleDownFilled = "Triángulo Abajo Relleno",
    SquareFilledBorderThick = "Cuadro Relleno Borde Delgado",
    SolidSquare = "Cuadro Sólido",
    SolidCircle = "Círculo Sólido",
    SolidTriangle = "Triángulo Sólido",
    SolidDiamond = "Diamante Sólido",
    SolidCircleThicker = "Cículo Sólido Delgado",
    BulletPoint = "Punta de Bala",
    CircleFilledBorder = "Círculo Relleno con Borde",
    SquareFilledBorder = "Cuadro Relleno con Borde",
    DiamondFilledBorder = "Diamante Relleno con Borde",
    TriangleFilledBorder = "Triángulo relleno con Borde",
    CircleLargeBorder = "Ciculo Grande con Borde"
  )
)

# ---- Line Types Dictionary----
LineTypesDictionary <- list(
  en = list(
    Solid  = "Solid",
    Dashed = "Dashed",
    Dotted = "Dotted",
    DotDash= "Dot Dash",
    LongDash = "Long Dash",
    TwoDash = "Two Dash"
  ),
  es = list(
    Solid  = "Sólido",
    Dashed = "Discontínuo",
    Dotted = "Punteado",
    DotDash= "Punteado Discontínuo",
    LongDash = "Discontinuo Largo",
    TwoDash = "Doble Discontínuo"
  )
)

# ---- Time Summarization Types Dictionary----
timeSummarizationTypesDictionary <- list(
  en = list(
    Hour = "Hour",
    Day = "Day",
    Week = "Week",
    Month = "Month",
    DayOfGrowth = "Day of Grow",
    WeekOfGrowth = "Week Of Growth",
    MonthOfGrowth = "Month Of Growth",
    PhaseOfGrowth = "Phase Of Growth",
    GraphsAvailable = "Graphs Available"
  ),
  es = list(
    Hour = "Hora",
    Day = "Día",
    Week = "Semana",
    Month = "Mes",
    DayOfGrowth = "Día de Crecimiento",
    WeekOfGrowth = "Semana de Crecimiento",
    MonthOfGrowth = "Mes de Crecimiento",
    PhaseOfGrowth = "Fase de Crecimiento"
  )
)


# ---- Axis Scale Dictionary----
axisScaleDictionary <- list(
  en = list(
    Auto = "Automatic",
    Cero = "Start in Cero"
  ),
  es = list(
    Auto = "Automático",
    Cero = "Inicia en cero"
  )
)


# ---- Climate Variables Dictionary----
climateDashVariablesDictionary <- list(
  en = list(
    temperature = "Temperature",
    windSpeed = "Wind speed",
    windDirection = "Wind direction",
    relativeHumedity = "Relative Humedity"
  ),
  es = list(
    temperature = "Temperatura",
    windSpeed = "Velocidad del Viento",
    windDirection = "Dirección de Viento",
    relativeHumedity = "Humedad Relativa"
  )
)

# ---- UI ----

dropdownMenuCustom <- function(...) {
  tags$li(class = "dropdown", ...)
}

ui <- dashboardPage(
  
  dashboardHeader(title = tags$img(src = "Agrismart.tech_Logo_Blanco@2x.png", height = "60px"),
                  dropdownMenuCustom(selectInput("selectInput_language", label = uiOutput("selectInput_language_label"),  choices = c("English" = "en", "Español" = "es"), selected = "es"))          
                  ),
  dashboardSidebar(
    sidebarMenu(
      menuItem(uiOutput("sideBarMenuItemClimateDashBoard_label"), tabName = "climate_dashboard", icon = icon("cloud-sun")),
      menuItem(uiOutput("sideBarMenuItemDashBoard_label"), tabName = "hourly_dashboard", icon = icon("dashboard"))
    )
  ),
  
  dashboardBody(
    
    tags$head(
      tags$link(rel = "stylesheet",
                href = "https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css")),
    
    box(title = uiOutput("boxAmbit_tittle_label"), status = "primary", 
        solidHeader = TRUE, collapsible = TRUE,  # Make the box collapsible
        width = 12,
        p(
          fluidRow(
            column(6, selectInput("selectInput_farm", label = uiOutput("selectInput_farm_label"), choices = NULL)),
            column(6, selectInput("selectInput_productionUnit", label = uiOutput("selectInput_productionUnit_label"), choices = NULL))),
          fluidRow(
            column(12, selectInput("selectInput_cropProduction", label = uiOutput("selectInput_cropProduction_label"), choices = NULL)),
            #column(6, selectInput("selectInput_measurementVariable", label = uiOutput("selectInput_measurementVariable_label"), choices = NULL))
          )
        ),
        class = ".box"
    ),
    tabItems(
      tabItem(tabName = "climate_dashboard",
              fluidRow(
                box(width = 4, title = uiOutput("climate_dashBoard_temperaure_label"), status = "primary", solidHeader = TRUE,
                    highcharter::highchartOutput("clim_temp_gauge", height = "280px")),
                box(width = 4, title = uiOutput("climate_dashBoard_windSpeed_label"), status = "primary", solidHeader = TRUE,
                    highcharter::highchartOutput("clim_wind_gauge", height = "280px")),
                box(width = 4, title = uiOutput("climate_dashBoard_windDirection_label"), status = "primary", solidHeader = TRUE,
                    div(style="text-align:center; padding-top:20px;",
                        tags$i(id = "clim_wind_arrow", class = "wi wi-direction-up",
                               style = "font-size:96px; display:block; transform: rotate(0deg);"),
                        h3(textOutput("clim_wind_dir_text"), style = "margin-top:10px;"),
                        uiOutput("clim_asof_text")
                    ))
              ),
              fluidRow(
                box(width = 12, title = "Last 24 hours", status = "info", solidHeader = TRUE,
                    highcharter::highchartOutput("hc_timeseries", height = "360px"))
              )
      ),
      
      tabItem(tabName = "hourly_dashboard",
              fluidRow(
                column(6, 
                       box(title = uiOutput("boxTrend_tittle_label"), status = "primary", solidHeader = TRUE,
                           plotOutput("measurementPlot"), width = 12)),
                column(3, checkboxGroupInput("checkboxGroupInput_plot_elements", uiOutput("checkboxGroupInput_plot_elements_label"),
                                             choices = NULL)),
                column(3, checkboxGroupInput("checkboxGroupInput_series_available", uiOutput("checkboxGroupInput_series_available_label"),
                                             choices = NULL)),
              fluidRow(
                column(4, selectInput("selectInput_graphs_available", label =  uiOutput("selectInput_graphs_available_label"), NULL)),
                column(4, actionButton("actionButton_newGraph", uiOutput("actionButton_newGraph_label"))),
                column(4, actionButton("actionButton_editGraph", uiOutput("actionButton_editGraphLabel"), class = "custom-button")),                
                column(4, selectInput("selectInput_series_available", label =  uiOutput("selectInput_series_available_label"), NULL)),
                column(4, actionButton("actionButton_newSeries", uiOutput("actionButton_newSeries_label"))),
                column(4, actionButton("actionButton_EditSeries", uiOutput("actionButton_EditSeries_label"))),
                )),
      
              fluidRow(
                column(6,
                       box(sliderInput("sliderInput_data_range", uiOutput("sliderInput_data_range_label"), 
                                       min = Sys.Date() - 60, max = Sys.Date(), value = c(Sys.Date() - 60, Sys.Date()), 
                                       timeFormat = "%d-%m-%Y"), width = 12))),
              fluidRow(
                column(6, 
                              box(title = uiOutput("boxSummary_label"), status = "warning", solidHeader = TRUE,
                                  verbatimTextOutput("salesSummary_label"), width = 12)))
      )
    )
  )
)



# ---- Server ----
server <- function(input, output, session) {
  # ---- Reactive Variables Definition ----
  # Reactive value to store authentication status and user data
  values <- reactiveValues(CompanyId = 0, FarmId = 0, ProductionUnit = 0, CropProdutionId = 0, measurementVariable = 0, loadData = TRUE, currentGraph = "", editingGraph = FALSE, editingSeries = FALSE,
                           editingAnaliticalEntity = FALSE)
  auth <- reactiveVal(FALSE)
  token <- reactiveVal(NULL)
  measurementVariables <- reactiveVal(NULL)
  measurementVariable <- reactiveVal(NULL)
  measurementUnits <- reactiveVal(NULL)
  measurementUnit <- reactiveVal(NULL)
  api_data <- reactiveVal(NULL)
  current_data <- reactiveVal(NULL)
  current_company <- reactiveVal(NULL)
  current_farm <- reactive(NULL)
  calculationSettings <- reactiveVal(NULL)
  #baseURL = "https://localhost:7029"
  baseURL = "http://162.248.52.111:8082"

  listMeasurementVariables <- reactiveVal(NULL)
  listFarms <- reactiveVal(NULL)
  cropProductions <- reactiveVal(NULL)
  cropProduction <- reactiveVal(NULL)
  cropPhases <- reactiveVal(NULL)
  listGraphs <- reactiveVal(NULL)
  listAnaliticalEntities <- reactiveVal(NULL)
  climate_poll_rv <- reactiveVal(NULL)

  # ---- Language Management ----
  # select a language
  selected_language <- reactive({
    input$selectInput_language
  })
  
  main_form_translator <- reactive({
    translations[[input$selectInput_language]]
  })
  
  series_form_translator <- reactive({
    translationGraphForm[[input$selectInput_language]]
  })
  
  statistics_Dictionary <- reactive({
    statisticsTypesDictionary[[input$selectInput_language]]
  })
  
  axis_types_Dictionary <- reactive({
    axisTypesDictionary[[input$selectInput_language]]
  })
  
  axis_scales_Dictionary <- reactive({
    axisScaleDictionary[[input$selectInput_language]]
  })
  
  geom_types_Dictionary <- reactive({
    geomsTypesDictionary[[input$selectInput_language]]
  })
  
  shape_Types_Dictionary <- reactive({
    ShapeTypesDictionary[[input$selectInput_language]]
  })
  
  line_Types_Dictionary <- reactive({
    LineTypesDictionary[[input$selectInput_language]]
  })
  
  time_Summarization_Types_Dictionary <-reactive({
    timeSummarizationTypesDictionary[[input$selectInput_language]]
  })
  
  bar_position_dictionary <-reactive({
    BarPositionDictionary[[input$selectInput_language]]
  })
  
  bar_stat_dictionary <-reactive({
    BarStatDictionary[[input$selectInput_language]]
  })
  
  analitical_entity_types_dictionary <-reactive({
    analiticalEntityTypesDictionary[[input$selectInput_language]]
  })
  
  # main form translations
  output$Apptitle <- renderText({ translations[[selected_language()]]$Apptitle })
  output$boxAmbit_tittle_label <- renderText({ translations[[selected_language()]]$boxAmbit_tittle_label })
  output$selectInput_language_label <- renderText({ translations[[selected_language()]]$selectInput_language_label })
  output$sideBarMenuItemDashBoard_label <- renderText({ translations[[selected_language()]]$sideBarMenuItemDashBoard_label })
  output$sideBarMenuItemOther_label <- renderText({ translations[[selected_language()]]$sideBarMenuItemOther_label })
  output$sideBarMenuItemClimateDashBoard_label <- renderText({ translations[[selected_language()]]$sideBarMenuItemClimateDashBoard_label })
  
  output$selectInput_farm_label <- renderText({ translations[[selected_language()]]$selectInput_farm_label })
  output$selectInput_productionUnit_label <- renderText({ translations[[selected_language()]]$selectInput_productionUnit_label })
  output$selectInput_cropProduction_label <- renderText({ translations[[selected_language()]]$selectInput_cropProduction_label })
  output$selectInput_measurementVariable_label <- renderText({ translations[[selected_language()]]$selectInput_measurementVariable_label })
  output$boxTrend_tittle_label <- renderText({ translations[[selected_language()]]$boxTrend_tittle_label })
  output$checkboxGroupInput_plot_elements_label <- renderText({ translations[[selected_language()]]$checkboxGroupInput_plot_elements_label })  
  output$selectInput_graphs_available_label <- renderText({ translations[[selected_language()]]$selectInput_graphs_available_label })
  output$checkboxGroupInput_series_available_label <- renderText({ translations[[selected_language()]]$checkboxGroupInput_series_available_label })
  output$actionButton_newGraph_label <- renderText({ translations[[selected_language()]]$actionButton_newGraph_label })
  output$actionButton_editGraphLabel <- renderText({ translations[[selected_language()]]$actionButton_editGraphLabel })
  output$actionButton_newSeries_label <- renderText({ translations[[selected_language()]]$actionButton_newSeries_label })
  output$actionButton_EditSeries_label <- renderText({ translations[[selected_language()]]$actionButton_EditSeries_label })
  output$selectInput_series_available_label <- renderText({ translations[[selected_language()]]$selectInput_series_available_label })
  output$selectInput_script_graphs_available_label <- renderText({ translations[[selected_language()]]$selectInput_script_graphs_available_label })
  output$actionButton_newGraph_Script_label <- renderText({ translations[[selected_language()]]$actionButton_newGraph_Script_label })
  output$actionButton_editGraph_Script_label <- renderText({ translations[[selected_language()]]$actionButton_editGraph_Script_label })
  output$selectInput_script_reports_available_label <- renderText({ translations[[selected_language()]]$selectInput_script_reports_available_label })
  output$actionButton_newReport_Script_label <- renderText({ translations[[selected_language()]]$actionButton_newReport_Script_label })
  output$actionButton_editReport_Scriptt_label <- renderText({ translations[[selected_language()]]$actionButton_editReport_Scriptt_label })
  
  
  output$sliderInput_data_range_label <- renderText({ translations[[selected_language()]]$sliderInput_data_range_label })
  output$boxSummary_label <- renderText({ translations[[selected_language()]]$boxSummary_label })
  output$LegendTitle <- renderText({ translations[[selected_language()]]$LegendTitle })
  
  #statistics translations
  output$Mean <- renderText({ statisticsTypesDictionary[[selected_language()]]$Mean })
  output$Min <- renderText({ statisticsTypesDictionary[[selected_language()]]$Min })
  output$Max <- renderText({ statisticsTypesDictionary[[selected_language()]]$Max })
  output$Sum <- renderText({ statisticsTypesDictionary[[selected_language()]]$Sum })
  output$Sd <- renderText({ statisticsTypesDictionary[[selected_language()]]$Sd })
  output$MissingValue <- renderText({ translations[[selected_language()]]$MissingValue })
  
  #Graph form translations
  output$form_graph_label <- renderText({ translationGraphForm[[selected_language()]]$form_graph_label })
  output$textInput_graphName_label <- renderText({ translationGraphForm[[selected_language()]]$textInput_graphName_label })

  output$textInput_series_name_refline_label <- renderText({ translationGraphForm[[selected_language()]]$textInput_series_name_refline_label })
  
  
  output$selectInput_summary_time_scale_label <- renderText({ translationGraphForm[[selected_language()]]$selectInput_summary_time_scale_label })
  output$selectInput_axis_scales_label <- renderText({ translationGraphForm[[selected_language()]]$selectInput_axis_scales_label })
  output$graph_form_actionButton_accept_label <- renderText({ translationGraphForm[[selected_language()]]$graph_form_actionButton_accept_label })
  output$graph_form_cancel_button_label <- renderText({ translationGraphForm[[selected_language()]]$graph_form_cancel_button_label })

  #Entity Definition form translations
  output$analitical_entity_form_caption  <- renderText({ translationAnaliticalEntityForm[[selected_language()]]$analitical_entity_form_caption })
  output$textInput_name_label <- renderText({ translationAnaliticalEntityForm[[selected_language()]]$textInput_name_label })
  output$selectInput_EntityType_label <- renderText({ translationAnaliticalEntityForm[[selected_language()]]$selectInput_EntityType_label })
  output$analitical_entity_form_actionButton_accept_label <- renderText({ translationAnaliticalEntityForm[[selected_language()]]$analitical_entity_form_actionButton_accept_label })
  output$analitical_entity_form_cancel_button_label <- renderText({ translationAnaliticalEntityForm[[selected_language()]]$analitical_entity_form_cancel_button_label })

  #login form translations
  output$LoginForm_Caption <- renderText({ translationsLoginForm[[selected_language()]]$LoginForm_Caption })
  output$Username <- renderText({ translationsLoginForm[[selected_language()]]$Username })
  output$Password <- renderText({ translationsLoginForm[[selected_language()]]$Password })
  output$Login <- renderText({ translationsLoginForm[[selected_language()]]$Login })
  
  #Series Form translations
  output$SeriesFormCaption <- renderText({ translationSeriesForm[[selected_language()]]$SeriesFormCaption })
  output$selectInput_measurement_variable_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_measurement_variable_label })
  output$selectInput_geomtype_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_geomtype_label })
  output$selectInput_axis_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_axis_label })
  output$colourInput_series_Color_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_series_Color_label })
  output$checkboxInput_series_visible_label <- renderText({ translationSeriesForm[[selected_language()]]$checkboxInput_series_visible_label })
  output$checkboxInput_series_create_stats_label <- renderText({ translationSeriesForm[[selected_language()]]$checkboxInput_series_create_stats_label })
  output$geom_line_info_group_label <- renderText({ translationSeriesForm[[selected_language()]]$geom_line_info_group_label })
  output$sliderInput_line_width_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_line_width_label })
  output$sliderInput_size_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_size_PointRange_label })
  output$sliderInput_width_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_width_PointRange_label })
  
  
  output$selectInput_line_type_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_line_type_label })
  output$selectInput_linetype_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_linetype_PointRange_label })
  output$sliderInput_Line_Transparency_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_Line_Transparency_label })
  output$sliderInput_Alpha_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_Alpha_PointRange_label })
  output$sliderInput_Alpha_RefLine_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_Alpha_RefLine_label })
  
  output$numericInput_value_refLine_label <- renderText({ translationSeriesForm[[selected_language()]]$numericInput_value_refLine_label })
  output$selectInput_line_type_refLine_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_line_type_refLine_label })
  output$sliderInput_line_width_refLine_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_line_width_refLine_label })
  
  output$geom_point_info_group_label <- renderText({ translationSeriesForm[[selected_language()]]$geom_point_info_group_label })
  output$selectInput_shape_type_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_shape_type_label })
  output$selectInput_shape_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_shape_PointRange_label })
  output$colourInput_shape_fill_color_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_shape_fill_color_label })
  output$colourInput_fill_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_fill_PointRange_label })
  
  output$colourInput_colour_PointRange_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_colour_PointRange_label })
  output$sliderInput_shape_size_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_shape_size_label })
  output$sliderInput_point_transparency_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_point_transparency_label })
  output$Geom_Bar_Info_Group_label <- renderText({ translationSeriesForm[[selected_language()]]$Geom_Bar_Info_Group_label })
  output$Geom_PointRange_Info_Group_label <- renderText({ translationSeriesForm[[selected_language()]]$Geom_PointRange_Info_Group_label })
  output$Geom_RefLine_label <- renderText({ translationSeriesForm[[selected_language()]]$Geom_RefLine_label })

  output$colourInput_bar_fill_color_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_bar_fill_color_label })
  output$sliderInput_bar_border_thickness_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_bar_border_thickness_label })
  output$sliderInput_bar_thickness_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_bar_thickness_label })
  output$sliderInput_bar_Transparency_label <- renderText({ translationSeriesForm[[selected_language()]]$sliderInput_bar_Transparency_label })
  output$colourInput_bar_border_color_label <- renderText({ translationSeriesForm[[selected_language()]]$colourInput_bar_border_color_label })
  output$selectInput_stat_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_stat_label })
  output$selectInput_position_label <- renderText({ translationSeriesForm[[selected_language()]]$selectInput_position_label })
  
  output$series_form_cancel_label <- renderText({ translationSeriesForm[[selected_language()]]$series_form_cancel_label })
  output$series_form_accept_label <- renderText({ translationSeriesForm[[selected_language()]]$series_form_accept_label })
  output$series_form_delete_label <- renderText({ translationSeriesForm[[selected_language()]]$series_form_delete_label })
  output$Title_Confirm_Series_Delete_Label <- renderText({ translationSeriesForm[[selected_language()]]$Title_Confirm_Series_Delete_Label })
  output$Confirm_Series_Delete_Message <- renderText({ translationSeriesForm[[selected_language()]]$Confirm_Series_Delete_Message })
  
  #Climate DashBoard translations
  output$climate_dashBoard_temperaure_label <- renderText({ climateDashVariablesDictionary[[selected_language()]]$temperature })
  output$climate_dashBoard_windSpeed_label <- renderText({ climateDashVariablesDictionary[[selected_language()]]$windSpeed })
  output$climate_dashBoard_windDirection_label <- renderText({ climateDashVariablesDictionary[[selected_language()]]$windDirection })
  output$climate_dashBoard_relativeHumedity_label <- renderText({ climateDashVariablesDictionary[[selected_language()]]$relativeHumedity })
  
  
  # Show login modal when app starts
  showModal(
    modalDialog(
      title = uiOutput("LoginForm_Caption"),
      
      tags$div(
        tags$img(src = "Agrismart.tech_Logo_Fullcolor@2x.png", height = "200px"),  # Adjust height as needed
        style = "text-align: center; margin-bottom: 10px;"),
        
      textInput("username", uiOutput("Username"), value = "csolano@iapcr.com"),
      passwordInput("password", uiOutput("Password"), value = "123"),
      footer = tagList(
        actionButton("login", uiOutput("Login"), class = "btn-primary")
      ),
      easyClose = FALSE,
      fade = TRUE
    )
  )
  

  # ---- Observed Events ----
  
  # login
  observeEvent(input$login, {
    req(input$username, input$password)
    
    # API request to authenticate
    res <- POST(
      url = paste0(baseURL,"/Authentication/login"),  
                   
      body = list(
        userEmail = input$username,
        password = input$password
      ),
      encode = "json"
    )
    
    # Check response status
    if (status_code(res) == 200) {
      # Extract token from response and store it
      token(content(res)$result$token)
      auth(TRUE)  # Set authentication status to TRUE
      removeModal()  # Close the login modal
    } else {
      # Display error message
      showNotification("Login failed. Please try again.", type = "error")
    }
    
    lang <- statistics_Dictionary()
    
    listIds <- c("MinValue","MaxValue","AvgValue","SumValue")
    listNames <- c(lang$MinValue,lang$MaxValue,lang$AvgValue,lang$SumValue)
    scales <- setNames(as.list(listIds), listNames)
    
    updateCheckboxGroupInput(session, "checkboxGroupInput_plot_elements", choices = scales, selected = c("AvgValue"))

    #showAmbitModal()                          
  })
  
  # Loading measurement units
  observeEvent(auth(), {
    if (auth()) {
      # API request to get user data using the token
      res <- GET(
        url = paste0(baseURL,"/MeasurementUnit"),  # Replace with actual data endpoint
        add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$measurementUnits)) {
          items <- json_data$result$measurementUnits
          
          json_content <- content(res, "text", encoding = "UTF-8")
          
          data <- fromJSON(json_content, flatten = TRUE)
          
          measurementUnits(data$result$measurementUnits)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data from measurement units.", type = "error")
      }
    }
  })
  
  # Loading farms list
  observeEvent(auth(), {
    if (auth()) {
      # API request to get user data using the token
      
      resFarms <- GET(
        url = paste0(baseURL,"/Farm"),  # Replace with actual data endpoint
        add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(resFarms) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(resFarms, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$farms)) {
          items <- json_data$result$farms
          
          json_content <- content(resFarms, "text", encoding = "UTF-8")
          
          data <- fromJSON(json_content, flatten = TRUE)
          
          listFarms(data$result$farms)
          
          ids <- sapply(items, function(item) item$id)
          
          names <- sapply(items, function(item) item["name"])
          
          choices <- setNames(as.list(ids), names)
          
          updateSelectInput(session, "selectInput_farm", choices = choices)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data from farms.", type = "error")
      }
    }
  })
  
  # Loading ProductionUnits and Company By Farm list
  observeEvent(input$selectInput_farm, {
    if (auth()) {
      
      values$FarmId = input$selectInput_farm
      
      farms <- listFarms()
      
      current_farm = farms %>%
        filter(id == input$selectInput_farm)
      
      url = paste0(baseURL,"/ProductionUnit?FarmId=",input$selectInput_farm)
      
      res <- GET(url, 
        add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$productionUnits)) {
          items <- json_data$result$productionUnits
          
          ids <- sapply(items, function(item) item$id)
          names <- sapply(items, function(item) item["name"])
          
          # Set up choices with ids as values and names as labels
          choices <- setNames(as.list(ids), names)
          
          updateSelectInput(session, "selectInput_productionUnit", choices = choices)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data production units.", type = "error")
      }
      
      url = paste0(baseURL,"/Company/GetById?Id=",current_farm$companyId)
      
      
      res <- GET(url, 
                 add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result)) {
          
        json_content <- content(res, "text", encoding = "UTF-8")

        data <- fromJSON(json_content, flatten = TRUE)  
        
        company = as.data.frame(data$result)
        
        current_company(company)
        
        loadcalculationSettings()
        
        loadMeasurementVarables()
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data company.", type = "error")
      }
    }
  })
  
  # Loading CropProductionsByProductionUnit list
  observeEvent(input$selectInput_productionUnit, {
    if (auth()) {

      values$ProductionUnit = input$selectInput_productionUnit
      
      url = paste0(baseURL,"/CropProduction?ProductionUnitId=",input$selectInput_productionUnit)  # Replace with actual data endpoint

      res <- GET(url, 
                 add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$cropProductions)) {
          items <- json_data$result$cropProductions
          
          ids <- sapply(items, function(item) item$id)
          names <- sapply(items, function(item) item["name"])
          
          # Set up choices with ids as values and names as labels
          choices <- setNames(as.list(ids), names)
          
          updateSelectInput(session, "selectInput_cropProduction", choices = choices)
          
          json_content <- content(res, "text", encoding = "UTF-8")
          
          data <- fromJSON(json_content, flatten = TRUE)
          
          cropProductions(data$result$cropProductions)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data from crop productions by production units.", type = "error")
      }
    }
  })
  
  updateSerieList <- function(series){
    series_list <- list()
    listIds <- integer(0)
    listNames <- character(0)
    
    measurementVars <- measurementVariables()
    
    for(i in 1:length(series))
    {
      seriesp = as.data.frame(series[[i]])
      mvar = measurementVars[measurementVars$id == seriesp$measurementVariableId, ]
      
      if(str_detect(mvar$name, "_"))
      {
        subString = strsplit(mvar$name, "_")[[1]]
        shortVarName = subString[2]
      }
      else
        shortVarName = series$name
      
      listIds <- c(listIds, seriesp$measurementVariableId)
      listNames <- c(listNames, shortVarName)
    }
    
    series_list <- setNames(as.list(listIds), listNames)
    
    updateCheckboxGroupInput(session, "checkboxGroupInput_series_available", choices = series_list, selected = NULL)
    
    updateCheckboxGroupInput(session, "checkboxGroupInput_series_available", choices = series_list, selected = series_list)
    
    updateSelectInput(session, "selectInput_series_available", choices = series_list, selected = input$selectInput_measurement_variable)
    
  }
  
  #Loading graphs
  loadGraphs <- function(){
    if(is.null(listGraphs()))
    {
      company = current_company();
      
      # API request to get user data using the token
      res <- GET(
        url = paste0(baseURL,"/Graph?CatalogId=", company$catalogId),  # Replace with actual data endpoint
        add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {
        # Store retrieved data
        
        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$graphs)) {
          items <- json_data$result$graphs
          
          json_content <- content(res, "text", encoding = "UTF-8")
          
          
          if(is.null(listGraphs()))
          {
            df <- tibble(
              id = integer(),
              catalogId = integer(),
              description = character(),
              name = character(), # Column for names (character type)
              summaryTimeScale = character(), # column for the summary dimension to apply
              yAxisScaleType = character(),
              series = I(list(NULL)),
              status = character()
            ) 
          }
          else
          {
            df <- graphs
          }
          
          
          data <- fromJSON(json_content, flatten = TRUE)
          
          graphs = data$result$graphs
          
          if(length(graphs) == 0)
            return(NULL)
          
          for(i in 1: nrow(graphs))
          {
            series <- fromJSON(graphs$series[i])
  
            df <- add_row(df, id = graphs$id[i], catalogId = graphs$catalogId[i], 
                          name = graphs$name[i],
                          description = graphs$description[i], summaryTimeScale = graphs$summaryTimeScale[i],
                          yAxisScaleType = graphs$yAxisScaleType[i], series = NULL, status = "unmodified")
            
  
            # df$series[[i]] <- append(df$series[[i]], list(series))
            
            nSeries = length(series)
  
            for(j in 1: nSeries)
            {
              seriesn = as.data.frame(series[j])
              df$series[[i]] <- append(df$series[[i]], list(seriesn))
            }
  
          }
          
          series = df$series[[1]]
          
          updateSerieList(series)
          
          # series_list <- list()
          # listIds <- integer(0)
          # listNames <- character(0)
          # 
          # measurementVars <- measurementVariables()
          # 
          # for(i in 1:length(series))
          # {
          #   seriesp = as.data.frame(series[[i]])
          #   mvar = measurementVars[measurementVars$id == seriesp$measurementVariableId, ]
          #   
          #   if(str_detect(mvar$name, "_"))
          #   {
          #     subString = strsplit(mvar$name, "_")[[1]]
          #     shortVarName = subString[2]
          #   }
          #   else
          #     shortVarName = series$name
          #   
          #   listIds <- c(listIds, seriesp$measurementVariableId)
          #   listNames <- c(listNames, shortVarName)
          # }
          # 
          # series_list <- setNames(as.list(listIds), listNames)
          # 
          # updateCheckboxGroupInput(session, "checkboxGroupInput_series_available", choices = series_list, selected = NULL)
          # 
          # updateCheckboxGroupInput(session, "checkboxGroupInput_series_available", choices = series_list, selected = series_list)
          # 
          # updateSelectInput(session, "selectInput_series_available", choices = series_list, selected = input$selectInput_measurement_variable)
          
          
          listGraphs(df)
          
          updateSelectInput(session, "selectInput_graphs_available", choices = df$name)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data from measurment variables.", type = "error")
      }
    }
  }
  
  #Loading Analitical Entities
  loadAnaliticalEntities <- function(){
    # API request to get user data using the token
    res <- GET(
      url = paste0(baseURL,"/AnaliticalEntity"),  # Replace with actual data endpoint
      add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
    )
    
    if (status_code(res) == 200) {
      # Store retrieved data
      
      json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
      
      if (!is.null(json_data$result) && !is.null(json_data$result$analiticalEntities)) {
        items <- json_data$result$analiticalEntities
        
        json_content <- content(res, "text", encoding = "UTF-8")
        
        
        if(is.null(listAnaliticalEntities()))
        {
          df <- tibble(
            id = integer(),
            catalogId = integer(),
            name = character(), # Column for names (character type)
            description = character(),
            script = character(),
            status = character()
          ) 
        }
        else
        {
          df <- listAnaliticalEntities()
        }
        
        
        data <- fromJSON(json_content, flatten = TRUE)
        
        entities = data$result$analiticalEntities
        
        if(length(graphs) == 0)
          return(NULL)
        
        for(i in 1: nrow(entities))
        {

          df <- add_row(df, id = entities$id[i], catalogId = entities$catalogId[i], 
                        name = entities$name[i],
                        description = entities$description[i], script = entities$script[i],
                        status = "unmodified")
        }
        
        
        listAnaliticalEntities(df)
        
        updateSelectInput(session, "selectInput_graphs_available", choices = df$name)
        
      } else {
        showNotification("Error: JSON structure does not contain 'data' or 'items'")
      }
    } else {
      showNotification("Failed to retrieve data from measurment variables.", type = "error")
    }
  }
  
  #Loading Calculation Setting
  loadcalculationSettings <- function() {
    
    company = current_company();
    
    url <- paste0(baseURL, "/CalculationSetting?CatalogId=", company$catalogId)
    
    resCalculationSetting <- GET(url, add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
    )
    
    stop_for_status(resCalculationSetting)
    
    if (status_code(resCalculationSetting) == 200) {
      # Store retrieved data
      
      json_content <- content(resCalculationSetting, "text", encoding = "UTF-8")
      
      data <- fromJSON(json_content, flatten = TRUE)
      
      calculationSettings(data$result$calculationSettings)
    }
  }
  
  #Loading measurement variable
  loadMeasurementVarables <- function() {
    
    company <- current_company()
    # API request to get user data using the token
    res <- GET(
      url = paste0(baseURL,"/MeasurementVariable?CatalogId=", company$catalogId),  # Replace with actual data endpoint
      add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
    )
    
    if (status_code(res) == 200) {
      # Store retrieved data
      
      json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
      
      if (!is.null(json_data$result) && !is.null(json_data$result$measurementVariables)) {
        items <- json_data$result$measurementVariables
        
        json_content <- content(res, "text", encoding = "UTF-8")
        
        data <- fromJSON(json_content, flatten = TRUE)
        
        measurementVariables(data$result$measurementVariables)
        
        ids <- sapply(items, function(item) item$id)
        
        names <- sapply(items, function(item) item["name"])
        
        choices <- setNames(as.list(ids), names)
        
        listMeasurementVariables(choices)
        
        updateSelectInput(session, "selectInput_measurementVariable", choices = choices)
        
      } else {
        showNotification("Error: JSON structure does not contain 'data' or 'items'")
      }
    } else {
      showNotification("Failed to retrieve data from measurment variables.", type = "error")
    }
    
    
  }
  
  fetch_clim_data <- function(var_id) {
    if (is.null(var_id) || is.na(var_id)) {
      return(tibble(recordDate=as.POSIXct(character()), value=numeric()))
    }
    raw <- get_last24hour_climateData(var_id)
    if (is.null(raw) || !is.data.frame(raw) || nrow(raw) == 0) {
      return(tibble(recordDate=as.POSIXct(character()), value=numeric()))
    }

    tibble(recordDate = raw$recordDate, recordValue = as.numeric(raw$recordValue)) %>% arrange(recordDate)
  }
  
  get_id <- function(settingName) {
    df <- calculationSettings()   # this is the data.frame from the reactive
    req(is.data.frame(df), nrow(df) > 0, "name" %in% names(df))
    
    setting <- df %>%
      dplyr::filter(name == settingName)
    
    as.integer(setting$value)
  }
  
  build_series <- function(id, metric, fetch_fun) {
    df <- fetch_fun(id)
    validate <- shiny::validate; need <- shiny::need
    
    validate(need(is.data.frame(df), sprintf("No data.frame for %s", metric)))
    
    # Must have time column
    validate(need("recordDate" %in% names(df), "Missing 'recordDate' in API data"))
    if (!inherits(df$recordDate, "POSIXct")) {
      df$recordDate <- as.POSIXct(df$recordDate, tz = "UTC")
    }
    
    # Pick the first available numeric value column
    val_col <- intersect(c("recordValue"), names(df))[1]
    validate(need(!is.na(val_col), sprintf("No value column (value/avg/sum/min/max) for %s", metric)))
    
    # Return a clean, 3-column tibble
    dplyr::transmute(df,
                     recordDate,
                     value  = suppressWarnings(as.numeric(.data[[val_col]])),
                     metric = metric
    )
  }
  
  # Selecting the Crop Production
  observeEvent(input$selectInput_cropProduction, {
    if (auth()) {
      
      values$loadData = TRUE
      api_data(NULL)
      current_data(NULL)
      
      loadGraphs()
      
      # Build a new reactivePoll bound to the current crop selection
      rp <- reactivePoll(
        60 * 1000, session,  # every 60s
        checkFunc = function() {
          # token changes on crop change, settings change, or each minute
          temp_id <- tryCatch(get_id("AirTemperatureMeasurementVariableId"),     error = function(e) NA)
          wspd_id <- tryCatch(get_id("WindSpeedMeasurementVariableId"),          error = function(e) NA)
          wdir_id <- tryCatch(get_id("WindDirectionMeasurementVariableId"),      error = function(e) NA)
          
          paste(
            input$selectInput_cropProduction,
            temp_id, wspd_id, wdir_id,
            as.numeric(Sys.time()) %/% 60   # minute bucket
          )
        },
        valueFunc = function() {
          s_temp  <- build_series(get_id("AirTemperatureMeasurementVariableId"), "temp", fetch_clim_data)
          s_wspd  <- build_series(get_id("WindSpeedMeasurementVariableId"),"windspd", fetch_clim_data)
          s_wdir  <- build_series(get_id("WindDirectionMeasurementVariableId"), "winddir", fetch_clim_data)
          
          dplyr::bind_rows(s_temp, s_wspd, s_wdir) |>
            dplyr::filter(!is.na(value)) |>
            dplyr::arrange(recordDate)
        }
      )
      
      climate_poll_rv(rp)
      
      values$CropProdutionId = input$selectInput_cropProduction
      
      df <- cropProductions()
      var <- df[df$id == values$CropProdutionId, ]
      var$startDate
      cropProduction(var)
      
      url = paste0(baseURL,"/CropPhase?CropId=", var$cropId)  # Replace with actual data endpoint
      
      res <- GET(url, 
                 add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
      )
      
      if (status_code(res) == 200) {

        json_data <- fromJSON(content(res, "text", encoding = "UTF-8"), simplifyVector = FALSE)
        
        if (!is.null(json_data$result) && !is.null(json_data$result$cropPhases)) {

          json_content <- content(res, "text", encoding = "UTF-8")
          
          data <- fromJSON(json_content, flatten = TRUE)
          
          cropPhases(data$result$cropPhases)
          
        } else {
          showNotification("Error: JSON structure does not contain 'data' or 'items'")
        }
      } else {
        showNotification("Failed to retrieve data from crop productios.", type = "error")
      }
    }
  }, ignoreInit = TRUE)
  
  # Selecting the variable
  observeEvent(input$selectInput_measurementVariable, {
    if (auth()) {
      values$loadData = TRUE
      values$measurementVariable = input$selectInput_measurementVariable
      
      df <- measurementVariables()
      var <- df[df$id == values$measurementVariable, ]
      measurementVariable(var)
      measurementUnitId = var$measurementUnitId
      dfu <- measurementUnits()
      var2 <- dfu[dfu$id == measurementUnitId, ]
      measurementUnit(var2)
      #updateBox(session, "measurementPlot", title = var$name)
    }
  })
  
  # Selecting the graph
  observeEvent(input$selectInput_graphs_available, {
    if (auth()) {
      values$loadData = TRUE
      api_data(NULL)
      current_data(NULL)
    }
  })
  
  filtered_data2 <- reactive({
    
    if (is.null(current_data()) | values$loadData) {
      data <- fetch_data2()
      
      if(! is.null(data)){
        current_data(data)
      }
      
    } else {
      data <- current_data()
    }
    
    if (is.null(data)) return(NULL)
    
    graphs <- listGraphs()
    
    currentGraph <- graphs %>%
      filter(name == input$selectInput_graphs_available) 
    
    series = currentGraph$series[[1]]
    
    updateSerieList(series)
    
    summaryTimeScale = currentGraph$summaryTimeScale
    
    groupbyvars = getGroupbyvars(summaryTimeScale)
    
    filterVar = groupbyvars[length(groupbyvars)]
    
    initVal = input$sliderInput_data_range[1]
    endVal = input$sliderInput_data_range[2]
    
    #selected = as.list(input$checkboxGroupInput_plot_elements)
    
    #filteredData = data %>%
      #filter(data[[filterVar]] >= initVal & data[[filterVar]] <= endVal & var %in% selected)
    
    filteredData = data %>%
      filter(data[[filterVar]] >= initVal & data[[filterVar]] <= endVal)
    
    return(filteredData) 
  })
  
  # Loading data
  fetch_data2 <- reactive({
    req(auth(), input$selectInput_graphs_available)
    
    currentCropProduction <- cropProduction()

    graphs <- listGraphs()
    
    if(is.null(graphs))
      return(NULL)
  
    graphName = input$selectInput_graphs_available
    
    currentGraph <- graphs %>%
      filter(name == graphName) 
      
    summaryTimeScale = currentGraph$summaryTimeScale
    
    if (!is.null(api_data())) {
      currentData <- api_data()
    }
    else
      currentData <- NULL

    series = currentGraph$series[[1]]
    
    nSeries = length(series)

    if(nSeries == 0)  
      return(NULL)
    
    for(i in 1: nSeries)
    {
        serie = as.data.frame(series[[i]])

        measurementVar = serie$measurementVariableId
      
        dataAlredyLoaded = FALSE
        
        # check if the variable is already in the data frame
        if(!is.null(currentData))
        {
          dataIn <- currentData %>%
          filter(measurementVariableId == measurementVar) 
          
          if(nrow(dataIn) > 0)
            dataAlredyLoaded = TRUE
        }

        if(! dataAlredyLoaded)
        {
          variableData = get_data_from_api(measurementVar)
          
          if(!is.null(currentData))
          {
            currentData <- rbind(currentData, variableData)
          }
          else
          {
            currentData = variableData
          }
        }
      }
    
      if(is.null(currentData)){
        return(null)}
      else{
        api_data(currentData)
      }
      
      adjustSlider(currentData, summaryTimeScale)
      
      groupbyvars <- getGroupbyvars(summaryTimeScale)  
  
      dataAvg = currentData %>% select(-minValue, -maxValue, -sumValue) %>% 
        mutate (var = "AvgValue") %>% 
        rename(value = avgValue)
      
      if (nrow(dataAvg) > 0) {
        dataAvg = dataAvg %>%
          group_by(across(all_of(groupbyvars))) %>%
          summarize(value = mean(value, na.rm = TRUE), .groups = "drop") %>%
          mutate (var = "AvgValue")
      }
      
      dataSum = currentData %>% select(-minValue, -maxValue, -avgValue) %>%
        filter(!is.na(sumValue)) %>%
        mutate (var = "SumValue") %>% 
        rename(value = sumValue) %>%
        filter(var %in% input$checkboxGroupInput_plot_elements)
      
      if (nrow(dataSum) > 0) {
        dataSum = dataSum %>%
          group_by(across(all_of(groupbyvars))) %>%
          summarize(value = sum(value, na.rm = TRUE), .groups = "drop")%>%
          mutate (var = "SumValue")
      } 
      
      dataMin = currentData %>% select(-maxValue, -avgValue, -sumValue) %>% 
        mutate (var = "MinValue") %>% 
        rename(value = minValue) 
      
      if (nrow(dataMin) > 0) {
        dataMin = dataMin %>%
          group_by(across(all_of(groupbyvars))) %>%
          summarize(value = min(value, na.rm = TRUE), .groups = "drop")%>%
          mutate (var = "MinValue")
      }
      
      dataMax = currentData %>% select(-minValue, -avgValue, -sumValue) %>% 
        mutate (var = "MaxValue") %>% 
        rename(value = maxValue)
      
      if (nrow(dataMax) > 0) {
        dataMax = dataMax %>%
          group_by(across(all_of(groupbyvars))) %>%
          summarize(value = max(value, na.rm = TRUE), .groups = "drop")%>%
          mutate (var = "MaxValue")
      }
      
      data <- bind_rows(
        lapply(list(dataSum, dataMin, dataMax, dataAvg), function(x) if (nrow(x) > 0) x))
    
    return(data)
    
  })
  
  to_local_time <- function(dt_utc) {
    # Detect system's timezone (on Linux/Mac/Windows it returns an IANA tz name)
    tz <- Sys.timezone()
    if (is.null(tz) || tz == "") {
      tz <- "UTC"   # fallback
    }
    with_tz(dt_utc, tz)
  }
  
  get_last24hour_climateData <- function(measurementVariable){
    currentCropProduction <- cropProduction()
    
    now_utc <- Sys.time()                # whatever the server clock is set to
    now_local <- to_local_time(now_utc)
    now_minus_24h <- now_local - hours(24)
    

    start_chr <- format(now_minus_24h, "%Y-%m-%d %H:%M:%S")
    end_chr   <- format(now_local, "%Y-%m-%d %H:%M:%S")
    
    start_enc <- utils::URLencode(start_chr, reserved = TRUE)
    end_enc   <- utils::URLencode(end_chr,   reserved = TRUE)
    
    cropProductionId <- values$CropProdutionId

    url = paste0(baseURL,"/MeasurementBase?CropProductionId=",cropProductionId,"&MeasurementVariableId=",measurementVariable,"&PeriodStartingDate=",start_enc,"&PeriodEndingDate=",end_enc)
    
    resMeasurementBaseData <- GET(url, add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
    )
    
    if (status_code(resMeasurementBaseData) == 200) {
      # Store retrieved data
      
      json_content <- content(resMeasurementBaseData, "text", encoding = "UTF-8")
      
      data <- fromJSON(json_content, flatten = TRUE)
      
      api_data  = data$result$measurements
      
      api_data$recordDate <- as.POSIXct(api_data$recordDate, format = "%Y-%m-%dT%H:%M:%S")
      
      return(api_data)
    }
    else {
      showNotification("Failed to retrieve data.", type = "error")
      return(data.frame())
    }
  }
  
  get_data_from_api <- function(measurementVariable){
    currentCropProduction <- cropProduction()
    
    if(values$loadData == TRUE)
    {
      currentCropProduction$startDate = as.POSIXct(currentCropProduction$startDate, format = "%Y-%m-%dT%H:%M:%S")
      currentCropProduction$endDate = as.POSIXct(currentCropProduction$endDate, format = "%Y-%m-%dT%H:%M:%S")
    }
    
    cropProductionId <- values$CropProdutionId
    periodEndingDate <- format(Sys.Date(), "%Y-%m-%d")
    
    url = paste0(baseURL,"/Measurement?CropProductionId=",cropProductionId,"&MeasurementVariableId=",measurementVariable,"&PeriodStartingDate=0001-01-01&PeriodEndingDate=",periodEndingDate)
    
    resMeasurementVariableData <- GET(url, add_headers(Accept = "text/plain", Authorization = paste("Bearer", token()))
    )
    
    if (status_code(resMeasurementVariableData) == 200) {
      # Store retrieved data
      
      json_content <- content(resMeasurementVariableData, "text", encoding = "UTF-8")
      
      data <- fromJSON(json_content, flatten = TRUE)
      
      api_data  = data$result$measurements
      
      api_data$recordDate <- as.POSIXct(api_data$recordDate, format = "%Y-%m-%dT%H:%M:%S")
      
      api_data <- api_data  %>%
        mutate(date = as.Date(recordDate)) %>%
        mutate(week = week(date), weekDate = ceiling_date(date, "week")) %>%
        mutate(month = month(date), monthDate = ceiling_date(date, "month") - days(1)) %>%
        mutate(daysOfGrowth = trunc(time_length(interval(currentCropProduction$startDate, date), "days"))) %>%
        mutate(weeksOfGrowth = trunc(time_length(interval(currentCropProduction$startDate, date), "weeks"))) %>%
        mutate(monthsOfGrowth = trunc(time_length(interval(currentCropProduction$startDate, date), "months"))) %>%
        select(-week, -month)
      
      
      values$loadData = FALSE;
      
      return(api_data)
    }
    else {
      showNotification("Failed to retrieve data.", type = "error")
      return(data.frame())
    }
  }
  
  adjustSlider <- function(df, summaryTimeScale){
    currentCropProduction <- cropProduction()
    
    periodEndingDate <- format(Sys.Date(), "%Y-%m-%d")
    
    stringList <- list("hour", "day", "week", "month")
    
    result <- unlist(stringList) %in% summaryTimeScale
    
    if (sum(result) > 0){
      min_val <- as.Date(currentCropProduction$startDate)
      max_val <- as.Date(periodEndingDate)
      updateSliderInput(session, "sliderInput_data_range", min = min_val, max = max_val, value = c(min_val, max_val), timeFormat = "%d-%m-%Y")
    }
    else
      if ("daysOfGrowth" %in% summaryTimeScale) {
        min_val <- min(df$daysOfGrowth)
        max_val <- max(df$daysOfGrowth)
        updateSliderInput(session, "sliderInput_data_range", min = min_val, max = max_val, value = c(min_val, max_val))
      }
    else
      if ("weekOfGrowth" %in% summaryTimeScale) {
        min_val <- min(df$weeksOfGrowth)
        max_val <- max(df$weeksOfGrowth)
        updateSliderInput(session, "sliderInput_data_range", min = min_val, max = max_val, value = c(min_val, max_val))
      }
    else
      if ("monthOfGrowth" %in% summaryTimeScale) {
        min_val <- min(df$monthsOfGrowth)
        max_val <- max(df$monthsOfGrowth)
        updateSliderInput(session, "sliderInput_data_range", min = min_val, max = max_val, value = c(min_val, max_val))
      }
  }
  
  getGroupbyvars <- function(summaryTimeScale){
    
    if ("hour" %in% summaryTimeScale) {
      groupbyvars = c("cropProductionId", "measurementVariableId", "recordDate")
    }
    else
      if ("day" %in% summaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "date")
      }
    else
      if ("week" %in% summaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "weekDate")
      }      
    else
      if ("month" %in% summaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "monthDate")
      }
    else
      if ("daysOfGrowth" %in% isummaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "daysOfGrowth")
      }          
    else
      if ("weekOfGrowth" %in% summaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "weekOfGrowth")
      }          
    else
      if ("monthOfGrowth" %in% summaryTimeScale) {
        groupbyvars = c("cropProductionId", "measurementVariableId", "monthOfGrowth")
      }
    
    return(groupbyvars)
  }
  
  showAmbitModal <- function (){
    showModal(modalDialog(
      title = uiOutput("form_graph_label"),
      
      box(title = uiOutput("boxAmbit_tittle_label"), status = "primary", 
          solidHeader = TRUE, collapsible = TRUE,  # Make the box collapsible
          width = 12,
          p(
            fluidRow(
              column(6, selectInput("selectInput_farm", label = uiOutput("selectInput_farm_label"), choices = NULL)),
              column(6, selectInput("selectInput_productionUnit", label = uiOutput("selectInput_productionUnit_label"), choices = NULL))),
            fluidRow(
              column(12, selectInput("selectInput_cropProduction", label = uiOutput("selectInput_cropProduction_label"), choices = NULL)),
              #column(6, selectInput("selectInput_measurementVariable", label = uiOutput("selectInput_measurementVariable_label"), choices = NULL))
            )
          ),
          class = ".box"
      ),
      
      footer = tagList(
        actionButton("actionButton_accept_ambit", uiOutput("graph_form_actionButton_accept_label")),
        modalButton(label = uiOutput("graph_form_cancel_button_label"), icon = NULL)
      )
    ))
  }
  
  showGraphModal <- function (){
    graphName = ""
    summaryTimeScale = "day"
    axisScaleType = "cero"
    
    graphs = listGraphs()
    
    if(values$editingGraph)
    {
      currentGraph <- graphs %>%
        filter(name == input$selectInput_graphs_available)
      
      if(nrow(currentGraph) == 0)
        return(null)
      
      graphName = currentGraph$name
      summaryTimeScale = currentGraph$summaryTimeScale
      axisScaleType = currentGraph$yAxisScaleType
    }
    
    lang <- time_Summarization_Types_Dictionary()
    langAxisSales <- axis_scales_Dictionary()
    
    listIds <- c("hour","day","week","month","dayOfGrowth","weekOfGrowth","monthOfGrowth","phaseOfGrowth")
    listNames <- c(lang$Hour,lang$Day,lang$Week,lang$Month,lang$DayOfGrowth,lang$WeekOfGrowth,lang$MonthOfGrowth,lang$PhaseOfGrowth)
    scales <- setNames(as.list(listIds), listNames)
    
    listIds <- c("auto","cero")
    listNames <- c(langAxisSales$Auto,langAxisSales$Cero)
    axisScales <- setNames(as.list(listIds), listNames)
    
    
    showModal(modalDialog(
      title = uiOutput("form_graph_label"),
      tabsetPanel(
        tabPanel("Parámetros",
                 fluidRow(column(12, textInput("textInput_graphName", uiOutput("textInput_graphName_label"), graphName))),
                 fluidRow(column(12, selectInput("selectInput_summary_time_scale", uiOutput("selectInput_summary_time_scale_label"), choices = scales, selected = summaryTimeScale))),
                 fluidRow(column(12, selectInput("selectInput_axis_scales", uiOutput("selectInput_axis_scales_label"), choices = axisScales, selected = axisScaleType)))),
        tabPanel("Script",
                 aceEditor("editor", value = "", 
                           mode = "r", 
                           theme = "github", 
                           height = "400px")
                 )
      ),
      
      
      footer = tagList(
        actionButton("actionButton_accept", uiOutput("graph_form_actionButton_accept_label")),
        modalButton(label = uiOutput("graph_form_cancel_button_label"), icon = NULL)
      )
    ))
  }
  
  observeEvent(input$actionButton_editGraph,{
    values$editingGraph = TRUE
    showGraphModal()
  })
  
  observeEvent(input$actionButton_newGraph, {
    values$editingGraph = FALSE
    showGraphModal()
  })
  
  getCurrentSeriesPos <- function(series, measurementVarId) {
    
      nSeries = length(series)
      
      for(i in 1:nSeries)
      {
        seriesp = as.data.frame(series[[i]])
        if(seriesp$measurementVariableId == measurementVarId)
        return(i)
      }
      
      return(0)
  }
  
  observeEvent(input$actionButton_accept, {
    
    graphs = listGraphs()
    
    company = current_company();
    
    if(values$editingGraph == FALSE)
    {
      if(is.null(listGraphs()))
      {
        df <- tibble(
          id = integer(),
          catalogId = integer(),
          description = character(),
          name = character(), # Column for names (character type)
          summaryTimeScale = character(), # column for the summary dimension to apply
          yAxisScaleType = character(),
          series = I(list(NULL)),
          status = character()
        ) 
      }
      else
      {
        df <- graphs
      }
      
      textInput_graphName_label = input$textInput_graphName
      
      df <- add_row(df, id = 0, catalogId = company$catalogId, name = textInput_graphName_label, description = "", summaryTimeScale = input$selectInput_summary_time_scale, yAxisScaleType = input$selectInput_axis_scales, NULL, status = "added")
      
      updateSelectInput(session, "selectInput_graphs_available", choices = df$name, selected = textInput_graphName_label)
      
      listGraphs(df)
    }
    else
    {
      df <- graphs
      
      row_index <- which(df$name == input$selectInput_graphs_available)	

      df$name[row_index] = input$textInput_graphName
      df$summaryTimeScale[row_index] = input$selectInput_summary_time_scale
      df$yAxisScaleType[row_index] = input$selectInput_axis_scales
      df$status[row_index] = "modified"
      
      
      listGraphs(df)
    }
    
    values$editingGraph == FALSE
    values$loadData = TRUE
    api_data(NULL)
    current_data(NULL)
    
    safeGraphs()
    
    removeModal()  # Close the login modal
    
    updateSelectInput(session, "selectInput_graphs_available", choices = df$name, selected = input$textInput_graphName)
    
    
  })
  
  showSeriesModal <- function(){
    
    measurement_variable = 1
    geomtype = "Line"
    axis = "Primary"
    series_Color = "#2200FF"
    series_visible = TRUE
    create_stats = TRUE
    
    bar_position = "dodge"
    bar_thickness = 3
    bar_Transparency = 1
    border_thickness = 3

    line_type = "Solid"    
    line_width = .5
    line_Transparency = 1

    shape_type = 16
    shape_size = 3
    point_transparency = 1
    
    line_width_pointrange = .5
    line_type_pointrange = "Solid"
    colour_pointrange = "#2200FF"
    shape_type_pointrange = 16
    fill_pointrange = "white"
    fatten_pointrange = 0.5
    alpha_pointrange = 1
    
    series_name_refline = ""
    value_refline = 0
    line_width_refline = .5
    line_type_refline = "Solid"
    colour_refline = "#2200FF"
    alpha_refline = 1
    
    graphs = listGraphs()
    
    if(values$editingSeries)
    {
      row_index <- which(graphs$name == input$selectInput_graphs_available)	
      series <- graphs$series[[row_index]]
      
      pos = getCurrentSeriesPos(series, input$selectInput_series_available)
      current_series = as.data.frame(series[[pos]])
      
      measurement_variable = current_series$measurementVariableId
      geomtype = current_series$geomtype
      axis= current_series$axis
      series_Color = current_series$color
      series_visible = current_series$visible
      
      create_stats <- if ("createStats" %in% colnames(current_series)) {
        current_series[["createStats"]]
      } else {
        FALSE
      }
      
      if(current_series$geomtype == "Bar")
      {
        bar_position = current_series$bar_position
        bar_thickness = current_series$bar_thickness
        bar_Transparency = current_series$bar_Transparency
        border_thickness = current_series$bar_border_thickness
      }
      else
      if(current_series$geomtype == "Line")
      {
        line_type = current_series$line_type
        line_width = current_series$line_width
        line_Transparency = current_series$line_Transparency
      }
      else
        if(current_series$geomtype == "Point")
        {
          shape_type = current_series$shape_type
          shape_size = current_series$shape_size 
          point_transparency =  current_series$point_transparency
        }
      else
        if(current_series$geomtype == "PointRange")
        {
          line_width_pointrange = current_series$size
          line_type_pointrange = current_series$linetype
          colour_pointrange = current_series$colour
          shape_type_pointrange = current_series$shape
          fill_pointrange = current_series$fill
          fatten_pointrange = current_series$fatten
          alpha_pointrange = current_series$alpha
        }
      else
        if(current_series$geomtype == "RefLine")
        {
          series_name_refline = current_series$name
          value_refline = current_series$yintercept
          line_width_refline = current_series$size
          line_type_refline = current_series$linetype
          alpha_refline = current_series$alpha
        }
    }
    
    
    lang <- series_form_translator()
    axisTypesLang <- axis_types_Dictionary()
    geomTypesLang <- geom_types_Dictionary()
    shapeTypesLang <- shape_Types_Dictionary()
    lineTypesLang <- line_Types_Dictionary()
    statTypesLang <- bar_stat_dictionary() 
    barPositionLang <- bar_position_dictionary()
    
    listIds <- c("Primary","Secondary")
    listNames <- c(axisTypesLang$AxisOptionMain,axisTypesLang$AxisOptionSecondary)
    axisOptions <- setNames(as.list(listIds), listNames)
    
    listIds <- c("Point","Line", "Bar", "PointRange", "RefLine")
    listNames <- c(geomTypesLang$GeomTypePoint,geomTypesLang$GeomTypeLine, geomTypesLang$GeomTypeBar, geomTypesLang$GeomTypePointRange, geomTypesLang$GeomTypeRefLine)
    geomTypeOptions <- setNames(as.list(listIds), listNames)
    
    listIds <- c(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25)
    listNames <- c(shapeTypesLang$SquareOpen,shapeTypesLang$CircleOpen,shapeTypesLang$TriangleUp,shapeTypesLang$Plus,shapeTypesLang$Cross,shapeTypesLang$DiamondOpen,shapeTypesLang$TriangleDown,shapeTypesLang$SquareFilled,shapeTypesLang$CircleFilled,shapeTypesLang$TriangleFilled,shapeTypesLang$PlusFilled,shapeTypesLang$CrossFilled,shapeTypesLang$DiamondFilled,shapeTypesLang$TriangleDownFilled,shapeTypesLang$SquareFilledBorderThick,shapeTypesLang$SolidSquare,shapeTypesLang$SolidCircle,shapeTypesLang$SolidTriangle,shapeTypesLang$SolidDiamond,shapeTypesLang$SolidCircleThicker,shapeTypesLang$BulletPoint,shapeTypesLang$CircleFilledBorder,shapeTypesLang$SquareFilledBorder,shapeTypesLang$DiamondFilledBorder,shapeTypesLang$TriangleFilledBorder,shapeTypesLang$CircleLargeBorder)
    shapeOptions <- setNames(as.list(listIds), listNames)
    
    listIds <- c("solid","dashed","dotted","dotdash","longdash","twodash")
    listNames <- c(lineTypesLang$Solid,lineTypesLang$Dashed,lineTypesLang$Dotted,lineTypesLang$DotDash,lineTypesLang$LongDash,lang$TwoDash)
    lineTypeOptions <- setNames(as.list(listIds), listNames)
    
    listIds <- c("identity","count")
    listNames <- c(statTypesLang$identity, statTypesLang$count)
    statTypeOptions <- setNames(as.list(listIds), listNames)
    
    listIds <- c("stack","dodge","fill")
    listNames <- c(barPositionLang$stack,barPositionLang$dodge,barPositionLang$fill)
    barPositionOptions <- setNames(as.list(listIds), listNames)
    
    selectInput_measurement_variable = selectInput("selectInput_measurement_variable", label = uiOutput("selectInput_measurement_variable_label"), choices = listMeasurementVariables(), selected = measurement_variable)
    selectInput_geomtype = selectInput("selectInput_geomtype", label = uiOutput("selectInput_geomtype_label"), choices = geomTypeOptions, selected = geomtype)
    selectInput_axis = selectInput("selectInput_axis", label = uiOutput("selectInput_axis_label"), choices = axisOptions, selected = axis)
    colourInput_series_Color = colourInput("colourInput_series_Color", label = uiOutput("colourInput_series_Color_label"), value = series_Color)
    checkboxInput_series_visible = checkboxInput("checkboxInput_series_visible", label= uiOutput("checkboxInput_series_visible_label"), value = series_visible)
    checkboxInput_series_create_stats = checkboxInput("checkboxInput_series_create_stats", label= uiOutput("checkboxInput_series_create_stats_label"), value = create_stats)
    
    #controls for bar
    selectInput_bar_position = selectInput("selectInput_bar_position", label = uiOutput("selectInput_position_label"), choices = barPositionOptions, selected = bar_position)
    sliderInput_bar_thickness = sliderInput("sliderInput_bar_thickness", label = uiOutput("sliderInput_bar_thickness_label"),  min = 1, max = 10, value = bar_thickness)
    sliderInput_bar_Transparency = sliderInput("sliderInput_bar_Transparency", label = uiOutput("sliderInput_bar_Transparency_label"),  min = 0, max = 1, value = bar_Transparency)
    sliderInput_bar_border_thickness = sliderInput("sliderInput_bar_border_thickness", label = uiOutput("sliderInput_bar_border_thickness_label"),  min = 1, max = 10, value = border_thickness)
    
    #controls for line
    selectInput_line_type = selectInput("selectInput_line_type", label = uiOutput("selectInput_line_type_label"), choices = lineTypeOptions, selected = line_type)
    sliderInput_line_width = sliderInput("sliderInput_line_width", label = uiOutput("sliderInput_line_width_label"),  min = 0, max = 10, step = 0.1, value = line_width)
    sliderInput_Line_Transparency = sliderInput("sliderInput_Line_Transparency", label = uiOutput("sliderInput_Line_Transparency_label"),  min = 0, max = 1, value = line_Transparency)
    
    #controls for point
    selectInput_shape_type = selectInput("selectInput_shape_type", label = uiOutput("selectInput_shape_type_label"), choices = shapeOptions, selected = shape_type)
    sliderInput_shape_size = sliderInput("sliderInput_shape_size", label = uiOutput("sliderInput_shape_size_label"),  min = 1, max = 10, value = shape_size)
    sliderInput_point_transparency = sliderInput("sliderInput_point_transparency", label = uiOutput("sliderInput_point_transparency_label"),  min = 0, max = 1, value = point_transparency)

    #controls for PointRange
    sliderInput_size_PointRange = sliderInput("sliderInput_size_PointRange", label = uiOutput("sliderInput_size_PointRange_label"),  min = 0, max = 10, step = 0.1, value = line_width_pointrange)
    selectInput_linetype_PointRange = selectInput("selectInput_linetype_PointRange", label = uiOutput("selectInput_linetype_PointRange_label"), choices = lineTypeOptions, selected = line_type_pointrange)
    colourInput_colour_PointRange = colourInput("colourInput_colour_PointRange", label = uiOutput("colourInput_colour_PointRange_label"), value = colour_pointrange)    
    selectInput_shape_PointRange = selectInput("selectInput_shape_PointRange", label = uiOutput("selectInput_shape_PointRange_label"), choices = shapeOptions, selected = shape_type_pointrange)
    colourInput_fill_PointRange = colourInput("colourInput_fill_PointRange", label = uiOutput("colourInput_fill_PointRange_label"), value = fill_pointrange)
    sliderInput_width_PointRange = sliderInput("sliderInput_width_PointRange", label = uiOutput("sliderInput_width_PointRange_label"),  min = 0, max = 0.5, step = 0.5, value = fatten_pointrange)
    sliderInput_Alpha_PointRange = sliderInput("sliderInput_Alpha_PointRange", label = uiOutput("sliderInput_Alpha_PointRange_label"),  min = 0, max = 1, value = alpha_pointrange)
    
    #controls for RefLine
    textInput_series_name_refline = textInput("textInput_series_name_refline", uiOutput("textInput_series_name_refline_label"), series_name_refline)
    numericInput_value_refLine = numericInput(inputId = "numericInput_value_refLine", label = uiOutput("numericInput_value_refLine_label"), value = value_refline, min = 0, max = 0, step = 0.1)
    sliderInput_line_width_refLine = sliderInput("sliderInput_line_width_refLine", label = uiOutput("sliderInput_line_width_refLine_label"),  min = 0, max = 10, step = 0.1, value = line_width_refline)
    selectInput_line_type_refLine = selectInput("selectInput_line_type_refLine", label = uiOutput("selectInput_line_type_refLine_label"), choices = lineTypeOptions, selected = line_type_refline)
    sliderInput_Alpha_refLine = sliderInput("sliderInput_Alpha_refLine", label = uiOutput("sliderInput_Alpha_RefLine_label"),  min = 0, max = 1, value = alpha_refline)


    showModal(modalDialog(
      title = uiOutput("SeriesFormCaption"),
      fluidRow(column(6, selectInput_measurement_variable),
               column(6, selectInput_geomtype),
               column(6, selectInput_axis),
               column(6, colourInput_series_Color),
               column(6, checkboxInput_series_visible),
               column(6, checkboxInput_series_create_stats)),
      conditionalPanel(condition = "input.selectInput_geomtype =='Bar'",
                       fluidRow(column(12, h3(uiOutput("Geom_Bar_Info_Group_label"))),
                                column(4, selectInput_bar_position),
                                column(4, sliderInput_bar_thickness),
                                column(4, sliderInput_bar_Transparency),
                                column(4, sliderInput_bar_border_thickness))
                       ),
      conditionalPanel(condition = "input.selectInput_geomtype =='Line'",
                       fluidRow(column(12, h3(uiOutput("geom_line_info_group_label"))),
                                column(4, selectInput_line_type),
                                column(4, sliderInput_line_width),
                                column(4, sliderInput_Line_Transparency))
                      ),  
      conditionalPanel(condition = "input.selectInput_geomtype =='Point'",
                       fluidRow(column(12, h3(uiOutput("geom_point_info_group_label"))),
                                column(4, selectInput_shape_type),
                                column(4, sliderInput_shape_size),
                                column(4, sliderInput_point_transparency))
                      ),
      conditionalPanel(condition = "input.selectInput_geomtype =='PointRange'",
                       fluidRow(column(12, h3(uiOutput("Geom_PointRange_Info_Group_label"))),
                                column(4, sliderInput_size_PointRange),
                                column(4, selectInput_linetype_PointRange),
                                column(4, colourInput_colour_PointRange),   
                                column(4, selectInput_shape_PointRange), 
                                column(4, colourInput_fill_PointRange),  
                                column(4, sliderInput_width_PointRange),
                                column(4, sliderInput_Alpha_PointRange))
                      ),
      conditionalPanel(condition = "input.selectInput_geomtype =='RefLine'",
                       fluidRow(column(12, h3(uiOutput("Geom_RefLine_label"))),
                                column(4, textInput_series_name_refline),
                                column(4, numericInput_value_refLine),
                                column(4, sliderInput_line_width_refLine),
                                column(4, selectInput_line_type_refLine),
                                column(4, colourInput_series_Color),
                                column(4, sliderInput_Alpha_refLine))
                      ),
      footer = tagList(
        actionButton("confirmEditSeries", uiOutput("series_form_accept_label")),
        actionButton("deleteSeries", uiOutput("series_form_delete_label")),
        modalButton(label = uiOutput("series_form_cancel_label"), icon = NULL)
        )
      )
    )
  }
  
  observeEvent(input$actionButton_newSeries, {
    values$editingSeries = FALSE
    showSeriesModal()
  })
  
  observeEvent(input$actionButton_EditSeries, {
    values$editingSeries = TRUE
    showSeriesModal()
  })
  
  observeEvent(input$confirmEditSeries, {
    req(input$confirmEditSeries)

    measurementVars <- measurementVariables()
    
    if(is.null(listGraphs()))
    {
      showNotification("List of graphs empty, create one", type = "error")
      removeModal()  # Close the login modal
    }
    else
    {
      df <- listGraphs()
      
      row_index <- which(df$name == input$selectInput_graphs_availabel)
      
      newrow <- NULL
      
      if(input$selectInput_geomtype == "Bar")
      {
        
        newrow <- data.frame(geomtype = input$selectInput_geomtype,
                             measurementVariableId = as.integer(input$selectInput_measurement_variable),
                             axis = input$selectInput_axis,  
                             color = input$colourInput_series_Color, 
                             visible = as.logical(input$checkboxInput_series_visible),
                             createStats = as.logical(input$checkboxInput_series_create_stats),
                             bar_position = input$selectInput_bar_position,
                             bar_thickness = as.numeric(input$sliderInput_bar_thickness),
                             bar_Transparency = as.numeric(input$sliderInput_bar_Transparency),
                             bar_border_thickness = as.numeric(sliderInput_bar_border_thickness)
        )
      }
      else
      if(input$selectInput_geomtype == "Line")
      {
        newrow <- data.frame(geomtype = input$selectInput_geomtype,
                             measurementVariableId = as.integer(input$selectInput_measurement_variable),
                             axis = input$selectInput_axis,  
                             color = input$colourInput_series_Color, 
                             visible = as.logical(input$checkboxInput_series_visible),
                             createStats = as.logical(input$checkboxInput_series_create_stats),
                             line_type = input$selectInput_line_type,
                             line_width = as.numeric(input$sliderInput_line_width),
                             line_Transparency = as.numeric(input$sliderInput_Line_Transparency))
        
      }
      else
      if(input$selectInput_geomtype == "Point")
      {
        newrow <- data.frame(geomtype = input$selectInput_geomtype,
                             measurementVariableId = as.integer(input$selectInput_measurement_variable),
                             axis = input$selectInput_axis,  
                             color = input$colourInput_series_Color, 
                             visible = input$checkboxInput_series_visible,
                             name = input$textInput_series_name_refline,
                             createStats = as.logical(input$checkboxInput_series_create_stats),
                             shape_type = as.integer(input$selectInput_shape_type),
                             shape_size = as.numeric(input$sliderInput_shape_size),
                             point_transparency = as.numeric(input$sliderInput_point_transparency))
      }
      else
        if(input$selectInput_geomtype == "PointRange")
        {
          newrow <- data.frame(geomtype = input$selectInput_geomtype,
                               measurementVariableId = as.integer(input$selectInput_measurement_variable),
                               axis = input$selectInput_axis,  
                               color = input$colourInput_series_Color, 
                               visible = input$checkboxInput_series_visible,
                               createStats = FALSE,
                               size = input$sliderInput_size_PointRange,
                               linetype = input$selectInput_linetype_PointRange,
                               shape = as.integer(input$selectInput_shape_PointRange),
                               colour = input$colourInput_colour_PointRange,
                               fill = input$colourInput_fill_PointRange,
                               fatten= input$sliderInput_width_PointRange,
                               alpha = input$sliderInput_Alpha_PointRange
                              )
        }
      else
        if(input$selectInput_geomtype == "RefLine")
        {
          newrow <- data.frame(geomtype = input$selectInput_geomtype,
                               measurementVariableId = as.integer(input$selectInput_measurement_variable),
                               axis = input$selectInput_axis,  
                               color = input$colourInput_series_Color, 
                               visible = input$checkboxInput_series_visible,
                               createStats = FALSE,
                               name = input$textInput_series_name_refline,
                               yintercept = as.numeric(input$numericInput_value_refLine),
                               size = input$sliderInput_line_width_refLine,
                               linetype = input$selectInput_line_type_refLine,
                               colour = input$colourInput_series_Color,
                               alpha = input$sliderInput_Alpha_refLine
                               
          )
        
        }
        
      

      #graph$series <- append(graph$series, newrow)
      
      row_index <- which(df$name == input$selectInput_graphs_available)	
      
      if(values$editingSeries)
      {
        series <- df$series[[row_index]]
        
        pos = getCurrentSeriesPos(series, as.integer(input$selectInput_measurement_variable))
        current_series = as.data.frame(series[[pos]])
        series[[pos]] = newrow
        df$series[[row_index]] = series
      }
      else
      {
        df$series[[row_index]] <- append(df$series[[row_index]], list(newrow))
      }
      
      series <- df$series[[row_index]]
      
      series_list <- list()
      listIds <- integer(0)
      listNames <- character(0)
      
      updateSerieList(series)
      
    }
    
    if(df$status[row_index] == "unmodified")
    {
      df$status[row_index] = "modified"
    }
    
    listGraphs(df)
    
    safeGraphs()
    
    values$loadData = TRUE
    
    removeModal()  # Close the login modal
  })
  
  observeEvent(input$deleteSeries, {
    showModal(modalDialog(
      title = uiOutput("Title_Confirm_Series_Delete_Label"),
      uiOutput("Confirm_Series_Delete_Message"),
      footer = tagList(
        actionButton("confirmDelete", uiOutput("series_form_accept_label")),
        modalButton(uiOutput("series_form_cancel_label"))
      )
    )
    )
  })
  
  observeEvent(input$confirmDelete, {
    
    df <- listGraphs()
    
    row_index <- which(df$name == input$selectInput_graphs_available)

    seriesToProcess = df$series[[row_index]]
    
    pos = getCurrentSeriesPos(seriesToProcess, input$selectInput_series_available)
    
    if (length(pos) > 0) {
      seriesToProcess <- seriesToProcess[-pos]
    }
    
    df$series[[row_index]] = seriesToProcess
    
    updateSerieList(seriesToProcess)
    
    listGraphs(df)
    
    # Close the confirmation modal
    removeModal()
  })
  
  safeGraphs <- function(){
    
    graphs <- listGraphs()
    
    for(i in 1: nrow(graphs))
    {
      if(graphs$status[i] == "added" | graphs$status[i] =="modified")
      {
        series = graphs$series[[i]]
        
        seriesjson = toJSON(series, pretty = FALSE)
        
        cleanSeriesJson <- substr(seriesjson, 2, nchar(seriesjson) - 1)
        
        cleanSeriesJson <- substr(cleanSeriesJson, 2, nchar(cleanSeriesJson) - 1)
        
        gts = data.frame(id = graphs$id[i], catalogId = graphs$catalogId[i], 
                         name = graphs$name[i],
                         description = graphs$description[i], summaryTimeScale = graphs$summaryTimeScale[i],
                         yAxisScaleType = graphs$yAxisScaleType[i], series = seriesjson, active = TRUE)
        
        graphJson = toJSON(gts, pretty = TRUE)
        
        cleanGraphJson <- substr(graphJson, 2, nchar(graphJson) - 1)
        
        print(cleanGraphJson)
        
        if(graphs$status[i] == "added")
        {
          response <- POST(
            url = paste0(baseURL,"/Graph"),  # Replace with actual data endpoint
            body = cleanGraphJson,
            encode = "json",  # Encoding type for the POST request
            add_headers("Content-Type" = "application/json", Accept = "text/plain", Authorization = paste("Bearer", token()))
          )
        }
        
        if(graphs$status[i] == "modified")
        {
          response <- PUT(
            url = paste0(baseURL,"/Graph"),  # Replace with actual data endpoint
            body = cleanGraphJson,
            encode = "json",  # Encoding type for the POST request
            add_headers("Content-Type" = "application/json", Accept = "text/plain", Authorization = paste("Bearer", token()))
          )
          
        }
        
        if (status_code(response) == 200 ) 
        {
          if(graphs$status[i] == "added" )
          {
            json_content <- content(response, "text", encoding = "UTF-8")
            
            data <- fromJSON(json_content, flatten = TRUE)
            
            graphs$id[i] = data$result$id
          }
          
          graphs$status[i] = "unmodified"
        }
        else
        {
          error_response <- content(response, "parsed", type = "application/json")
          
          if ("detail" %in% names(error_response)) {
            details = (paste("Error detail:", error_response$detail))
          }
          
          showNotification(paste(error_response, " ", details))
          
        } 
      }
    }
    
    listGraphs(graphs)
  }
  
  observeEvent(input$actionButton_newGraph_Script, {
    values$editingAnaliticalEntity = FALSE
    showAnaliticalEntityModal(1)
  })
  
  observeEvent(input$actionButton_editGraph_Script, {
    values$editingAnaliticalEntity = TRUE
    showAnaliticalEntityModal(1)
  })
  
  observeEvent(input$actionButton_newReport_Script, {
    values$editingAnaliticalEntity = FALSE
    showAnaliticalEntityModal(2)
  })
  
  observeEvent(input$actionButton_editReport_Script, {
    values$editingAnaliticalEntity = TRUE
    showAnaliticalEntityModal(2)
  })
  
  showAnaliticalEntityModal <- function (){
    entityName = ""
    entityDescription = ""
    script = ""
    entityType = "graph" 
    
    langEntityType <- analitical_entity_types_dictionary()
    
    listIds <- c("graph","report")
    listNames <- c(langEntityType$graph,langEntityType$report)
    entitytypes <- setNames(as.list(listIds), listNames)
    
    analiticalEntities = listAnaliticalEntities()
    
    if(values$editingAnaliticalEntity)
    {
      currentAnaliticalEntity <- analiticalEntities %>%
        filter(name == input$selectInput_graphs_available)
      
      if(nrow(currentGraph) == 0)
        return(null)
      
      entityName = currentAnaliticalEntity$name
      entityDescription = currentAnaliticalEntity$description
      entityType = currentAnaliticalEntity$
        script = currentAnaliticalEntity$script
    }
    
    showModal(modalDialog(
      title = uiOutput("form_graph_label"),
      tabsetPanel(
        tabPanel("Parámetros",
                 fluidRow(column(12, textInput("textInput_entityName", uiOutput("textInput_graphName_label"), entityName))),
                 fluidRow(column(12, textInput("textInput_entityDescription", uiOutput("selectInput_summary_time_scale_label"), entityDescription))),
                 fluidRow(column(12, selectInput("selectInput_analitical_entity_type", uiOutput("selectInput_EntityType_label"), choices = entitytypes, selected = entityType)))),
        tabPanel("Script",
                 aceEditor("Editor", value = script, 
                           mode = "r", 
                           theme = "github", 
                           height = "400px")
        )
      ),
      
      
      footer = tagList(
        actionButton("analitical_entity_form_actionButton_accept", uiOutput("analitical_entity_form_actionButton_accept_label")),
        modalButton(label = uiOutput("analitical_entity_form_cancel_button_label"), icon = NULL)
      )
    ))
  }
  
  observeEvent(input$analitical_entity_form_actionButton_accept, {
    req(input$analitical_entity_form_actionButton_accept)
    
    analiticalEntities = listAnaliticalEntities()
    
    company = current_company();
    
    if(values$editingAnaliticalEntity == FALSE)
    {
      if(is.null(analiticalEntities()))
      {
        df <- tibble(
          id = integer(),
          catalogId = integer(),
          name = character(), # Column for names (character type)
          description = character(),
          script = character(),
          status = character()
        ) 
      }
      else
      {
        df <- analiticalEntities
      }
      
      textInput_graphName_label = input$textInput_graphName
      
      df <- add_row(df, id = 0, catalogId = company$catalogId, name = textInput_graphName_label, description = "", summaryTimeScale = input$selectInput_summary_time_scale, yAxisScaleType = input$selectInput_axis_scales, NULL, status = "added")
      
      updateSelectInput(session, "selectInput_graphs_available", choices = df$name, selected = textInput_graphName_label)
      
      listGraphs(df)
    }
    else
    {
      df <- graphs
      
      row_index <- which(df$name == input$selectInput_graphs_available)	
      
      df$name[row_index] = input$textInput_graphName
      df$summaryTimeScale[row_index] = input$selectInput_summary_time_scale
      df$yAxisScaleType[row_index] = input$selectInput_axis_scales
      df$status[row_index] = "modified"
      
      
      listGraphs(df)
    }
    
    values$editingGraph == FALSE
    values$loadData = TRUE
    api_data(NULL)
    current_data(NULL)
    
    removeModal()  # Close the login modal
    
    updateSelectInput(session, "selectInput_graphs_available", choices = df$name, selected = input$textInput_graphName)
    
  })
  
  safeAnalitical <- function(){
    
    graphs <- listGraphs()
    
    for(i in 1: nrow(graphs))
    {
      if(graphs$status[i] == "added" | graphs$status[i] =="modified")
      {
        series = graphs$series[[i]]
        
        seriesjson = toJSON(series, pretty = FALSE)
        
        cleanSeriesJson <- substr(seriesjson, 2, nchar(seriesjson) - 1)
        
        cleanSeriesJson <- substr(cleanSeriesJson, 2, nchar(cleanSeriesJson) - 1)
        
        gts = data.frame(id = graphs$id[i], catalogId = graphs$catalogId[i], 
                         name = graphs$name[i],
                         description = graphs$description[i], summaryTimeScale = graphs$summaryTimeScale[i],
                         yAxisScaleType = graphs$yAxisScaleType[i], series = seriesjson, active = TRUE)
        
        graphJson = toJSON(gts, pretty = TRUE)
        
        cleanGraphJson <- substr(graphJson, 2, nchar(graphJson) - 1)
        
        print(cleanGraphJson)
        
        if(graphs$status[i] == "added")
        {
          response <- POST(
            url = paste0(baseURL,"/Graph"),  # Replace with actual data endpoint
            body = cleanGraphJson,
            encode = "json",  # Encoding type for the POST request
            add_headers("Content-Type" = "application/json", Accept = "text/plain", Authorization = paste("Bearer", token()))
          )
        }
        
        if(graphs$status[i] == "modified")
        {
          response <- PUT(
            url = paste0(baseURL,"/Graph"),  # Replace with actual data endpoint
            body = cleanGraphJson,
            encode = "json",  # Encoding type for the POST request
            add_headers("Content-Type" = "application/json", Accept = "text/plain", Authorization = paste("Bearer", token()))
          )
          
        }
        
        if (status_code(response) == 200 ) 
        {
          if(graphs$status[i] == "added" )
          {
            json_content <- content(response, "text", encoding = "UTF-8")
            
            data <- fromJSON(json_content, flatten = TRUE)
            
            graphs$id[i] = data$result$id
          }
          
          graphs$status[i] = "unmodified"
        }
        else
        {
          error_response <- content(response, "parsed", type = "application/json")
          
          if ("detail" %in% names(error_response)) {
            details = (paste("Error detail:", error_response$detail))
          }
          
          showNotification(paste(error_response, " ", details))
          
        } 
      }
    }
    
    listGraphs(graphs)
  }
  
  # ---Climate Dashbord Reactive Variables
  {
    # latest snapshot for gauges / arrow
    clim_latest <- reactive({
      df <- climate_df()
      req(nrow(df) > 0)
      
      latest_time <- df %>% summarize(t = max(recordDate, na.rm = TRUE)) %>% pull(t)
      last_val <- function(m) df %>% filter(metric == m, recordDate == max(recordDate, na.rm = TRUE)) %>% slice_tail(n=1) %>% pull(value)
      
      tibble::tibble(
        time       = latest_time,
        temp_c     = suppressWarnings(as.numeric(last_val("temp"))),
        wind_speed = suppressWarnings(as.numeric(last_val("windspd"))),
        wind_dir   = suppressWarnings(as.numeric(last_val("winddir")))
      )
    })
    
    climate_df <- reactive({
      rp <- climate_poll_rv()          # inner reactive (if any)
      req(!is.null(rp))
      rp()                              # call it to get the data.frame
    })
  }
  
  
  # ---- Outputs ----
  
  getxlabel <- function(summaryTimeScale){
    lang <- time_Summarization_Types_Dictionary()
    
    listIds <- c("daysOfGrowth","weekOfGrowth","monthOfGrowth","phaseOfGrowth")
    listNames <- c(lang$DayOfGrowth,lang$WeekOfGrowth,lang$MonthOfGrowth,lang$PhaseOfGrowth)
    
    stringList <- list("hour", "day", "week", "month")
    
    result <- unlist(stringList) %in% summaryTimeScale
    
    if (sum(result) > 0){
      return(lang$Date)
    }
    else
      if ("daysOfGrowth" %in% summaryTimeScale) {
        position <- which(listIds == "daysOfGrowth")
        return(listNames[[position]])
      }
    else
      if ("weekOfGrowth" %in% summaryTimeScale) {
        position <- which(listIds == "weekOfGrowth")
        return(listNames[[position]])
      }
    else
      if ("monthOfGrowth" %in% summaryTimeScale) {
        position <- which(listIds == "monthOfGrowth")
        return(listNames[[position]])
      }
  }
  
  getTransformation_factor <- function(data, yaxisType){
    
    df <- data
    
    if(nrow(df) == 0)
      return(1)
    
    graphs <- listGraphs()
    
    currentGraph <- graphs %>%
      filter(name == input$selectInput_graphs_available) 
    
    row_index <- which(graphs$name == input$selectInput_graphs_available)
    
    series = currentGraph$series[[1]]
    
    map0 <- lapply(series, function(df) {
      select(as.data.frame(df), measurementVariableId, axis)
    })
    
    map <- do.call(rbind, map0)
    
    #map <- bind_rows(as.data.frame(map))
    
    join <- left_join(data, map, by = "measurementVariableId")
    
    stats <- join %>%
      group_by(axis) %>%
        summarize(range_value = max(value) - min(value), max_Value = max(value))
    
    if(nrow(stats) == 1)
      return(1)
    
    statsY = stats %>%
      filter(axis == "Primary")
    
    statsY2 = stats %>%
      filter(axis == "Secondary")
    
    if(currentGraph$yAxisScaleType == "cero")
    {
      transformation_factor <- statsY2$max_Value / statsY$max_Value
    }
    else
    {
      transformation_factor <- max(statsY2$range_value) / max(stats$range_value)
    }

    
    return(transformation_factor) 
  }
  
  getApplyY2 <- function(data, series){
    nSeries = length(series)
    useY2 = FALSE
    transformation_factor <- 1
    
    for(i in 1:nSeries)
    {
      serie = as.data.frame(series[[i]])
      
      if(serie$axis == "Secondary")
      {
        subset <- data %>%
          filter(measurementVariableId == serie$measurementVariableId)
        
        if(nrow(subset) > 0)
        {
          useY2 = TRUE
          transformation_factor <- getTransformation_factor(data)
        }
     }
      
    }
    
    result <- data.frame(useY2 = useY2, transformation_factor = transformation_factor)
    
    return(result)
  }
  
  generate_tones <- function(main_color) {
    # Generate lighter and darker shades of the main color
    color_palette <- colorRampPalette(c(main_color, "white"))(3)  # Lighter tones for min, avg, max
    return(color_palette)
  }
  
  getColor <- function (series, stat){
    stat <- as.character(stat)
    
    seriesColor <- series$color
    
    if(stat == "MinValue")
      return(lighten(seriesColor, amount = 0.3))  # Lighter tone
    if(stat == "AvgValue")
      return(seriesColor)
    if(stat == "MaxValue")
      return(darken(seriesColor, amount = 0.3))   # Darker tone
    if(stat == "SumValue")
      return(darken(seriesColor, amount = 0.5))   # Darker tone  
  }
  
  addGeomBar <- function(parms){

    series= parms$pseries

    shape_type  = as.numeric(series$shape_type)

    color_vector = parms$pcolor_vector

    colorKey = getColor(series, parms$pstat)

    color_vector <- c(color_vector, colorKey)

    parms$pcolor_vector = color_vector

    data <- parms$pdata

    sub = data %>%
      filter(measurementVariableId == series$measurementVariableId & var == parms$pstat)

    sub$group = parms$pseriesKey

    if(series$axis == "Primary")
      yCol = "value"
    else
      yCol = paste("value * " , parms$ptransformation_factor)

    xcol = as.character(parms$pxvar)

    seriesName = "Series1"

    geom_col(data = sub, aes_string(x = xcol, y = yCol, fill = "group", color = "group"), position = series$bar_position,
             width  = series$bar_thickness, alpha  = series$bar_Transparency, size = series$bar_border_thickness)

    #fill = series$shape_fill_colorv

    plot = parms$pplot

    plot = plot + geom

    parms$pplot <- plot

    return(parms)
  }
  
  addGeomPoint <- function(parms){
    
    series= parms$pseries
    
    shape_type  = as.numeric(series$shape_type) 
    
    color_vector = parms$pcolor_vector
    
    colorKey = getColor(series, parms$pstat)
    
    color_vector <- c(color_vector, colorKey)
    
    parms$pcolor_vector = color_vector
    
    data <- parms$pdata
    
    sub = data %>% 
      filter(measurementVariableId == series$measurementVariableId & var == parms$pstat)
    
    sub$group = parms$pseriesKey
    
    if(series$axis == "Primary")
      yCol = "value"
    else
      yCol = paste("value * " , parms$ptransformation_factor)
    
    xcol = as.character(parms$pxvar)
    
    seriesName = "Series1"
    
    geom = geom_point(data = sub, 
                      aes_string(x = xcol, y = yCol, fill = "group", color = "group"), 
                      shape = series$shape_type, size = series$shape_size, alpha = series$point_transparency) 
    
    #fill = series$shape_fill_colorv
    
    plot = parms$pplot
    
    plot = plot + geom
    
    parms$pplot <- plot
    
    return(parms)
  }
  
  addGeomLine <- function(parms){
    
    series= parms$pseries
    
    line_types_vector = parms$pline_types_vector
    
    lineType = series$line_type
    
    line_types_vector <- c(line_types_vector, lineType)
    
    parms$pline_types_vector = line_types_vector
    
    color_vector = parms$pcolor_vector
    
    colorKey = getColor(series, parms$pstat)
    
    color_vector <- c(color_vector, colorKey)
    
    parms$pcolor_vector = color_vector
    
    data <- parms$pdata
    
    sub = data %>% 
      filter(measurementVariableId == series$measurementVariableId & var == parms$pstat)
    
    sub$group = parms$pseriesKey
    
    if(series$axis == "Primary")
      yCol = "value"
    else
      yCol = paste("value * " , parms$ptransformation_factor)
    
    xcol = as.character(parms$pxvar)
    
    seriesName = "Series1"
    
    geom = geom_line(data = sub, 
                     aes_string(x = xcol, y = yCol, color = "group"), 
                     linetype = lineType, size = series$line_width, alpha = series$line_Transparency) 
    
    plot = parms$pplot
    
    plot = plot + geom
    
    parms$pplot <- plot
    
    return(parms)
  }
  
  addGeom_hline <- function(parms){
    
    series= parms$pseries
    
    line_types_vector = parms$pline_types_vector
    
    lineType = series$line_type
    
    line_types_vector <- c(line_types_vector, lineType)
    
    parms$pline_types_vector = line_types_vector
    
    color_vector = parms$pcolor_vector
    
    colorKey = getColor(series, parms$pstat)
    
    color_vector <- c(color_vector, colorKey)
    
    parms$pcolor_vector = color_vector
    
    data <- parms$pdata
    
    sub = data %>% 
      filter(measurementVariableId == series$measurementVariableId)
    
    possible_id_cols <- c("recordDate", "date", "weekDate", "monthDate", "daysOfGrowth", "weekOfGrowth", "monthOfGrowth")
    
    id_col <- intersect(possible_id_cols, names(sub))
    
    sub <- sub %>%
      pivot_wider(
        id_cols = all_of(id_col),
        names_from = var,
        values_from = value
      )
    
    geom = geom_hline(yintercept=series$yintercept, size = series$size, linetype = series$linetype, 
                      colour= series$color, alpha = series$alpha)
    
    sub$group = parms$pseriesKey
    
    plot = parms$pplot
    
    plot = plot + geom
    
    parms$pplot <- plot
    
    return(parms)
  }
  
  addGeomPointRange <- function(parms){
    
    series= parms$pseries

    line_types_vector = parms$pline_types_vector

    lineType = series$line_type
    
    line_types_vector <- c(line_types_vector, lineType)
    
    parms$pline_types_vector = line_types_vector
    
    color_vector = parms$pcolor_vector
    
    colorKey = getColor(series, parms$pstat)
    
    color_vector <- c(color_vector, colorKey)

    parms$pcolor_vector = color_vector
    
    data <- parms$pdata
    
    sub = data %>% 
      filter(measurementVariableId == series$measurementVariableId)
    
    sub <- sub %>%
      sub = data %>% 
      filter(measurementVariableId == series$measurementVariableId)
    
    possible_id_cols <- c("recordDate", "date", "weekDate", "monthDate", "daysOfGrowth", "weekOfGrowth", "monthOfGrowth")
    
    id_col <- intersect(possible_id_cols, names(sub))
    
    sub <- sub %>%
      pivot_wider(
        id_cols = all_of(id_col),
        names_from = var,
        values_from = value
      )
    
    sub$group = parms$pseriesKey
    
    if(series$axis == "Primary")
    {
      yColMean = "AvgValue"
      yColMin = "MinValue"
      yColMax = "MaxValue"
    }
    else
    {
      yColMean = paste("AvgValue * " , parms$ptransformation_factor)
      yColMin = paste("MinValue * " , parms$ptransformation_factor)
      yColMax = paste("MaxValue * " , parms$ptransformation_factor)
    }
    
    xcol = as.character(parms$pxvar)
    
    
    seriesName = "Series1"
    

    geom =  geom_pointrange(data=sub, 
                            mapping= aes_string(x = xcol, y = yColMean, ymin = yColMin, ymax =  yColMax), 
                            size=series$size, linetype = series$linetype, colour= series$colour, shape = series$shape,  
                            fill= series$fill, fatten=series$fatten, alpha = series$alpha)
    
    #mapping=aes(x=drink, y=mean, ymin=upper, ymax=lower), width=0.2, size=1, color="blue", fill="white", shape=22)
      
      

    
    plot = parms$pplot
    
    plot = plot + geom
    
    parms$pplot <- plot
    
    return(parms)
  }
  
  addSeries <- function(parms){
    series <- parms$pseries
    transformation_factor <- parms$ptransformation_factor
    lang <- statistics_Dictionary() 
    mvars <- measurementVariables()
    mvar <- mvars[mvars$id == parms$pseries$measurementVariableId, ]

    if(str_detect(mvar$name, "_"))
    {
      subString = strsplit(mvar$name, "_")[[1]]
      shortVarName = subString[2]
    }
    else
      shortVarName = series$name
    
    if(series$axis == "Primary")
      yCol = "value"
    else
      yCol = paste("value * " , transformation_factor)
    
    selected = as.list(input$checkboxGroupInput_plot_elements)
    
    create_stats <- if ("createStats" %in% colnames(series)) {
      series[["createStats"]]
    } else {
      FALSE
    }
    
    if(series$geomtype == "RefLine")
    {
      parms$pseries_labels_vector = c(parms$pseries_labels_vector, series$name)
      
      parms = addGeom_hline(parms)
    }
    else
      {
        if(create_stats)
          nStats = length(selected)
        else
          nStats = 1
        
        for(i in 1:nStats)
        {
          stat = selected[i]
          
          statLabel = lang[[as.character(stat)]]
          
          label = paste(shortVarName, paste0("(", statLabel, ")"))
          
          parms$pseries_labels_vector = c(parms$pseries_labels_vector, label)
          
          seriesKey = paste0(parms$pseriesKey,stat,i)
          
          parms$pseriesKey = seriesKey
          
          parms$pseries_key_vector = c(parms$pseries_key_vector, seriesKey)
          
          parms$pstat = as.character(stat)
          
          if(series$geomtype == "Line")
          {
            parms = addGeomLine(parms)
          }
          else
            if(series$geomtype == "Point")
            {
              parms = addGeomPoint(parms)
            }
          else
            if(series$geomtype == "Bar")
            {
              parms = addGeomBar(parms)
            }
          else
            if(series$geomtype == "PointRange")
            {
              parms = addGeomPointRange(parms)
            }
        }
      }
      
      return(parms)
  }
  
  getPlot <- function(data){

    lang <- main_form_translator()  # Get translations for selected selectInput_language
    legendTitle = lang$LegendTitle
    
    measurementVars <- measurementVariables()
    measurementUnits <- measurementUnits()
    
    ylabel = ""
    y2label = ""
    
    graphs <- listGraphs()
    
    row_index <- which(graphs$name == input$selectInput_graphs_available)
    
    currentGraph <- graphs %>%
      filter(name == input$selectInput_graphs_available) 
    
    summaryTimeScale = currentGraph$summaryTimeScale
    
    groupbyvars <- getGroupbyvars(summaryTimeScale)  
    
    xvar = groupbyvars[length(groupbyvars)]
    
    xlabel <- getxlabel(summaryTimeScale) 
    
    seriesToProcess = currentGraph$series[[1]]
    
    nSeries = length(seriesToProcess)
    
    plot <- ggplot() +
      theme_minimal() 
    
    if(currentGraph$yAxisScaleType == "cero")
      plot <- plot + ylim(0, NA)
    
    color_vector <- character(0)
    line_types_vector <-  character(0)
    series_labels_vector <-  character(0)
    series_key_vector <-  character(0)
    
    applyY2 <- getApplyY2(data, seriesToProcess)
    
    useY2 = applyY2$useY2
    transformation_factor = applyY2$transformation_factor
    
    selectedSeries = as.list(input$checkboxGroupInput_series_available)
    
    if(length(selectedSeries) > 0)
    {
      for(i in 1:nSeries)
      {
        seriesp = as.data.frame(seriesToProcess[[i]])
        
        mvar = measurementVars[measurementVars$id == seriesp$measurementVariableId, ]
        unit <- measurementUnits[measurementUnits$id == mvar$measurementUnitId, ]
        
        if(seriesp$measurementVariableId %in% selectedSeries)
        {        
          if(seriesp$axis == "Secondary")
            y2label = paste(y2label, paste0("(",unit$symbol,")"))
          else
            ylabel = paste(ylabel, paste0("(",unit$symbol,")"))
          
          seriesKey = paste0("s",i)
          parms = list(pplot = plot, pdata = data, pseries = seriesp, pxvar = xvar, papplyY2 = applyY2,  
                       ptransformation_factor = transformation_factor, pseriesKey = seriesKey, 
                       pcolor_vector = color_vector, pline_types_vector = line_types_vector, 
                       pseries_labels_vector = series_labels_vector, pseries_key_vector = series_key_vector,
                       pstat = "")
          
          parms = addSeries(parms)
          
          color_vector <- parms$pcolor_vector
          line_types_vector <-  parms$pline_types_vector
          series_labels_vector <-  parms$pseries_labels_vector
          series_key_vector <-  parms$pseries_key_vector
          plot = parms$pplot
          
          parms$pplot = plot
        }
        
      }
      
      p <- parms$pplot
      
      p <- p +labs(color = legendTitle) +  # Change legend title for color
        scale_color_manual(
          values = parms$pcolor_vector,  # Set custom colors
          labels = parms$pseries_labels_vector  # Change legend item labels
        )
      
      p <- p + theme(legend.position = "bottom")
      
      if(useY2)
      {
        if(currentGraph$yAxisScaleType == "cero")
        {
          p <- p + scale_y_continuous(limits = c(0, NA),
                                      name = ylabel,  # label for the primary Y-axis
                                      sec.axis = sec_axis(trans = ~ . / transformation_factor, name = y2label)
          )
        }
        else
        {
          p <- p + scale_y_continuous(name = ylabel,  # label for the primary Y-axis
                                      sec.axis = sec_axis(trans = ~ . / transformation_factor, name = y2label)
          )                      
        }       
          
      }

      p <- p + labs(title = currentGraph$name,
                    x = paste(xlabel),
                    y = paste(ylabel))
      
      return(p)  
    }
    
    return(NULL)
  }
  
  # Plot
  output$measurementPlot <- renderPlot({
    req(filtered_data2())

    data <- filtered_data2()
    g <- getPlot(data)
    g
  })
  
  output$salesSummary_label <- renderPrint({
    req(filtered_data2())
    data <- filtered_data2()    
    summary(data)  # Replace with your actual data
  })
  
  .clim_compass <- function(deg) {
    labs <- c("N","NNE","NE","ENE","E","ESE","SE","SSE",
              "S","SSW","SW","WSW","W","WNW","NW","NNW","N")
    labs[ round((deg %% 360)/22.5) + 1 ]
  }  
  
  
  # ---Climate Dashbord Outputs
  {
    output$clim_asof_text <- renderUI({
      
      latest <- clim_latest()   # <-- call once

      tags$div(style="color:#666; font-size:12px;",
               paste("as of", format(clim_latest()$time[1], "%Y-%m-%d %H:%M")))
    })
    
    # --- gauges ---------------------------------------------------------------
    output$clim_temp_gauge <- renderHighchart({
      
      latest <- clim_latest()   # <-- call once
      
      val <- round(clim_latest()$temp_c[1], 1)
      highchart() |>
        hc_chart(type = "gauge") |>
        hc_title(text = NULL) |>
        hc_pane(startAngle = -150, endAngle = 150) |>
        hc_yAxis(
          min = -10, max = 45, tickPositions = seq(-10, 45, 5),
          plotBands = list(
            list(from=-10,to=0, color="#DDEEFF"),
            list(from=0,  to=25,color="#E7F7E7"),
            list(from=25, to=35,color="#FFF3CD"),
            list(from=35, to=45,color="#F8D7DA")
          )
        ) |>
        hc_series(list(name="°C", data=list(val),
                       dataLabels=list(format="{y} °C", style=list(fontSize="16px"))))
    })
    
    output$clim_wind_gauge <- renderHighchart({
      latest <- clim_latest()   # <-- call once
      
      val <- round(clim_latest()$wind_speed[1], 1)
      highchart() |>
        hc_chart(type = "gauge") |>
        hc_title(text = NULL) |>
        hc_pane(startAngle = -150, endAngle = 150) |>
        hc_yAxis(
          min = 0, max = 120, tickPositions = seq(0, 120, 10),
          plotBands = list(
            list(from=0, to=20, color="#E7F7E7"),
            list(from=20,to=40, color="#DFF0FF"),
            list(from=40,to=70, color="#FFF3CD"),
            list(from=70,to=120,color="#F8D7DA")
          )
        ) |>
        hc_series(list(name="km/h", data=list(val),
                       dataLabels=list(format="{y} km/h", style=list(fontSize="16px"))))
    })
    
    # --- wind arrow -----------------------------------------------------------
    observe({
      req(clim_latest(), !is.na(clim_latest()$wind_dir))
      deg <- as.numeric(clim_latest()$wind_dir[1])
      lbl <- .clim_compass(deg)
      session$sendCustomMessage("clim_js",
                                list(code = sprintf("var el=document.getElementById('clim_wind_arrow'); if(el){el.style.transform='rotate(%fdeg)';}", deg)))
      output$clim_wind_dir_text <- renderText(sprintf("%s (%d°)", lbl, round(deg)))
    })
    
    # --- last 24h timeseries --------------------------------------------------
    output$hc_timeseries <- renderHighchart({
      df <- climate_df()
      req(nrow(df) > 0)
      
      t0   <- max(df$recordDate, na.rm = TRUE) - lubridate::hours(24)
      df24 <- dplyr::filter(df, recordDate >= t0)
      
      s_temp <- df24 %>% dplyr::filter(metric == "temp")    %>%
        dplyr::transmute(x = as.numeric(recordDate) * 1000, y = value)
      s_wspd <- df24 %>% dplyr::filter(metric == "windspd") %>%
        dplyr::transmute(x = as.numeric(recordDate) * 1000, y = value)
      
      highcharter::highchart() %>%
        highcharter::hc_title(text = NULL) %>%
        highcharter::hc_xAxis(type = "datetime") %>%
        highcharter::hc_yAxis_multiples(
          list(title = list(text = "°C"),   height = "50%", lineWidth = 1),
          list(title = list(text = "km/h"), top    = "55%", height = "45%", offset = 0, lineWidth = 1)
        ) %>%
        { if (nrow(s_temp) > 0) highcharter::hc_add_series(.,
                                                           data = highcharter::list_parse2(s_temp),
                                                           type = "spline", name = "Temp (°C)", yAxis = 0) else . } %>%
        { if (nrow(s_wspd) > 0) highcharter::hc_add_series(.,
                                                           data = highcharter::list_parse2(s_wspd),
                                                           type = "column", name = "Wind (km/h)", yAxis = 1) else . }
    })
  }
}
# ---- App ----
shinyApp(ui, server)