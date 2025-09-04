using AgriSmart.Tools.Configuration;
using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Entities;
using AgriSmart.Tools.Desktop.Resources;
using AgriSmart.Tools.Services;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmSessionInfo : Form
    {
        private readonly IAgriSmartApiClient _apiClient;

        public Session session;
        private int catalogId;

        private IList<CompanyModel> companies;
        private IList<CropPhaseModel> cropPhases;

        public FrmSessionInfo(IAgriSmartApiClient apiClient)
        {
            _apiClient = apiClient;

            InitializeComponent();
            splashScreenManager1.ShowWaitForm();

            Thread.Sleep(1000);

            string caption = FrmResources.LoadingCompanies;
            splashScreenManager1.SetWaitFormCaption(caption);
            Thread.Sleep(2000);

            LoadCompanies();

            caption = FrmResources.LoadingCrops;
            splashScreenManager1.SetWaitFormCaption(caption);
            Thread.Sleep(2000);

            Task.Run(() => this.LoadCrops()).Wait();

            splashScreenManager1.CloseWaitForm();
        }
        private async void LoadCompanies()
        {
            var response = await _apiClient.GetCompanies(LoggedUser.getInstance().User.Token);
            companies = response;
            companyModelBindingSource.DataSource = companies;
        }
        private async void LoadCrops()
        {
            var reponse = await _apiClient.GetCrops(LoggedUser.getInstance().User.Token);
            cropModelBindingSource.DataSource = reponse;
        }
        private void btnContinue_Click(object sender, EventArgs e)
        {
            if (dxValidationProvider1.Validate())
            {
                splashScreenManager1.ShowWaitForm();
                string caption = FrmResources.LoadingSessionData;
                splashScreenManager1.SetWaitFormCaption(caption);

                session = new Session(_apiClient);
                session.Name = textEditSessionName.Text;
                session.CatalogId = catalogId;

                caption = FrmResources.LoadingEntities;
                splashScreenManager1.SetWaitFormCaption(caption);

                session.CropPhaseId = Convert.ToInt32(lookUpEditPhase.EditValue);
                session.LoadEntities();

                session.WaterFeaturesCategoryInfo = getFeatureCategoryInfo("WaterQualityFeatureSettings.xml");
                session.WaterFeaturesInfo = getSolutionFeaturesInfo("WaterQualityFeatureSettings.xml");
                session.SolutionFeaturesCategoryInfo = getFeatureCategoryInfo("SolutionQualityFeatureSettings.xml");
                session.SolutionFeaturesInfo = getSolutionFeaturesInfo("SolutionQualityFeatureSettings.xml");

                splashScreenManager1.CloseWaitForm();

                this.DialogResult = DialogResult.OK;
            }
        }
        private List<SolutionFeatureCategoryInfo> getFeatureCategoryInfo(string xmlFileName)
        {
            List<SolutionFeatureCategoryInfo> output = new List<SolutionFeatureCategoryInfo>();

            XmlDocument doc = new XmlDocument();
            string xmlName = @".\XML\" + xmlFileName;
            doc.Load(Path.GetFullPath(System.AppDomain.CurrentDomain.BaseDirectory + xmlName));
            string path = @"/Setting/Categories";

            XmlNodeList nodeList = doc.SelectNodes(path);

            foreach (XmlNode itemNode in nodeList)
            {
                foreach (XmlNode node in itemNode.ChildNodes)
                {
                    char[] delim = { '-' };
                    string[] strArr = System.Threading.Thread.CurrentThread.CurrentUICulture.Name.Split(delim);

                    output.Add(new SolutionFeatureCategoryInfo(node, strArr[0]));
                }

            }
            return output;
        }
        private List<SolutionFeatureInfo> getSolutionFeaturesInfo(string xmlFileName)
        {
            List<SolutionFeatureInfo> output = new List<SolutionFeatureInfo>();

            XmlDocument doc = new XmlDocument();
            string xmlName = @".\XML\" + xmlFileName;
            doc.Load(Path.GetFullPath(System.AppDomain.CurrentDomain.BaseDirectory + xmlName));
            string path = @"/Setting/Features";

            XmlNodeList nodeList = doc.SelectNodes(path);

            foreach (XmlNode itemNode in nodeList)
            {
                foreach (XmlNode node in itemNode.ChildNodes)
                {
                    char[] delim = { '-' };
                    string[] strArr = System.Threading.Thread.CurrentThread.CurrentUICulture.Name.Split(delim);
                    SolutionFeatureInfo newWaterQualityFeatureInfo = new SolutionFeatureInfo(node, strArr[0]);

                    //if (newWaterQualityFeatureInfo.CategoryName != "")
                    //{
                    //    int pos = session.WaterQualityFeatureCategoryInfo.IndexOf(new WaterQualityFeatureCategoryInfo(newWaterQualityFeatureInfo.CategoryName));
                    //    newWaterQualityFeatureInfo.Category = session.WaterQualityFeatureCategoryInfo[pos];
                    //}

                    output.Add(new SolutionFeatureInfo(node, strArr[0]));
                }

            }
            return output;
        }
        private void lookUpEditCompany_EditValueChanged(object sender, EventArgs e)
        {
            if (Convert.ToInt32(lookUpEditCompany.EditValue) != -1)
            {
                splashScreenManager1.ShowWaitForm();
                string caption = FrmResources.LoadingFarms;
                splashScreenManager1.SetWaitFormCaption(caption);
                CompanyModel selectedCompany = (CompanyModel)lookUpEditCompany.GetSelectedDataRow();
                catalogId = selectedCompany.CatalogId;
                Thread.Sleep(2000);
                LoadFarms();

                splashScreenManager1.CloseWaitForm();
            }
        }
        private async void LoadFarms()
        {
            var reponse = await _apiClient.GetFarms(Convert.ToInt32(lookUpEditCompany.EditValue), LoggedUser.getInstance().User.Token);
            farmModelBindingSource.DataSource = reponse;
        }
        private void lookUpEditFarm_EditValueChanged(object sender, EventArgs e)
        {
            splashScreenManager1.ShowWaitForm();

            string caption = FrmResources.LoadingCropProductions;
            splashScreenManager1.SetWaitFormCaption(caption);
            Thread.Sleep(2000);

            LoadCropProductions();

            caption = FrmResources.LoadingProductionUnits;
            splashScreenManager1.SetWaitFormCaption(caption);

            LoadProductionUnits();

            splashScreenManager1.CloseWaitForm();
        }
        private async void LoadCropProductions()
        {
            var reponse = await _apiClient.GetCropProductionsByCompany(Convert.ToInt32(lookUpEditCompany.EditValue), LoggedUser.getInstance().User.Token);
            cropProductionModelBindingSource.DataSource = reponse;
        }
        private async void LoadProductionUnits()
        {
            var reponse = await _apiClient.GetProductionUnits(Convert.ToInt32(lookUpEditFarm.EditValue), LoggedUser.getInstance().User.Token);
            productionUnitModelBindingSource.DataSource = reponse;
        }
        private void gridLookUpEdit1_EditValueChanged(object sender, EventArgs e)
        {
            int cropId = Convert.ToInt32(gridLookUpEdit1View.GetRowCellValue(gridLookUpEdit1View.FocusedRowHandle, "CropId"));

            splashScreenManager1.ShowWaitForm();
            string caption = FrmResources.LoadingCropPhases;
            splashScreenManager1.SetWaitFormCaption(caption);
            Thread.Sleep(2000);

            LoadCropPhases(cropId);

            splashScreenManager1.CloseWaitForm();
        }
        private async void LoadCropPhases(int cropId)
        {
            var response = await _apiClient.GetCropPhases(cropId, LoggedUser.getInstance().User.Token);

            cropPhaseModelBindingSource.DataSource = response;
        }

        private void lookUpEditPhase_EditValueChanged(object sender, EventArgs e)
        {

        }
        private async void LoadCropPhaseSolutionRequirements(int cropPhaseId)
        {
            var response = await _apiClient.GetCropPhaseSolutionRequirement(cropPhaseId, LoggedUser.getInstance().User.Token);

            //cropPhaseModelBindingSource.DataSource = response.Result.CropPhases;
        }
    }
}
