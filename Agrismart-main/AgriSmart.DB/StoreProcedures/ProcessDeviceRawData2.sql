USE [db_9aab5e_ucragrismart]
GO
/****** Object:  StoredProcedure [dbo].[ProcessDeviceRawData2]    Script Date: 09/08/2025 15:26:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Esteban Brenes, edited by César Solano>
-- Create date: <2022/12>
-- Description:	<Moves the RawData to the Measurement table>
-- =============================================
-- Change History
--DATE	2024/12	CHANGED BY César Solano	CHANGE CODE	DESCRIPTION inserting data mapped to the CropProduction and using MeasurementVariable field
--exec [dbo].[ProcessDeviceRawData] ''
-- =============================================
ALTER PROCEDURE [dbo].[ProcessDeviceRawData2]
    @CropProductionId INT,
    @resultMessage NVARCHAR(128) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @transtate BIT;
    IF @@TRANCOUNT = 0
    BEGIN
        SET @transtate = 1;
        BEGIN TRANSACTION transtate;
    END

    BEGIN TRY
        DECLARE @targetTimeZone VARCHAR(50);

        SELECT TOP 1 @targetTimeZone = TZ.Name
        FROM [dbo].[CropProductionDevice] CPD
        INNER JOIN [dbo].[ProductionUnit] PU ON CPD.CropProductionId = PU.Id
        INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
		INNER JOIN [dbo].[TimeZone] TZ ON FA.TimeZoneId = TZ.Id
        WHERE CPD.CropProductionId = @CropProductionId;

		DECLARE @MaxHour DATETIME;
		set @MaxHour = ISNULL((select max(RecordDate) from [dbo].[MeasurementBase] where CropProductionId = @CropProductionId),(select StartDate from [dbo].[CropProduction] where Id = @CropProductionId))

		DECLARE @LastHour DATETIME;
        SET @LastHour = DATEADD(HOUR, DATEDIFF(HOUR, 0, @MaxHour), 0);

        DELETE FROM [dbo].[MeasurementBase]
        WHERE RecordDate >= @LastHour
        AND CropProductionId = @CropProductionId;

        DELETE FROM [dbo].[Measurement]
        WHERE RecordDate >= @LastHour 
        AND CropProductionId = @CropProductionId;

        -- Materialize RawDataCTE
        SELECT RD.Id, RD.RecordDate, RD.Payload, SE.Id AS SensorId, SE.MeasurementVariableId, DV.DeviceId, 
               CPD.CropProductionId, TZ.Name as TimeZoneName, SE.NumberOfContainers,
               CAST(ISNULL(TRY_CAST(RD.Payload AS FLOAT), 0) / NULLIF(SE.NumberOfContainers, 0) AS FLOAT) AS RecordValue
        INTO #RawDataTemp
        FROM [dbo].[DeviceRawData] RD
        INNER JOIN [dbo].[Device] DV ON RD.DeviceId = DV.DeviceId
        INNER JOIN [dbo].[Sensor] SE ON RD.Sensor = SE.SensorLabel AND SE.DeviceId = DV.Id
        INNER JOIN [dbo].[CropProductionDevice] CPD ON CPD.DeviceId = DV.Id
        INNER JOIN [dbo].[CropProduction] CP ON CPD.CropProductionId = CP.Id
        INNER JOIN [dbo].[ProductionUnit] PU ON CP.ProductionUnitId = PU.Id
        INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
		INNER JOIN [dbo].[TimeZone] TZ ON FA.TimeZoneId = TZ.Id
        WHERE CPD.CropProductionId = @CropProductionId
          AND TRY_CAST(RD.Payload AS FLOAT) IS NOT NULL
          AND RD.Summarized = 0;

        INSERT INTO [dbo].[MeasurementBase] ([RecordDate], [CropProductionId], [MeasurementVariableId], [SensorId], [RecordValue])
        SELECT 
            RecordDate AT TIME ZONE 'UTC' AT TIME ZONE TimeZoneName,
            CropProductionId, MeasurementVariableId, SensorId, RecordValue
        FROM #RawDataTemp RD
		WHERE RecordValue IS NOT null;

        INSERT INTO [dbo].[Measurement] ([RecordDate], [CropProductionId], [MeasurementVariableId], [MinValue], [MaxValue], [AvgValue], [SumValue])
        SELECT
            DATEADD(HOUR, DATEDIFF(HOUR, 0, RD.RecordDate AT TIME ZONE 'UTC' AT TIME ZONE TimeZoneName), 0) AS RecordDate,
            CropProductionId, MeasurementVariableId,
            MIN(RecordValue), MAX(RecordValue), AVG(RecordValue), SUM(RecordValue)
        FROM #RawDataTemp RD
        GROUP BY CropProductionId, MeasurementVariableId,
                 DATEADD(HOUR, DATEDIFF(HOUR, 0, RD.RecordDate AT TIME ZONE 'UTC' AT TIME ZONE TimeZoneName), 0)
        HAVING SUM(RecordValue) > 0;

		
		set @MaxHour = ISNULL((select max(RecordDate) AT TIME ZONE @targetTimeZone AT TIME ZONE 'UTC' from [dbo].[MeasurementBase] where CropProductionId = @CropProductionId),(select StartDate from [dbo].[CropProduction] where Id = @CropProductionId))
		SET @LastHour = DATEADD(HOUR, DATEDIFF(HOUR, 0, @MaxHour), 0);

        -- Update summarized flag
        UPDATE RD
        SET RD.Summarized = 1
        FROM [dbo].[DeviceRawData] RD
        INNER JOIN #RawDataTemp TMP ON RD.Id = TMP.Id
		where RD.RecordDate < @LastHour;

        DROP TABLE #RawDataTemp;

        IF @transtate = 1 AND XACT_STATE() = 1
            COMMIT TRANSACTION transtate;

        SET @resultMessage = OBJECT_NAME(@@PROCID) + ' Successfully Executed';
    END TRY
    BEGIN CATCH
        DECLARE @Error_Message VARCHAR(5000), @Error_Severity INT, @Error_State INT;
        SELECT @Error_Message = ERROR_MESSAGE(),
               @Error_Severity = ERROR_SEVERITY(),
               @Error_State = ERROR_STATE();

        IF @transtate = 1 AND XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        RAISERROR (@Error_Message, @Error_Severity, @Error_State);
    END CATCH
END