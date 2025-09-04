using System;
using System.Data;
using System.Linq;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmSelectFertilizer : Form
    {
        private Session session;
        private bool forSelectingAdjusters = false;
        private SubFrmFertilizerInputs subFrmFertilizerInputs;
        //public List<FertilizerInput> SelectedFertilizerInputs;

        public FrmSelectFertilizer(Session session, bool forSelectingAdjusters = false)
        {
            InitializeComponent();
            subFrmFertilizerInputs = new SubFrmFertilizerInputs(session);
            subFrmFertilizerInputs.Dock = DockStyle.Fill;
            panelControl.Controls.Add(subFrmFertilizerInputs);
            this.forSelectingAdjusters = forSelectingAdjusters;
            this.session = session;

            //if(session.FertilizerInputs != null)

        }


        private void simpleButton1_Click(object sender, EventArgs e)
        {
            if (forSelectingAdjusters && session.FertilizerInputs.Where(x => x.Fertilizer.FertilizerChemistry.IspHAdjuster == true).ToList().Count == 0)
                this.DialogResult = DialogResult.Retry;
            else
                this.DialogResult = DialogResult.OK;
        }

        private void select()
        {
        }

    }
}
