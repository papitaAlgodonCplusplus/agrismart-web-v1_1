namespace AgriSmart.Tools.Desktop
{
    partial class FrmInputPresentations
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmInputPresentations));
            ribbonControl1 = new DevExpress.XtraBars.Ribbon.RibbonControl();
            barButtonItemSave = new DevExpress.XtraBars.BarButtonItem();
            ribbonPage1 = new DevExpress.XtraBars.Ribbon.RibbonPage();
            ribbonPageGroup1 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            Root = new DevExpress.XtraLayout.LayoutControlGroup();
            panelControl = new DevExpress.XtraEditors.PanelControl();
            ((System.ComponentModel.ISupportInitialize)ribbonControl1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)Root).BeginInit();
            ((System.ComponentModel.ISupportInitialize)panelControl).BeginInit();
            SuspendLayout();
            // 
            // ribbonControl1
            // 
            ribbonControl1.ExpandCollapseItem.Id = 0;
            ribbonControl1.Items.AddRange(new DevExpress.XtraBars.BarItem[] { ribbonControl1.ExpandCollapseItem, barButtonItemSave });
            resources.ApplyResources(ribbonControl1, "ribbonControl1");
            ribbonControl1.MaxItemId = 2;
            ribbonControl1.Name = "ribbonControl1";
            ribbonControl1.Pages.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPage[] { ribbonPage1 });
            // 
            // barButtonItemSave
            // 
            resources.ApplyResources(barButtonItemSave, "barButtonItemSave");
            barButtonItemSave.Id = 1;
            barButtonItemSave.ImageOptions.LargeImage = (System.Drawing.Image)resources.GetObject("barButtonItemSave.ImageOptions.LargeImage");
            barButtonItemSave.Name = "barButtonItemSave";
            barButtonItemSave.RibbonStyle = DevExpress.XtraBars.Ribbon.RibbonItemStyles.Large;
            barButtonItemSave.ItemClick += barButtonItemSave_ItemClick;
            // 
            // ribbonPage1
            // 
            ribbonPage1.Groups.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPageGroup[] { ribbonPageGroup1 });
            ribbonPage1.Name = "ribbonPage1";
            resources.ApplyResources(ribbonPage1, "ribbonPage1");
            // 
            // ribbonPageGroup1
            // 
            ribbonPageGroup1.ItemLinks.Add(barButtonItemSave);
            ribbonPageGroup1.Name = "ribbonPageGroup1";
            resources.ApplyResources(ribbonPageGroup1, "ribbonPageGroup1");
            // 
            // layoutControl1
            // 
            resources.ApplyResources(layoutControl1, "layoutControl1");
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = Root;
            // 
            // Root
            // 
            Root.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            Root.GroupBordersVisible = false;
            Root.Name = "Root";
            Root.Size = new System.Drawing.Size(883, 330);
            Root.TextVisible = false;
            // 
            // panelControl
            // 
            resources.ApplyResources(panelControl, "panelControl");
            panelControl.Name = "panelControl";
            // 
            // FrmInputPresentations
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(panelControl);
            Controls.Add(layoutControl1);
            Controls.Add(ribbonControl1);
            Name = "FrmInputPresentations";
            Load += FrmCRUDInputPresentations_Load;
            ((System.ComponentModel.ISupportInitialize)ribbonControl1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            ((System.ComponentModel.ISupportInitialize)Root).EndInit();
            ((System.ComponentModel.ISupportInitialize)panelControl).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private DevExpress.XtraBars.Ribbon.RibbonControl ribbonControl1;
        private DevExpress.XtraBars.Ribbon.RibbonPage ribbonPage1;
        private DevExpress.XtraBars.Ribbon.RibbonPageGroup ribbonPageGroup1;
        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraLayout.LayoutControlGroup Root;
        private DevExpress.XtraEditors.PanelControl panelControl;
        private DevExpress.XtraBars.BarButtonItem barButtonItemSave;
    }
}