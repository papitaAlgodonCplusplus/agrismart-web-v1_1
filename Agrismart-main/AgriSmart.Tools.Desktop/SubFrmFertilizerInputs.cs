using System.Windows.Forms;
using DevExpress.XtraGrid.Views.Grid;
using System.Linq;
using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.Desktop
{
    public partial class SubFrmFertilizerInputs : UserControl
    {
        private Session session;
        public SubFrmFertilizerInputs(Session session)
        {
            InitializeComponent();
            this.session = session;
        }

        private void gridView1_FocusedRowChanged(object sender, DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventArgs e)
        {
            FertilizerInputEntity fertilizerInput = (sender as GridView).GetRow(e.FocusedRowHandle) as FertilizerInputEntity;

            if (fertilizerInput != null)
            {
                if (fertilizerInput.Fertilizer != null)
                {
                    fertilizerChemistryBindingSource.DataSource = fertilizerInput.Fertilizer.FertilizerChemistry;
                    fertilizerBindingSource.DataSource = fertilizerInput.Fertilizer;
                }
            }
        }

        private void SubFrmFertilizerInputs_Load(object sender, System.EventArgs e)
        {
            fertilizerInputBindingSource.DataSource = session.FertilizerInputs;
            //fertilizerBindingSource.DataSource = session.Fertilizers;
            repositoryItemLookUpEdit1.DataSource = session.Fertilizers;
            repositoryItemLookUpEditPresentation.DataSource = session.InputPresentations;
        }

        private void gridView1_InitNewRow(object sender, InitNewRowEventArgs e)
        {
            GridView view = sender as GridView;
            view.SetRowCellValue(e.RowHandle, view.Columns["Id"], session.FertilizerInputs.Max(x => x.Id) + 1);
            view.SetRowCellValue(e.RowHandle, view.Columns["CatalogId"], session.CatalogId);
            view.SetRowCellValue(e.RowHandle, view.Columns["Active"], true);
        }

        private void gridView1_RowUpdated(object sender, DevExpress.XtraGrid.Views.Base.RowObjectEventArgs e)
        {
            //FertilizerInput fertilizerInput = (FertilizerInput)gridView1.GetRow(e.RowHandle);
            //fertilizerInput.InputPresentation = session.InputPresentations.Where(x => x.Id == fertilizerInput.InputPresentationId).FirstOrDefault();
            //fertilizerInput.Fertilizer = session.Fertilizers.Where(x => x.Id == fertilizerInput.FertilizerId).FirstOrDefault();
        }

        private void gridView1_ValidateRow(object sender, DevExpress.XtraGrid.Views.Base.ValidateRowEventArgs e)
        {
            FertilizerInputEntity fertilizerInput = (FertilizerInputEntity)e.Row;
            fertilizerInput.InputPresentation = session.InputPresentations.Where(x => x.Id == fertilizerInput.InputPresentationId).FirstOrDefault();
            fertilizerInput.Fertilizer = session.Fertilizers.Where(x => x.Id == fertilizerInput.FertilizerId).FirstOrDefault();
        }
    }
}
