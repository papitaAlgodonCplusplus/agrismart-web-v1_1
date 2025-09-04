namespace AgriSmart.Tools.Desktop
{
    partial class SubFrmInputPresentation
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
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            gridControl1 = new DevExpress.XtraGrid.GridControl();
            inputPresentationBindingSource = new System.Windows.Forms.BindingSource(components);
            gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
            colId = new DevExpress.XtraGrid.Columns.GridColumn();
            colName = new DevExpress.XtraGrid.Columns.GridColumn();
            colDescription = new DevExpress.XtraGrid.Columns.GridColumn();
            colMeasurementUnit = new DevExpress.XtraGrid.Columns.GridColumn();
            repositoryItemLookUpEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
            colQuantity = new DevExpress.XtraGrid.Columns.GridColumn();
            colActive = new DevExpress.XtraGrid.Columns.GridColumn();
            Root = new DevExpress.XtraLayout.LayoutControlGroup();
            layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            layoutControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)gridControl1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)inputPresentationBindingSource).BeginInit();
            ((System.ComponentModel.ISupportInitialize)gridView1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEdit1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)Root).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).BeginInit();
            SuspendLayout();
            // 
            // layoutControl1
            // 
            layoutControl1.Controls.Add(gridControl1);
            layoutControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            layoutControl1.Location = new System.Drawing.Point(0, 0);
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = Root;
            layoutControl1.Size = new System.Drawing.Size(610, 320);
            layoutControl1.TabIndex = 0;
            layoutControl1.Text = "layoutControl1";
            // 
            // gridControl1
            // 
            gridControl1.DataSource = inputPresentationBindingSource;
            gridControl1.Location = new System.Drawing.Point(12, 12);
            gridControl1.MainView = gridView1;
            gridControl1.Name = "gridControl1";
            gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[] { repositoryItemLookUpEdit1 });
            gridControl1.Size = new System.Drawing.Size(586, 296);
            gridControl1.TabIndex = 4;
            gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[] { gridView1 });
            // 
            // inputPresentationBindingSource
            // 
            inputPresentationBindingSource.DataSource = typeof(Core.Entities.InputPresentation);
            // 
            // gridView1
            // 
            gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[] { colId, colName, colDescription, colMeasurementUnit, colQuantity, colActive });
            gridView1.GridControl = gridControl1;
            gridView1.Name = "gridView1";
            gridView1.OptionsView.NewItemRowPosition = DevExpress.XtraGrid.Views.Grid.NewItemRowPosition.Top;
            gridView1.InitNewRow += gridView1_InitNewRow;
            gridView1.ValidateRow += gridView1_ValidateRow;
            // 
            // colId
            // 
            colId.Caption = "Id";
            colId.FieldName = "Id";
            colId.Name = "colId";
            colId.Visible = true;
            colId.VisibleIndex = 0;
            // 
            // colName
            // 
            colName.Caption = "Name";
            colName.FieldName = "Name";
            colName.Name = "colName";
            colName.Visible = true;
            colName.VisibleIndex = 1;
            // 
            // colDescription
            // 
            colDescription.Caption = "Description";
            colDescription.FieldName = "Description";
            colDescription.Name = "colDescription";
            colDescription.Visible = true;
            colDescription.VisibleIndex = 2;
            // 
            // colMeasurementUnit
            // 
            colMeasurementUnit.Caption = "Unit";
            colMeasurementUnit.ColumnEdit = repositoryItemLookUpEdit1;
            colMeasurementUnit.FieldName = "MeasurementUnitId";
            colMeasurementUnit.Name = "colMeasurementUnit";
            colMeasurementUnit.Visible = true;
            colMeasurementUnit.VisibleIndex = 3;
            // 
            // repositoryItemLookUpEdit1
            // 
            repositoryItemLookUpEdit1.AutoHeight = false;
            repositoryItemLookUpEdit1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo) });
            repositoryItemLookUpEdit1.Columns.AddRange(new DevExpress.XtraEditors.Controls.LookUpColumnInfo[] { new DevExpress.XtraEditors.Controls.LookUpColumnInfo("Name", "Name"), new DevExpress.XtraEditors.Controls.LookUpColumnInfo("Symbol", "Symbol") });
            repositoryItemLookUpEdit1.DisplayMember = "Name";
            repositoryItemLookUpEdit1.Name = "repositoryItemLookUpEdit1";
            repositoryItemLookUpEdit1.ValueMember = "Id";
            repositoryItemLookUpEdit1.EditValueChanged += repositoryItemLookUpEdit1_EditValueChanged;
            // 
            // colQuantity
            // 
            colQuantity.Caption = "Quantity";
            colQuantity.FieldName = "Quantity";
            colQuantity.Name = "colQuantity";
            colQuantity.Visible = true;
            colQuantity.VisibleIndex = 4;
            // 
            // colActive
            // 
            colActive.Caption = "Active";
            colActive.FieldName = "Active";
            colActive.Name = "colActive";
            colActive.Visible = true;
            colActive.VisibleIndex = 5;
            // 
            // Root
            // 
            Root.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            Root.GroupBordersVisible = false;
            Root.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlItem1 });
            Root.Name = "Root";
            Root.Size = new System.Drawing.Size(610, 320);
            Root.TextVisible = false;
            // 
            // layoutControlItem1
            // 
            layoutControlItem1.Control = gridControl1;
            layoutControlItem1.Location = new System.Drawing.Point(0, 0);
            layoutControlItem1.Name = "layoutControlItem1";
            layoutControlItem1.Size = new System.Drawing.Size(590, 300);
            layoutControlItem1.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem1.TextVisible = false;
            // 
            // SubFrmInputPresentation
            // 
            AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(layoutControl1);
            Name = "SubFrmInputPresentation";
            Size = new System.Drawing.Size(610, 320);
            Load += SubFormInputPresentation_Load;
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            layoutControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)gridControl1).EndInit();
            ((System.ComponentModel.ISupportInitialize)inputPresentationBindingSource).EndInit();
            ((System.ComponentModel.ISupportInitialize)gridView1).EndInit();
            ((System.ComponentModel.ISupportInitialize)repositoryItemLookUpEdit1).EndInit();
            ((System.ComponentModel.ISupportInitialize)Root).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraGrid.GridControl gridControl1;
        private System.Windows.Forms.BindingSource inputPresentationBindingSource;
        private DevExpress.XtraGrid.Views.Grid.GridView gridView1;
        private DevExpress.XtraGrid.Columns.GridColumn colId;
        private DevExpress.XtraGrid.Columns.GridColumn colName;
        private DevExpress.XtraGrid.Columns.GridColumn colDescription;
        private DevExpress.XtraGrid.Columns.GridColumn colMeasurementUnit;
        private DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit repositoryItemLookUpEdit1;
        private DevExpress.XtraGrid.Columns.GridColumn colQuantity;
        private DevExpress.XtraGrid.Columns.GridColumn colActive;
        private DevExpress.XtraLayout.LayoutControlGroup Root;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem1;
    }
}
