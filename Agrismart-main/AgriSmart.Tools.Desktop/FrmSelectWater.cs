using AgriSmart.Tools.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmSelectWater : Form
    {
        private Session session;
        private SubFrmWater subFrmWaters;
        //public List<FertilizerInput> SelectedFertilizerInputs;

        public FrmSelectWater(Session session)
        {
            InitializeComponent();
            subFrmWaters = new SubFrmWater(session);
            subFrmWaters.Dock = DockStyle.Fill;
            panelControl.Controls.Add(subFrmWaters);
            this.session = session;
        }


        private void simpleButton1_Click(object sender, EventArgs e)
        {
            List<WaterEntity> selectedWaters = session.Waters.Where(x => x.Selected == true).ToList();

            if (selectedWaters.Count == 0)
            {
                MessageBox.Show("Debe seleccionar al menos una agua", "Información", MessageBoxButtons.OK);
                DialogResult = DialogResult.Retry;
            }
            else
            if(selectedWaters.Count > 1)
            {
                MessageBox.Show("Debe seleccionar solo una agua", "Información", MessageBoxButtons.OK);
                DialogResult = DialogResult.Retry;
            }

            this.DialogResult = DialogResult.OK;
            this.Close();
        }

        private void select()
        {
        }
    }
}
