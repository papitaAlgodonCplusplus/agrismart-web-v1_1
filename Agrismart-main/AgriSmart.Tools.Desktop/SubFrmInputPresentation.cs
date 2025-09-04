using AgriSmart.Tools.Entities;
using DevExpress.XtraGrid.Views.Grid;
using System;
using System.Data;
using System.Linq;
using System.Windows.Forms;

namespace AgriSmart.Tools.Desktop
{
    public partial class SubFrmInputPresentation : UserControl
    {
        Session session;
        public SubFrmInputPresentation(Session session)
        {
            InitializeComponent();
            this.session = session;
        }

        private void SubFormInputPresentation_Load(object sender, EventArgs e)
        {
            inputPresentationBindingSource.DataSource = session.InputPresentations;
            repositoryItemLookUpEdit1.DataSource = session.MeasurementUnits;
        }

        private void repositoryItemLookUpEdit1_Closed(object sender, DevExpress.XtraEditors.Controls.ClosedEventArgs e)
        {

        }

        private void repositoryItemLookUpEdit1_EditValueChanged(object sender, EventArgs e)
        {
            //InputPresentation inputPresentation = (InputPresentation)gridView1.GetRow(gridView1.FocusedRowHandle);
            //inputPresentation.MeasurementUnit = session.MeasurementUnits.Where(x => x.Id == inputPresentation.MeasurementUnitId).FirstOrDefault();
        }

        private void gridView1_InitNewRow(object sender, DevExpress.XtraGrid.Views.Grid.InitNewRowEventArgs e)
        {
            GridView view = sender as GridView;
            view.SetRowCellValue(e.RowHandle, view.Columns["Id"], session.InputPresentations.Max(x => x.Id) + 1);
            view.SetRowCellValue(e.RowHandle, view.Columns["CatalogId"], session.CatalogId);
            view.SetRowCellValue(e.RowHandle, view.Columns["Active"], true);
        }

        private void gridView1_ValidateRow(object sender, DevExpress.XtraGrid.Views.Base.ValidateRowEventArgs e)
        {
            InputPresentationEntity inputPresentation = (InputPresentationEntity)e.Row;
            inputPresentation.MeasurementUnit = session.MeasurementUnits.Where(x => x.Id == inputPresentation.MeasurementUnitId).FirstOrDefault();
        }
    }
}
