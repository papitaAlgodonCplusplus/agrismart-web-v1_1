using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Logic
{
    public class IrrigationController
    {
        List<IrrigationRequest> IrrigationRequests { get; set; }

        public IrrigationController(List<IrrigationRequest> irrigationRequests)
        {
            IrrigationRequests = irrigationRequests;
        }

        public void StartIrrigation()
        {
            while (notAllRequestDone() == true)
            {
                foreach (IrrigationRequest irrigationRequest in IrrigationRequests)
                {
                    if (!IrrigationMonitor.IsRelayActive(irrigationRequest.IrrigationSector.PumpRelay))
                    {
                        SendSetOnSignal(irrigationRequest.IrrigationSector.PumpRelay);
                        irrigationRequest.IrrigationSector.PumpRelay.Active = true;
                        SendSetOnSignal(irrigationRequest.IrrigationSector.ValveRelay);

                    }
                }
            }
        }

        private bool notAllRequestDone()
        {
            List<IrrigationRequest> unDoneRequests = IrrigationRequests.Where(x => x.Done == false).ToList();

            if (unDoneRequests.Count() > 0)
                return false;
            else
                return true;
        }

        public void StopIrrigation()
        {
            foreach (IrrigationRequest irrigationRequest in IrrigationRequests)
            {
                if (!IrrigationMonitor.IsRelayActive(irrigationRequest.IrrigationSector.PumpRelay))
                {
                    SendSetOnSignal(irrigationRequest.IrrigationSector.PumpRelay);
                    irrigationRequest.IrrigationSector.PumpRelay.Active = true;
                    SendSetOnSignal(irrigationRequest.IrrigationSector.ValveRelay);
                }
            }
        }

        private void SendSetOnSignal(Relay relay)
        {
            //send a message to the API
        }

        //private bool 
    }
}
