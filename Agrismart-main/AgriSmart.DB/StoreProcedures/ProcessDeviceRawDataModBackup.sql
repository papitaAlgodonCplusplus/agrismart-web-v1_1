-- =============================================
-- Author:		<Esteban Brenes, edited by César Solano>
-- Create date: <2022/12>
-- Description:	<Moves the RawData to the Measurement table>
-- =============================================
-- Change History
--DATE	2024/12	CHANGED BY César Solano	CHANGE CODE	DESCRIPTION inserting data mapped to the CropProduction and using MeasurementVariable field
--exec [dbo].[ProcessDeviceRawData] ''
-- =============================================
CREATE PROCEDURE [dbo].[ProcessDeviceRawData2]
	@deviceId NVARCHAR(32),
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

			DECLARE @currentHour DateTime
			DECLARE @targetTimeZone Varchar(50)

			set  @targetTimeZone = (SELECT FA.TimeZoneName
			FROM [dbo].[Device] as DV
			INNER JOIN [dbo].[CropProductionDevice] DC ON DV.Id = DC.DeviceId
			INNER JOIN [dbo].[ProductionUnit] PU ON DC.CropProductionId = PU.Id
			INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
			WHERE 
				DV.Id =  @deviceId)

			SET @currentHour = (select FORMAT(GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @targetTimeZone, 'yyyy-MM-dd HH:00'))


			Declare @currentCropProductionId int
			set @currentCropProductionId = (select top 1 cp.CropProductionId from [dbo].[CropProductionDevice] cp where DeviceId = @deviceId
			order by cp.DateCreated desc)

			INSERT INTO [dbo].[MeasurementBase]
				([RecordDate], [CropProductionId], [MeasurementVariableId], [SensorId], [RecordValue])
				SELECT
				RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName AS LocalTime,
				DC.CropProductionId,
				SE.[MeasurementVariableId], 
				SE.id,
				CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0) / SE.NumberOfContainers AS FLOAT) AS RecordValue
			FROM [dbo].[DeviceRawData] RD
			INNER JOIN [dbo].[Device] DV ON RD.DeviceId = DV.DeviceId
			INNER JOIN [dbo].[Sensor] SE ON RD.Sensor = SE.SensorLabel AND SE.DeviceId = DV.Id
			CROSS APPLY (
				SELECT TOP 1 B.CropProductionId, PU.FarmId
				FROM [dbo].[CropProductionDevice] B
				INNER JOIN [dbo].[CropProduction] CP ON B.CropProductionId = CP.Id  -- Move join inside CROSS APPLY
				INNER JOIN [dbo].[ProductionUnit] PU ON CP.ProductionUnitId = PU.Id  
				INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
				WHERE B.InitDate AT TIME ZONE FA.TimeZoneName AT TIME ZONE 'UTC' <= RD.RecordDate
				ORDER BY B.InitDate DESC
			) DC
			INNER JOIN [dbo].[Farm] FA ON DC.FarmId = FA.Id  -- Now you can use DC.FarmId
			WHERE 
				DV.Id = @deviceId
				AND TRY_CAST([Payload] AS FLOAT) IS NOT NULL
				AND [Summarized] = 0
			ORDER BY 
				DC.CropProductionId, SE.MeasurementVariableId, RD.RecordDate;

			delete from [dbo].[Measurement] where FORMAT(RecordDate, 'yyyy-MM-dd HH:00') =  @currentHour 
			and CropProductionId = @currentCropProductionId 

			delete from [dbo].[MeasurementBase] where FORMAT(RecordDate, 'yyyy-MM-dd HH:00') =  @currentHour 
			and CropProductionId = @currentCropProductionId 

			INSERT INTO [dbo].[Measurement]
				([RecordDate], [CropProductionId], [MeasurementVariableId], [MinValue], [MaxValue], [AvgValue], [SumValue])
			SELECT
				CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + ':00:00' AS recordDate,
				MAX(DC.[CropProductionId]) as CropProductionId,
				MAX(SE.[MeasurementVariableId]) as MeasurementVariableId, 
				MIN(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0) / SE.NumberOfContainers AS FLOAT)) as MinValue,
				MAX(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0) / SE.NumberOfContainers AS FLOAT)) as MaxValue,
				AVG(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0) / SE.NumberOfContainers AS FLOAT)) as AvgValue,
				SUM(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0) / SE.NumberOfContainers AS FLOAT)) as SumValue
			FROM [dbo].[DeviceRawData] RD 
			INNER JOIN [dbo].[Device] DV ON RD.DeviceId = DV.DeviceId
			INNER JOIN [dbo].[Sensor] SE ON RD.Sensor = SE.SensorLabel AND SE.DeviceId = DV.Id
			CROSS APPLY (
				SELECT TOP 1 B.CropProductionId, PU.FarmId
				FROM [dbo].[CropProductionDevice] B
				INNER JOIN [dbo].[CropProduction] CP ON B.CropProductionId = CP.Id  -- Move join inside CROSS APPLY
				INNER JOIN [dbo].[ProductionUnit] PU ON CP.ProductionUnitId = PU.Id  
				INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
				WHERE B.InitDate AT TIME ZONE FA.TimeZoneName AT TIME ZONE 'UTC' <= RD.RecordDate
				ORDER BY B.InitDate DESC
			) DC
			INNER JOIN [dbo].[Farm] FA ON DC.FarmId = FA.Id  -- Now you can use DC.FarmId
			WHERE DV.Id = @deviceId
					AND TRY_CAST([Payload] AS float) IS NOT NULL
					AND [Summarized] = 0
			GROUP BY
					DC.[CropProductionId],
					SE.[MeasurementVariableId],
					DATEPART(YEAR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
					DATEPART(MONTH, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
					DATEPART(DAY,RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
					DATEPART(HOUR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)
		    HAVING (MIN(CAST(ISNULL([Payload],0) AS FLOAT)) +
					MAX(CAST(ISNULL([Payload],0) AS FLOAT)) + 
					AVG(CAST(ISNULL([Payload],0) AS FLOAT)) +
					SUM(CAST(ISNULL([Payload],0) AS FLOAT))) > 0
			order by CropProductionId, MeasurementVariableId, RecordDate

			UPDATE [dbo].[DeviceRawData] SET [Summarized] = 1 WHERE [RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE @targetTimeZone < @currentHour and Id in (
			select distinct a.Id from
				(select Id, DeviceId, Sensor from [dbo].[DeviceRawData] ) a
				JOIN
				(
					SELECT
						RD.[DeviceId],
						RD.[Sensor],
						CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)) + ':00:00' AS recordDate,
						MAX(DC.[CropProductionId]) as CropProductionId,
						MAX(SE.[MeasurementVariableId]) as MeasurementVariableId, 
						MIN(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0)  / SE.NumberOfContainers AS FLOAT)) as MinValue,
						MAX(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0)  / SE.NumberOfContainers AS FLOAT)) as MaxValue,
						AVG(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0)  / SE.NumberOfContainers AS FLOAT)) as AvgValue,
						SUM(CAST(ISNULL(TRY_CAST([Payload] AS FLOAT), 0)  / SE.NumberOfContainers AS FLOAT)) as SumValue
					FROM [dbo].[DeviceRawData] RD 
					INNER JOIN [dbo].[Device] DV ON RD.DeviceId = DV.DeviceId
					INNER JOIN [dbo].[Sensor] SE ON RD.Sensor = SE.SensorLabel AND SE.DeviceId = DV.Id
					CROSS APPLY (
						SELECT TOP 1 B.CropProductionId, PU.FarmId
						FROM [dbo].[CropProductionDevice] B
						INNER JOIN [dbo].[CropProduction] CP ON B.CropProductionId = CP.Id  -- Move join inside CROSS APPLY
						INNER JOIN [dbo].[ProductionUnit] PU ON CP.ProductionUnitId = PU.Id  
						INNER JOIN [dbo].[Farm] FA ON PU.FarmId = FA.Id
						WHERE B.InitDate AT TIME ZONE FA.TimeZoneName AT TIME ZONE 'UTC' <= RD.RecordDate
						ORDER BY B.InitDate DESC
					) DC
					INNER JOIN [dbo].[Farm] FA ON DC.FarmId = FA.Id  -- Now you can use DC.FarmId
					WHERE DV.Id = @deviceId
							AND Summarized = 0
							AND TRY_CAST([Payload] AS float) IS NOT NULL
							AND [Summarized] = 0
					GROUP BY
							RD.[DeviceId],
							RD.[Sensor],
							DATEPART(YEAR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
							DATEPART(MONTH, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
							DATEPART(DAY,RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName),
							DATEPART(HOUR, RD.[RecordDate] AT TIME ZONE 'UTC' AT TIME ZONE FA.TimeZoneName)
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