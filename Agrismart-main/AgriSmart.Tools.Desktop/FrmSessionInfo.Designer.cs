namespace AgriSmart.Tools.Desktop
{
    partial class FrmSessionInfo
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmSessionInfo));
            DevExpress.XtraEditors.DXErrorProvider.ConditionValidationRule conditionValidationRule1 = new DevExpress.XtraEditors.DXErrorProvider.ConditionValidationRule();
            DevExpress.XtraEditors.DXErrorProvider.ConditionValidationRule conditionValidationRule2 = new DevExpress.XtraEditors.DXErrorProvider.ConditionValidationRule();
            splashScreenManager1 = new DevExpress.XtraSplashScreen.SplashScreenManager(this, typeof(WaitForm1), true, true);
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            gridLookUpEdit1 = new DevExpress.XtraEditors.GridLookUpEdit();
            cropProductionModelBindingSource = new System.Windows.Forms.BindingSource(components);
            gridLookUpEdit1View = new DevExpress.XtraGrid.Views.Grid.GridView();
            colId = new DevExpress.XtraGrid.Columns.GridColumn();
            colName = new DevExpress.XtraGrid.Columns.GridColumn();
            colCropId = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemLookUpEditCrops = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
            cropModelBindingSource = new System.Windows.Forms.BindingSource(components);
            colProductionUnitId = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemLookUpEditProductionUnits = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
            productionUnitModelBindingSource = new System.Windows.Forms.BindingSource(components);
            textEditSessionName = new DevExpress.XtraEditors.TextEdit();
            btnCancel = new DevExpress.XtraEditors.SimpleButton();
            btnContinue = new DevExpress.XtraEditors.SimpleButton();
            lookUpEditPhase = new DevExpress.XtraEditors.LookUpEdit();
            cropPhaseModelBindingSource = new System.Windows.Forms.BindingSource(components);
            lookUpEditCompany = new DevExpress.XtraEditors.LookUpEdit();
            companyModelBindingSource = new System.Windows.Forms.BindingSource(components);
            lookUpEditFarm = new DevExpress.XtraEditors.LookUpEdit();
            farmModelBindingSource = new System.Windows.Forms.BindingSource(components);
            layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
            emptySpaceItem1 = new DevExpress.XtraLayout.EmptySpaceItem();
            layoutControlItem3 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem4 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem5 = new DevExpress.XtraLayout.LayoutControlItem();
            emptySpaceItem2 = new DevExpress.XtraLayout.EmptySpaceItem();
            emptySpaceItem3 = new DevExpress.XtraLayout.EmptySpaceItem();
            layoutControlItem6 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItemCompany = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItemFarm = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
            dxValidationProvider1 = new DevExpress.XtraEditors.DXErrorProvider.DXValidationProvider(components);
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            layoutControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)gridLookUpEdit1.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)cropProductionModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)gridLookUpEdit1View).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditCrops).BeginInit();
            ((System.ComponentModel.ISupportInitialize)cropModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditProductionUnits).BeginInit();
            ((System.ComponentModel.ISupportInitialize)productionUnitModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)textEditSessionName.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditPhase.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)cropPhaseModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditCompany.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)companyModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditFarm.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)farmModelBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem4).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem5).BeginInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem3).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem6).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemCompany).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemFarm).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)dxValidationProvider1).BeginInit();
            SuspendLayout();
            // 
            // splashScreenManager1
            // 
            splashScreenManager1.ClosingDelay = 500;
            // 
            // layoutControl1
            // 
            layoutControl1.Controls.Add(gridLookUpEdit1);
            layoutControl1.Controls.Add(textEditSessionName);
            layoutControl1.Controls.Add(btnCancel);
            layoutControl1.Controls.Add(btnContinue);
            layoutControl1.Controls.Add(lookUpEditPhase);
            layoutControl1.Controls.Add(lookUpEditCompany);
            layoutControl1.Controls.Add(lookUpEditFarm);
            resources.ApplyResources(layoutControl1, "layoutControl1");
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = layoutControlGroup1;
            // 
            // gridLookUpEdit1
            // 
            resources.ApplyResources(gridLookUpEdit1, "gridLookUpEdit1");
            gridLookUpEdit1.Name = "gridLookUpEdit1";
            gridLookUpEdit1.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("gridLookUpEdit1.Properties.Buttons")) });
            gridLookUpEdit1.Properties.DataSource = cropProductionModelBindingSource;
            gridLookUpEdit1.Properties.DisplayMember = "Name";
            gridLookUpEdit1.Properties.PopupView = gridLookUpEdit1View;
            gridLookUpEdit1.Properties.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] { repositoryItemLookUpEditCrops, repositoryItemLookUpEditProductionUnits });
            gridLookUpEdit1.Properties.ValueMember = "Id";
            gridLookUpEdit1.StyleController = layoutControl1;
            gridLookUpEdit1.EditValueChanged += gridLookUpEdit1_EditValueChanged;
            // 
            // cropProductionModelBindingSource
            // 
            cropProductionModelBindingSource.DataSource = typeof(Entities.CropProductionEntity);
            // 
            // gridLookUpEdit1View
            // 
            gridLookUpEdit1View.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] { colId, colName, colCropId, colProductionUnitId });
            gridLookUpEdit1View.DetailHeight = 404;
            gridLookUpEdit1View.FocusRectStyle = DevExpress.XtraGrid.Views.Grid.DrawFocusRectStyle.RowFocus;
            gridLookUpEdit1View.Name = "gridLookUpEdit1View";
            gridLookUpEdit1View.OptionsEditForm.PopupEditFormWidth = 933;
            gridLookUpEdit1View.OptionsSelection.EnableAppearanceFocusedCell = false;
            gridLookUpEdit1View.OptionsView.ShowGroupPanel = false;
            // 
            // colId
            // 
            resources.ApplyResources(colId, "colId");
            colId.FieldName = "Id";
            colId.MinWidth = 23;
            colId.Name = "colId";
            // 
            // colName
            // 
            resources.ApplyResources(colName, "colName");
            colName.FieldName = "Name";
            colName.MinWidth = 23;
            colName.Name = "colName";
            // 
            // colCropId
            // 
            resources.ApplyResources(colCropId, "colCropId");
            colCropId.ColumnEdit = repositoryItemLookUpEditCrops;
            colCropId.FieldName = "CropId";
            colCropId.MinWidth = 23;
            colCropId.Name = "colCropId";
            // 
            // repositoryItemLookUpEditCrops
            // 
            resources.ApplyResources(repositoryItemLookUpEditCrops, "repositoryItemLookUpEditCrops");
            repositoryItemLookUpEditCrops.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("repositoryItemLookUpEditCrops.Buttons")) });
            repositoryItemLookUpEditCrops.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditCrops.Columns"), resources.GetString("repositoryItemLookUpEditCrops.Columns1"), (int)resources.GetObject("repositoryItemLookUpEditCrops.Columns2"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditCrops.Columns3"), resources.GetString("repositoryItemLookUpEditCrops.Columns4"), (bool)resources.GetObject("repositoryItemLookUpEditCrops.Columns5"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditCrops.Columns6"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditCrops.Columns7"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditCrops.Columns8")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditCrops.Columns9"), resources.GetString("repositoryItemLookUpEditCrops.Columns10"), (int)resources.GetObject("repositoryItemLookUpEditCrops.Columns11"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditCrops.Columns12"), resources.GetString("repositoryItemLookUpEditCrops.Columns13"), (bool)resources.GetObject("repositoryItemLookUpEditCrops.Columns14"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditCrops.Columns15"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditCrops.Columns16"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditCrops.Columns17")) });
            repositoryItemLookUpEditCrops.DataSource = cropModelBindingSource;
            repositoryItemLookUpEditCrops.DisplayMember = "Name";
            repositoryItemLookUpEditCrops.Name = "repositoryItemLookUpEditCrops";
            repositoryItemLookUpEditCrops.ValueMember = "Id";
            // 
            // cropModelBindingSource
            // 
            cropModelBindingSource.DataSource = typeof(Entities.CropEntity);
            // 
            // colProductionUnitId
            // 
            resources.ApplyResources(colProductionUnitId, "colProductionUnitId");
            colProductionUnitId.ColumnEdit = repositoryItemLookUpEditProductionUnits;
            colProductionUnitId.FieldName = "ProductionUnitId";
            colProductionUnitId.MinWidth = 23;
            colProductionUnitId.Name = "colProductionUnitId";
            // 
            // repositoryItemLookUpEditProductionUnits
            // 
            resources.ApplyResources(repositoryItemLookUpEditProductionUnits, "repositoryItemLookUpEditProductionUnits");
            repositoryItemLookUpEditProductionUnits.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("repositoryItemLookUpEditProductionUnits.Buttons")) });
            repositoryItemLookUpEditProductionUnits.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditProductionUnits.Columns"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns1"), (int)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns2"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns3"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns4"), (bool)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns5"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns6"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns7"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns8")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditProductionUnits.Columns9"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns10"), (int)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns11"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns12"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns13"), (bool)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns14"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns15"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns16"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns17")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditProductionUnits.Columns18"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns19"), (int)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns20"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns21"), resources.GetString("repositoryItemLookUpEditProductionUnits.Columns22"), (bool)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns23"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns24"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns25"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditProductionUnits.Columns26")) });
            repositoryItemLookUpEditProductionUnits.DataSource = productionUnitModelBindingSource;
            repositoryItemLookUpEditProductionUnits.DisplayMember = "Name";
            repositoryItemLookUpEditProductionUnits.Name = "repositoryItemLookUpEditProductionUnits";
            repositoryItemLookUpEditProductionUnits.ValueMember = "Id";
            // 
            // productionUnitModelBindingSource
            // 
            productionUnitModelBindingSource.DataSource = typeof(Entities.ProductionUnitEntity);
            // 
            // textEditSessionName
            // 
            resources.ApplyResources(textEditSessionName, "textEditSessionName");
            textEditSessionName.Name = "textEditSessionName";
            textEditSessionName.StyleController = layoutControl1;
            conditionValidationRule1.ConditionOperator = DevExpress.XtraEditors.DXErrorProvider.ConditionOperator.IsNotBlank;
            conditionValidationRule1.ErrorText = "Input a Name";
            dxValidationProvider1.SetValidationRule(textEditSessionName, conditionValidationRule1);
            // 
            // btnCancel
            // 
            btnCancel.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            resources.ApplyResources(btnCancel, "btnCancel");
            btnCancel.Name = "btnCancel";
            btnCancel.StyleController = layoutControl1;
            // 
            // btnContinue
            // 
            resources.ApplyResources(btnContinue, "btnContinue");
            btnContinue.Name = "btnContinue";
            btnContinue.StyleController = layoutControl1;
            btnContinue.Click += btnContinue_Click;
            // 
            // lookUpEditPhase
            // 
            resources.ApplyResources(lookUpEditPhase, "lookUpEditPhase");
            lookUpEditPhase.Name = "lookUpEditPhase";
            lookUpEditPhase.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("lookUpEditPhase.Properties.Buttons")) });
            lookUpEditPhase.Properties.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditPhase.Properties.Columns"), resources.GetString("lookUpEditPhase.Properties.Columns1"), (int)resources.GetObject("lookUpEditPhase.Properties.Columns2"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditPhase.Properties.Columns3"), resources.GetString("lookUpEditPhase.Properties.Columns4"), (bool)resources.GetObject("lookUpEditPhase.Properties.Columns5"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditPhase.Properties.Columns6"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditPhase.Properties.Columns7"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditPhase.Properties.Columns8")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditPhase.Properties.Columns9"), resources.GetString("lookUpEditPhase.Properties.Columns10"), (int)resources.GetObject("lookUpEditPhase.Properties.Columns11"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditPhase.Properties.Columns12"), resources.GetString("lookUpEditPhase.Properties.Columns13"), (bool)resources.GetObject("lookUpEditPhase.Properties.Columns14"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditPhase.Properties.Columns15"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditPhase.Properties.Columns16"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditPhase.Properties.Columns17")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditPhase.Properties.Columns18"), resources.GetString("lookUpEditPhase.Properties.Columns19"), (int)resources.GetObject("lookUpEditPhase.Properties.Columns20"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditPhase.Properties.Columns21"), resources.GetString("lookUpEditPhase.Properties.Columns22"), (bool)resources.GetObject("lookUpEditPhase.Properties.Columns23"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditPhase.Properties.Columns24"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditPhase.Properties.Columns25"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditPhase.Properties.Columns26")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditPhase.Properties.Columns27"), resources.GetString("lookUpEditPhase.Properties.Columns28"), (int)resources.GetObject("lookUpEditPhase.Properties.Columns29"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditPhase.Properties.Columns30"), resources.GetString("lookUpEditPhase.Properties.Columns31"), (bool)resources.GetObject("lookUpEditPhase.Properties.Columns32"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditPhase.Properties.Columns33"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditPhase.Properties.Columns34"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditPhase.Properties.Columns35")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditPhase.Properties.Columns36"), resources.GetString("lookUpEditPhase.Properties.Columns37"), (int)resources.GetObject("lookUpEditPhase.Properties.Columns38"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditPhase.Properties.Columns39"), resources.GetString("lookUpEditPhase.Properties.Columns40"), (bool)resources.GetObject("lookUpEditPhase.Properties.Columns41"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditPhase.Properties.Columns42"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditPhase.Properties.Columns43"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditPhase.Properties.Columns44")) });
            lookUpEditPhase.Properties.DataSource = cropPhaseModelBindingSource;
            lookUpEditPhase.Properties.DisplayMember = "Name";
            lookUpEditPhase.Properties.ValueMember = "Id";
            lookUpEditPhase.StyleController = layoutControl1;
            conditionValidationRule2.ConditionOperator = DevExpress.XtraEditors.DXErrorProvider.ConditionOperator.IsNotBlank;
            conditionValidationRule2.ErrorText = "You have to select a crop phase";
            dxValidationProvider1.SetValidationRule(lookUpEditPhase, conditionValidationRule2);
            lookUpEditPhase.EditValueChanged += lookUpEditPhase_EditValueChanged;
            // 
            // cropPhaseModelBindingSource
            // 
            cropPhaseModelBindingSource.DataSource = typeof(Entities.CropPhaseEntity);
            // 
            // lookUpEditCompany
            // 
            resources.ApplyResources(lookUpEditCompany, "lookUpEditCompany");
            lookUpEditCompany.Name = "lookUpEditCompany";
            lookUpEditCompany.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("lookUpEditCompany.Properties.Buttons")) });
            lookUpEditCompany.Properties.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditCompany.Properties.Columns"), resources.GetString("lookUpEditCompany.Properties.Columns1"), (int)resources.GetObject("lookUpEditCompany.Properties.Columns2"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditCompany.Properties.Columns3"), resources.GetString("lookUpEditCompany.Properties.Columns4"), (bool)resources.GetObject("lookUpEditCompany.Properties.Columns5"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditCompany.Properties.Columns6"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditCompany.Properties.Columns7"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditCompany.Properties.Columns8")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditCompany.Properties.Columns9"), resources.GetString("lookUpEditCompany.Properties.Columns10"), (int)resources.GetObject("lookUpEditCompany.Properties.Columns11"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditCompany.Properties.Columns12"), resources.GetString("lookUpEditCompany.Properties.Columns13"), (bool)resources.GetObject("lookUpEditCompany.Properties.Columns14"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditCompany.Properties.Columns15"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditCompany.Properties.Columns16"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditCompany.Properties.Columns17")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditCompany.Properties.Columns18"), resources.GetString("lookUpEditCompany.Properties.Columns19"), (int)resources.GetObject("lookUpEditCompany.Properties.Columns20"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditCompany.Properties.Columns21"), resources.GetString("lookUpEditCompany.Properties.Columns22"), (bool)resources.GetObject("lookUpEditCompany.Properties.Columns23"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditCompany.Properties.Columns24"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditCompany.Properties.Columns25"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditCompany.Properties.Columns26")) });
            lookUpEditCompany.Properties.DataSource = companyModelBindingSource;
            lookUpEditCompany.Properties.DisplayMember = "Name";
            lookUpEditCompany.Properties.ValueMember = "Id";
            lookUpEditCompany.StyleController = layoutControl1;
            lookUpEditCompany.EditValueChanged += lookUpEditCompany_EditValueChanged;
            // 
            // companyModelBindingSource
            // 
            companyModelBindingSource.DataSource = typeof(Entities.CompanyEntity);
            // 
            // lookUpEditFarm
            // 
            resources.ApplyResources(lookUpEditFarm, "lookUpEditFarm");
            lookUpEditFarm.Name = "lookUpEditFarm";
            lookUpEditFarm.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("lookUpEditFarm.Properties.Buttons")) });
            lookUpEditFarm.Properties.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditFarm.Properties.Columns"), resources.GetString("lookUpEditFarm.Properties.Columns1"), (int)resources.GetObject("lookUpEditFarm.Properties.Columns2"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditFarm.Properties.Columns3"), resources.GetString("lookUpEditFarm.Properties.Columns4"), (bool)resources.GetObject("lookUpEditFarm.Properties.Columns5"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditFarm.Properties.Columns6"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditFarm.Properties.Columns7"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditFarm.Properties.Columns8")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditFarm.Properties.Columns9"), resources.GetString("lookUpEditFarm.Properties.Columns10"), (int)resources.GetObject("lookUpEditFarm.Properties.Columns11"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditFarm.Properties.Columns12"), resources.GetString("lookUpEditFarm.Properties.Columns13"), (bool)resources.GetObject("lookUpEditFarm.Properties.Columns14"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditFarm.Properties.Columns15"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditFarm.Properties.Columns16"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditFarm.Properties.Columns17")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("lookUpEditFarm.Properties.Columns18"), resources.GetString("lookUpEditFarm.Properties.Columns19"), (int)resources.GetObject("lookUpEditFarm.Properties.Columns20"), (DevExpress.Utils.FormatType)resources.GetObject("lookUpEditFarm.Properties.Columns21"), resources.GetString("lookUpEditFarm.Properties.Columns22"), (bool)resources.GetObject("lookUpEditFarm.Properties.Columns23"), (DevExpress.Utils.HorzAlignment)resources.GetObject("lookUpEditFarm.Properties.Columns24"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("lookUpEditFarm.Properties.Columns25"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("lookUpEditFarm.Properties.Columns26")) });
            lookUpEditFarm.Properties.DataSource = farmModelBindingSource;
            lookUpEditFarm.Properties.DisplayMember = "Name";
            lookUpEditFarm.Properties.ValueMember = "Id";
            lookUpEditFarm.StyleController = layoutControl1;
            lookUpEditFarm.EditValueChanged += lookUpEditFarm_EditValueChanged;
            // 
            // farmModelBindingSource
            // 
            farmModelBindingSource.DataSource = typeof(Entities.FarmEntity);
            // 
            // layoutControlGroup1
            // 
            layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            layoutControlGroup1.GroupBordersVisible = false;
            layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { emptySpaceItem1, layoutControlItem3, layoutControlItem4, layoutControlItem5, emptySpaceItem2, emptySpaceItem3, layoutControlItem6, layoutControlItemCompany, layoutControlItemFarm, layoutControlItem1 });
            layoutControlGroup1.Name = "layoutControlGroup1";
            layoutControlGroup1.Size = new System.Drawing.Size(582, 207);
            layoutControlGroup1.TextVisible = false;
            // 
            // emptySpaceItem1
            // 
            emptySpaceItem1.AllowHotTrack = false;
            emptySpaceItem1.Location = new System.Drawing.Point(0, 120);
            emptySpaceItem1.Name = "emptySpaceItem1";
            emptySpaceItem1.Size = new System.Drawing.Size(562, 41);
            emptySpaceItem1.TextSize = new System.Drawing.Size(0, 0);
            // 
            // layoutControlItem3
            // 
            layoutControlItem3.Control = lookUpEditPhase;
            layoutControlItem3.Location = new System.Drawing.Point(0, 96);
            layoutControlItem3.Name = "layoutControlItem3";
            layoutControlItem3.Size = new System.Drawing.Size(562, 24);
            resources.ApplyResources(layoutControlItem3, "layoutControlItem3");
            layoutControlItem3.TextSize = new System.Drawing.Size(77, 13);
            // 
            // layoutControlItem4
            // 
            layoutControlItem4.Control = btnContinue;
            layoutControlItem4.Location = new System.Drawing.Point(186, 161);
            layoutControlItem4.Name = "layoutControlItem4";
            layoutControlItem4.Size = new System.Drawing.Size(85, 26);
            layoutControlItem4.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem4.TextVisible = false;
            // 
            // layoutControlItem5
            // 
            layoutControlItem5.Control = btnCancel;
            layoutControlItem5.Location = new System.Drawing.Point(271, 161);
            layoutControlItem5.Name = "layoutControlItem5";
            layoutControlItem5.Size = new System.Drawing.Size(81, 26);
            layoutControlItem5.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem5.TextVisible = false;
            // 
            // emptySpaceItem2
            // 
            emptySpaceItem2.AllowHotTrack = false;
            emptySpaceItem2.Location = new System.Drawing.Point(0, 161);
            emptySpaceItem2.Name = "emptySpaceItem2";
            emptySpaceItem2.Size = new System.Drawing.Size(186, 26);
            emptySpaceItem2.TextSize = new System.Drawing.Size(0, 0);
            // 
            // emptySpaceItem3
            // 
            emptySpaceItem3.AllowHotTrack = false;
            emptySpaceItem3.Location = new System.Drawing.Point(352, 161);
            emptySpaceItem3.Name = "emptySpaceItem3";
            emptySpaceItem3.Size = new System.Drawing.Size(210, 26);
            emptySpaceItem3.TextSize = new System.Drawing.Size(0, 0);
            // 
            // layoutControlItem6
            // 
            layoutControlItem6.Control = textEditSessionName;
            layoutControlItem6.Location = new System.Drawing.Point(0, 0);
            layoutControlItem6.Name = "layoutControlItem6";
            layoutControlItem6.Size = new System.Drawing.Size(562, 24);
            resources.ApplyResources(layoutControlItem6, "layoutControlItem6");
            layoutControlItem6.TextSize = new System.Drawing.Size(77, 13);
            // 
            // layoutControlItemCompany
            // 
            layoutControlItemCompany.Control = lookUpEditCompany;
            resources.ApplyResources(layoutControlItemCompany, "layoutControlItemCompany");
            layoutControlItemCompany.Location = new System.Drawing.Point(0, 24);
            layoutControlItemCompany.Name = "layoutControlItemCompany";
            layoutControlItemCompany.Size = new System.Drawing.Size(562, 24);
            layoutControlItemCompany.TextSize = new System.Drawing.Size(77, 13);
            // 
            // layoutControlItemFarm
            // 
            layoutControlItemFarm.Control = lookUpEditFarm;
            resources.ApplyResources(layoutControlItemFarm, "layoutControlItemFarm");
            layoutControlItemFarm.Location = new System.Drawing.Point(0, 48);
            layoutControlItemFarm.Name = "layoutControlItemFarm";
            layoutControlItemFarm.Size = new System.Drawing.Size(562, 24);
            layoutControlItemFarm.TextSize = new System.Drawing.Size(77, 13);
            // 
            // layoutControlItem1
            // 
            layoutControlItem1.Control = gridLookUpEdit1;
            layoutControlItem1.Location = new System.Drawing.Point(0, 72);
            layoutControlItem1.Name = "layoutControlItem1";
            layoutControlItem1.Size = new System.Drawing.Size(562, 24);
            resources.ApplyResources(layoutControlItem1, "layoutControlItem1");
            layoutControlItem1.TextSize = new System.Drawing.Size(77, 13);
            // 
            // FrmSessionInfo
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(layoutControl1);
            Name = "FrmSessionInfo";
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            layoutControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)gridLookUpEdit1.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)cropProductionModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)gridLookUpEdit1View).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditCrops).EndInit();
            ((System.ComponentModel.ISupportInitialize)cropModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditProductionUnits).EndInit();
            ((System.ComponentModel.ISupportInitialize)productionUnitModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)textEditSessionName.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditPhase.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)cropPhaseModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditCompany.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)companyModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)lookUpEditFarm.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)farmModelBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).EndInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem4).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem5).EndInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem2).EndInit();
            ((System.ComponentModel.ISupportInitialize)emptySpaceItem3).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem6).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemCompany).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemFarm).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).EndInit();
            ((System.ComponentModel.ISupportInitialize)dxValidationProvider1).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup1;
        private DevExpress.XtraLayout.EmptySpaceItem emptySpaceItem1;
        private DevExpress.XtraEditors.SimpleButton btnCancel;
        private DevExpress.XtraEditors.SimpleButton btnContinue;
        private DevExpress.XtraEditors.LookUpEdit lookUpEditPhase;
        private System.Windows.Forms.BindingSource cropPhaseModelBindingSource;
        private System.Windows.Forms.BindingSource cropModelBindingSource;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem3;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem4;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem5;
        private DevExpress.XtraLayout.EmptySpaceItem emptySpaceItem2;
        private DevExpress.XtraLayout.EmptySpaceItem emptySpaceItem3;
        private DevExpress.XtraEditors.TextEdit textEditSessionName;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem6;
        private DevExpress.XtraEditors.DXErrorProvider.DXValidationProvider dxValidationProvider1;
        private DevExpress.XtraEditors.LookUpEdit lookUpEditCompany;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItemCompany;
        private DevExpress.XtraEditors.LookUpEdit lookUpEditFarm;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItemFarm;
        private System.Windows.Forms.BindingSource companyModelBindingSource;
        private System.Windows.Forms.BindingSource farmModelBindingSource;
        private System.Windows.Forms.BindingSource cropProductionModelBindingSource;
        private DevExpress.XtraEditors.GridLookUpEdit gridLookUpEdit1;
        private DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit repositoryItemLookUpEditCrops;
        private DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit repositoryItemLookUpEditProductionUnits;
        private System.Windows.Forms.BindingSource productionUnitModelBindingSource;
        private DevExpress.XtraGrid.Views.Grid.GridView gridLookUpEdit1View;
        private DevExpress.XtraGrid.Columns.GridColumn colId;
        private DevExpress.XtraGrid.Columns.GridColumn colName;
        private DevExpress.XtraGrid.Columns.GridColumn colCropId;
        private DevExpress.XtraGrid.Columns.GridColumn colProductionUnitId;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem1;
        private DevExpress.XtraSplashScreen.SplashScreenManager splashScreenManager1;
    }
}