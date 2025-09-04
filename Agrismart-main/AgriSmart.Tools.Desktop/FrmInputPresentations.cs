using DevExpress.XtraBars.Ribbon;
using System;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmInputPresentations : DevExpress.XtraEditors.XtraForm
    {
        private Session session;
        private SubFrmInputPresentation subInputPresentation;

        public FrmInputPresentations(Session session)
        {
            InitializeComponent();
            this.session = session;
        }

        public FrmInputPresentations(RibbonForm parent, Session session)
        {
            this.MdiParent = parent;
            InitializeComponent();

            this.session = session;
        }

        private void FrmCRUDInputPresentations_Load(object sender, EventArgs e)
        {
            subInputPresentation = new SubFrmInputPresentation(session);
            subInputPresentation.Dock = DockStyle.Fill;
            panelControl.Controls.Add(subInputPresentation);
        }

        private void barButtonItemSave_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            session.SaveInputPresentations();
        }
    }
}