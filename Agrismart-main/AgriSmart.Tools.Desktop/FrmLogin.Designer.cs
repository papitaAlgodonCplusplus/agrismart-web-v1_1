namespace AgriSmart.Tools.Desktop
{
    partial class FrmLogin
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FrmLogin));
            layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
            cmbLanguage = new DevExpress.XtraEditors.ComboBoxEdit();
            pictureBox1 = new System.Windows.Forms.PictureBox();
            simpleButtonCancel = new DevExpress.XtraEditors.SimpleButton();
            simpleButtonOK = new DevExpress.XtraEditors.SimpleButton();
            textEditPassword = new DevExpress.XtraEditors.TextEdit();
            textEditUserName = new DevExpress.XtraEditors.TextEdit();
            layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
            layoutControlItemUserName = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItemPassword = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem3 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem4 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItem5 = new DevExpress.XtraLayout.LayoutControlItem();
            layoutControlItemLanguage = new DevExpress.XtraLayout.LayoutControlItem();
            ((System.ComponentModel.ISupportInitialize)layoutControl1).BeginInit();
            layoutControl1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)cmbLanguage.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)textEditPassword.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)textEditUserName.Properties).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemUserName).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemPassword).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem4).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem5).BeginInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemLanguage).BeginInit();
            SuspendLayout();
            // 
            // layoutControl1
            // 
            resources.ApplyResources(layoutControl1, "layoutControl1");
            layoutControl1.Controls.Add(cmbLanguage);
            layoutControl1.Controls.Add(pictureBox1);
            layoutControl1.Controls.Add(simpleButtonCancel);
            layoutControl1.Controls.Add(simpleButtonOK);
            layoutControl1.Controls.Add(textEditPassword);
            layoutControl1.Controls.Add(textEditUserName);
            layoutControl1.Name = "layoutControl1";
            layoutControl1.Root = layoutControlGroup1;
            // 
            // cmbLanguage
            // 
            resources.ApplyResources(cmbLanguage, "cmbLanguage");
            cmbLanguage.Name = "cmbLanguage";
            cmbLanguage.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] { new DevExpress.XtraEditors.Controls.EditorButton((DevExpress.XtraEditors.Controls.ButtonPredefines)resources.GetObject("cmbLanguage.Properties.Buttons")) });
            cmbLanguage.StyleController = layoutControl1;
            cmbLanguage.SelectedIndexChanged += cmbLanguage_SelectedIndexChanged;
            // 
            // pictureBox1
            // 
            resources.ApplyResources(pictureBox1, "pictureBox1");
            pictureBox1.Name = "pictureBox1";
            pictureBox1.TabStop = false;
            // 
            // simpleButtonCancel
            // 
            resources.ApplyResources(simpleButtonCancel, "simpleButtonCancel");
            simpleButtonCancel.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            simpleButtonCancel.ImageOptions.ImageKey = resources.GetString("simpleButtonCancel.ImageOptions.ImageKey");
            simpleButtonCancel.Name = "simpleButtonCancel";
            simpleButtonCancel.StyleController = layoutControl1;
            // 
            // simpleButtonOK
            // 
            resources.ApplyResources(simpleButtonOK, "simpleButtonOK");
            simpleButtonOK.ImageOptions.ImageKey = resources.GetString("simpleButtonOK.ImageOptions.ImageKey");
            simpleButtonOK.Name = "simpleButtonOK";
            simpleButtonOK.StyleController = layoutControl1;
            simpleButtonOK.Click += simpleButtonOK_Click;
            // 
            // textEditPassword
            // 
            resources.ApplyResources(textEditPassword, "textEditPassword");
            textEditPassword.Name = "textEditPassword";
            textEditPassword.Properties.PasswordChar = '*';
            textEditPassword.StyleController = layoutControl1;
            // 
            // textEditUserName
            // 
            resources.ApplyResources(textEditUserName, "textEditUserName");
            textEditUserName.Name = "textEditUserName";
            textEditUserName.StyleController = layoutControl1;
            // 
            // layoutControlGroup1
            // 
            resources.ApplyResources(layoutControlGroup1, "layoutControlGroup1");
            layoutControlGroup1.BackgroundImageOptions.ImageKey = resources.GetString("layoutControlGroup1.BackgroundImageOptions.ImageKey");
            layoutControlGroup1.CaptionImageOptions.ImageKey = resources.GetString("layoutControlGroup1.CaptionImageOptions.ImageKey");
            layoutControlGroup1.ContentImageOptions.ImageKey = resources.GetString("layoutControlGroup1.ContentImageOptions.ImageKey");
            layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
            layoutControlGroup1.GroupBordersVisible = false;
            layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[] { layoutControlItemUserName, layoutControlItemPassword, layoutControlItem3, layoutControlItem4, layoutControlItem5, layoutControlItemLanguage });
            layoutControlGroup1.Name = "layoutControlGroup1";
            layoutControlGroup1.Size = new System.Drawing.Size(377, 230);
            layoutControlGroup1.TextVisible = false;
            // 
            // layoutControlItemUserName
            // 
            resources.ApplyResources(layoutControlItemUserName, "layoutControlItemUserName");
            layoutControlItemUserName.Control = textEditUserName;
            layoutControlItemUserName.ImageOptions.ImageKey = resources.GetString("layoutControlItemUserName.ImageOptions.ImageKey");
            layoutControlItemUserName.Location = new System.Drawing.Point(0, 112);
            layoutControlItemUserName.Name = "layoutControlItemUserName";
            layoutControlItemUserName.Size = new System.Drawing.Size(357, 24);
            layoutControlItemUserName.TextSize = new System.Drawing.Size(56, 13);
            // 
            // layoutControlItemPassword
            // 
            resources.ApplyResources(layoutControlItemPassword, "layoutControlItemPassword");
            layoutControlItemPassword.Control = textEditPassword;
            layoutControlItemPassword.ImageOptions.ImageKey = resources.GetString("layoutControlItemPassword.ImageOptions.ImageKey");
            layoutControlItemPassword.Location = new System.Drawing.Point(0, 136);
            layoutControlItemPassword.Name = "layoutControlItemPassword";
            layoutControlItemPassword.Size = new System.Drawing.Size(357, 24);
            layoutControlItemPassword.TextSize = new System.Drawing.Size(56, 13);
            // 
            // layoutControlItem3
            // 
            resources.ApplyResources(layoutControlItem3, "layoutControlItem3");
            layoutControlItem3.Control = simpleButtonOK;
            layoutControlItem3.ImageOptions.ImageKey = resources.GetString("layoutControlItem3.ImageOptions.ImageKey");
            layoutControlItem3.Location = new System.Drawing.Point(0, 184);
            layoutControlItem3.Name = "layoutControlItem3";
            layoutControlItem3.Size = new System.Drawing.Size(179, 26);
            layoutControlItem3.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem3.TextVisible = false;
            // 
            // layoutControlItem4
            // 
            resources.ApplyResources(layoutControlItem4, "layoutControlItem4");
            layoutControlItem4.Control = simpleButtonCancel;
            layoutControlItem4.ImageOptions.ImageKey = resources.GetString("layoutControlItem4.ImageOptions.ImageKey");
            layoutControlItem4.Location = new System.Drawing.Point(179, 184);
            layoutControlItem4.Name = "layoutControlItem4";
            layoutControlItem4.Size = new System.Drawing.Size(178, 26);
            layoutControlItem4.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem4.TextVisible = false;
            // 
            // layoutControlItem5
            // 
            resources.ApplyResources(layoutControlItem5, "layoutControlItem5");
            layoutControlItem5.Control = pictureBox1;
            layoutControlItem5.ImageOptions.ImageKey = resources.GetString("layoutControlItem5.ImageOptions.ImageKey");
            layoutControlItem5.Location = new System.Drawing.Point(0, 0);
            layoutControlItem5.Name = "layoutControlItem5";
            layoutControlItem5.Size = new System.Drawing.Size(357, 112);
            layoutControlItem5.TextSize = new System.Drawing.Size(0, 0);
            layoutControlItem5.TextVisible = false;
            // 
            // layoutControlItemLanguage
            // 
            resources.ApplyResources(layoutControlItemLanguage, "layoutControlItemLanguage");
            layoutControlItemLanguage.Control = cmbLanguage;
            layoutControlItemLanguage.ImageOptions.ImageKey = resources.GetString("layoutControlItemLanguage.ImageOptions.ImageKey");
            layoutControlItemLanguage.Location = new System.Drawing.Point(0, 160);
            layoutControlItemLanguage.Name = "layoutControlItemLanguage";
            layoutControlItemLanguage.Size = new System.Drawing.Size(357, 24);
            layoutControlItemLanguage.TextSize = new System.Drawing.Size(56, 13);
            // 
            // FrmLogin
            // 
            resources.ApplyResources(this, "$this");
            AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            Controls.Add(layoutControl1);
            Name = "FrmLogin";
            Load += FrmLogin_Load;
            ((System.ComponentModel.ISupportInitialize)layoutControl1).EndInit();
            layoutControl1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)cmbLanguage.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            ((System.ComponentModel.ISupportInitialize)textEditPassword.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)textEditUserName.Properties).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlGroup1).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemUserName).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemPassword).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem3).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem4).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItem5).EndInit();
            ((System.ComponentModel.ISupportInitialize)layoutControlItemLanguage).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private DevExpress.XtraLayout.LayoutControl layoutControl1;
        private DevExpress.XtraLayout.LayoutControlGroup layoutControlGroup1;
        private DevExpress.XtraEditors.SimpleButton simpleButtonCancel;
        private DevExpress.XtraEditors.SimpleButton simpleButtonOK;
        private DevExpress.XtraEditors.TextEdit textEditPassword;
        private DevExpress.XtraEditors.TextEdit textEditUserName;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItemUserName;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItemPassword;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem3;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem4;
        private System.Windows.Forms.PictureBox pictureBox1;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItem5;
        private DevExpress.XtraEditors.ComboBoxEdit cmbLanguage;
        private DevExpress.XtraLayout.LayoutControlItem layoutControlItemLanguage;
    }
}