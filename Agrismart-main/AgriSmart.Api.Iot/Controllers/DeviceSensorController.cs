using AgriSmart.Application.Iot.Services;
using DevExpress.Xpo;
using Microsoft.AspNetCore.Mvc;
using System;

namespace AgriSmart.Api.Iot.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DeviceSensorController : ControllerBase
    {
        private readonly DeviceSensorCacheService _cacheService;

        public DeviceSensorController(DeviceSensorCacheService cacheService)
        {
            _cacheService = cacheService;
        }

        [HttpGet("devices")]
        public IActionResult GetDevices()
        {
            var devices = _cacheService.GetDevices();
            return Ok(devices);
        }

        [HttpGet("sensors")]
        public IActionResult GetSensors()
        {
            var sensors = _cacheService.GetSensors();
            return Ok(sensors);
        }
    }

}