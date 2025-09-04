using DevExpress.XtraBars.Ribbon;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmWater : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        private Session session;
        private SubFrmWater subFrmWater;

        public FrmWater(RibbonForm parent, Session session)
        {
            this.MdiParent = parent;
            InitializeComponent();
            subFrmWater = new SubFrmWater(session);
            subFrmWater.Dock = DockStyle.Fill;
            panelControl.Controls.Add(subFrmWater);
            this.session = session;
        }
    }
}
