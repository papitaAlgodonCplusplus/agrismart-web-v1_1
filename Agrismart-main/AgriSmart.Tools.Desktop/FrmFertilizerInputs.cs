using DevExpress.XtraBars.Ribbon;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmFertilizerInputs : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        private Session session;
        private SubFrmFertilizerInputs subFrmFertilizerInputs;

        public FrmFertilizerInputs(RibbonForm parent, Session session)
        {
            this.MdiParent = parent;
            InitializeComponent();
            subFrmFertilizerInputs = new SubFrmFertilizerInputs(session);
            subFrmFertilizerInputs.Dock = DockStyle.Fill;
            panelControl.Controls.Add(subFrmFertilizerInputs);
            this.session = session;
        }

        private void barButtonItem1_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            session.SaveFertilizerInputs();
        }

        private void barButtonItemAdd_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            FrmInputPresentations frmCRUDInputPresentations = new FrmInputPresentations(session);
            frmCRUDInputPresentations.ShowDialog();
        }
    }
}
