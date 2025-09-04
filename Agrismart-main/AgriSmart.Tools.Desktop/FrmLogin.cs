using System;
using System.Windows.Forms;
using System.Threading;
using System.ComponentModel;
using AgriSmart.Tools.Services;
using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Desktop.Resources;
using Microsoft.Extensions.DependencyInjection;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmLogin : Form
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IAgriSmartApiClient _apiClient;
        public FrmLogin(IServiceProvider serviceProvider, IAgriSmartApiClient apiClient)
        {
            InitializeComponent();
            _serviceProvider = serviceProvider;
            _apiClient = apiClient;
        }
    

        private void simpleButtonOK_Click(object sender, EventArgs e)
        {
            Login();
        }

        private async void Login()
        {
            UserModel user = await _apiClient.CreateSession(textEditUserName.Text, textEditPassword.Text);

            if (user == null)
            {
                DialogResult dialogResult = MessageBox.Show(FrmResources.loginFail, LoggedUser.getInstance().ErroMessage, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else
            {
                LoggedUser.getInstance().User = user;
                this.DialogResult = DialogResult.OK; // ✅ critical to control startup
                this.Close();
            }

        }
        private void FrmLogin_Load(object sender, EventArgs e)
        {
            LanguageManager.SetLanguages(Thread.CurrentThread.CurrentCulture);
            this.cmbLanguage.Properties.Items.AddRange(LanguageManager.Languages);
            this.cmbLanguage.SelectedIndex = LanguageManager.DefaultIndex;
        }
        private void ChangeForm()
        {
            ComponentResourceManager resourceManager =
                new ComponentResourceManager(this.GetType());

            // apply resources to each control
            resourceManager.ApplyResources(this.simpleButtonOK, this.simpleButtonOK.Name);
            resourceManager.ApplyResources(this.simpleButtonCancel, this.simpleButtonCancel.Name);
            resourceManager.ApplyResources(this.layoutControlItemUserName, this.layoutControlItemUserName.Name);
            resourceManager.ApplyResources(this.layoutControlItemPassword, this.layoutControlItemPassword.Name);
            resourceManager.ApplyResources(this.layoutControlItemLanguage, this.layoutControlItemLanguage.Name);
            resourceManager.ApplyResources(this, "$this");
            
            // apply resources to the form
            //int X = this.Location.X;
            //int Y = this.Location.Y;

            //this.Location = new Point(X, Y);
        }
        private void cmbLanguage_SelectedIndexChanged(object sender, EventArgs e)
        {
            Culture culture = (Culture)this.cmbLanguage.Properties.Items[this.cmbLanguage.SelectedIndex];
            LanguageManager.SetCulture(culture.CultureCode);
            LanguageManager.SetLanguages(Thread.CurrentThread.CurrentCulture);
            this.cmbLanguage.Properties.Items.Clear();
            this.cmbLanguage.Properties.Items.AddRange(LanguageManager.Languages);
            this.cmbLanguage.SelectedIndex = LanguageManager.IndexOf(culture.CultureCode);
            ChangeForm();
        }
    }
}
