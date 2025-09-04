using System.Collections.Generic;
using System.Windows.Forms;
using AgriSmart.Tools.Entities;
using DevExpress.XtraGrid.Views.Grid;


namespace AgriSmart.Tools.Desktop
{
    public partial class SubFrmWater : UserControl
    {
        private Session session;

        public SubFrmWater(Session session)
        {
            InitializeComponent();
            this.session = session;
            waterBindingSource.DataSource = session.Waters;
        }

        private void gridView1_FocusedRowChanged(object sender, DevExpress.XtraGrid.Views.Base.FocusedRowChangedEventArgs e)
        {
            WaterEntity water = (sender as GridView).GetRow(e.FocusedRowHandle) as WaterEntity;

            if (water != null)
            {
                waterChemistryBindingSource.DataSource = water.Chemistries;
            }
        }

        private void vGridControl1_FocusedRecordChanged(object sender, DevExpress.XtraVerticalGrid.Events.IndexChangedEventArgs e)
        {
            WaterChemistryEntity waterChemistry = (WaterChemistryEntity)vGridControl1.GetRecordObject(vGridControl1.FocusedRecord);
            waterQualityFeatureBindingSource.DataSource = getChemistryQualityFeatures(waterChemistry);
        }


        public List<SolutionFeature> getChemistryQualityFeatures(WaterChemistryEntity waterChemistry)
        {
            List<SolutionFeature> output = new List<SolutionFeature>();

            foreach (SolutionFeatureInfo info in session.WaterFeaturesInfo)
            {
                SolutionFeature newWaterQualityFeature = new SolutionFeature(info, waterChemistry);
                int pos = session.WaterFeaturesCategoryInfo.IndexOf(new SolutionFeatureCategoryInfo(info.CategoryName));
                newWaterQualityFeature.Category = new SolutionFeatureCategory(session.WaterFeaturesCategoryInfo[pos]);
                output.Add(newWaterQualityFeature);
            }

            return output;
        }
    }
}
