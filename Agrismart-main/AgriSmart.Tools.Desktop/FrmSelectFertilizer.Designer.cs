namespace AgriSmart.Tools.Desktop
{
    partial class FrmSelectFertilizer
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmSelectFertilizer));
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            panelControl = new DevExpress.XtraEditors.PanelControl();
            simpleButton1 = new DevExpress.XtraEditors.SimpleButton();
            layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
            layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem2 = new DevExpress.XtraLayout.LayoutControlItem();
            fertilizerInputBindingSource = new System.Windows.Forms.BindingSource(components);
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            layoutControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)panelControl).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem2).BeginInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerInputBindingSource).BeginInit();
            SuspendLayout();
            // 
            // layoutControl1
            // 
            resources.ApplyResources(layoutControl1, "layoutControl1");
            layoutControl1.Controls.Add(panelControl);
            layoutControl1.Controls.Add(simpleButton1);
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = layoutControlGroup1;
            // 
            // panelControl
            // 
            resources.ApplyResources(panelControl, "panelControl");
            panelControl.Name = "panelControl";
            // 
            // simpleButton1
            // 
            resources.ApplyResources(simpleButton1, "simpleButton1");
            simpleButton1.ImageOptions.ImageKey = resources.GetString("simpleButton1.ImageOptions.ImageKey");
            simpleButton1.Name = "simpleButton1";
            simpleButton1.StyleController = layoutControl1;
            simpleButton1.Click += simpleButton1_Click;
            // 
            // layoutControlGroup1
            // 
            resources.ApplyResources(layoutControlGroup1, "layoutControlGroup1");
            layoutControlGroup1.BackgroundImageOptions.ImageKey = resources.GetString("layoutControlGroup1.BackgroundImageOptions.ImageKey");
            layoutControlGroup1.CaptionImageOptions.ImageKey = resources.GetString("layoutControlGroup1.CaptionImageOptions.ImageKey");
            layoutControlGroup1.ContentImageOptions.ImageKey = resources.GetString("layoutControlGroup1.ContentImageOptions.ImageKey");
            layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            layoutControlGroup1.GroupBordersVisible = false;
            layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlItem1, layoutControlItem2 });
            layoutControlGroup1.Name = "layoutControlGroup1";
            layoutControlGroup1.Size = new System.Drawing.Size(1205, 593);
            layoutControlGroup1.TextVisible = false;
            // 
            // layoutControlItem1
            // 
            resources.ApplyResources(layoutControlItem1, "layoutControlItem1");
            layoutControlItem1.Control = simpleButton1;
            layoutControlItem1.ImageOptions.ImageKey = resources.GetString("layoutControlItem1.ImageOptions.ImageKey");
            layoutControlItem1.Location = new System.Drawing.Point(0, 547);
            layoutControlItem1.Name = "layoutControlItem1";
            layoutControlItem1.Size = new System.Drawing.Size(1185, 26);
            layoutControlItem1.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem1.TextVisible = false;
            // 
            // layoutControlItem2
            // 
            resources.ApplyResources(layoutControlItem2, "layoutControlItem2");
            layoutControlItem2.Control = panelControl;
            layoutControlItem2.ImageOptions.ImageKey = resources.GetString("layoutControlItem2.ImageOptions.ImageKey");
            layoutControlItem2.Location = new System.Drawing.Point(0, 0);
            layoutControlItem2.Name = "layoutControlItem2";
            layoutControlItem2.Size = new System.Drawing.Size(1185, 547);
            layoutControlItem2.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem2.TextVisible = false;
            // 
            // fertilizerInputBindingSource
            // 
            fertilizerInputBindingSource.DataSource = typeof(Core.Entities.FertilizerInput);
            // 
            // FrmSelectFertilizer
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(layoutControl1);
            Name = "FrmSelectFertilizer";
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            layoutControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)panelControl).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem2).EndInit();
            ((System.ComponentModel.ISupportInitialize)fertilizerInputBindingSource).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup1;
        private DevExpress.XtraEditors.SimpleButton simpleButton1;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem1;
        private System.Windows.Forms.BindingSource fertilizerInputBindingSource;
        private DevExpress.XtraEditors.PanelControl panelControl;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem2;
    }
}