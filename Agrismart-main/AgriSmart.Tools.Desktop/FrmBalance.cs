using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using DevExpress.XtraBars;
using DevExpress.XtraBars.Ribbon;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraGrid;
using DevExpress.Data;
using DevExpress.XtraGrid.Columns;
using AgriSmart.Tools;
using AgriSmart.Core.Entities;
using AgriSmart.Tools.Desktop.DataSets;
using AgriSmart.Tools.Desktop;
using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.Desktop
{
    public partial class FrmBalance : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        private Dictionary<string, int> visibleIndexesMasterGrid = new Dictionary<string, int>();
        private Dictionary<string, int> visibleIndexesDetailGrid = new Dictionary<string, int>();
        private List<FertilizerInput> SelectedFertilizerInputs;
        private Water water = null;
        private CropPhaseSolutionRequirement requirements;
        private Session session;
        Balancer balancer = null;
        private BalanceDs balanceDs = new BalanceDs();
        double requirement = 0;
        double supply = 0;

        public FrmBalance(RibbonForm parent, Session session)
        {
            this.MdiParent = parent;
            InitializeComponent();
            this.session = session;
            storeIndexes();
            barEditItemShowPercentages.EditValue = false;
            balancer = new Balancer(session);
            balanceBindingSource.DataSource = balancer.Balance;
        }


        //private void getBalance()
        //{
        //    balance = new Balance();

        //    this.SelectedFertilizerInputs = session.FertilizerInputs.Where(x => x.Selected).ToList();

        //    foreach (CropSolutionRequirementItem rqto in requirements.SolutionFeatures)
        //    {
        //        BalanceItem balanceItem = new BalanceItem(rqto);

        //        foreach (FertilizerInput fertilizerInput in SelectedFertilizerInputs)
        //        {
        //            Supply supply = new Supply(rqto.RequirementName);
        //            supply.Source = fertilizerInput.Fertilizer;
        //            supply.Amount = fertilizerInput.Fertilizer.Amount;
        //            balanceItem.AddSupply(supply);
        //         }

        //        double val = balanceItem.FertilizerSupply;

        //        balance.AddItem(balanceItem);

        //        if (water != null)
        //        {
        //            Supply supplyWater = new Supply(rqto.RequirementName);
        //            supplyWater.Source = water;
        //            supplyWater.Amount = 0;
        //            balanceItem.AddSupply(supplyWater);
        //        }

        //    }

        //    fillBalanceDataSet();
        //}

        //private void fillBalanceDataSet()
        //{
        //    balanceDs.Clear();
        //    if (balance.BalanceItems.Count > 0)
        //    {
        //        BalanceDs.masterRow masterRequirementRow = balanceDs.master.NewmasterRow();
        //        masterRequirementRow.itemName = "Requirements";
        //        masterRequirementRow.caption = "Requirements";
        //        masterRequirementRow.ElectroConductivity = balance.ElectroConductivityRequired;
        //        balanceDs.master.AddmasterRow(masterRequirementRow);

        //        BalanceDs.masterRow masterSupplyRow = balanceDs.master.NewmasterRow();
        //        masterSupplyRow.itemName = "Supplies";
        //        masterSupplyRow.caption = "Supplies";
        //        masterSupplyRow.ElectroConductivity = balance.ElectroConductivityFertilizer;
        //        balanceDs.master.AddmasterRow(masterSupplyRow);

        //        BalanceDs.detailRow detailRequirementRow = balanceDs.detail.NewdetailRow();
        //        detailRequirementRow.parentName = "Requirements";
        //        detailRequirementRow.itemName = "Requirements";
        //        detailRequirementRow.caption = "Requirements";

        //        balanceDs.detail.AdddetailRow(detailRequirementRow);

        //        foreach (CropSolutionRequirementItem rto in requirements.SolutionFeatures)
        //        {
        //            if (rto.RequirementName != "NH4" && rto.RequirementName != "Cl" && rto.RequirementName != "Na")
        //            {
        //                detailRequirementRow[rto.RequirementName] = rto.Value;
        //            }
        //        }

        //        foreach (BalanceItem balanceItem in balance.BalanceItems)
        //        {
        //            foreach (Supply supply in balanceItem.FertilizerSupplies)
        //            {
        //                string sourceName = "";

        //                Type t = supply.Source.GetType();

        //                if (t.Equals(typeof(Fertilizer)))
        //                {
        //                    Fertilizer fertilizer = (Fertilizer)supply.Source;
        //                    sourceName = fertilizer.Name;
        //                }
        //                else
        //                {
        //                    Water water = (Water)supply.Source;
        //                    sourceName = water.Name;
        //                }

        //                BalanceDs.detailRow detailRow = balanceDs.detail.Where(x => x.itemName == sourceName).FirstOrDefault();

        //                if (detailRow == null)
        //                {
        //                    detailRow = balanceDs.detail.NewdetailRow();
        //                    detailRow.itemName = sourceName;
        //                    detailRow.caption = sourceName;
        //                    detailRow.parentName = "Supplies";
        //                    detailRow.Amount = supply.Amount;

        //                    balanceDs.detail.AdddetailRow(detailRow);
        //                }

        //                if (balanceItem.SolutionFeature.RequirementName != "NH4" && balanceItem.SolutionFeature.RequirementName != "Cl" && balanceItem.SolutionFeature.RequirementName != "Na")
        //                {
        //                    detailRow[balanceItem.SolutionFeature.RequirementName] = supply.SupplyValue;
        //                }
        //            }
        //        }
        //        CalculatePercentages();
        //        masterDataTableBindingSource.DataSource = balanceDs;

        //    }

        //}

        private void barButtonSelectFertilizers_ItemClick(object sender, ItemClickEventArgs e)
        {
            selectFertilizers();
        }

        private void selectFertilizers()
        {
            FrmSelectFertilizer frmSelectFertilizer = new FrmSelectFertilizer(this.session);
            frmSelectFertilizer.ShowDialog();
            balancer.GetBalance();
            balanceBindingSource.DataSource = balancer.Balance.BalanceRows;
            solutionQualityFeatureBindingSource.DataSource = balancer.SolutionFeatures;
            gridControlBalance.RefreshDataSource();
        }

        private void gridView2_CellValueChanged(object sender, DevExpress.XtraGrid.Views.Base.CellValueChangedEventArgs e)
        {
            updateAmount();
        }

        private void barButtonItemSelectWater_ItemClick(object sender, ItemClickEventArgs e)
        {
            if (session.FertilizerInputs.Where(x => x.Selected == true).ToList().Count == 0)
            {
                DialogResult dialogResult = MessageBox.Show("No hay fertilizantes seleccionados", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else
            {
                FrmSelectWater frmSelectWater = new FrmSelectWater(session);
                frmSelectWater.ShowDialog();

                if (frmSelectWater.DialogResult == DialogResult.OK)
                {
                    DialogResult dialogResult = MessageBox.Show("Desear ajusta de pH del agua?", "Ajuste", MessageBoxButtons.YesNo);

                    if (dialogResult == DialogResult.Yes)
                    {
                        List<FertilizerInputEntity> adjusters = session.FertilizerInputs.Where(x => x.Selected == true && x.Fertilizer.FertilizerChemistry.IspHAdjuster == true).ToList();

                        if (adjusters.Count == 0)
                        {
                            DialogResult dialogResult2 = MessageBox.Show("No hay fertilizantes de ajuste seleccionados, desea seleccionarlos?", "Ajuste", MessageBoxButtons.YesNo);

                            if (dialogResult2 == DialogResult.Yes)
                            {
                                selectFertilizers();
                            }
                        }


                        //do something
                    }

                    balancer.calculateAmountAdjuster();
                }
            }

            balanceBindingSource.DataSource = balancer.Balance.BalanceRows;
            solutionQualityFeatureBindingSource.DataSource = balancer.SolutionFeatures;
            gridControlBalance.RefreshDataSource();
        }

        private void gridView1_CustomSummaryCalculate(object sender, DevExpress.Data.CustomSummaryEventArgs e)
        {
            GridView view = sender as GridView;
            string fieldName = (e.Item as GridSummaryItem).FieldName;
            //Get the summary ID. 
            int summaryID = Convert.ToInt32((e.Item as GridSummaryItem).Tag);

            //Initialization.
            if (e.SummaryProcess == CustomSummaryProcess.Start)
            {
                requirement = 0;
                supply = 0;
            }
            //Calculation.
            if (e.SummaryProcess == CustomSummaryProcess.Calculate)
            {
                GridColumn column = view.Columns[fieldName];
                requirement = Convert.ToDouble(view.GetRowCellValue(0, column));
                supply = Convert.ToDouble(view.GetRowCellValue(1, column));

            }
            //Finalization
            if (e.SummaryProcess == CustomSummaryProcess.Finalize)
            {
                e.TotalValue = supply - requirement;
            }
        }

        private void storeIndexes()
        {
            for (int i = 0; i < gridView1.Columns.Count; i++)
            {
                visibleIndexesMasterGrid.Add(gridView1.Columns[i].Name, gridView1.Columns[i].VisibleIndex);
            }

            for (int i = 0; i < gridView2.Columns.Count; i++)
            {
                visibleIndexesDetailGrid.Add(gridView2.Columns[i].Name, gridView2.Columns[i].VisibleIndex);
            }
        }

        private void barEditItemShowPercentages_EditValueChanged(object sender, EventArgs e)
        {
            for (int i = 0; i < gridView1.Columns.Count; i++)
            {
                gridView1.Columns[i].VisibleIndex = visibleIndexesMasterGrid[gridView1.Columns[i].Name];

                if (gridView1.Columns[i].Name.Contains("_p"))
                {
                    bool visible = Convert.ToBoolean(barEditItemShowPercentages.EditValue);
                    gridView1.Columns[i].Visible = visible;
                }
            }

            for (int i = 0; i < gridView2.Columns.Count; i++)
            {
                gridView2.Columns[i].VisibleIndex = visibleIndexesDetailGrid[gridView2.Columns[i].Name];

                if (gridView2.Columns[i].Name.Contains("_p"))
                {
                    bool visible = Convert.ToBoolean(barEditItemShowPercentages.EditValue);
                    gridView2.Columns[i].Visible = visible;
                }
            }
        }

        private void gridView1_CustomDrawFooterCell(object sender, FooterCellCustomDrawEventArgs e)
        {
            if (e.Info.Column.FieldName.Contains("_p"))
            {
                if (Math.Abs(Convert.ToDouble(e.Info.Value)) < 5.0)
                {
                    e.Appearance.BackColor = Color.Green;
                    e.Appearance.FillRectangle(e.Cache, e.Bounds);
                    e.Info.AllowDrawBackground = false;
                }
                else
                if (Math.Abs(Convert.ToDouble(e.Info.Value)) < 10.0)
                {
                    e.Appearance.BackColor = Color.Yellow;
                    e.Appearance.FillRectangle(e.Cache, e.Bounds);
                    e.Info.AllowDrawBackground = false;
                }
                else
                {
                    e.Appearance.BackColor = Color.Red;
                    e.Appearance.FillRectangle(e.Cache, e.Bounds);
                    e.Info.AllowDrawBackground = false;
                }
            }
        }

        private void barButtonItem1_ItemClick(object sender, ItemClickEventArgs e)
        {
            session.FertilizerInputs.Where(x => x.Selected).ToList();
        }

        private void gridView2_CellValueChanged_1(object sender, CellValueChangedEventArgs e)
        {
            if (e.Column.Name == "colAmount")
            {
                updateAmount();
            }
        }

        private void updateAmount()
        {
            int rowHandle = (gridControlBalance.FocusedView as ColumnView).FocusedRowHandle;
            ColumnView view = (ColumnView)gridControlBalance.FocusedView;
            BalanceDetail detail = view.GetRow(rowHandle) as BalanceDetail;
            balancer.updateAmount(detail.SourceId, detail.Amount);
            balancer.GetBalance();
            balanceBindingSource.DataSource = balancer.Balance.BalanceRows;
            solutionQualityFeatureBindingSource.DataSource = balancer.SolutionFeatures;
            gridControlBalance.RefreshDataSource();
        }

        private void barEditItem1_EditValueChanged(object sender, EventArgs e)
        {
            session.TargetEC = Convert.ToDouble(barEditItem1.EditValue);
        }
    }
}