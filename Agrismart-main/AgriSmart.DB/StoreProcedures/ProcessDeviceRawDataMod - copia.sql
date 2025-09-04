-- =============================================
-- Author:		<Esteban Brenes, edited by César Solano>
-- Create date: <2022/12>
-- Description:	<Moves the RawData to the Measurement table>
-- =============================================
-- Change History
--DATE	2024/12	CHANGED BY César Solano	CHANGE CODE	DESCRIPTION inserting data mapped to the CropProduction and using MeasurementVariable field
--exec [dbo].[ProcessDeviceRawData] ''
-- =============================================
CREATE PROCEDURE [dbo].[ProcessDeviceRawData]
	@deviceId NVARCHAR(32),
	@requestTime DateTime,
	@resultMessage NVARCHAR(128) OUTPUT
AS
	BEGIN
		DECLARE @transtate BIT
		IF @@TRANCOUNT = 0
		BEGIN
			SET @transtate = 1
			BEGIN TRANSACTION transtate
		END
 
	BEGIN TRY

			DECLARE @now DateTime
			SET @now = (CAST(GETDATE() AS DATETIME))

			DECLARE @timeDiffInSeconds INT
			SET @timeDiffInSeconds = (SELECT DATEDIFF(SECOND, @now, @requestTime))

			DECLARE @sourceDate DateTime
			SET @sourceDate = DATEADD(second, @timeDiffInSeconds, @now)

			DECLARE @currentHour DateTime
			SET @currentHour = FORMAT(@sourceDate, 'yyyy-MM-dd HH:00')

			INSERT INTO [dbo].[MeasurementBase]
				([RecordDate], [CropProductionId], [MeasurementVariableId], [RecordValue])
			SELECT
				RD.[RecordDate],
				DC.[CropProductionId],
				SE.[MeasurementVariableId], 
				CAST(ISNULL([Payload],0) AS FLOAT) as RecordValue
			FROM [dbo].[DeviceRawData] RD, [dbo].[Device] DV, [dbo].[Sensor] SE, [dbo].[CropProductionDevice] DC
			WHERE RD.DeviceId = DV.DeviceId and RD.DeviceId = DV.DeviceId and RD.Sensor = SE.SensorLabel and
					SE.DeviceId = DV.Id and DV.Id = DC.DeviceId and RD.DeviceId = @deviceId
					AND Summarized = 0
					AND TRY_CAST(([Payload] / SE.NumberOfContainers) AS float) IS NOT NULL
					AND [Summarized] = 0
			order by CropProductionId, MeasurementVariableId, RecordDate

			delete from [dbo].[Measurement] where FORMAT(RecordDate, 'yyyy-MM-dd HH:00') =  @currentHour

			INSERT INTO [dbo].[Measurement]
				([RecordDate], [CropProductionId], [MeasurementVariableId], [MinValue], [MaxValue], [AvgValue], [SumValue])
			SELECT
				CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate])) + ':00:00' AS recordDate,
				MAX(RD.[CropProductionId]) as CropProductionId,
				MAX(RD.[MeasurementVariableId]) as MeasurementVariableId, 
				MIN(RCAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) as MinValue,
				MAX(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) as MaxValue,
				AVG(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) as AvgValue,
				SUM(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) as SumValue
			FROM [dbo].[MeasurementBase] RD, [dbo].[Device] DV, [dbo].[Sensor] SE, [dbo].[CropProductionDevice] DC
			WHERE RD.DeviceId = DV.DeviceId and RD.DeviceId = DV.DeviceId and RD.Sensor = SE.SensorLabel and
					SE.DeviceId = DV.Id and DV.Id = DC.DeviceId and RD.DeviceId = @deviceId
					AND Summarized = 0
					AND TRY_CAST(([Payload]/SE.NumberOfContainers) AS float) IS NOT NULL
					AND [Summarized] = 0
			GROUP BY
					DC.[CropProductionId],
					SE.[MeasurementVariableId],
					DATEPART(YEAR, RD.[RecordDate]),
					DATEPART(MONTH, RD.[RecordDate]),
					DATEPART(DAY,RD.[RecordDate]),
					DATEPART(HOUR, RD.[RecordDate])
		    HAVING (MIN(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) +
				    MAX(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) + 
					AVG(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT)) +
					SUM(CAST(ISNULL(([Payload]/SE.NumberOfContainers),0) AS FLOAT))) > 0
			order by CropProductionId, MeasurementVariableId, RecordDate


			UPDATE [dbo].[DeviceRawData] SET [Summarized] = 1 WHERE [RecordDate] < @currentHour and Id in (
			select distinct a.Id from
				( select Id, DeviceId, Sensor from [dbo].[DeviceRawData] ) a
				JOIN
				(
				SELECT
				CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate])) + ':00:00' AS recordDate,
				MAX([DeviceId]) as DeviceId,
				MAX([Sensor]) as Sensor, 
				MIN(CAST(ISNULL(([Payload],0) AS FLOAT)) as MinValue,
				MAX(CAST(ISNULL(([Payload],0) AS FLOAT)) as MaxValue,
				AVG(CAST(ISNULL(([Payload],0) AS FLOAT)) as AvgValue,
				SUM(CAST(ISNULL(([Payload],0) AS FLOAT)) as SumValue
				FROM [dbo].[DeviceRawData] RD
				WHERE DeviceId =  @deviceId
						AND Summarized = 0
						AND TRY_CAST([Payload] AS float) IS NOT NULL
						AND [Summarized] = 0
				GROUP BY
						[DeviceId],
						[Sensor],
						DATEPART(YEAR, RD.[RecordDate]),
						DATEPART(MONTH, RD.[RecordDate]),
						DATEPART(DAY,RD.[RecordDate]),
						DATEPART(HOUR, RD.[RecordDate])
				HAVING (MIN(CAST(ISNULL([Payload],0) AS FLOAT)) +
						MAX(CAST(ISNULL([Payload],0) AS FLOAT)) + 
						AVG(CAST(ISNULL([Payload],0) AS FLOAT)) +
						SUM(CAST(ISNULL([Payload],0) AS FLOAT))) > 0
						) b
				ON a.DeviceId = b.DeviceId and a.Sensor = b.Sensor)

			IF @transtate = 1 
				AND XACT_STATE() = 1
				COMMIT TRANSACTION transtate

			SET @resultMessage = OBJECT_NAME(@@PROCID) + ' Successfully Executed' 


		END TRY
		BEGIN CATCH
 
		DECLARE @Error_Message VARCHAR(5000)
		DECLARE @Error_Severity INT
		DECLARE @Error_State INT
 
		SELECT @Error_Message = ERROR_MESSAGE()
		SELECT @Error_Severity = ERROR_SEVERITY()
		SELECT @Error_State = ERROR_STATE()
 
		   IF @transtate = 1 
		   AND XACT_STATE() <> 0
		   ROLLBACK TRANSACTION
 
		RAISERROR (@Error_Message, @Error_Severity, @Error_State)
 
	END CATCH
END