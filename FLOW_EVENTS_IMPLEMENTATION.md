# Flow Events Detection - Implementation Summary

## Overview
Refactored the dashboard component to detect and display flow events based on payload changes in `Water_flow_value` and `Total_pulse` sensors over time.

## Key Changes

### 1. New Interface: `FlowEvent`
```typescript
interface FlowEvent {
  deviceId: string;
  sensorType: 'Water_flow_value' | 'Total_pulse';
  changeDetectedAt: Date;
  previousPayload: number;
  currentPayload: number;
  volumeOfWater?: number;
  timeDifference: number;
}
```

### 2. Event Detection Logic (`detectFlowEvents()`)

#### How it Works:
1. **Data Grouping**: Groups `rawData.deviceRawData` by `deviceId` and `sensor` type
2. **Time-based Sorting**: Sorts readings chronologically for each sensor
3. **Change Detection**:
   - Compares consecutive readings
   - Detects when payload values change between time periods
   - Example: If at 10:00:00 payload is 100 and at 10:00:05 payload is 150, that's +1 event
4. **Deduplication**:
   - Prevents counting the same event twice when both sensors change simultaneously
   - Uses a 5-second time window to detect combined events
   - If both `Water_flow_value` and `Total_pulse` change within 5 seconds, counts as 1 event

#### Key Features:
- **Per-Device Segregation**: Each device's events are tracked separately
- **Volume Tracking**: For `Water_flow_value` changes, the current payload represents water volume
- **Time Difference**: Calculates elapsed time between consecutive readings

### 3. Component Properties Added
```typescript
flowEvents: FlowEvent[] = [];  // Stores all detected events
```

### 4. New Helper Methods

#### `getTotalEventsDetected()`
Returns the total count of detected flow events.

#### `getEventsByDevice()`
Returns events grouped by deviceId as a Map for easy display segregation.

#### `formatTimeDifference(milliseconds)`
Formats time differences in human-readable format (e.g., "2h 15m", "45m 30s", "10s").

### 5. UI/HTML Changes

#### New Stats Card
- Displays total events detected across all devices
- Replaces the generic "Eventos de Riego" card

#### New Section: "Eventos de Flujo Detectados"
Features:
- **Device Segregation**: Events grouped by deviceId
- **Badge Counter**: Shows event count per device
- **Detailed Table** per device showing:
  - Sensor type (color-coded badges)
  - Date/Time of change
  - Previous payload value
  - Current payload value
  - Payload difference (green for increase, red for decrease)
  - Volume of water (for Water_flow_value sensor)
  - Time elapsed since previous reading

#### Example Display Format:
```
Dispositivo: flujo-01-c7 [3 eventos]
┌─────────────────┬──────────────┬──────────┬─────────┬────────┬──────────┬──────────┐
│ Sensor          │ Fecha/Hora   │ Anterior │ Actual  │ Cambio │ Volumen  │ Tiempo   │
├─────────────────┼──────────────┼──────────┼─────────┼────────┼──────────┼──────────┤
│ Water_flow_value│ 12/11 10:05 │ 100.00   │ 125.50  │ +25.50 │ 125.50 L │ 5m 12s   │
│ Total_pulse     │ 12/11 10:05 │ 1000.00  │ 1050.00 │ +50.00 │ N/A      │ 5m 15s   │
│ Water_flow_value│ 12/11 10:10 │ 125.50   │ 150.00  │ +24.50 │ 150.00 L │ 5m 0s    │
└─────────────────┴──────────────┴──────────┴─────────┴────────┴──────────┴──────────┘
```

### 6. Integration Points

The `detectFlowEvents()` method is called in:
- `loadDashboardStats()` - Initial data load
- `loadMoreDeviceData()` - Pagination
- `loadMoreDeviceDataBulk()` - Bulk 6-hour load
- `loadMoreDeviceDataBulk24()` - Bulk 24-hour load

## Event Detection Rules

1. **Single Event**: Change in either `Water_flow_value` OR `Total_pulse` = 1 event
2. **Combined Event**: Change in BOTH sensors within 5 seconds = 1 event (not 2)
3. **Multiple Devices**: Events from different devices are tracked separately
4. **Time Window**: Consecutive readings are compared to detect changes

## Example Scenarios

### Scenario 1: Water Flow Change Only
```
Time: 10:00:00 - Water_flow_value: 100 L
Time: 10:00:05 - Water_flow_value: 120 L
Result: 1 event detected, volume = 120 L
```

### Scenario 2: Both Sensors Change (Combined)
```
Time: 10:00:00 - Water_flow_value: 100 L, Total_pulse: 1000
Time: 10:00:05 - Water_flow_value: 120 L, Total_pulse: 1100
Result: 1 event detected (not 2), volume = 120 L
```

### Scenario 3: Multiple Devices
```
Device flujo-01-c7:
  10:00:00 → 10:00:05: Water_flow_value changed (1 event)

Device flujo-02-c7:
  10:00:10 → 10:00:15: Total_pulse changed (1 event)

Total: 2 events (segregated by device in UI)
```

## Benefits

1. **Accurate Detection**: Only counts actual payload changes, not just data points
2. **No Duplicates**: Smart logic prevents double-counting when multiple sensors change together
3. **Device Clarity**: Users can see exactly which device had events and when
4. **Volume Tracking**: Direct visibility into water volume changes
5. **Time Analysis**: Shows how frequently events occur with time differences

## Console Logging
The method logs detection results:
```javascript
console.log(`Detected ${this.flowEvents.length} flow events across all devices`);
```

## Future Enhancements (Optional)
- Add filtering by date range
- Add export functionality for events
- Add alert thresholds for unusual flow patterns
- Add graphical visualization of events over time
