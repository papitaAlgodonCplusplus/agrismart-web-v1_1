namespace AgriSmart.Tools.Desktop
{
    partial class SubFrmFertilizerInputs
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

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(SubFrmFertilizerInputs));
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            vGridControl2 = new DevExpress.XtraVerticalGrid.VGridControl();
            fertilizerBindingSource = new System.Windows.Forms.BindingSource(components);
            rowId = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowName = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowManufacturer = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowIsLiquid = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowActive = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            category = new DevExpress.XtraVerticalGrid.Rows.CategoryRow();
            rowSaltMolecularWeight = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowCationMolecularWeight = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowAnionMolecularWeight = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowPnh4 = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowPn = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowPno3 = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            vGridControl1 = new DevExpress.XtraVerticalGrid.VGridControl();
            fertilizerChemistryBindingSource = new System.Windows.Forms.BindingSource(components);
            repositoryItemCheckEdit2 = new DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit();
            rowPurity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowDensity = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSolubility0 = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSolubility20 = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowSolubility40 = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowFormula = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            rowIspHAdjuster = new DevExpress.XtraVerticalGrid.Rows.EditorRow();
            gridControl1 = new DevExpress.XtraGrid.GridControl();
            fertilizerInputBindingSource = new System.Windows.Forms.BindingSource(components);
            gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            colSelected = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemCheckEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit();
            colId = new DevExpress.XtraGrid.Columns.GridColumn();
            colPresentation = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemLookUpEditPresentation = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
            colName = new DevExpress.XtraGrid.Columns.GridColumn();
            colPrice = new DevExpress.XtraGrid.Columns.GridColumn();
            colFertilizer = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemLookUpEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
            layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
            layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem2 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem3 = new DevExpress.XtraLayout.LayoutControlItem();
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            layoutControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)vGridControl2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)vGridControl1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerChemistryBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemCheckEdit2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)gridControl1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerInputBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)gridView1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemCheckEdit1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditPresentation).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEdit1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).BeginInit();
            SuspendLayout();
            // 
            // layoutControl1
            // 
            resources.ApplyResources(layoutControl1, "layoutControl1");
            layoutControl1.Controls.Add(vGridControl2);
            layoutControl1.Controls.Add(vGridControl1);
            layoutControl1.Controls.Add(gridControl1);
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = layoutControlGroup1;
            // 
            // vGridControl2
            // 
            resources.ApplyResources(vGridControl2, "vGridControl2");
            vGridControl2.DataSource = fertilizerBindingSource;
            vGridControl2.Name = "vGridControl2";
            vGridControl2.Rows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowId, rowName, rowManufacturer, rowIsLiquid, rowActive, category });
            // 
            // rowId
            // 
            resources.ApplyResources(rowId, "rowId");
            rowId.Name = "rowId";
            rowId.Properties.AccessibleDescription = resources.GetString("rowId.Properties.AccessibleDescription");
            rowId.Properties.AccessibleName = resources.GetString("rowId.Properties.AccessibleName");
            rowId.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowId.Properties.AccessibleRole");
            rowId.Properties.Caption = resources.GetString("rowId.Properties.Caption");
            rowId.Properties.CustomizationCaption = resources.GetString("rowId.Properties.CustomizationCaption");
            rowId.Properties.FieldName = "Id";
            rowId.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowId.Properties.RowEdit");
            rowId.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowId.Properties.SortOrder");
            rowId.Properties.ToolTip = resources.GetString("rowId.Properties.ToolTip");
            rowId.Properties.Value = resources.GetObject("rowId.Properties.Value");
            // 
            // rowName
            // 
            resources.ApplyResources(rowName, "rowName");
            rowName.Name = "rowName";
            rowName.Properties.AccessibleDescription = resources.GetString("rowName.Properties.AccessibleDescription");
            rowName.Properties.AccessibleName = resources.GetString("rowName.Properties.AccessibleName");
            rowName.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowName.Properties.AccessibleRole");
            rowName.Properties.Caption = resources.GetString("rowName.Properties.Caption");
            rowName.Properties.CustomizationCaption = resources.GetString("rowName.Properties.CustomizationCaption");
            rowName.Properties.FieldName = "Name";
            rowName.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowName.Properties.RowEdit");
            rowName.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowName.Properties.SortOrder");
            rowName.Properties.ToolTip = resources.GetString("rowName.Properties.ToolTip");
            rowName.Properties.Value = resources.GetObject("rowName.Properties.Value");
            // 
            // rowManufacturer
            // 
            resources.ApplyResources(rowManufacturer, "rowManufacturer");
            rowManufacturer.Name = "rowManufacturer";
            rowManufacturer.Properties.AccessibleDescription = resources.GetString("rowManufacturer.Properties.AccessibleDescription");
            rowManufacturer.Properties.AccessibleName = resources.GetString("rowManufacturer.Properties.AccessibleName");
            rowManufacturer.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowManufacturer.Properties.AccessibleRole");
            rowManufacturer.Properties.Caption = resources.GetString("rowManufacturer.Properties.Caption");
            rowManufacturer.Properties.CustomizationCaption = resources.GetString("rowManufacturer.Properties.CustomizationCaption");
            rowManufacturer.Properties.FieldName = "Manufacturer";
            rowManufacturer.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowManufacturer.Properties.RowEdit");
            rowManufacturer.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowManufacturer.Properties.SortOrder");
            rowManufacturer.Properties.ToolTip = resources.GetString("rowManufacturer.Properties.ToolTip");
            rowManufacturer.Properties.Value = resources.GetObject("rowManufacturer.Properties.Value");
            // 
            // rowIsLiquid
            // 
            resources.ApplyResources(rowIsLiquid, "rowIsLiquid");
            rowIsLiquid.Name = "rowIsLiquid";
            rowIsLiquid.Properties.AccessibleDescription = resources.GetString("rowIsLiquid.Properties.AccessibleDescription");
            rowIsLiquid.Properties.AccessibleName = resources.GetString("rowIsLiquid.Properties.AccessibleName");
            rowIsLiquid.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowIsLiquid.Properties.AccessibleRole");
            rowIsLiquid.Properties.Caption = resources.GetString("rowIsLiquid.Properties.Caption");
            rowIsLiquid.Properties.CustomizationCaption = resources.GetString("rowIsLiquid.Properties.CustomizationCaption");
            rowIsLiquid.Properties.FieldName = "IsLiquid";
            rowIsLiquid.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowIsLiquid.Properties.RowEdit");
            rowIsLiquid.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowIsLiquid.Properties.SortOrder");
            rowIsLiquid.Properties.ToolTip = resources.GetString("rowIsLiquid.Properties.ToolTip");
            rowIsLiquid.Properties.Value = resources.GetObject("rowIsLiquid.Properties.Value");
            // 
            // rowActive
            // 
            resources.ApplyResources(rowActive, "rowActive");
            rowActive.Name = "rowActive";
            rowActive.Properties.AccessibleDescription = resources.GetString("rowActive.Properties.AccessibleDescription");
            rowActive.Properties.AccessibleName = resources.GetString("rowActive.Properties.AccessibleName");
            rowActive.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowActive.Properties.AccessibleRole");
            rowActive.Properties.Caption = resources.GetString("rowActive.Properties.Caption");
            rowActive.Properties.CustomizationCaption = resources.GetString("rowActive.Properties.CustomizationCaption");
            rowActive.Properties.FieldName = "Active";
            rowActive.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowActive.Properties.RowEdit");
            rowActive.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowActive.Properties.SortOrder");
            rowActive.Properties.ToolTip = resources.GetString("rowActive.Properties.ToolTip");
            rowActive.Properties.Value = resources.GetObject("rowActive.Properties.Value");
            // 
            // category
            // 
            category.ChildRows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowSaltMolecularWeight, rowCationMolecularWeight, rowAnionMolecularWeight, rowPnh4, rowPn, rowPno3 });
            resources.ApplyResources(category, "category");
            category.Name = "category";
            category.Properties.AccessibleDescription = resources.GetString("category.Properties.AccessibleDescription");
            category.Properties.AccessibleName = resources.GetString("category.Properties.AccessibleName");
            category.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("category.Properties.AccessibleRole");
            category.Properties.Caption = resources.GetString("category.Properties.Caption");
            category.Properties.CustomizationCaption = resources.GetString("category.Properties.CustomizationCaption");
            category.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("category.Properties.RowEdit");
            category.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("category.Properties.SortOrder");
            category.Properties.ToolTip = resources.GetString("category.Properties.ToolTip");
            category.Properties.Value = resources.GetObject("category.Properties.Value");
            // 
            // rowSaltMolecularWeight
            // 
            resources.ApplyResources(rowSaltMolecularWeight, "rowSaltMolecularWeight");
            rowSaltMolecularWeight.Name = "rowSaltMolecularWeight";
            rowSaltMolecularWeight.Properties.AccessibleDescription = resources.GetString("rowSaltMolecularWeight.Properties.AccessibleDescription");
            rowSaltMolecularWeight.Properties.AccessibleName = resources.GetString("rowSaltMolecularWeight.Properties.AccessibleName");
            rowSaltMolecularWeight.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowSaltMolecularWeight.Properties.AccessibleRole");
            rowSaltMolecularWeight.Properties.Caption = resources.GetString("rowSaltMolecularWeight.Properties.Caption");
            rowSaltMolecularWeight.Properties.CustomizationCaption = resources.GetString("rowSaltMolecularWeight.Properties.CustomizationCaption");
            rowSaltMolecularWeight.Properties.FieldName = "SaltMolecularWeight";
            rowSaltMolecularWeight.Properties.ReadOnly = true;
            rowSaltMolecularWeight.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowSaltMolecularWeight.Properties.RowEdit");
            rowSaltMolecularWeight.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowSaltMolecularWeight.Properties.SortOrder");
            rowSaltMolecularWeight.Properties.ToolTip = resources.GetString("rowSaltMolecularWeight.Properties.ToolTip");
            rowSaltMolecularWeight.Properties.Value = resources.GetObject("rowSaltMolecularWeight.Properties.Value");
            // 
            // rowCationMolecularWeight
            // 
            resources.ApplyResources(rowCationMolecularWeight, "rowCationMolecularWeight");
            rowCationMolecularWeight.Name = "rowCationMolecularWeight";
            rowCationMolecularWeight.Properties.AccessibleDescription = resources.GetString("rowCationMolecularWeight.Properties.AccessibleDescription");
            rowCationMolecularWeight.Properties.AccessibleName = resources.GetString("rowCationMolecularWeight.Properties.AccessibleName");
            rowCationMolecularWeight.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowCationMolecularWeight.Properties.AccessibleRole");
            rowCationMolecularWeight.Properties.Caption = resources.GetString("rowCationMolecularWeight.Properties.Caption");
            rowCationMolecularWeight.Properties.CustomizationCaption = resources.GetString("rowCationMolecularWeight.Properties.CustomizationCaption");
            rowCationMolecularWeight.Properties.FieldName = "CationMolecularWeight";
            rowCationMolecularWeight.Properties.ReadOnly = true;
            rowCationMolecularWeight.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowCationMolecularWeight.Properties.RowEdit");
            rowCationMolecularWeight.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowCationMolecularWeight.Properties.SortOrder");
            rowCationMolecularWeight.Properties.ToolTip = resources.GetString("rowCationMolecularWeight.Properties.ToolTip");
            rowCationMolecularWeight.Properties.Value = resources.GetObject("rowCationMolecularWeight.Properties.Value");
            // 
            // rowAnionMolecularWeight
            // 
            resources.ApplyResources(rowAnionMolecularWeight, "rowAnionMolecularWeight");
            rowAnionMolecularWeight.Name = "rowAnionMolecularWeight";
            rowAnionMolecularWeight.Properties.AccessibleDescription = resources.GetString("rowAnionMolecularWeight.Properties.AccessibleDescription");
            rowAnionMolecularWeight.Properties.AccessibleName = resources.GetString("rowAnionMolecularWeight.Properties.AccessibleName");
            rowAnionMolecularWeight.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowAnionMolecularWeight.Properties.AccessibleRole");
            rowAnionMolecularWeight.Properties.Caption = resources.GetString("rowAnionMolecularWeight.Properties.Caption");
            rowAnionMolecularWeight.Properties.CustomizationCaption = resources.GetString("rowAnionMolecularWeight.Properties.CustomizationCaption");
            rowAnionMolecularWeight.Properties.FieldName = "AnionMolecularWeight";
            rowAnionMolecularWeight.Properties.ReadOnly = true;
            rowAnionMolecularWeight.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowAnionMolecularWeight.Properties.RowEdit");
            rowAnionMolecularWeight.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowAnionMolecularWeight.Properties.SortOrder");
            rowAnionMolecularWeight.Properties.ToolTip = resources.GetString("rowAnionMolecularWeight.Properties.ToolTip");
            rowAnionMolecularWeight.Properties.Value = resources.GetObject("rowAnionMolecularWeight.Properties.Value");
            // 
            // rowPnh4
            // 
            resources.ApplyResources(rowPnh4, "rowPnh4");
            rowPnh4.Name = "rowPnh4";
            rowPnh4.Properties.AccessibleDescription = resources.GetString("rowPnh4.Properties.AccessibleDescription");
            rowPnh4.Properties.AccessibleName = resources.GetString("rowPnh4.Properties.AccessibleName");
            rowPnh4.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowPnh4.Properties.AccessibleRole");
            rowPnh4.Properties.Caption = resources.GetString("rowPnh4.Properties.Caption");
            rowPnh4.Properties.CustomizationCaption = resources.GetString("rowPnh4.Properties.CustomizationCaption");
            rowPnh4.Properties.FieldName = "Pnh4";
            rowPnh4.Properties.ReadOnly = true;
            rowPnh4.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowPnh4.Properties.RowEdit");
            rowPnh4.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowPnh4.Properties.SortOrder");
            rowPnh4.Properties.ToolTip = resources.GetString("rowPnh4.Properties.ToolTip");
            rowPnh4.Properties.Value = resources.GetObject("rowPnh4.Properties.Value");
            // 
            // rowPn
            // 
            resources.ApplyResources(rowPn, "rowPn");
            rowPn.Name = "rowPn";
            rowPn.Properties.AccessibleDescription = resources.GetString("rowPn.Properties.AccessibleDescription");
            rowPn.Properties.AccessibleName = resources.GetString("rowPn.Properties.AccessibleName");
            rowPn.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowPn.Properties.AccessibleRole");
            rowPn.Properties.Caption = resources.GetString("rowPn.Properties.Caption");
            rowPn.Properties.CustomizationCaption = resources.GetString("rowPn.Properties.CustomizationCaption");
            rowPn.Properties.FieldName = "Pn";
            rowPn.Properties.ReadOnly = true;
            rowPn.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowPn.Properties.RowEdit");
            rowPn.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowPn.Properties.SortOrder");
            rowPn.Properties.ToolTip = resources.GetString("rowPn.Properties.ToolTip");
            rowPn.Properties.Value = resources.GetObject("rowPn.Properties.Value");
            // 
            // rowPno3
            // 
            resources.ApplyResources(rowPno3, "rowPno3");
            rowPno3.Name = "rowPno3";
            rowPno3.Properties.AccessibleDescription = resources.GetString("rowPno3.Properties.AccessibleDescription");
            rowPno3.Properties.AccessibleName = resources.GetString("rowPno3.Properties.AccessibleName");
            rowPno3.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowPno3.Properties.AccessibleRole");
            rowPno3.Properties.Caption = resources.GetString("rowPno3.Properties.Caption");
            rowPno3.Properties.CustomizationCaption = resources.GetString("rowPno3.Properties.CustomizationCaption");
            rowPno3.Properties.FieldName = "Pno3";
            rowPno3.Properties.ReadOnly = true;
            rowPno3.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowPno3.Properties.RowEdit");
            rowPno3.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowPno3.Properties.SortOrder");
            rowPno3.Properties.ToolTip = resources.GetString("rowPno3.Properties.ToolTip");
            rowPno3.Properties.Value = resources.GetObject("rowPno3.Properties.Value");
            // 
            // vGridControl1
            // 
            resources.ApplyResources(vGridControl1, "vGridControl1");
            vGridControl1.Cursor = System.Windows.Forms.Cursors.SizeWE;
            vGridControl1.DataSource = fertilizerChemistryBindingSource;
            vGridControl1.Name = "vGridControl1";
            vGridControl1.OptionsView.MinRowAutoHeight = 12;
            vGridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] { repositoryItemCheckEdit2 });
            vGridControl1.Rows.AddRange(new DevExpress.XtraVerticalGrid.Rows.BaseRow[] { rowPurity, rowDensity, rowSolubility0, rowSolubility20, rowSolubility40, rowFormula, rowIspHAdjuster });
            // 
            // repositoryItemCheckEdit2
            // 
            resources.ApplyResources(repositoryItemCheckEdit2, "repositoryItemCheckEdit2");
            repositoryItemCheckEdit2.Name = "repositoryItemCheckEdit2";
            // 
            // rowPurity
            // 
            resources.ApplyResources(rowPurity, "rowPurity");
            rowPurity.Name = "rowPurity";
            rowPurity.Properties.AccessibleDescription = resources.GetString("rowPurity.Properties.AccessibleDescription");
            rowPurity.Properties.AccessibleName = resources.GetString("rowPurity.Properties.AccessibleName");
            rowPurity.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowPurity.Properties.AccessibleRole");
            rowPurity.Properties.Caption = resources.GetString("rowPurity.Properties.Caption");
            rowPurity.Properties.CustomizationCaption = resources.GetString("rowPurity.Properties.CustomizationCaption");
            rowPurity.Properties.FieldName = "Purity";
            rowPurity.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowPurity.Properties.RowEdit");
            rowPurity.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowPurity.Properties.SortOrder");
            rowPurity.Properties.ToolTip = resources.GetString("rowPurity.Properties.ToolTip");
            rowPurity.Properties.Value = resources.GetObject("rowPurity.Properties.Value");
            // 
            // rowDensity
            // 
            resources.ApplyResources(rowDensity, "rowDensity");
            rowDensity.Name = "rowDensity";
            rowDensity.Properties.AccessibleDescription = resources.GetString("rowDensity.Properties.AccessibleDescription");
            rowDensity.Properties.AccessibleName = resources.GetString("rowDensity.Properties.AccessibleName");
            rowDensity.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowDensity.Properties.AccessibleRole");
            rowDensity.Properties.Caption = resources.GetString("rowDensity.Properties.Caption");
            rowDensity.Properties.CustomizationCaption = resources.GetString("rowDensity.Properties.CustomizationCaption");
            rowDensity.Properties.FieldName = "Density";
            rowDensity.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowDensity.Properties.RowEdit");
            rowDensity.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowDensity.Properties.SortOrder");
            rowDensity.Properties.ToolTip = resources.GetString("rowDensity.Properties.ToolTip");
            rowDensity.Properties.Value = resources.GetObject("rowDensity.Properties.Value");
            // 
            // rowSolubility0
            // 
            resources.ApplyResources(rowSolubility0, "rowSolubility0");
            rowSolubility0.Name = "rowSolubility0";
            rowSolubility0.Properties.AccessibleDescription = resources.GetString("rowSolubility0.Properties.AccessibleDescription");
            rowSolubility0.Properties.AccessibleName = resources.GetString("rowSolubility0.Properties.AccessibleName");
            rowSolubility0.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowSolubility0.Properties.AccessibleRole");
            rowSolubility0.Properties.Caption = resources.GetString("rowSolubility0.Properties.Caption");
            rowSolubility0.Properties.CustomizationCaption = resources.GetString("rowSolubility0.Properties.CustomizationCaption");
            rowSolubility0.Properties.FieldName = "Solubility0";
            rowSolubility0.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowSolubility0.Properties.RowEdit");
            rowSolubility0.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowSolubility0.Properties.SortOrder");
            rowSolubility0.Properties.ToolTip = resources.GetString("rowSolubility0.Properties.ToolTip");
            rowSolubility0.Properties.Value = resources.GetObject("rowSolubility0.Properties.Value");
            // 
            // rowSolubility20
            // 
            resources.ApplyResources(rowSolubility20, "rowSolubility20");
            rowSolubility20.Name = "rowSolubility20";
            rowSolubility20.Properties.AccessibleDescription = resources.GetString("rowSolubility20.Properties.AccessibleDescription");
            rowSolubility20.Properties.AccessibleName = resources.GetString("rowSolubility20.Properties.AccessibleName");
            rowSolubility20.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowSolubility20.Properties.AccessibleRole");
            rowSolubility20.Properties.Caption = resources.GetString("rowSolubility20.Properties.Caption");
            rowSolubility20.Properties.CustomizationCaption = resources.GetString("rowSolubility20.Properties.CustomizationCaption");
            rowSolubility20.Properties.FieldName = "Solubility20";
            rowSolubility20.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowSolubility20.Properties.RowEdit");
            rowSolubility20.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowSolubility20.Properties.SortOrder");
            rowSolubility20.Properties.ToolTip = resources.GetString("rowSolubility20.Properties.ToolTip");
            rowSolubility20.Properties.Value = resources.GetObject("rowSolubility20.Properties.Value");
            // 
            // rowSolubility40
            // 
            resources.ApplyResources(rowSolubility40, "rowSolubility40");
            rowSolubility40.Name = "rowSolubility40";
            rowSolubility40.Properties.AccessibleDescription = resources.GetString("rowSolubility40.Properties.AccessibleDescription");
            rowSolubility40.Properties.AccessibleName = resources.GetString("rowSolubility40.Properties.AccessibleName");
            rowSolubility40.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowSolubility40.Properties.AccessibleRole");
            rowSolubility40.Properties.Caption = resources.GetString("rowSolubility40.Properties.Caption");
            rowSolubility40.Properties.CustomizationCaption = resources.GetString("rowSolubility40.Properties.CustomizationCaption");
            rowSolubility40.Properties.FieldName = "Solubility40";
            rowSolubility40.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowSolubility40.Properties.RowEdit");
            rowSolubility40.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowSolubility40.Properties.SortOrder");
            rowSolubility40.Properties.ToolTip = resources.GetString("rowSolubility40.Properties.ToolTip");
            rowSolubility40.Properties.Value = resources.GetObject("rowSolubility40.Properties.Value");
            // 
            // rowFormula
            // 
            resources.ApplyResources(rowFormula, "rowFormula");
            rowFormula.Name = "rowFormula";
            rowFormula.Properties.AccessibleDescription = resources.GetString("rowFormula.Properties.AccessibleDescription");
            rowFormula.Properties.AccessibleName = resources.GetString("rowFormula.Properties.AccessibleName");
            rowFormula.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowFormula.Properties.AccessibleRole");
            rowFormula.Properties.Caption = resources.GetString("rowFormula.Properties.Caption");
            rowFormula.Properties.CustomizationCaption = resources.GetString("rowFormula.Properties.CustomizationCaption");
            rowFormula.Properties.FieldName = "Formula";
            rowFormula.Properties.RowEdit = (DevExpress.XtraEditors.Repository.RepositoryItem)resources.GetObject("rowFormula.Properties.RowEdit");
            rowFormula.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowFormula.Properties.SortOrder");
            rowFormula.Properties.ToolTip = resources.GetString("rowFormula.Properties.ToolTip");
            rowFormula.Properties.Value = resources.GetObject("rowFormula.Properties.Value");
            // 
            // rowIspHAdjuster
            // 
            resources.ApplyResources(rowIspHAdjuster, "rowIspHAdjuster");
            rowIspHAdjuster.Name = "rowIspHAdjuster";
            rowIspHAdjuster.Properties.AccessibleDescription = resources.GetString("rowIspHAdjuster.Properties.AccessibleDescription");
            rowIspHAdjuster.Properties.AccessibleName = resources.GetString("rowIspHAdjuster.Properties.AccessibleName");
            rowIspHAdjuster.Properties.AccessibleRole = (System.Windows.Forms.AccessibleRole)resources.GetObject("rowIspHAdjuster.Properties.AccessibleRole");
            rowIspHAdjuster.Properties.Caption = resources.GetString("rowIspHAdjuster.Properties.Caption");
            rowIspHAdjuster.Properties.CustomizationCaption = resources.GetString("rowIspHAdjuster.Properties.CustomizationCaption");
            rowIspHAdjuster.Properties.FieldName = "IspHAdjuster";
            rowIspHAdjuster.Properties.RowEdit = repositoryItemCheckEdit2;
            rowIspHAdjuster.Properties.SortOrder = (DevExpress.Data.ColumnSortOrder)resources.GetObject("rowIspHAdjuster.Properties.SortOrder");
            rowIspHAdjuster.Properties.ToolTip = resources.GetString("rowIspHAdjuster.Properties.ToolTip");
            rowIspHAdjuster.Properties.Value = resources.GetObject("rowIspHAdjuster.Properties.Value");
            // 
            // gridControl1
            // 
            resources.ApplyResources(gridControl1, "gridControl1");
            gridControl1.DataSource = fertilizerInputBindingSource;
            gridControl1.EmbeddedNavigator.AccessibleDescription = resources.GetString("gridControl1.EmbeddedNavigator.AccessibleDescription");
            gridControl1.EmbeddedNavigator.AccessibleName = resources.GetString("gridControl1.EmbeddedNavigator.AccessibleName");
            gridControl1.EmbeddedNavigator.AllowHtmlTextInToolTip = (DevExpress.Utils.DefaultBoolean)resources.GetObject("gridControl1.EmbeddedNavigator.AllowHtmlTextInToolTip");
            gridControl1.EmbeddedNavigator.Anchor = (System.Windows.Forms.AnchorStyles)resources.GetObject("gridControl1.EmbeddedNavigator.Anchor");
            gridControl1.EmbeddedNavigator.AutoSize = (bool)resources.GetObject("gridControl1.EmbeddedNavigator.AutoSize");
            gridControl1.EmbeddedNavigator.BackgroundImage = (System.Drawing.Image)resources.GetObject("gridControl1.EmbeddedNavigator.BackgroundImage");
            gridControl1.EmbeddedNavigator.BackgroundImageLayout = (System.Windows.Forms.ImageLayout)resources.GetObject("gridControl1.EmbeddedNavigator.BackgroundImageLayout");
            gridControl1.EmbeddedNavigator.ImeMode = (System.Windows.Forms.ImeMode)resources.GetObject("gridControl1.EmbeddedNavigator.ImeMode");
            gridControl1.EmbeddedNavigator.Margin = (System.Windows.Forms.Padding)resources.GetObject("gridControl1.EmbeddedNavigator.Margin");
            gridControl1.EmbeddedNavigator.MaximumSize = (System.Drawing.Size)resources.GetObject("gridControl1.EmbeddedNavigator.MaximumSize");
            gridControl1.EmbeddedNavigator.TextLocation = (DevExpress.XtraEditors.NavigatorButtonsTextLocation)resources.GetObject("gridControl1.EmbeddedNavigator.TextLocation");
            gridControl1.EmbeddedNavigator.ToolTip = resources.GetString("gridControl1.EmbeddedNavigator.ToolTip");
            gridControl1.EmbeddedNavigator.ToolTipIconType = (DevExpress.Utils.ToolTipIconType)resources.GetObject("gridControl1.EmbeddedNavigator.ToolTipIconType");
            gridControl1.EmbeddedNavigator.ToolTipTitle = resources.GetString("gridControl1.EmbeddedNavigator.ToolTipTitle");
            gridControl1.MainView = gridView1;
            gridControl1.Name = "gridControl1";
            gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] { repositoryItemCheckEdit1, repositoryItemLookUpEdit1, repositoryItemLookUpEditPresentation });
            gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] { gridView1 });
            // 
            // gridView1
            // 
            resources.ApplyResources(gridView1, "gridView1");
            gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] { colSelected, colId, colPresentation, colName, colPrice, colFertilizer });
            gridView1.DetailHeight = 404;
            gridView1.GridControl = gridControl1;
            gridView1.Name = "gridView1";
            gridView1.OptionsEditForm.PopupEditFormWidth = 933;
            gridView1.OptionsView.NewItemRowPosition = DevExpress.XtraGrid.Views.Grid.NewItemRowPosition.Bottom;
            gridView1.InitNewRow += gridView1_InitNewRow;
            gridView1.FocusedRowChanged += gridView1_FocusedRowChanged;
            gridView1.ValidateRow += gridView1_ValidateRow;
            gridView1.RowUpdated += gridView1_RowUpdated;
            // 
            // colSelected
            // 
            resources.ApplyResources(colSelected, "colSelected");
            colSelected.ColumnEdit = repositoryItemCheckEdit1;
            colSelected.FieldName = "Selected";
            colSelected.ImageOptions.ImageKey = resources.GetString("colSelected.ImageOptions.ImageKey");
            colSelected.MinWidth = 23;
            colSelected.Name = "colSelected";
            colSelected.Summary.AddRange(new DevExpress.XtraGrid.GridSummaryItem[] { new DevExpress.XtraGrid.GridColumnSummaryItem() });
            colSelected.UnboundType = DevExpress.Data.UnboundColumnType.Boolean;
            // 
            // repositoryItemCheckEdit1
            // 
            resources.ApplyResources(repositoryItemCheckEdit1, "repositoryItemCheckEdit1");
            repositoryItemCheckEdit1.Name = "repositoryItemCheckEdit1";
            // 
            // colId
            // 
            resources.ApplyResources(colId, "colId");
            colId.FieldName = "Id";
            colId.ImageOptions.ImageKey = resources.GetString("colId.ImageOptions.ImageKey");
            colId.MinWidth = 23;
            colId.Name = "colId";
            // 
            // colPresentation
            // 
            resources.ApplyResources(colPresentation, "colPresentation");
            colPresentation.ColumnEdit = repositoryItemLookUpEditPresentation;
            colPresentation.FieldName = "InputPresentationId";
            colPresentation.ImageOptions.ImageKey = resources.GetString("colPresentation.ImageOptions.ImageKey");
            colPresentation.MinWidth = 23;
            colPresentation.Name = "colPresentation";
            colPresentation.Summary.AddRange(new DevExpress.XtraGrid.GridSummaryItem[] { new DevExpress.XtraGrid.GridColumnSummaryItem() });
            // 
            // repositoryItemLookUpEditPresentation
            // 
            repositoryItemLookUpEditPresentation.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("repositoryItemLookUpEditPresentation.Buttons")) });
            repositoryItemLookUpEditPresentation.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditPresentation.Columns"), resources.GetString("repositoryItemLookUpEditPresentation.Columns1")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditPresentation.Columns2"), resources.GetString("repositoryItemLookUpEditPresentation.Columns3")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEditPresentation.Columns4"), resources.GetString("repositoryItemLookUpEditPresentation.Columns5"), (int)resources.GetObject("repositoryItemLookUpEditPresentation.Columns6"), (DevExpress.Utils.FormatType)resources.GetObject("repositoryItemLookUpEditPresentation.Columns7"), resources.GetString("repositoryItemLookUpEditPresentation.Columns8"), (bool)resources.GetObject("repositoryItemLookUpEditPresentation.Columns9"), (DevExpress.Utils.HorzAlignment)resources.GetObject("repositoryItemLookUpEditPresentation.Columns10"), (DevExpress.Data.ColumnSortOrder)resources.GetObject("repositoryItemLookUpEditPresentation.Columns11"), (DevExpress.Utils.DefaultBoolean)resources.GetObject("repositoryItemLookUpEditPresentation.Columns12")) });
            repositoryItemLookUpEditPresentation.DisplayMember = "Name";
            repositoryItemLookUpEditPresentation.Name = "repositoryItemLookUpEditPresentation";
            repositoryItemLookUpEditPresentation.ValueMember = "Id";
            // 
            // colName
            // 
            resources.ApplyResources(colName, "colName");
            colName.FieldName = "Name";
            colName.ImageOptions.ImageKey = resources.GetString("colName.ImageOptions.ImageKey");
            colName.MinWidth = 23;
            colName.Name = "colName";
            // 
            // colPrice
            // 
            resources.ApplyResources(colPrice, "colPrice");
            colPrice.FieldName = "Price";
            colPrice.ImageOptions.ImageKey = resources.GetString("colPrice.ImageOptions.ImageKey");
            colPrice.MinWidth = 23;
            colPrice.Name = "colPrice";
            // 
            // colFertilizer
            // 
            resources.ApplyResources(colFertilizer, "colFertilizer");
            colFertilizer.ColumnEdit = repositoryItemLookUpEdit1;
            colFertilizer.FieldName = "FertilizerId";
            colFertilizer.ImageOptions.ImageKey = resources.GetString("colFertilizer.ImageOptions.ImageKey");
            colFertilizer.Name = "colFertilizer";
            colFertilizer.Summary.AddRange(new DevExpress.XtraGrid.GridSummaryItem[] { new DevExpress.XtraGrid.GridColumnSummaryItem() });
            // 
            // repositoryItemLookUpEdit1
            // 
            repositoryItemLookUpEdit1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("repositoryItemLookUpEdit1.Buttons")) });
            repositoryItemLookUpEdit1.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEdit1.Columns"), resources.GetString("repositoryItemLookUpEdit1.Columns1")), new DevExpress.XtraEditors.Controls.LookUpColumnInfo(resources.GetString("repositoryItemLookUpEdit1.Columns2"), resources.GetString("repositoryItemLookUpEdit1.Columns3")) });
            repositoryItemLookUpEdit1.DisplayMember = "Name";
            repositoryItemLookUpEdit1.KeyMember = "Id";
            repositoryItemLookUpEdit1.Name = "repositoryItemLookUpEdit1";
            repositoryItemLookUpEdit1.ValueMember = "Id";
            // 
            // layoutControlGroup1
            // 
            resources.ApplyResources(layoutControlGroup1, "layoutControlGroup1");
            layoutControlGroup1.BackgroundImageOptions.ImageKey = resources.GetString("layoutControlGroup1.BackgroundImageOptions.ImageKey");
            layoutControlGroup1.CaptionImageOptions.ImageKey = resources.GetString("layoutControlGroup1.CaptionImageOptions.ImageKey");
            layoutControlGroup1.ContentImageOptions.ImageKey = resources.GetString("layoutControlGroup1.ContentImageOptions.ImageKey");
            layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            layoutControlGroup1.GroupBordersVisible = false;
            layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlItem1, layoutControlItem2, layoutControlItem3 });
            layoutControlGroup1.Name = "layoutControlGroup1";
            layoutControlGroup1.Size = new System.Drawing.Size(1344, 684);
            layoutControlGroup1.TextVisible = false;
            // 
            // layoutControlItem1
            // 
            resources.ApplyResources(layoutControlItem1, "layoutControlItem1");
            layoutControlItem1.Control = gridControl1;
            layoutControlItem1.ImageOptions.ImageKey = resources.GetString("layoutControlItem1.ImageOptions.ImageKey");
            layoutControlItem1.Location = new System.Drawing.Point(0, 0);
            layoutControlItem1.Name = "layoutControlItem1";
            layoutControlItem1.Size = new System.Drawing.Size(990, 664);
            layoutControlItem1.TextLocation = DevExpress.Utils.Locations.Top;
            layoutControlItem1.TextSize = new System.Drawing.Size(116, 13);
            // 
            // layoutControlItem2
            // 
            resources.ApplyResources(layoutControlItem2, "layoutControlItem2");
            layoutControlItem2.Control = vGridControl1;
            layoutControlItem2.ImageOptions.ImageKey = resources.GetString("layoutControlItem2.ImageOptions.ImageKey");
            layoutControlItem2.Location = new System.Drawing.Point(990, 232);
            layoutControlItem2.Name = "layoutControlItem2";
            layoutControlItem2.Size = new System.Drawing.Size(334, 432);
            layoutControlItem2.TextLocation = DevExpress.Utils.Locations.Top;
            layoutControlItem2.TextSize = new System.Drawing.Size(116, 13);
            // 
            // layoutControlItem3
            // 
            resources.ApplyResources(layoutControlItem3, "layoutControlItem3");
            layoutControlItem3.Control = vGridControl2;
            layoutControlItem3.ImageOptions.ImageKey = resources.GetString("layoutControlItem3.ImageOptions.ImageKey");
            layoutControlItem3.Location = new System.Drawing.Point(990, 0);
            layoutControlItem3.Name = "layoutControlItem3";
            layoutControlItem3.Size = new System.Drawing.Size(334, 232);
            layoutControlItem3.TextLocation = DevExpress.Utils.Locations.Top;
            layoutControlItem3.TextSize = new System.Drawing.Size(116, 13);
            // 
            // SubFrmFertilizerInputs
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(layoutControl1);
            Name = "SubFrmFertilizerInputs";
            Load += SubFrmFertilizerInputs_Load;
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            layoutControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)vGridControl2).EndInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)vGridControl1).EndInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerChemistryBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemCheckEdit2).EndInit();
            ((System.ComponentModel.ISupportInitialize)gridControl1).EndInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerInputBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)gridView1).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemCheckEdit1).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEditPresentation).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEdit1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem2).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraGrid.GridControl gridControl1;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        private DevExpress.XtraGrid.Columns.GridColumn colSelected;
        private DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit repositoryItemCheckEdit1;
        private DevExpress.XtraGrid.Columns.GridColumn colId;
        private DevExpress.XtraGrid.Columns.GridColumn colPresentation;
        private DevExpress.XtraGrid.Columns.GridColumn colName;
        private DevExpress.XtraGrid.Columns.GridColumn colPrice;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup1;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem1;
        private System.Windows.Forms.BindingSource fertilizerInputBindingSource;
        private DevExpress.XtraVerticalGrid.VGridControl vGridControl1;
        private System.Windows.Forms.BindingSource fertilizerChemistryBindingSource;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowPurity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowDensity;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSolubility0;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSolubility20;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSolubility40;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowFormula;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem2;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowIspHAdjuster;
        private DevExpress.XtraEditors.Repository.RepositoryItemCheckEdit repositoryItemCheckEdit2;
        private DevExpress.XtraGrid.Columns.GridColumn colFertilizer;
        private DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit repositoryItemLookUpEdit1;
        private System.Windows.Forms.BindingSource fertilizerBindingSource;
        private DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit repositoryItemLookUpEditPresentation;
        private DevExpress.XtraVerticalGrid.VGridControl vGridControl2;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowManufacturer;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowIsLiquid;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowSaltMolecularWeight;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowCationMolecularWeight;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowAnionMolecularWeight;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowPnh4;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowPn;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowPno3;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowId;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowName;
        private DevExpress.XtraVerticalGrid.Rows.EditorRow rowActive;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem3;
        private DevExpress.XtraVerticalGrid.Rows.CategoryRow category;
    }
}
