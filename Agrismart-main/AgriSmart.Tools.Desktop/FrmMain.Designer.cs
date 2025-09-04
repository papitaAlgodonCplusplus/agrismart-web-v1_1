namespace AgriSmart.Tools.Desktop
{
    partial class FrmMain
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmMain));
            ribbon = new DevExpress.XtraBars.Ribbon.RibbonControl();
            barButtonItem1 = new DevExpress.XtraBars.BarButtonItem();
            ribbonPageSystem = new DevExpress.XtraBars.Ribbon.RibbonPage();
            ribbonPageGroup1 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
            ribbonStatusBar = new DevExpress.XtraBars.Ribbon.RibbonStatusBar();
            navBarControl1 = new DevExpress.XtraNavBar.NavBarControl();
            navBarGroupInputs = new DevExpress.XtraNavBar.NavBarGroup();
            navBarItemFertilizer = new DevExpress.XtraNavBar.NavBarItem();
            navBarItemWater = new DevExpress.XtraNavBar.NavBarItem();
            navBarGroupProductionUnits = new DevExpress.XtraNavBar.NavBarGroup();
            navBarItemFarm = new DevExpress.XtraNavBar.NavBarItem();
            navBarItemProductionUnit = new DevExpress.XtraNavBar.NavBarItem();
            navBarItem1 = new DevExpress.XtraNavBar.NavBarItem();
            navBarGroupTools = new DevExpress.XtraNavBar.NavBarGroup();
            navBarItemSolutionFormulation = new DevExpress.XtraNavBar.NavBarItem();
            navBarItemRequirements = new DevExpress.XtraNavBar.NavBarItem();
            ((System.ComponentModel.ISupportInitialize)ribbon).BeginInit();
            ((System.ComponentModel.ISupportInitialize)navBarControl1).BeginInit();
            SuspendLayout();
            // 
            // ribbon
            // 
            ribbon.ExpandCollapseItem.Id = 0;
            ribbon.Items.AddRange(new DevExpress.XtraBars.BarItem[] { ribbon.ExpandCollapseItem, barButtonItem1 });
            resources.ApplyResources(ribbon, "ribbon");
            ribbon.MaxItemId = 2;
            ribbon.Name = "ribbon";
            ribbon.Pages.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPage[] { ribbonPageSystem });
            ribbon.StatusBar = ribbonStatusBar;
            // 
            // barButtonItem1
            // 
            resources.ApplyResources(barButtonItem1, "barButtonItem1");
            barButtonItem1.Id = 1;
            barButtonItem1.ImageOptions.Image = (System.Drawing.Image)resources.GetObject("barButtonItem1.ImageOptions.Image");
            barButtonItem1.ImageOptions.LargeImage = (System.Drawing.Image)resources.GetObject("barButtonItem1.ImageOptions.LargeImage");
            barButtonItem1.Name = "barButtonItem1";
            barButtonItem1.ItemClick += barButtonItem1_ItemClick;
            // 
            // ribbonPageSystem
            // 
            ribbonPageSystem.Groups.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPageGroup[] { ribbonPageGroup1 });
            ribbonPageSystem.Name = "ribbonPageSystem";
            resources.ApplyResources(ribbonPageSystem, "ribbonPageSystem");
            // 
            // ribbonPageGroup1
            // 
            ribbonPageGroup1.ItemLinks.Add(barButtonItem1);
            ribbonPageGroup1.Name = "ribbonPageGroup1";
            resources.ApplyResources(ribbonPageGroup1, "ribbonPageGroup1");
            // 
            // ribbonStatusBar
            // 
            resources.ApplyResources(ribbonStatusBar, "ribbonStatusBar");
            ribbonStatusBar.Name = "ribbonStatusBar";
            ribbonStatusBar.Ribbon = ribbon;
            // 
            // navBarControl1
            // 
            navBarControl1.ActiveGroup = navBarGroupInputs;
            resources.ApplyResources(navBarControl1, "navBarControl1");
            navBarControl1.Groups.AddRange(new DevExpress.XtraNavBar.NavBarGroup[] { navBarGroupProductionUnits, navBarGroupInputs, navBarGroupTools });
            navBarControl1.Items.AddRange(new DevExpress.XtraNavBar.NavBarItem[] { navBarItemFertilizer, navBarItemSolutionFormulation, navBarItemWater, navBarItemFarm, navBarItemProductionUnit, navBarItem1, navBarItemRequirements });
            navBarControl1.Name = "navBarControl1";
            navBarControl1.OptionsNavPane.ExpandedWidth = (int)resources.GetObject("resource.ExpandedWidth");
            navBarControl1.View = new DevExpress.XtraNavBar.ViewInfo.StandardSkinExplorerBarViewInfoRegistrator("DevExpress Style");
            navBarControl1.Click += navBarControl1_Click;
            // 
            // navBarGroupInputs
            // 
            resources.ApplyResources(navBarGroupInputs, "navBarGroupInputs");
            navBarGroupInputs.Expanded = true;
            navBarGroupInputs.ItemLinks.AddRange(new DevExpress.XtraNavBar.NavBarItemLink[] { new DevExpress.XtraNavBar.NavBarItemLink(navBarItemFertilizer), new DevExpress.XtraNavBar.NavBarItemLink(navBarItemWater) });
            navBarGroupInputs.Name = "navBarGroupInputs";
            // 
            // navBarItemFertilizer
            // 
            resources.ApplyResources(navBarItemFertilizer, "navBarItemFertilizer");
            navBarItemFertilizer.ImageOptions.SmallImage = (System.Drawing.Image)resources.GetObject("navBarItemFertilizer.ImageOptions.SmallImage");
            navBarItemFertilizer.Name = "navBarItemFertilizer";
            navBarItemFertilizer.LinkClicked += navBarItemFertilizer_LinkClicked;
            // 
            // navBarItemWater
            // 
            resources.ApplyResources(navBarItemWater, "navBarItemWater");
            navBarItemWater.ImageOptions.SmallImage = (System.Drawing.Image)resources.GetObject("navBarItemWater.ImageOptions.SmallImage");
            navBarItemWater.Name = "navBarItemWater";
            navBarItemWater.LinkClicked += navBarItemWater_LinkClicked;
            // 
            // navBarGroupProductionUnits
            // 
            resources.ApplyResources(navBarGroupProductionUnits, "navBarGroupProductionUnits");
            navBarGroupProductionUnits.ItemLinks.AddRange(new DevExpress.XtraNavBar.NavBarItemLink[] { new DevExpress.XtraNavBar.NavBarItemLink(navBarItemFarm), new DevExpress.XtraNavBar.NavBarItemLink(navBarItemProductionUnit), new DevExpress.XtraNavBar.NavBarItemLink(navBarItem1) });
            navBarGroupProductionUnits.Name = "navBarGroupProductionUnits";
            // 
            // navBarItemFarm
            // 
            resources.ApplyResources(navBarItemFarm, "navBarItemFarm");
            navBarItemFarm.ImageOptions.LargeImage = (System.Drawing.Image)resources.GetObject("navBarItemFarm.ImageOptions.LargeImage");
            navBarItemFarm.ImageOptions.SmallImage = (System.Drawing.Image)resources.GetObject("navBarItemFarm.ImageOptions.SmallImage");
            navBarItemFarm.ImageOptions.SmallImageIndex = 1;
            navBarItemFarm.Name = "navBarItemFarm";
            // 
            // navBarItemProductionUnit
            // 
            resources.ApplyResources(navBarItemProductionUnit, "navBarItemProductionUnit");
            navBarItemProductionUnit.Name = "navBarItemProductionUnit";
            // 
            // navBarItem1
            // 
            resources.ApplyResources(navBarItem1, "navBarItem1");
            navBarItem1.Name = "navBarItem1";
            // 
            // navBarGroupTools
            // 
            resources.ApplyResources(navBarGroupTools, "navBarGroupTools");
            navBarGroupTools.Expanded = true;
            navBarGroupTools.ItemLinks.AddRange(new DevExpress.XtraNavBar.NavBarItemLink[] { new DevExpress.XtraNavBar.NavBarItemLink(navBarItemSolutionFormulation), new DevExpress.XtraNavBar.NavBarItemLink(navBarItemRequirements) });
            navBarGroupTools.Name = "navBarGroupTools";
            // 
            // navBarItemSolutionFormulation
            // 
            resources.ApplyResources(navBarItemSolutionFormulation, "navBarItemSolutionFormulation");
            navBarItemSolutionFormulation.ImageOptions.SmallImage = (System.Drawing.Image)resources.GetObject("navBarItemSolutionFormulation.ImageOptions.SmallImage");
            navBarItemSolutionFormulation.Name = "navBarItemSolutionFormulation";
            navBarItemSolutionFormulation.LinkClicked += navBarItemSolutionFormulation_LinkClicked;
            // 
            // navBarItemRequirements
            // 
            resources.ApplyResources(navBarItemRequirements, "navBarItemRequirements");
            navBarItemRequirements.ImageOptions.SvgImage = (DevExpress.Utils.Svg.SvgImage)resources.GetObject("navBarItemRequirements.ImageOptions.SvgImage");
            navBarItemRequirements.Name = "navBarItemRequirements";
            // 
            // FrmMain
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(navBarControl1);
            Controls.Add(ribbonStatusBar);
            Controls.Add(ribbon);
            IsMdiContainer = true;
            Name = "FrmMain";
            Ribbon = ribbon;
            StatusBar = ribbonStatusBar;
            WindowState = System.Windows.Forms.FormWindowState.Maximized;
            Load += FrmMain_Load;
            ((System.ComponentModel.ISupportInitialize)ribbon).EndInit();
            ((System.ComponentModel.ISupportInitialize)navBarControl1).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private DevExpress.XtraBars.Ribbon.RibbonControl ribbon;
        private DevExpress.XtraBars.Ribbon.RibbonPage ribbonPageSystem;
        private DevExpress.XtraBars.Ribbon.RibbonPageGroup ribbonPageGroup1;
        private DevExpress.XtraBars.Ribbon.RibbonStatusBar ribbonStatusBar;
        private DevExpress.XtraNavBar.NavBarControl navBarControl1;
        private DevExpress.XtraNavBar.NavBarGroup navBarGroupInputs;
        private DevExpress.XtraNavBar.NavBarItem navBarItemFertilizer;
        private DevExpress.XtraNavBar.NavBarGroup navBarGroupTools;
        private DevExpress.XtraNavBar.NavBarItem navBarItemSolutionFormulation;
        private DevExpress.XtraNavBar.NavBarItem navBarItemWater;
        private DevExpress.XtraBars.BarButtonItem barButtonItem1;
        private DevExpress.XtraNavBar.NavBarGroup navBarGroupProductionUnits;
        private DevExpress.XtraNavBar.NavBarItem navBarItemFarm;
        private DevExpress.XtraNavBar.NavBarItem navBarItemProductionUnit;
        private DevExpress.XtraNavBar.NavBarItem navBarItem1;
        private DevExpress.XtraNavBar.NavBarItem navBarItemRequirements;
    }
}