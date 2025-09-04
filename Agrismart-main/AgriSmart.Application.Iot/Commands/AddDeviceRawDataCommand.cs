using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Commands
{
    public record Application_Ids
    {
        public string Application_Id { get; set; }
    }

    public record End_Device_Ids
    {
        public string Device_Id { get; set; }
        public Application_Ids application_Ids { get; set; }
    }

    public record Decoded_Payload
    {
        public object? strings { get; set; }
    }
    
    public record Uplink_Message
    {
        public string? Session_Key_Id { get; set; }
        public object? Decoded_Payload { get; set; }
    }

    public record Data
    {
        public End_Device_Ids? End_Device_Ids { get; set; }
        public string? Received_at { get; set; }
        public  Uplink_Message? Uplink_Message { get; set; }
    }

    public class AddDeviceRawDataCommand : IRequest<Response<AddDeviceRawDataResponse>>
    {
        public End_Device_Ids? End_Device_Ids { get; set; }
        public string? Received_at { get; set; }
        public Uplink_Message? Uplink_Message { get; set; }

    }
}
