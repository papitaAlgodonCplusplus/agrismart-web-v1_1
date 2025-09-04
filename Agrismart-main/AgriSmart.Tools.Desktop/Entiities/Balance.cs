using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class Balance
    {
        public List<BalanceMaster> BalanceRows { get; set; }

        public void AddMasterRow(BalanceMaster master)
        {
            if (BalanceRows == null)
                BalanceRows = new List<BalanceMaster>();

            BalanceRows.Add(master);
        }
    }
}
