using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class SubFormCropProductionSoil : UserControl
    {
        public SubFormCropProductionSoil()
        {
            InitializeComponent();
        }

        private DevExpress.XtraDataLayout.DataLayoutControl dataLayoutControl1;
        private DevExpress.XtraEditors.TextEdit NumberOfDropperM2TextEdit;
        private BindingSource cropProductionSoilBindingSource;
        private IContainer components;
        private DevExpress.XtraEditors.LookUpEdit CropNameLookUpEdit;
        private DevExpress.XtraEditors.TextEdit LengthTextEdit;
        private DevExpress.XtraEditors.TextEdit WidthTextEdit;
        private DevExpress.XtraEditors.TextEdit AreaTextEdit;
        private DevExpress.XtraEditors.TextEdit BetweenRowDistanceTextEdit;
        private DevExpress.XtraEditors.TextEdit BetweenPlantDistanceTextEdit;
        private DevExpress.XtraEditors.LookUpEdit DropperNameLookUpEdit;
        private DevExpress.XtraEditors.DateEdit StartDateDateEdit;
        private DevExpress.XtraEditors.TextEdit DensityPlantTextEdit;
        private DevExpress.XtraEditors.TextEdit TotalPlantsTextEdit;
        private DevExpress.XtraEditors.TextEdit NumberOfRowsTextEdit;
        private DevExpress.XtraEditors.TextEdit NumberOfPlantsPerRowTextEdit;
        private DevExpress.XtraEditors.TextEdit StopDrainPercentageTextEdit;
        private DevExpress.XtraEditors.TextEdit NameTextEdit;
        private DevExpress.XtraGrid.GridControl SoilLayersGridControl;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        private DevExpress.XtraGrid.GridControl IrrigationSectorGridControl;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView2;
        private DevExpress.XtraLayout.LayoutControlGroup Root;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup1;
        private DevExpress.XtraEditors.SpinEdit IrrigationThresholdTextEdit;
        private DevExpress.XtraEditors.SpinEdit DrainThresholdTextEdit;
        private DevExpress.XtraLayout.TabbedControlGroup tabbedControlGroup1;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup2;
        private DevExpress.XtraLayout.LayoutControlItem ItemForCropName;
        private DevExpress.XtraLayout.LayoutControlItem ItemForName;
        private DevExpress.XtraLayout.LayoutControlItem ItemForDropperName;
        private DevExpress.XtraLayout.LayoutControlItem ItemForNumberOfDropperM2;
        private DevExpress.XtraLayout.LayoutControlItem ItemForLength;
        private DevExpress.XtraLayout.LayoutControlItem ItemForWidth;
        private DevExpress.XtraLayout.LayoutControlItem ItemForArea;
        private DevExpress.XtraLayout.LayoutControlItem ItemForBetweenRowDistance;
        private DevExpress.XtraLayout.LayoutControlItem ItemForBetweenPlantDistance;
        private DevExpress.XtraLayout.LayoutControlItem ItemForStartDate;
        private DevExpress.XtraLayout.LayoutControlItem ItemForDensityPlant;
        private DevExpress.XtraLayout.LayoutControlItem ItemForDrainThreshold;
        private DevExpress.XtraLayout.LayoutControlItem ItemForTotalPlants;
        private DevExpress.XtraLayout.LayoutControlItem ItemForNumberOfRows;
        private DevExpress.XtraLayout.LayoutControlItem ItemForNumberOfPlantsPerRow;
        private DevExpress.XtraLayout.LayoutControlItem ItemForIrrigationThreshold;
        private DevExpress.XtraLayout.LayoutControlItem ItemForStopDrainPercentage;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup3;
        private DevExpress.XtraLayout.LayoutControlItem ItemForSoilLayers;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup4;
        private BindingSource soilLayerBindingSource;
        private DevExpress.XtraGrid.Columns.GridColumn colFieldCapacityPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colPermanentWiltingPointPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colSevenKpaHumidity;
        private DevExpress.XtraGrid.Columns.GridColumn colApparentDensity;
        private DevExpress.XtraGrid.Columns.GridColumn colActualDensity;
        private DevExpress.XtraGrid.Columns.GridColumn colSoilDepth;
        private DevExpress.XtraGrid.Columns.GridColumn colSandPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colSiltPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colClayPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colInfiltrationCapacity;
        private DevExpress.XtraGrid.Columns.GridColumn colDepletionPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colIrrigatedAreaPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colTexture;
        private DevExpress.XtraGrid.Columns.GridColumn colTotalPorosityPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colTotalPorosityVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colSolidComponentPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colSolidComponentVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colEaselyAvaliableWaterPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colEaselyAvailableWaterVolumen;
        private DevExpress.XtraGrid.Columns.GridColumn colTotalAvailableWaterPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colTotalAvailableWaterVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colReserveWaterPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colReserveWaterVolumen;
        private DevExpress.XtraGrid.Columns.GridColumn colNonAvailableWaterPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colNonAvailableWaterVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colAerationCapacityAtContainerCapacityPercentage;
        private DevExpress.XtraGrid.Columns.GridColumn colAerationCapacityAtContainerCapacityVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colIrrigationSheetTotalVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colIrrigationSheetNetVolume;
        private DevExpress.XtraGrid.Columns.GridColumn colApplicationEfficiency;
        private DevExpress.XtraGrid.Columns.GridColumn colId;
        private DevExpress.XtraGrid.Columns.GridColumn colName;
        private DevExpress.XtraGrid.Columns.GridColumn colActive;
        private DevExpress.XtraGrid.Columns.GridColumn colIsNew;
        private DevExpress.XtraGrid.Columns.GridColumn colIsModified;
        private DevExpress.XtraGrid.Columns.GridColumn colIsDeleted;
        private DevExpress.XtraVerticalGrid.VGridControl vGridControl1;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem1;
        private BindingSource soilLayerBindingSource1;
        private DevExpress.XtraVerticalGrid.Rows.CategoryRow category;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowId;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowName;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowFieldCapacityPercentage;
        private DevExpress.XtraVerticalGrid.Rows.CategoryRow category1;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowPermanentWiltingPointPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSevenKpaHumidity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowApparentDensity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowActualDensity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSoilDepth;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSandPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSiltPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowClayPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowInfiltrationCapacity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowDepletionPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowIrrigatedAreaPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowTexture;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowTotalPorosityPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowTotalPorosityVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSolidComponentPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSolidComponentVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowEaselyAvaliableWaterPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowEaselyAvailableWaterVolumen;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowTotalAvailableWaterPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowTotalAvailableWaterVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowReserveWaterPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowReserveWaterVolumen;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowNonAvailableWaterPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowNonAvailableWaterVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowAerationCapacityAtContainerCapacityPercentage;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowAerationCapacityAtContainerCapacityVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowIrrigationSheetTotalVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowIrrigationSheetNetVolume;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowApplicationEfficiency;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowActive;
        private DevExpress.XtraVerticalGrid.Rows.CategoryRow category2;
        private DevExpress.XtraLayout.LayoutControlItem ItemForIrrigationSector;

        private void InitializeComponent()
        {
            components = new Container();
            dataLayoutControl1 = new DevExpress.XtraDataLayout.DataLayoutControl();
            NumberOfDropperM2TextEdit = new DevExpress.XtraEditors.TextEdit();
            cropProductionSoilBindingSource = new BindingSource(components);
            CropNameLookUpEdit = new DevExpress.XtraEditors.LookUpEdit();
            LengthTextEdit = new DevExpress.XtraEditors.TextEdit();
            WidthTextEdit = new DevExpress.XtraEditors.TextEdit();
            AreaTextEdit = new DevExpress.XtraEditors.TextEdit();
            BetweenRowDistanceTextEdit = new DevExpress.XtraEditors.TextEdit();
            BetweenPlantDistanceTextEdit = new DevExpress.XtraEditors.TextEdit();
            DropperNameLookUpEdit = new DevExpress.XtraEditors.LookUpEdit();
            StartDateDateEdit = new DevExpress.XtraEditors.DateEdit();
            DensityPlantTextEdit = new DevExpress.XtraEditors.TextEdit();
            TotalPlantsTextEdit = new DevExpress.XtraEditors.TextEdit();
            NumberOfRowsTextEdit = new DevExpress.XtraEditors.TextEdit();
            NumberOfPlantsPerRowTextEdit = new DevExpress.XtraEditors.TextEdit();
            StopDrainPercentageTextEdit = new DevExpress.XtraEditors.TextEdit();
            NameTextEdit = new DevExpress.XtraEditors.TextEdit();
            SoilLayersGridControl = new DevExpress.XtraGrid.GridControl();
            soilLayerBindingSource = new BindingSource(components);
            gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            colFieldCapacityPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colPermanentWiltingPointPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colSevenKpaHumidity = new DevExpress.XtraGrid.Columns.GridColumn();
            colApparentDensity = new DevExpress.XtraGrid.Columns.GridColumn();
            colActualDensity = new DevExpress.XtraGrid.Columns.GridColumn();
            colSoilDepth = new DevExpress.XtraGrid.Columns.GridColumn();
            colSandPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colSiltPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colClayPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colInfiltrationCapacity = new DevExpress.XtraGrid.Columns.GridColumn();
            colDepletionPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colIrrigatedAreaPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colTexture = new DevExpress.XtraGrid.Columns.GridColumn();
            colTotalPorosityPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colTotalPorosityVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colSolidComponentPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colSolidComponentVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colEaselyAvaliableWaterPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colEaselyAvailableWaterVolumen = new DevExpress.XtraGrid.Columns.GridColumn();
            colTotalAvailableWaterPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colTotalAvailableWaterVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colReserveWaterPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colReserveWaterVolumen = new DevExpress.XtraGrid.Columns.GridColumn();
            colNonAvailableWaterPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colNonAvailableWaterVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colAerationCapacityAtContainerCapacityPercentage = new DevExpress.XtraGrid.Columns.GridColumn();
            colAerationCapacityAtContainerCapacityVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colIrrigationSheetTotalVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colIrrigationSheetNetVolume = new DevExpress.XtraGrid.Columns.GridColumn();
            colApplicationEfficiency = new DevExpress.XtraGrid.Columns.GridColumn();
            colId = new DevExpress.XtraGrid.Columns.GridColumn();
            colName = new DevExpress.XtraGrid.Columns.GridColumn();
            colActive = new DevExpress.XtraGrid.Columns.GridColumn();
            colIsNew = new DevExpress.XtraGrid.Columns.GridColumn();
            colIsModified = new DevExpress.XtraGrid.Columns.GridColumn();
            colIsDeleted = new DevExpress.XtraGrid.Columns.GridColumn();
            IrrigationSectorGridControl = new DevExpress.XtraGrid.GridControl();
            gridView2 = new DevExpress.XtraGrid.Views.Grid.GridView();
            IrrigationThresholdTextEdit = new DevExpress.XtraEditors.SpinEdit();
            DrainThresholdTextEdit = new DevExpress.XtraEditors.SpinEdit();
            Root = new DevExpress.XtraLayout.LayoutControlGroup();
            layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
            tabbedControlGroup1 = new DevExpress.XtraLayout.TabbedControlGroup();
            layoutControlGroup3 = new DevExpress.XtraLayout.LayoutControlGroup();
            ItemForSoilLayers = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlGroup2 = new DevExpress.XtraLayout.LayoutControlGroup();
            ItemForCropName = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForName = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForDropperName = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForNumberOfDropperM2 = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForLength = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForWidth = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForArea = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForBetweenRowDistance = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForBetweenPlantDistance = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForStartDate = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForDensityPlant = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForDrainThreshold = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForTotalPlants = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForNumberOfRows = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForNumberOfPlantsPerRow = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForIrrigationThreshold = new DevExpress.XtraLayout.LayoutControlItem();
            ItemForStopDrainPercentage = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlGroup4 = new DevExpress.XtraLayout.LayoutControlGroup();
            ItemForIrrigationSector = new DevExpress.XtraLayout.LayoutControlItem();
            vGridControl1 = new DevExpress.XtraVerticalGrid.VGridControl();
            layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
            soilLayerBindingSource1 = new BindingSource(components);
            rowFieldCapacityPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowPermanentWiltingPointPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSevenKpaHumidity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowApparentDensity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowActualDensity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSoilDepth = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSandPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSiltPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowClayPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowInfiltrationCapacity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowDepletionPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowIrrigatedAreaPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowTexture = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowTotalPorosityPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowTotalPorosityVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSolidComponentPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSolidComponentVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowEaselyAvaliableWaterPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowEaselyAvailableWaterVolumen = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowTotalAvailableWaterPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowTotalAvailableWaterVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowReserveWaterPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowReserveWaterVolumen = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowNonAvailableWaterPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowNonAvailableWaterVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowAerationCapacityAtContainerCapacityPercentage = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowAerationCapacityAtContainerCapacityVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowIrrigationSheetTotalVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowIrrigationSheetNetVolume = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowApplicationEfficiency = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowId = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowName = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowActive = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            category = new DevExpress.XtraVerticalGrid.Rows.CategoryRow();
            category1 = new DevExpress.XtraVerticalGrid.Rows.CategoryRow();
            category2 = new DevExpress.XtraVerticalGrid.Rows.CategoryRow();
            ((ISupportInitialize)dataLayoutControl1).BeginInit();
            dataLayoutControl1.SuspendLayout();
            ((ISupportInitialize)NumberOfDropperM2TextEdit.Properties).BeginInit();
            ((ISupportInitialize)cropProductionSoilBindingSource).BeginInit();
            ((ISupportInitialize)CropNameLookUpEdit.Properties).BeginInit();
            ((ISupportInitialize)LengthTextEdit.Properties).BeginInit();
            ((ISupportInitialize)WidthTextEdit.Properties).BeginInit();
            ((ISupportInitialize)AreaTextEdit.Properties).BeginInit();
            ((ISupportInitialize)BetweenRowDistanceTextEdit.Properties).BeginInit();
            ((ISupportInitialize)BetweenPlantDistanceTextEdit.Properties).BeginInit();
            ((ISupportInitialize)DropperNameLookUpEdit.Properties).BeginInit();
            ((ISupportInitialize)StartDateDateEdit.Properties).BeginInit();
            ((ISupportInitialize)StartDateDateEdit.Properties.CalendarTimeProperties).BeginInit();
            ((ISupportInitialize)DensityPlantTextEdit.Properties).BeginInit();
            ((ISupportInitialize)TotalPlantsTextEdit.Properties).BeginInit();
            ((ISupportInitialize)NumberOfRowsTextEdit.Properties).BeginInit();
            ((ISupportInitialize)NumberOfPlantsPerRowTextEdit.Properties).BeginInit();
            ((ISupportInitialize)StopDrainPercentageTextEdit.Properties).BeginInit();
            ((ISupportInitialize)NameTextEdit.Properties).BeginInit();
            ((ISupportInitialize)SoilLayersGridControl).BeginInit();
            ((ISupportInitialize)soilLayerBindingSource).BeginInit();
            ((ISupportInitialize)gridView1).BeginInit();
            ((ISupportInitialize)IrrigationSectorGridControl).BeginInit();
            ((ISupportInitialize)gridView2).BeginInit();
            ((ISupportInitialize)IrrigationThresholdTextEdit.Properties).BeginInit();
            ((ISupportInitialize)DrainThresholdTextEdit.Properties).BeginInit();
            ((ISupportInitialize)Root).BeginInit();
            ((ISupportInitialize)layoutControlGroup1).BeginInit();
            ((ISupportInitialize)tabbedControlGroup1).BeginInit();
            ((ISupportInitialize)layoutControlGroup3).BeginInit();
            ((ISupportInitialize)ItemForSoilLayers).BeginInit();
            ((ISupportInitialize)layoutControlGroup2).BeginInit();
            ((ISupportInitialize)ItemForCropName).BeginInit();
            ((ISupportInitialize)ItemForName).BeginInit();
            ((ISupportInitialize)ItemForDropperName).BeginInit();
            ((ISupportInitialize)ItemForNumberOfDropperM2).BeginInit();
            ((ISupportInitialize)ItemForLength).BeginInit();
            ((ISupportInitialize)ItemForWidth).BeginInit();
            ((ISupportInitialize)ItemForArea).BeginInit();
            ((ISupportInitialize)ItemForBetweenRowDistance).BeginInit();
            ((ISupportInitialize)ItemForBetweenPlantDistance).BeginInit();
            ((ISupportInitialize)ItemForStartDate).BeginInit();
            ((ISupportInitialize)ItemForDensityPlant).BeginInit();
            ((ISupportInitialize)ItemForDrainThreshold).BeginInit();
            ((ISupportInitialize)ItemForTotalPlants).BeginInit();
            ((ISupportInitialize)ItemForNumberOfRows).BeginInit();
            ((ISupportInitialize)ItemForNumberOfPlantsPerRow).BeginInit();
            ((ISupportInitialize)ItemForIrrigationThreshold).BeginInit();
            ((ISupportInitialize)ItemForStopDrainPercentage).BeginInit();
            ((ISupportInitialize)layoutControlGroup4).BeginInit();
            ((ISupportInitialize)ItemForIrrigationSector).BeginInit();
            ((ISupportInitialize)vGridControl1).BeginInit();
            ((ISupportInitialize)layoutControlItem1).BeginInit();
            ((ISupportInitialize)soilLayerBindingSource1).BeginInit();
            SuspendLayout();
            // 
            // dataLayoutControl1
            // 
            dataLayoutControl1.AllowGeneratingCollectionProperties = DevExpress.Utils.DefaultBoolean.True;
            dataLayoutControl1.AllowGeneratingNestedGroups = DevExpress.Utils.DefaultBoolean.True;
            dataLayoutControl1.Controls.Add(vGridControl1);
            dataLayoutControl1.Controls.Add(NumberOfDropperM2TextEdit);
            dataLayoutControl1.Controls.Add(CropNameLookUpEdit);
            dataLayoutControl1.Controls.Add(LengthTextEdit);
            dataLayoutControl1.Controls.Add(WidthTextEdit);
            dataLayoutControl1.Controls.Add(AreaTextEdit);
            dataLayoutControl1.Controls.Add(BetweenRowDistanceTextEdit);
            dataLayoutControl1.Controls.Add(BetweenPlantDistanceTextEdit);
            dataLayoutControl1.Controls.Add(DropperNameLookUpEdit);
            dataLayoutControl1.Controls.Add(StartDateDateEdit);
            dataLayoutControl1.Controls.Add(DensityPlantTextEdit);
            dataLayoutControl1.Controls.Add(TotalPlantsTextEdit);
            dataLayoutControl1.Controls.Add(NumberOfRowsTextEdit);
            dataLayoutControl1.Controls.Add(NumberOfPlantsPerRowTextEdit);
            dataLayoutControl1.Controls.Add(StopDrainPercentageTextEdit);
            dataLayoutControl1.Controls.Add(NameTextEdit);
            dataLayoutControl1.Controls.Add(SoilLayersGridControl);
            dataLayoutControl1.Controls.Add(IrrigationSectorGridControl);
            dataLayoutControl1.Controls.Add(IrrigationThresholdTextEdit);
            dataLayoutControl1.Controls.Add(DrainThresholdTextEdit);
            dataLayoutControl1.DataSource = cropProductionSoilBindingSource;
            dataLayoutControl1.Dock = DockStyle.Fill;
            dataLayoutControl1.Location = new Point(0, 0);
            dataLayoutControl1.Name = "dataLayoutControl1";
            dataLayoutControl1.Root = Root;
            dataLayoutControl1.Size = new Size(888, 600);
            dataLayoutControl1.TabIndex = 0;
            dataLayoutControl1.Text = "dataLayoutControl1";
            // 
            // NumberOfDropperM2TextEdit
            // 
            NumberOfDropperM2TextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "NumberOfDropperM2", true));
            NumberOfDropperM2TextEdit.Location = new Point(163, 119);
            NumberOfDropperM2TextEdit.Name = "NumberOfDropperM2TextEdit";
            NumberOfDropperM2TextEdit.Properties.Appearance.Options.UseTextOptions = true;
            NumberOfDropperM2TextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            NumberOfDropperM2TextEdit.Properties.Mask.EditMask = "F";
            NumberOfDropperM2TextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            NumberOfDropperM2TextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            NumberOfDropperM2TextEdit.Size = new Size(420, 20);
            NumberOfDropperM2TextEdit.StyleController = dataLayoutControl1;
            NumberOfDropperM2TextEdit.TabIndex = 6;
            // 
            // cropProductionSoilBindingSource
            // 
            cropProductionSoilBindingSource.DataSource = typeof(AgriSmart.Tools.Entities.CropProductionSoilEntity);
            // 
            // CropNameLookUpEdit
            // 
            CropNameLookUpEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Crop.Name", true));
            CropNameLookUpEdit.Location = new Point(163, 71);
            CropNameLookUpEdit.Name = "CropNameLookUpEdit";
            CropNameLookUpEdit.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            CropNameLookUpEdit.Properties.NullText = "";
            CropNameLookUpEdit.Size = new Size(420, 20);
            CropNameLookUpEdit.StyleController = dataLayoutControl1;
            CropNameLookUpEdit.TabIndex = 4;
            // 
            // LengthTextEdit
            // 
            LengthTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Length", true));
            LengthTextEdit.Location = new Point(163, 143);
            LengthTextEdit.Name = "LengthTextEdit";
            LengthTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            LengthTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            LengthTextEdit.Properties.Mask.EditMask = "F";
            LengthTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            LengthTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            LengthTextEdit.Size = new Size(420, 20);
            LengthTextEdit.StyleController = dataLayoutControl1;
            LengthTextEdit.TabIndex = 7;
            // 
            // WidthTextEdit
            // 
            WidthTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Width", true));
            WidthTextEdit.Location = new Point(163, 167);
            WidthTextEdit.Name = "WidthTextEdit";
            WidthTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            WidthTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            WidthTextEdit.Properties.Mask.EditMask = "F";
            WidthTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            WidthTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            WidthTextEdit.Size = new Size(420, 20);
            WidthTextEdit.StyleController = dataLayoutControl1;
            WidthTextEdit.TabIndex = 8;
            // 
            // AreaTextEdit
            // 
            AreaTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Area", true));
            AreaTextEdit.Location = new Point(163, 191);
            AreaTextEdit.Name = "AreaTextEdit";
            AreaTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            AreaTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            AreaTextEdit.Properties.Mask.EditMask = "F";
            AreaTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            AreaTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            AreaTextEdit.Properties.ReadOnly = true;
            AreaTextEdit.Size = new Size(420, 20);
            AreaTextEdit.StyleController = dataLayoutControl1;
            AreaTextEdit.TabIndex = 9;
            // 
            // BetweenRowDistanceTextEdit
            // 
            BetweenRowDistanceTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "BetweenRowDistance", true));
            BetweenRowDistanceTextEdit.Location = new Point(163, 215);
            BetweenRowDistanceTextEdit.Name = "BetweenRowDistanceTextEdit";
            BetweenRowDistanceTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            BetweenRowDistanceTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            BetweenRowDistanceTextEdit.Properties.Mask.EditMask = "F";
            BetweenRowDistanceTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            BetweenRowDistanceTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            BetweenRowDistanceTextEdit.Size = new Size(420, 20);
            BetweenRowDistanceTextEdit.StyleController = dataLayoutControl1;
            BetweenRowDistanceTextEdit.TabIndex = 10;
            // 
            // BetweenPlantDistanceTextEdit
            // 
            BetweenPlantDistanceTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "BetweenPlantDistance", true));
            BetweenPlantDistanceTextEdit.Location = new Point(163, 239);
            BetweenPlantDistanceTextEdit.Name = "BetweenPlantDistanceTextEdit";
            BetweenPlantDistanceTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            BetweenPlantDistanceTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            BetweenPlantDistanceTextEdit.Properties.Mask.EditMask = "F";
            BetweenPlantDistanceTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            BetweenPlantDistanceTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            BetweenPlantDistanceTextEdit.Size = new Size(420, 20);
            BetweenPlantDistanceTextEdit.StyleController = dataLayoutControl1;
            BetweenPlantDistanceTextEdit.TabIndex = 11;
            // 
            // DropperNameLookUpEdit
            // 
            DropperNameLookUpEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Dropper.Name", true));
            DropperNameLookUpEdit.Location = new Point(163, 95);
            DropperNameLookUpEdit.Name = "DropperNameLookUpEdit";
            DropperNameLookUpEdit.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            DropperNameLookUpEdit.Properties.NullText = "";
            DropperNameLookUpEdit.Size = new Size(420, 20);
            DropperNameLookUpEdit.StyleController = dataLayoutControl1;
            DropperNameLookUpEdit.TabIndex = 5;
            // 
            // StartDateDateEdit
            // 
            StartDateDateEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "StartDate", true));
            StartDateDateEdit.EditValue = null;
            StartDateDateEdit.Location = new Point(163, 263);
            StartDateDateEdit.Name = "StartDateDateEdit";
            StartDateDateEdit.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            StartDateDateEdit.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            StartDateDateEdit.Size = new Size(420, 20);
            StartDateDateEdit.StyleController = dataLayoutControl1;
            StartDateDateEdit.TabIndex = 12;
            // 
            // DensityPlantTextEdit
            // 
            DensityPlantTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "DensityPlant", true));
            DensityPlantTextEdit.Location = new Point(163, 287);
            DensityPlantTextEdit.Name = "DensityPlantTextEdit";
            DensityPlantTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            DensityPlantTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            DensityPlantTextEdit.Properties.Mask.EditMask = "F";
            DensityPlantTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            DensityPlantTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            DensityPlantTextEdit.Properties.ReadOnly = true;
            DensityPlantTextEdit.Size = new Size(420, 20);
            DensityPlantTextEdit.StyleController = dataLayoutControl1;
            DensityPlantTextEdit.TabIndex = 13;
            // 
            // TotalPlantsTextEdit
            // 
            TotalPlantsTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "TotalPlants", true));
            TotalPlantsTextEdit.Location = new Point(163, 335);
            TotalPlantsTextEdit.Name = "TotalPlantsTextEdit";
            TotalPlantsTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            TotalPlantsTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            TotalPlantsTextEdit.Properties.Mask.EditMask = "F";
            TotalPlantsTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            TotalPlantsTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            TotalPlantsTextEdit.Properties.ReadOnly = true;
            TotalPlantsTextEdit.Size = new Size(420, 20);
            TotalPlantsTextEdit.StyleController = dataLayoutControl1;
            TotalPlantsTextEdit.TabIndex = 15;
            // 
            // NumberOfRowsTextEdit
            // 
            NumberOfRowsTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "NumberOfRows", true));
            NumberOfRowsTextEdit.Location = new Point(163, 383);
            NumberOfRowsTextEdit.Name = "NumberOfRowsTextEdit";
            NumberOfRowsTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            NumberOfRowsTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            NumberOfRowsTextEdit.Properties.Mask.EditMask = "N0";
            NumberOfRowsTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            NumberOfRowsTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            NumberOfRowsTextEdit.Properties.ReadOnly = true;
            NumberOfRowsTextEdit.Size = new Size(420, 20);
            NumberOfRowsTextEdit.StyleController = dataLayoutControl1;
            NumberOfRowsTextEdit.TabIndex = 17;
            // 
            // NumberOfPlantsPerRowTextEdit
            // 
            NumberOfPlantsPerRowTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "NumberOfPlantsPerRow", true));
            NumberOfPlantsPerRowTextEdit.Location = new Point(163, 407);
            NumberOfPlantsPerRowTextEdit.Name = "NumberOfPlantsPerRowTextEdit";
            NumberOfPlantsPerRowTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            NumberOfPlantsPerRowTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            NumberOfPlantsPerRowTextEdit.Properties.Mask.EditMask = "N0";
            NumberOfPlantsPerRowTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            NumberOfPlantsPerRowTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            NumberOfPlantsPerRowTextEdit.Properties.ReadOnly = true;
            NumberOfPlantsPerRowTextEdit.Size = new Size(420, 20);
            NumberOfPlantsPerRowTextEdit.StyleController = dataLayoutControl1;
            NumberOfPlantsPerRowTextEdit.TabIndex = 18;
            // 
            // StopDrainPercentageTextEdit
            // 
            StopDrainPercentageTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "StopDrainPercentage", true));
            StopDrainPercentageTextEdit.Location = new Point(163, 359);
            StopDrainPercentageTextEdit.Name = "StopDrainPercentageTextEdit";
            StopDrainPercentageTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            StopDrainPercentageTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            StopDrainPercentageTextEdit.Properties.Mask.EditMask = "F";
            StopDrainPercentageTextEdit.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Numeric;
            StopDrainPercentageTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            StopDrainPercentageTextEdit.Size = new Size(420, 20);
            StopDrainPercentageTextEdit.StyleController = dataLayoutControl1;
            StopDrainPercentageTextEdit.TabIndex = 16;
            // 
            // NameTextEdit
            // 
            NameTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "Name", true));
            NameTextEdit.Location = new Point(163, 47);
            NameTextEdit.Name = "NameTextEdit";
            NameTextEdit.Size = new Size(420, 20);
            NameTextEdit.StyleController = dataLayoutControl1;
            NameTextEdit.TabIndex = 3;
            // 
            // SoilLayersGridControl
            // 
            SoilLayersGridControl.DataBindings.Add(new Binding("DataSource", cropProductionSoilBindingSource, "SoilLayers", true));
            SoilLayersGridControl.DataSource = soilLayerBindingSource;
            SoilLayersGridControl.Location = new Point(24, 47);
            SoilLayersGridControl.MainView = gridView1;
            SoilLayersGridControl.Name = "SoilLayersGridControl";
            SoilLayersGridControl.Size = new Size(840, 404);
            SoilLayersGridControl.TabIndex = 0;
            SoilLayersGridControl.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] { gridView1 });
            // 
            // soilLayerBindingSource
            // 
            soilLayerBindingSource.DataSource = typeof(AgriSmart.Tools.Entities.SoilLayerEntity);
            // 
            // gridView1
            // 
            gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] { colId, colName, colFieldCapacityPercentage, colPermanentWiltingPointPercentage, colSevenKpaHumidity, colApparentDensity, colActualDensity, colSoilDepth, colSandPercentage, colSiltPercentage, colClayPercentage, colInfiltrationCapacity, colDepletionPercentage, colIrrigatedAreaPercentage, colTexture, colTotalPorosityPercentage, colTotalPorosityVolume, colSolidComponentPercentage, colSolidComponentVolume, colEaselyAvaliableWaterPercentage, colEaselyAvailableWaterVolumen, colTotalAvailableWaterPercentage, colTotalAvailableWaterVolume, colReserveWaterPercentage, colReserveWaterVolumen, colNonAvailableWaterPercentage, colNonAvailableWaterVolume, colAerationCapacityAtContainerCapacityPercentage, colAerationCapacityAtContainerCapacityVolume, colIrrigationSheetTotalVolume, colIrrigationSheetNetVolume, colApplicationEfficiency, colActive, colIsNew, colIsModified, colIsDeleted });
            gridView1.GridControl = SoilLayersGridControl;
            gridView1.Name = "gridView1";
            // 
            // colFieldCapacityPercentage
            // 
            colFieldCapacityPercentage.FieldName = "FieldCapacityPercentage";
            colFieldCapacityPercentage.Name = "colFieldCapacityPercentage";
            colFieldCapacityPercentage.Visible = true;
            colFieldCapacityPercentage.VisibleIndex = 0;
            // 
            // colPermanentWiltingPointPercentage
            // 
            colPermanentWiltingPointPercentage.FieldName = "PermanentWiltingPointPercentage";
            colPermanentWiltingPointPercentage.Name = "colPermanentWiltingPointPercentage";
            colPermanentWiltingPointPercentage.Visible = true;
            colPermanentWiltingPointPercentage.VisibleIndex = 1;
            // 
            // colSevenKpaHumidity
            // 
            colSevenKpaHumidity.FieldName = "SevenKpaHumidity";
            colSevenKpaHumidity.Name = "colSevenKpaHumidity";
            colSevenKpaHumidity.Visible = true;
            colSevenKpaHumidity.VisibleIndex = 2;
            // 
            // colApparentDensity
            // 
            colApparentDensity.FieldName = "ApparentDensity";
            colApparentDensity.Name = "colApparentDensity";
            colApparentDensity.Visible = true;
            colApparentDensity.VisibleIndex = 3;
            // 
            // colActualDensity
            // 
            colActualDensity.FieldName = "ActualDensity";
            colActualDensity.Name = "colActualDensity";
            colActualDensity.Visible = true;
            colActualDensity.VisibleIndex = 4;
            // 
            // colSoilDepth
            // 
            colSoilDepth.FieldName = "SoilDepth";
            colSoilDepth.Name = "colSoilDepth";
            colSoilDepth.Visible = true;
            colSoilDepth.VisibleIndex = 5;
            // 
            // colSandPercentage
            // 
            colSandPercentage.FieldName = "SandPercentage";
            colSandPercentage.Name = "colSandPercentage";
            colSandPercentage.Visible = true;
            colSandPercentage.VisibleIndex = 6;
            // 
            // colSiltPercentage
            // 
            colSiltPercentage.FieldName = "SiltPercentage";
            colSiltPercentage.Name = "colSiltPercentage";
            colSiltPercentage.Visible = true;
            colSiltPercentage.VisibleIndex = 7;
            // 
            // colClayPercentage
            // 
            colClayPercentage.FieldName = "ClayPercentage";
            colClayPercentage.Name = "colClayPercentage";
            colClayPercentage.Visible = true;
            colClayPercentage.VisibleIndex = 8;
            // 
            // colInfiltrationCapacity
            // 
            colInfiltrationCapacity.FieldName = "InfiltrationCapacity";
            colInfiltrationCapacity.Name = "colInfiltrationCapacity";
            colInfiltrationCapacity.Visible = true;
            colInfiltrationCapacity.VisibleIndex = 9;
            // 
            // colDepletionPercentage
            // 
            colDepletionPercentage.FieldName = "DepletionPercentage";
            colDepletionPercentage.Name = "colDepletionPercentage";
            colDepletionPercentage.Visible = true;
            colDepletionPercentage.VisibleIndex = 10;
            // 
            // colIrrigatedAreaPercentage
            // 
            colIrrigatedAreaPercentage.FieldName = "IrrigatedAreaPercentage";
            colIrrigatedAreaPercentage.Name = "colIrrigatedAreaPercentage";
            colIrrigatedAreaPercentage.Visible = true;
            colIrrigatedAreaPercentage.VisibleIndex = 11;
            // 
            // colTexture
            // 
            colTexture.FieldName = "Texture";
            colTexture.Name = "colTexture";
            colTexture.OptionsColumn.ReadOnly = true;
            colTexture.Visible = true;
            colTexture.VisibleIndex = 12;
            // 
            // colTotalPorosityPercentage
            // 
            colTotalPorosityPercentage.FieldName = "TotalPorosityPercentage";
            colTotalPorosityPercentage.Name = "colTotalPorosityPercentage";
            colTotalPorosityPercentage.OptionsColumn.ReadOnly = true;
            colTotalPorosityPercentage.Visible = true;
            colTotalPorosityPercentage.VisibleIndex = 13;
            // 
            // colTotalPorosityVolume
            // 
            colTotalPorosityVolume.FieldName = "TotalPorosityVolume";
            colTotalPorosityVolume.Name = "colTotalPorosityVolume";
            colTotalPorosityVolume.OptionsColumn.ReadOnly = true;
            colTotalPorosityVolume.Visible = true;
            colTotalPorosityVolume.VisibleIndex = 14;
            // 
            // colSolidComponentPercentage
            // 
            colSolidComponentPercentage.FieldName = "SolidComponentPercentage";
            colSolidComponentPercentage.Name = "colSolidComponentPercentage";
            colSolidComponentPercentage.OptionsColumn.ReadOnly = true;
            colSolidComponentPercentage.Visible = true;
            colSolidComponentPercentage.VisibleIndex = 15;
            // 
            // colSolidComponentVolume
            // 
            colSolidComponentVolume.FieldName = "SolidComponentVolume";
            colSolidComponentVolume.Name = "colSolidComponentVolume";
            colSolidComponentVolume.OptionsColumn.ReadOnly = true;
            colSolidComponentVolume.Visible = true;
            colSolidComponentVolume.VisibleIndex = 16;
            // 
            // colEaselyAvaliableWaterPercentage
            // 
            colEaselyAvaliableWaterPercentage.FieldName = "EaselyAvaliableWaterPercentage";
            colEaselyAvaliableWaterPercentage.Name = "colEaselyAvaliableWaterPercentage";
            colEaselyAvaliableWaterPercentage.OptionsColumn.ReadOnly = true;
            colEaselyAvaliableWaterPercentage.Visible = true;
            colEaselyAvaliableWaterPercentage.VisibleIndex = 17;
            // 
            // colEaselyAvailableWaterVolumen
            // 
            colEaselyAvailableWaterVolumen.FieldName = "EaselyAvailableWaterVolumen";
            colEaselyAvailableWaterVolumen.Name = "colEaselyAvailableWaterVolumen";
            colEaselyAvailableWaterVolumen.OptionsColumn.ReadOnly = true;
            colEaselyAvailableWaterVolumen.Visible = true;
            colEaselyAvailableWaterVolumen.VisibleIndex = 18;
            // 
            // colTotalAvailableWaterPercentage
            // 
            colTotalAvailableWaterPercentage.FieldName = "TotalAvailableWaterPercentage";
            colTotalAvailableWaterPercentage.Name = "colTotalAvailableWaterPercentage";
            colTotalAvailableWaterPercentage.OptionsColumn.ReadOnly = true;
            colTotalAvailableWaterPercentage.Visible = true;
            colTotalAvailableWaterPercentage.VisibleIndex = 19;
            // 
            // colTotalAvailableWaterVolume
            // 
            colTotalAvailableWaterVolume.FieldName = "TotalAvailableWaterVolume";
            colTotalAvailableWaterVolume.Name = "colTotalAvailableWaterVolume";
            colTotalAvailableWaterVolume.OptionsColumn.ReadOnly = true;
            colTotalAvailableWaterVolume.Visible = true;
            colTotalAvailableWaterVolume.VisibleIndex = 20;
            // 
            // colReserveWaterPercentage
            // 
            colReserveWaterPercentage.FieldName = "ReserveWaterPercentage";
            colReserveWaterPercentage.Name = "colReserveWaterPercentage";
            colReserveWaterPercentage.OptionsColumn.ReadOnly = true;
            colReserveWaterPercentage.Visible = true;
            colReserveWaterPercentage.VisibleIndex = 21;
            // 
            // colReserveWaterVolumen
            // 
            colReserveWaterVolumen.FieldName = "ReserveWaterVolumen";
            colReserveWaterVolumen.Name = "colReserveWaterVolumen";
            colReserveWaterVolumen.OptionsColumn.ReadOnly = true;
            colReserveWaterVolumen.Visible = true;
            colReserveWaterVolumen.VisibleIndex = 22;
            // 
            // colNonAvailableWaterPercentage
            // 
            colNonAvailableWaterPercentage.FieldName = "NonAvailableWaterPercentage";
            colNonAvailableWaterPercentage.Name = "colNonAvailableWaterPercentage";
            colNonAvailableWaterPercentage.OptionsColumn.ReadOnly = true;
            colNonAvailableWaterPercentage.Visible = true;
            colNonAvailableWaterPercentage.VisibleIndex = 23;
            // 
            // colNonAvailableWaterVolume
            // 
            colNonAvailableWaterVolume.FieldName = "NonAvailableWaterVolume";
            colNonAvailableWaterVolume.Name = "colNonAvailableWaterVolume";
            colNonAvailableWaterVolume.OptionsColumn.ReadOnly = true;
            colNonAvailableWaterVolume.Visible = true;
            colNonAvailableWaterVolume.VisibleIndex = 24;
            // 
            // colAerationCapacityAtContainerCapacityPercentage
            // 
            colAerationCapacityAtContainerCapacityPercentage.FieldName = "AerationCapacityAtContainerCapacityPercentage";
            colAerationCapacityAtContainerCapacityPercentage.Name = "colAerationCapacityAtContainerCapacityPercentage";
            colAerationCapacityAtContainerCapacityPercentage.OptionsColumn.ReadOnly = true;
            colAerationCapacityAtContainerCapacityPercentage.Visible = true;
            colAerationCapacityAtContainerCapacityPercentage.VisibleIndex = 25;
            // 
            // colAerationCapacityAtContainerCapacityVolume
            // 
            colAerationCapacityAtContainerCapacityVolume.FieldName = "AerationCapacityAtContainerCapacityVolume";
            colAerationCapacityAtContainerCapacityVolume.Name = "colAerationCapacityAtContainerCapacityVolume";
            colAerationCapacityAtContainerCapacityVolume.OptionsColumn.ReadOnly = true;
            colAerationCapacityAtContainerCapacityVolume.Visible = true;
            colAerationCapacityAtContainerCapacityVolume.VisibleIndex = 26;
            // 
            // colIrrigationSheetTotalVolume
            // 
            colIrrigationSheetTotalVolume.FieldName = "IrrigationSheetTotalVolume";
            colIrrigationSheetTotalVolume.Name = "colIrrigationSheetTotalVolume";
            colIrrigationSheetTotalVolume.OptionsColumn.ReadOnly = true;
            colIrrigationSheetTotalVolume.Visible = true;
            colIrrigationSheetTotalVolume.VisibleIndex = 27;
            // 
            // colIrrigationSheetNetVolume
            // 
            colIrrigationSheetNetVolume.FieldName = "IrrigationSheetNetVolume";
            colIrrigationSheetNetVolume.Name = "colIrrigationSheetNetVolume";
            colIrrigationSheetNetVolume.Visible = true;
            colIrrigationSheetNetVolume.VisibleIndex = 28;
            // 
            // colApplicationEfficiency
            // 
            colApplicationEfficiency.FieldName = "ApplicationEfficiency";
            colApplicationEfficiency.Name = "colApplicationEfficiency";
            colApplicationEfficiency.Visible = true;
            colApplicationEfficiency.VisibleIndex = 29;
            // 
            // colId
            // 
            colId.FieldName = "Id";
            colId.Name = "colId";
            colId.Visible = true;
            colId.VisibleIndex = 30;
            // 
            // colName
            // 
            colName.FieldName = "Name";
            colName.Name = "colName";
            colName.Visible = true;
            colName.VisibleIndex = 31;
            // 
            // colActive
            // 
            colActive.FieldName = "Active";
            colActive.Name = "colActive";
            colActive.Visible = true;
            colActive.VisibleIndex = 32;
            // 
            // colIsNew
            // 
            colIsNew.FieldName = "IsNew";
            colIsNew.Name = "colIsNew";
            colIsNew.Visible = true;
            colIsNew.VisibleIndex = 33;
            // 
            // colIsModified
            // 
            colIsModified.FieldName = "IsModified";
            colIsModified.Name = "colIsModified";
            colIsModified.Visible = true;
            colIsModified.VisibleIndex = 34;
            // 
            // colIsDeleted
            // 
            colIsDeleted.FieldName = "IsDeleted";
            colIsDeleted.Name = "colIsDeleted";
            colIsDeleted.Visible = true;
            colIsDeleted.VisibleIndex = 35;
            // 
            // IrrigationSectorGridControl
            // 
            IrrigationSectorGridControl.DataBindings.Add(new Binding("DataSource", cropProductionSoilBindingSource, "IrrigationSector", true));
            IrrigationSectorGridControl.Location = new Point(24, 500);
            IrrigationSectorGridControl.MainView = gridView2;
            IrrigationSectorGridControl.Name = "IrrigationSectorGridControl";
            IrrigationSectorGridControl.Size = new Size(840, 76);
            IrrigationSectorGridControl.TabIndex = 20;
            IrrigationSectorGridControl.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] { gridView2 });
            // 
            // gridView2
            // 
            gridView2.GridControl = IrrigationSectorGridControl;
            gridView2.Name = "gridView2";
            // 
            // IrrigationThresholdTextEdit
            // 
            IrrigationThresholdTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "IrrigationThreshold", true));
            IrrigationThresholdTextEdit.EditValue = new decimal(new int[] { 0, 0, 0, 0 });
            IrrigationThresholdTextEdit.Location = new Point(163, 431);
            IrrigationThresholdTextEdit.Name = "IrrigationThresholdTextEdit";
            IrrigationThresholdTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            IrrigationThresholdTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            IrrigationThresholdTextEdit.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            IrrigationThresholdTextEdit.Properties.EditValueChangedFiringMode = DevExpress.XtraEditors.Controls.EditValueChangedFiringMode.Default;
            IrrigationThresholdTextEdit.Properties.Mask.EditMask = "F";
            IrrigationThresholdTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            IrrigationThresholdTextEdit.Size = new Size(420, 20);
            IrrigationThresholdTextEdit.StyleController = dataLayoutControl1;
            IrrigationThresholdTextEdit.TabIndex = 19;
            // 
            // DrainThresholdTextEdit
            // 
            DrainThresholdTextEdit.DataBindings.Add(new Binding("EditValue", cropProductionSoilBindingSource, "DrainThreshold", true));
            DrainThresholdTextEdit.EditValue = new decimal(new int[] { 0, 0, 0, 0 });
            DrainThresholdTextEdit.Location = new Point(163, 311);
            DrainThresholdTextEdit.Name = "DrainThresholdTextEdit";
            DrainThresholdTextEdit.Properties.Appearance.Options.UseTextOptions = true;
            DrainThresholdTextEdit.Properties.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Far;
            DrainThresholdTextEdit.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            DrainThresholdTextEdit.Properties.EditValueChangedFiringMode = DevExpress.XtraEditors.Controls.EditValueChangedFiringMode.Default;
            DrainThresholdTextEdit.Properties.Mask.EditMask = "F";
            DrainThresholdTextEdit.Properties.Mask.UseMaskAsDisplayFormat = true;
            DrainThresholdTextEdit.Size = new Size(420, 20);
            DrainThresholdTextEdit.StyleController = dataLayoutControl1;
            DrainThresholdTextEdit.TabIndex = 14;
            // 
            // Root
            // 
            Root.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            Root.GroupBordersVisible = false;
            Root.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlGroup1 });
            Root.Name = "Root";
            Root.Size = new Size(888, 600);
            Root.TextVisible = false;
            // 
            // layoutControlGroup1
            // 
            layoutControlGroup1.AllowDrawBackground = false;
            layoutControlGroup1.GroupBordersVisible = false;
            layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { tabbedControlGroup1, layoutControlGroup4 });
            layoutControlGroup1.Location = new Point(0, 0);
            layoutControlGroup1.Name = "autoGeneratedGroup0";
            layoutControlGroup1.Size = new Size(868, 580);
            // 
            // tabbedControlGroup1
            // 
            tabbedControlGroup1.Location = new Point(0, 0);
            tabbedControlGroup1.Name = "tabbedControlGroup1";
            tabbedControlGroup1.SelectedTabPage = layoutControlGroup2;
            tabbedControlGroup1.Size = new Size(868, 455);
            tabbedControlGroup1.TabPages.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlGroup2, layoutControlGroup3 });
            // 
            // layoutControlGroup3
            // 
            layoutControlGroup3.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { ItemForSoilLayers });
            layoutControlGroup3.Location = new Point(0, 0);
            layoutControlGroup3.Name = "layoutControlGroup3";
            layoutControlGroup3.Size = new Size(844, 408);
            // 
            // ItemForSoilLayers
            // 
            ItemForSoilLayers.Control = SoilLayersGridControl;
            ItemForSoilLayers.Location = new Point(0, 0);
            ItemForSoilLayers.Name = "ItemForSoilLayers";
            ItemForSoilLayers.Size = new Size(844, 408);
            ItemForSoilLayers.StartNewLine = true;
            ItemForSoilLayers.Text = "Soil Layers";
            ItemForSoilLayers.TextSize = new Size(0, 0);
            ItemForSoilLayers.TextVisible = false;
            // 
            // layoutControlGroup2
            // 
            layoutControlGroup2.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { ItemForCropName, ItemForName, ItemForDropperName, ItemForNumberOfDropperM2, ItemForLength, ItemForWidth, ItemForArea, ItemForBetweenRowDistance, ItemForBetweenPlantDistance, ItemForStartDate, ItemForDensityPlant, ItemForDrainThreshold, ItemForTotalPlants, ItemForNumberOfRows, ItemForNumberOfPlantsPerRow, ItemForIrrigationThreshold, ItemForStopDrainPercentage, layoutControlItem1 });
            layoutControlGroup2.Location = new Point(0, 0);
            layoutControlGroup2.Name = "layoutControlGroup2";
            layoutControlGroup2.Size = new Size(844, 408);
            // 
            // ItemForCropName
            // 
            ItemForCropName.Control = CropNameLookUpEdit;
            ItemForCropName.Location = new Point(0, 24);
            ItemForCropName.Name = "ItemForCropName";
            ItemForCropName.Size = new Size(563, 24);
            ItemForCropName.Text = "Crop";
            ItemForCropName.TextSize = new Size(127, 13);
            // 
            // ItemForName
            // 
            ItemForName.Control = NameTextEdit;
            ItemForName.Location = new Point(0, 0);
            ItemForName.Name = "ItemForName";
            ItemForName.Size = new Size(563, 24);
            ItemForName.Text = "Crop Production Name";
            ItemForName.TextSize = new Size(127, 13);
            // 
            // ItemForDropperName
            // 
            ItemForDropperName.Control = DropperNameLookUpEdit;
            ItemForDropperName.Location = new Point(0, 48);
            ItemForDropperName.Name = "ItemForDropperName";
            ItemForDropperName.Size = new Size(563, 24);
            ItemForDropperName.Text = "Dropper";
            ItemForDropperName.TextSize = new Size(127, 13);
            // 
            // ItemForNumberOfDropperM2
            // 
            ItemForNumberOfDropperM2.Control = NumberOfDropperM2TextEdit;
            ItemForNumberOfDropperM2.Location = new Point(0, 72);
            ItemForNumberOfDropperM2.Name = "ItemForNumberOfDropperM2";
            ItemForNumberOfDropperM2.Size = new Size(563, 24);
            ItemForNumberOfDropperM2.Text = "Number Of Dropper M2";
            ItemForNumberOfDropperM2.TextSize = new Size(127, 13);
            // 
            // ItemForLength
            // 
            ItemForLength.Control = LengthTextEdit;
            ItemForLength.Location = new Point(0, 96);
            ItemForLength.Name = "ItemForLength";
            ItemForLength.Size = new Size(563, 24);
            ItemForLength.Text = "Length";
            ItemForLength.TextSize = new Size(127, 13);
            // 
            // ItemForWidth
            // 
            ItemForWidth.Control = WidthTextEdit;
            ItemForWidth.Location = new Point(0, 120);
            ItemForWidth.Name = "ItemForWidth";
            ItemForWidth.Size = new Size(563, 24);
            ItemForWidth.Text = "Width";
            ItemForWidth.TextSize = new Size(127, 13);
            // 
            // ItemForArea
            // 
            ItemForArea.Control = AreaTextEdit;
            ItemForArea.Location = new Point(0, 144);
            ItemForArea.Name = "ItemForArea";
            ItemForArea.Size = new Size(563, 24);
            ItemForArea.Text = "Area";
            ItemForArea.TextSize = new Size(127, 13);
            // 
            // ItemForBetweenRowDistance
            // 
            ItemForBetweenRowDistance.Control = BetweenRowDistanceTextEdit;
            ItemForBetweenRowDistance.Location = new Point(0, 168);
            ItemForBetweenRowDistance.Name = "ItemForBetweenRowDistance";
            ItemForBetweenRowDistance.Size = new Size(563, 24);
            ItemForBetweenRowDistance.Text = "Between Row Distance";
            ItemForBetweenRowDistance.TextSize = new Size(127, 13);
            // 
            // ItemForBetweenPlantDistance
            // 
            ItemForBetweenPlantDistance.Control = BetweenPlantDistanceTextEdit;
            ItemForBetweenPlantDistance.Location = new Point(0, 192);
            ItemForBetweenPlantDistance.Name = "ItemForBetweenPlantDistance";
            ItemForBetweenPlantDistance.Size = new Size(563, 24);
            ItemForBetweenPlantDistance.Text = "Between Plant Distance";
            ItemForBetweenPlantDistance.TextSize = new Size(127, 13);
            // 
            // ItemForStartDate
            // 
            ItemForStartDate.Control = StartDateDateEdit;
            ItemForStartDate.Location = new Point(0, 216);
            ItemForStartDate.Name = "ItemForStartDate";
            ItemForStartDate.Size = new Size(563, 24);
            ItemForStartDate.Text = "Start Date";
            ItemForStartDate.TextSize = new Size(127, 13);
            // 
            // ItemForDensityPlant
            // 
            ItemForDensityPlant.Control = DensityPlantTextEdit;
            ItemForDensityPlant.Location = new Point(0, 240);
            ItemForDensityPlant.Name = "ItemForDensityPlant";
            ItemForDensityPlant.Size = new Size(563, 24);
            ItemForDensityPlant.Text = "Density Plant";
            ItemForDensityPlant.TextSize = new Size(127, 13);
            // 
            // ItemForDrainThreshold
            // 
            ItemForDrainThreshold.Control = DrainThresholdTextEdit;
            ItemForDrainThreshold.Location = new Point(0, 264);
            ItemForDrainThreshold.Name = "ItemForDrainThreshold";
            ItemForDrainThreshold.Size = new Size(563, 24);
            ItemForDrainThreshold.Text = "Drain Threshold";
            ItemForDrainThreshold.TextSize = new Size(127, 13);
            // 
            // ItemForTotalPlants
            // 
            ItemForTotalPlants.Control = TotalPlantsTextEdit;
            ItemForTotalPlants.Location = new Point(0, 288);
            ItemForTotalPlants.Name = "ItemForTotalPlants";
            ItemForTotalPlants.Size = new Size(563, 24);
            ItemForTotalPlants.Text = "Total Plants";
            ItemForTotalPlants.TextSize = new Size(127, 13);
            // 
            // ItemForNumberOfRows
            // 
            ItemForNumberOfRows.Control = NumberOfRowsTextEdit;
            ItemForNumberOfRows.Location = new Point(0, 336);
            ItemForNumberOfRows.Name = "ItemForNumberOfRows";
            ItemForNumberOfRows.Size = new Size(563, 24);
            ItemForNumberOfRows.Text = "Number Of Rows";
            ItemForNumberOfRows.TextSize = new Size(127, 13);
            // 
            // ItemForNumberOfPlantsPerRow
            // 
            ItemForNumberOfPlantsPerRow.Control = NumberOfPlantsPerRowTextEdit;
            ItemForNumberOfPlantsPerRow.Location = new Point(0, 360);
            ItemForNumberOfPlantsPerRow.Name = "ItemForNumberOfPlantsPerRow";
            ItemForNumberOfPlantsPerRow.Size = new Size(563, 24);
            ItemForNumberOfPlantsPerRow.Text = "Number Of Plants Per Row";
            ItemForNumberOfPlantsPerRow.TextSize = new Size(127, 13);
            // 
            // ItemForIrrigationThreshold
            // 
            ItemForIrrigationThreshold.Control = IrrigationThresholdTextEdit;
            ItemForIrrigationThreshold.Location = new Point(0, 384);
            ItemForIrrigationThreshold.Name = "ItemForIrrigationThreshold";
            ItemForIrrigationThreshold.Size = new Size(563, 24);
            ItemForIrrigationThreshold.Text = "Irrigation Threshold";
            ItemForIrrigationThreshold.TextSize = new Size(127, 13);
            // 
            // ItemForStopDrainPercentage
            // 
            ItemForStopDrainPercentage.Control = StopDrainPercentageTextEdit;
            ItemForStopDrainPercentage.Location = new Point(0, 312);
            ItemForStopDrainPercentage.Name = "ItemForStopDrainPercentage";
            ItemForStopDrainPercentage.Size = new Size(563, 24);
            ItemForStopDrainPercentage.Text = "Stop Drain Percentage";
            ItemForStopDrainPercentage.TextSize = new Size(127, 13);
            // 
            // layoutControlGroup4
            // 
            layoutControlGroup4.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { ItemForIrrigationSector });
            layoutControlGroup4.Location = new Point(0, 455);
            layoutControlGroup4.Name = "layoutControlGroup4";
            layoutControlGroup4.Size = new Size(868, 125);
            // 
            // ItemForIrrigationSector
            // 
            ItemForIrrigationSector.Control = IrrigationSectorGridControl;
            ItemForIrrigationSector.Location = new Point(0, 0);
            ItemForIrrigationSector.Name = "ItemForIrrigationSector";
            ItemForIrrigationSector.Size = new Size(844, 80);
            ItemForIrrigationSector.StartNewLine = true;
            ItemForIrrigationSector.Text = "Irrigation Sector";
            ItemForIrrigationSector.TextSize = new Size(0, 0);
            ItemForIrrigationSector.TextVisible = false;
            // 
            // vGridControl1
            // 
            vGridControl1.DataSource = soilLayerBindingSource1;
            vGridControl1.Location = new Point(587, 47);
            vGridControl1.Name = "vGridControl1";
            vGridControl1.RowHeaderWidth = 157;
            vGridControl1.Rows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { category, category1, category2 });
            vGridControl1.Size = new Size(277, 404);
            vGridControl1.TabIndex = 21;
            // 
            // layoutControlItem1
            // 
            layoutControlItem1.Control = vGridControl1;
            layoutControlItem1.Location = new Point(563, 0);
            layoutControlItem1.Name = "layoutControlItem1";
            layoutControlItem1.Size = new Size(281, 408);
            layoutControlItem1.TextSize = new Size(0, 0);
            layoutControlItem1.TextVisible = false;
            // 
            // soilLayerBindingSource1
            // 
            soilLayerBindingSource1.DataSource = typeof(AgriSmart.Tools.Entities.SoilLayerEntity);
            // 
            // rowFieldCapacityPercentage
            // 
            rowFieldCapacityPercentage.Name = "rowFieldCapacityPercentage";
            rowFieldCapacityPercentage.Properties.Caption = "Field Capacity Percentage";
            rowFieldCapacityPercentage.Properties.FieldName = "FieldCapacityPercentage";
            // 
            // rowPermanentWiltingPointPercentage
            // 
            rowPermanentWiltingPointPercentage.Name = "rowPermanentWiltingPointPercentage";
            rowPermanentWiltingPointPercentage.Properties.Caption = "Permanent Wilting Point Percentage";
            rowPermanentWiltingPointPercentage.Properties.FieldName = "PermanentWiltingPointPercentage";
            // 
            // rowSevenKpaHumidity
            // 
            rowSevenKpaHumidity.Name = "rowSevenKpaHumidity";
            rowSevenKpaHumidity.Properties.Caption = "Seven Kpa Humidity";
            rowSevenKpaHumidity.Properties.FieldName = "SevenKpaHumidity";
            // 
            // rowApparentDensity
            // 
            rowApparentDensity.Name = "rowApparentDensity";
            rowApparentDensity.Properties.Caption = "Apparent Density";
            rowApparentDensity.Properties.FieldName = "ApparentDensity";
            // 
            // rowActualDensity
            // 
            rowActualDensity.Name = "rowActualDensity";
            rowActualDensity.Properties.Caption = "Actual Density";
            rowActualDensity.Properties.FieldName = "ActualDensity";
            // 
            // rowSoilDepth
            // 
            rowSoilDepth.Name = "rowSoilDepth";
            rowSoilDepth.Properties.Caption = "Soil Depth";
            rowSoilDepth.Properties.FieldName = "SoilDepth";
            // 
            // rowSandPercentage
            // 
            rowSandPercentage.Name = "rowSandPercentage";
            rowSandPercentage.Properties.Caption = "Sand Percentage";
            rowSandPercentage.Properties.FieldName = "SandPercentage";
            // 
            // rowSiltPercentage
            // 
            rowSiltPercentage.Name = "rowSiltPercentage";
            rowSiltPercentage.Properties.Caption = "Silt Percentage";
            rowSiltPercentage.Properties.FieldName = "SiltPercentage";
            // 
            // rowClayPercentage
            // 
            rowClayPercentage.Name = "rowClayPercentage";
            rowClayPercentage.Properties.Caption = "Clay Percentage";
            rowClayPercentage.Properties.FieldName = "ClayPercentage";
            // 
            // rowInfiltrationCapacity
            // 
            rowInfiltrationCapacity.Name = "rowInfiltrationCapacity";
            rowInfiltrationCapacity.Properties.Caption = "Infiltration Capacity";
            rowInfiltrationCapacity.Properties.FieldName = "InfiltrationCapacity";
            // 
            // rowDepletionPercentage
            // 
            rowDepletionPercentage.Name = "rowDepletionPercentage";
            rowDepletionPercentage.Properties.Caption = "Depletion Percentage";
            rowDepletionPercentage.Properties.FieldName = "DepletionPercentage";
            // 
            // rowIrrigatedAreaPercentage
            // 
            rowIrrigatedAreaPercentage.Name = "rowIrrigatedAreaPercentage";
            rowIrrigatedAreaPercentage.Properties.Caption = "Irrigated Area Percentage";
            rowIrrigatedAreaPercentage.Properties.FieldName = "IrrigatedAreaPercentage";
            // 
            // rowTexture
            // 
            rowTexture.Name = "rowTexture";
            rowTexture.Properties.Caption = "Texture";
            rowTexture.Properties.FieldName = "Texture";
            // 
            // rowTotalPorosityPercentage
            // 
            rowTotalPorosityPercentage.Name = "rowTotalPorosityPercentage";
            rowTotalPorosityPercentage.Properties.Caption = "Total Porosity Percentage";
            rowTotalPorosityPercentage.Properties.FieldName = "TotalPorosityPercentage";
            // 
            // rowTotalPorosityVolume
            // 
            rowTotalPorosityVolume.Name = "rowTotalPorosityVolume";
            rowTotalPorosityVolume.Properties.Caption = "Total Porosity Volume";
            rowTotalPorosityVolume.Properties.FieldName = "TotalPorosityVolume";
            // 
            // rowSolidComponentPercentage
            // 
            rowSolidComponentPercentage.Name = "rowSolidComponentPercentage";
            rowSolidComponentPercentage.Properties.Caption = "Solid Component Percentage";
            rowSolidComponentPercentage.Properties.FieldName = "SolidComponentPercentage";
            // 
            // rowSolidComponentVolume
            // 
            rowSolidComponentVolume.Name = "rowSolidComponentVolume";
            rowSolidComponentVolume.Properties.Caption = "Solid Component Volume";
            rowSolidComponentVolume.Properties.FieldName = "SolidComponentVolume";
            // 
            // rowEaselyAvaliableWaterPercentage
            // 
            rowEaselyAvaliableWaterPercentage.Name = "rowEaselyAvaliableWaterPercentage";
            rowEaselyAvaliableWaterPercentage.Properties.Caption = "Easely Avaliable Water Percentage";
            rowEaselyAvaliableWaterPercentage.Properties.FieldName = "EaselyAvaliableWaterPercentage";
            // 
            // rowEaselyAvailableWaterVolumen
            // 
            rowEaselyAvailableWaterVolumen.Name = "rowEaselyAvailableWaterVolumen";
            rowEaselyAvailableWaterVolumen.Properties.Caption = "Easely Available Water Volumen";
            rowEaselyAvailableWaterVolumen.Properties.FieldName = "EaselyAvailableWaterVolumen";
            // 
            // rowTotalAvailableWaterPercentage
            // 
            rowTotalAvailableWaterPercentage.Name = "rowTotalAvailableWaterPercentage";
            rowTotalAvailableWaterPercentage.Properties.Caption = "Total Available Water Percentage";
            rowTotalAvailableWaterPercentage.Properties.FieldName = "TotalAvailableWaterPercentage";
            // 
            // rowTotalAvailableWaterVolume
            // 
            rowTotalAvailableWaterVolume.Name = "rowTotalAvailableWaterVolume";
            rowTotalAvailableWaterVolume.Properties.Caption = "Total Available Water Volume";
            rowTotalAvailableWaterVolume.Properties.FieldName = "TotalAvailableWaterVolume";
            // 
            // rowReserveWaterPercentage
            // 
            rowReserveWaterPercentage.Name = "rowReserveWaterPercentage";
            rowReserveWaterPercentage.Properties.Caption = "Reserve Water Percentage";
            rowReserveWaterPercentage.Properties.FieldName = "ReserveWaterPercentage";
            // 
            // rowReserveWaterVolumen
            // 
            rowReserveWaterVolumen.Name = "rowReserveWaterVolumen";
            rowReserveWaterVolumen.Properties.Caption = "Reserve Water Volumen";
            rowReserveWaterVolumen.Properties.FieldName = "ReserveWaterVolumen";
            // 
            // rowNonAvailableWaterPercentage
            // 
            rowNonAvailableWaterPercentage.Name = "rowNonAvailableWaterPercentage";
            rowNonAvailableWaterPercentage.Properties.Caption = "Non Available Water Percentage";
            rowNonAvailableWaterPercentage.Properties.FieldName = "NonAvailableWaterPercentage";
            // 
            // rowNonAvailableWaterVolume
            // 
            rowNonAvailableWaterVolume.Name = "rowNonAvailableWaterVolume";
            rowNonAvailableWaterVolume.Properties.Caption = "Non Available Water Volume";
            rowNonAvailableWaterVolume.Properties.FieldName = "NonAvailableWaterVolume";
            // 
            // rowAerationCapacityAtContainerCapacityPercentage
            // 
            rowAerationCapacityAtContainerCapacityPercentage.Name = "rowAerationCapacityAtContainerCapacityPercentage";
            rowAerationCapacityAtContainerCapacityPercentage.Properties.Caption = "Aeration Capacity At Container Capacity Percentage";
            rowAerationCapacityAtContainerCapacityPercentage.Properties.FieldName = "AerationCapacityAtContainerCapacityPercentage";
            // 
            // rowAerationCapacityAtContainerCapacityVolume
            // 
            rowAerationCapacityAtContainerCapacityVolume.Name = "rowAerationCapacityAtContainerCapacityVolume";
            rowAerationCapacityAtContainerCapacityVolume.Properties.Caption = "Aeration Capacity At Container Capacity Volume";
            rowAerationCapacityAtContainerCapacityVolume.Properties.FieldName = "AerationCapacityAtContainerCapacityVolume";
            // 
            // rowIrrigationSheetTotalVolume
            // 
            rowIrrigationSheetTotalVolume.Name = "rowIrrigationSheetTotalVolume";
            rowIrrigationSheetTotalVolume.Properties.Caption = "Irrigation Sheet Total Volume";
            rowIrrigationSheetTotalVolume.Properties.FieldName = "IrrigationSheetTotalVolume";
            // 
            // rowIrrigationSheetNetVolume
            // 
            rowIrrigationSheetNetVolume.Name = "rowIrrigationSheetNetVolume";
            rowIrrigationSheetNetVolume.Properties.Caption = "Irrigation Sheet Net Volume";
            rowIrrigationSheetNetVolume.Properties.FieldName = "IrrigationSheetNetVolume";
            // 
            // rowApplicationEfficiency
            // 
            rowApplicationEfficiency.Name = "rowApplicationEfficiency";
            rowApplicationEfficiency.Properties.Caption = "Application Efficiency";
            rowApplicationEfficiency.Properties.FieldName = "ApplicationEfficiency";
            // 
            // rowId
            // 
            rowId.Name = "rowId";
            rowId.Properties.Caption = "Id";
            rowId.Properties.FieldName = "Id";
            // 
            // rowName
            // 
            rowName.Name = "rowName";
            rowName.Properties.Caption = "Name";
            rowName.Properties.FieldName = "Name";
            // 
            // rowActive
            // 
            rowActive.Name = "rowActive";
            rowActive.Properties.Caption = "Active";
            rowActive.Properties.FieldName = "Active";
            // 
            // category
            // 
            category.ChildRows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowId, rowName, rowActive });
            category.Name = "category";
            category.Properties.Caption = "Id";
            // 
            // category1
            // 
            category1.ChildRows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowPermanentWiltingPointPercentage, rowSevenKpaHumidity, rowApparentDensity, rowActualDensity, rowSoilDepth, rowSandPercentage, rowSiltPercentage, rowClayPercentage, rowInfiltrationCapacity, rowDepletionPercentage, rowIrrigatedAreaPercentage, rowIrrigationSheetNetVolume, rowApplicationEfficiency, rowFieldCapacityPercentage });
            category1.Name = "category1";
            category1.Properties.Caption = "Features";
            // 
            // category2
            // 
            category2.ChildRows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowTexture, rowTotalPorosityPercentage, rowTotalPorosityVolume, rowSolidComponentPercentage, rowSolidComponentVolume, rowEaselyAvaliableWaterPercentage, rowEaselyAvailableWaterVolumen, rowTotalAvailableWaterPercentage, rowTotalAvailableWaterVolume, rowReserveWaterPercentage, rowReserveWaterVolumen, rowNonAvailableWaterPercentage, rowNonAvailableWaterVolume, rowAerationCapacityAtContainerCapacityPercentage, rowAerationCapacityAtContainerCapacityVolume, rowIrrigationSheetTotalVolume });
            category2.Name = "category2";
            category2.Properties.Caption = "Coefficients";
            // 
            // SubFormCropProductionSoil
            // 
            Controls.Add(dataLayoutControl1);
            Name = "SubFormCropProductionSoil";
            Size = new Size(888, 600);
            ((ISupportInitialize)dataLayoutControl1).EndInit();
            dataLayoutControl1.ResumeLayout(false);
            ((ISupportInitialize)NumberOfDropperM2TextEdit.Properties).EndInit();
            ((ISupportInitialize)cropProductionSoilBindingSource).EndInit();
            ((ISupportInitialize)CropNameLookUpEdit.Properties).EndInit();
            ((ISupportInitialize)LengthTextEdit.Properties).EndInit();
            ((ISupportInitialize)WidthTextEdit.Properties).EndInit();
            ((ISupportInitialize)AreaTextEdit.Properties).EndInit();
            ((ISupportInitialize)BetweenRowDistanceTextEdit.Properties).EndInit();
            ((ISupportInitialize)BetweenPlantDistanceTextEdit.Properties).EndInit();
            ((ISupportInitialize)DropperNameLookUpEdit.Properties).EndInit();
            ((ISupportInitialize)StartDateDateEdit.Properties.CalendarTimeProperties).EndInit();
            ((ISupportInitialize)StartDateDateEdit.Properties).EndInit();
            ((ISupportInitialize)DensityPlantTextEdit.Properties).EndInit();
            ((ISupportInitialize)TotalPlantsTextEdit.Properties).EndInit();
            ((ISupportInitialize)NumberOfRowsTextEdit.Properties).EndInit();
            ((ISupportInitialize)NumberOfPlantsPerRowTextEdit.Properties).EndInit();
            ((ISupportInitialize)StopDrainPercentageTextEdit.Properties).EndInit();
            ((ISupportInitialize)NameTextEdit.Properties).EndInit();
            ((ISupportInitialize)SoilLayersGridControl).EndInit();
            ((ISupportInitialize)soilLayerBindingSource).EndInit();
            ((ISupportInitialize)gridView1).EndInit();
            ((ISupportInitialize)IrrigationSectorGridControl).EndInit();
            ((ISupportInitialize)gridView2).EndInit();
            ((ISupportInitialize)IrrigationThresholdTextEdit.Properties).EndInit();
            ((ISupportInitialize)DrainThresholdTextEdit.Properties).EndInit();
            ((ISupportInitialize)Root).EndInit();
            ((ISupportInitialize)layoutControlGroup1).EndInit();
            ((ISupportInitialize)tabbedControlGroup1).EndInit();
            ((ISupportInitialize)layoutControlGroup3).EndInit();
            ((ISupportInitialize)ItemForSoilLayers).EndInit();
            ((ISupportInitialize)layoutControlGroup2).EndInit();
            ((ISupportInitialize)ItemForCropName).EndInit();
            ((ISupportInitialize)ItemForName).EndInit();
            ((ISupportInitialize)ItemForDropperName).EndInit();
            ((ISupportInitialize)ItemForNumberOfDropperM2).EndInit();
            ((ISupportInitialize)ItemForLength).EndInit();
            ((ISupportInitialize)ItemForWidth).EndInit();
            ((ISupportInitialize)ItemForArea).EndInit();
            ((ISupportInitialize)ItemForBetweenRowDistance).EndInit();
            ((ISupportInitialize)ItemForBetweenPlantDistance).EndInit();
            ((ISupportInitialize)ItemForStartDate).EndInit();
            ((ISupportInitialize)ItemForDensityPlant).EndInit();
            ((ISupportInitialize)ItemForDrainThreshold).EndInit();
            ((ISupportInitialize)ItemForTotalPlants).EndInit();
            ((ISupportInitialize)ItemForNumberOfRows).EndInit();
            ((ISupportInitialize)ItemForNumberOfPlantsPerRow).EndInit();
            ((ISupportInitialize)ItemForIrrigationThreshold).EndInit();
            ((ISupportInitialize)ItemForStopDrainPercentage).EndInit();
            ((ISupportInitialize)layoutControlGroup4).EndInit();
            ((ISupportInitialize)ItemForIrrigationSector).EndInit();
            ((ISupportInitialize)vGridControl1).EndInit();
            ((ISupportInitialize)layoutControlItem1).EndInit();
            ((ISupportInitialize)soilLayerBindingSource1).EndInit();
            ResumeLayout(false);
        }
    }
}
