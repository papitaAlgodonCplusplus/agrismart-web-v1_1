using System;
using System.Windows.Forms;
using AgriSmart.Tools.Services;
using AgriSmart.Tools.Configuration;
using Microsoft.Extensions.Options;
using AgriSmart.Tools.Desktop.Resources;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmMain : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        private readonly IAgriSmartApiClient _apiClient;
        private Session session = null;

        public FrmMain(IAgriSmartApiClient apiClient)
        {
            InitializeComponent();
            _apiClient = apiClient;
        }

        public FrmMain()
        {
            InitializeComponent();
            Initialize();
        }

        private void Initialize()
        {

        }


        private void navBarItemFertilizer_LinkClicked(object sender, DevExpress.XtraNavBar.NavBarLinkEventArgs e)
        {
            if (session == null)
            {
                if (!CreateSession())
                    MessageBox.Show(GlobalFormResources.NoSessionCreated, GlobalFormResources.Error, MessageBoxButtons.OK, MessageBoxIcon.Error);
                else
                {
                    FrmFertilizerInputs frmFertilizerInputs = new FrmFertilizerInputs(this, session);
                    frmFertilizerInputs.Show();
                }
            }
            else
            {
                FrmFertilizerInputs frmFertilizerInputs = new FrmFertilizerInputs(this, session);
                frmFertilizerInputs.Show();
            }
        }

        private bool CreateSession()
        {
            FrmSessionInfo frmSessionInfo = new FrmSessionInfo(_apiClient);
            frmSessionInfo.ShowDialog();

            if (frmSessionInfo.DialogResult == System.Windows.Forms.DialogResult.OK)
            {
                session = frmSessionInfo.session;
                return true;
            }
            else
            {
                return false;
            }
        }

        private void navBarItemSolutionFormulation_LinkClicked(object sender, DevExpress.XtraNavBar.NavBarLinkEventArgs e)
        {
            if (session == null)
            {
                if (!CreateSession())
                    MessageBox.Show(GlobalFormResources.NoSessionCreated, GlobalFormResources.Error, MessageBoxButtons.OK, MessageBoxIcon.Error);
                else
                {
                    FrmBalance frmBalance = new FrmBalance(this, session);
                    frmBalance.Show();
                }
            }
            else
            {
                FrmBalance frmBalance = new FrmBalance(this, session);
                frmBalance.Show();
            }
        }

        private void navBarItemWater_LinkClicked(object sender, DevExpress.XtraNavBar.NavBarLinkEventArgs e)
        {
            if (session == null)
            {
                if (!CreateSession())
                    MessageBox.Show(GlobalFormResources.NoSessionCreated, GlobalFormResources.Error, MessageBoxButtons.OK, MessageBoxIcon.Error);
                else
                {
                    FrmWater FrmWater = new FrmWater(this, session);
                    FrmWater.Show();
                }
            }
            else
            {
                FrmWater FrmWater = new FrmWater(this, session);
                FrmWater.Show();
            }
        }

        private void barButtonItem1_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            //CalculationsTester tester = new CalculationsTester();
            //List<GlobalOutput> output = tester.TestCalculations(Convert.ToDateTime("01/05/2023"), Convert.ToDateTime("31/05/2023"));
            //FrmCalculationOutputs FrmCalculationOutputs = new FrmCalculationOutputs(output);
            //FrmCalculationOutputs.Show();
        }

        private void FrmMain_Load(object sender, EventArgs e)
        {
            //FrmAmbit frmAmbit = new FrmAmbit();
            //frmAmbit.ShowDialog();
        }

        private void navBarControl1_Click(object sender, EventArgs e)
        {

        }
    }
}