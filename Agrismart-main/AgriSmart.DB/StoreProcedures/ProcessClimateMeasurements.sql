-- =============================================
-- Author:		<Esteban Brenes>
-- Create date: <2023/05>
-- Description:	<Moves the RawData to the Climate Measurement table>
-- =============================================
-- Change History
--DATE		CHANGED BY		CHANGE CODE		DESCRIPTION
--exec [dbo].[ProcessDeviceRawDataClimateMeasurements] 1, ''
-- =============================================
CREATE PROCEDURE [dbo].[ProcessDeviceRawDataClimateMeasurements]
	@deviceId INT,
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


			DECLARE @Now DATETIME = GETDATE()
			DECLARE @NowOneHourBefore DATETIME = DATEADD(hh, -1, @Now)

			DECLARE @LastDate DATETIME

			SET @LastDate =	ISNULL((SELECT 
				CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00' 
			FROM [dbo].[DeviceRawData] DRD_TEM 
				JOIN 
					[dbo].[Device] D
					ON DRD_TEM.[DeviceId] = D.[DeviceId] AND D.[Id] = @deviceId
						JOIN [dbo].[Sensor] S1
							ON DRD_TEM.[Sensor] = S1.[SensorLabel]
							AND S1.[Description] = 'Temperature' 
				JOIN [dbo].[ClimateMeasurement] CM ON CM.[RecordDateTime] = (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00')
				AND DRD_TEM.[Summarized] = 0 AND CM.[DeviceId] = @deviceId
				
			GROUP BY CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00'),'1900/01/01')
			
			DECLARE @existingRecordDateTime DATETIME
			DECLARE @existingDeviceId INT
			DECLARE @updatedMinTemperature FLOAT
			DECLARE @updatedMaxTemperature FLOAT
			DECLARE @updatedAvgTemperature FLOAT
			DECLARE @updatedMinHumidity FLOAT
			DECLARE @updatedMaxHumidity FLOAT
			DECLARE @updatedAvgHumidity FLOAT
			DECLARE @updatedMinWindSpeed FLOAT
			DECLARE @updatedMaxWindSpeed FLOAT
			DECLARE @updatedAvgWindSpeed FLOAT

			SELECT	
				@existingRecordDateTime = CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00',
				@existingDeviceId = MAX(D.[Id]),
				@updatedMinTemperature = MIN(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)), 
				@updatedMaxTemperature = MAX(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)),
				@updatedAvgTemperature = AVG(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)),
				@updatedMinHumidity = MIN(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)), 
				@updatedMaxHumidity = MAX(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)),
				@updatedAvgHumidity = AVG(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)),
				@updatedMinWindSpeed = MIN(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT)), 
				@updatedMaxWindSpeed = MAX(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT)),
				@updatedAvgWindSpeed = AVG(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT))
			FROM [dbo].[DeviceRawData] DRD_TEM 
			JOIN 
				[dbo].[Device] D
				ON DRD_TEM.[DeviceId] = D.[DeviceId]
					JOIN [dbo].[Sensor] S1
						ON DRD_TEM.[Sensor] = S1.[SensorLabel]
						AND S1.[Description] = 'Temperature' 
			JOIN
				[dbo].[DeviceRawData] DRD_HUM
				ON (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00') = 
					(CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_HUM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_HUM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_HUM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_HUM.[RecordDate])) + ':00:00')	
					JOIN [dbo].[Sensor] S2
						ON DRD_HUM.[Sensor] = S2.[SensorLabel]
						AND S2.[Description] = 'Humidity' 
			JOIN
				[dbo].[DeviceRawData] DRD_WINDSPEED
				ON (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00') = 
					(CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_WINDSPEED.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_WINDSPEED.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_WINDSPEED.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_WINDSPEED.[RecordDate])) + ':00:00')
					JOIN [dbo].[Sensor] S3
						ON DRD_WINDSPEED.[Sensor] = S3.[SensorLabel]
						AND S3.[Description] = 'Wind Speed' 	
			WHERE
				D.[Id] = @deviceId 
				AND TRY_CAST(DRD_TEM.[Payload] AS float) IS NOT NULL
				AND TRY_CAST(DRD_HUM.[Payload] AS float) IS NOT NULL
				AND TRY_CAST(DRD_WINDSPEED.[Payload] AS float) IS NOT NULL
				AND CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00' = @LastDate
			GROUP BY 
				D.DeviceId,
				DATEPART(YEAR, DRD_TEM.[RecordDate]),
				DATEPART(MONTH, DRD_TEM.[RecordDate]),
				DATEPART(DAY, DRD_TEM.[RecordDate]),
				DATEPART(HOUR, DRD_TEM.[RecordDate])
				

			UPDATE [dbo].[ClimateMeasurement]
			SET 
				[MinTemperature] = @updatedMinTemperature,
				[MaxTemperature] = @updatedMaxTemperature,
				[AvgTemperature] = @updatedAvgTemperature,
				[MinHumidity] = @updatedMinHumidity,
				[MaxHumidity] = @updatedMaxHumidity,
				[AvgHumidity] = @updatedAvgHumidity,
				[MinWindSpeed] = @updatedMinWindSpeed,
				[MaxWindSpeed] = @updatedMaxWindSpeed,
				[AvgWindSpeed] = @updatedAvgWindSpeed
			WHERE [RecordDateTime] = @existingRecordDateTime
				AND [DeviceId] = @existingDeviceId


			INSERT INTO [dbo].[ClimateMeasurement] ([RecordDateTime],[DeviceId],[MinTemperature],[MaxTemperature],[AvgTemperature],[MinHumidity],[MaxHumidity],[AvgHumidity],[MinWindSpeed],[MaxWindSpeed],[AvgWindSpeed])
			SELECT 				
				CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00' AS [RecordDateTime],
				MAX(D.[Id]) AS [DeviceId],
				MIN(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)) AS [MinTemperature], 
				MAX(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)) AS [MaxTemperature],
				AVG(CAST(ISNULL(DRD_TEM.[Payload],0) AS FLOAT)) AS [AvgTemperature],
				MIN(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)) AS [MinHumidity], 
				MAX(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)) AS [MaxHumidity],
				AVG(CAST(ISNULL(DRD_HUM.[Payload],0) AS FLOAT)) AS [AvgHumidity],
				MIN(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT)) AS [MinWindSpeed], 
				MAX(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT)) AS [MaxWindSpeed],
				AVG(CAST(ISNULL(DRD_WINDSPEED.[Payload],0) AS FLOAT)) AS [AvgWindSpeed]
			FROM [dbo].[DeviceRawData] DRD_TEM 
			JOIN 
				[dbo].[Device] D
				ON DRD_TEM.[DeviceId] = D.[DeviceId]
					JOIN [dbo].[Sensor] S1
						ON DRD_TEM.[Sensor] = S1.[SensorLabel]
						AND S1.[Description] = 'Temperature' 
			JOIN
				[dbo].[DeviceRawData] DRD_HUM
				ON (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00') = 
					(CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_HUM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_HUM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_HUM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_HUM.[RecordDate])) + ':00:00')	
					JOIN [dbo].[Sensor] S2
						ON DRD_HUM.[Sensor] = S2.[SensorLabel]
						AND S2.[Description] = 'Humidity' 
			JOIN
				[dbo].[DeviceRawData] DRD_WINDSPEED
				ON (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00') = 
					(CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_WINDSPEED.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_WINDSPEED.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_WINDSPEED.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_WINDSPEED.[RecordDate])) + ':00:00')
					JOIN [dbo].[Sensor] S3
						ON DRD_WINDSPEED.[Sensor] = S3.[SensorLabel]
						AND S3.[Description] = 'Wind Speed' 
			WHERE
				D.[Id] = @deviceId 
				AND TRY_CAST(DRD_TEM.[Payload] AS float) IS NOT NULL
				AND TRY_CAST(DRD_HUM.[Payload] AS float) IS NOT NULL
				AND TRY_CAST(DRD_WINDSPEED.[Payload] AS float) IS NOT NULL
				AND DRD_TEM.[RecordDate] < @NowOneHourBefore 	
				AND (CONVERT(VARCHAR(4), DATEPART(YEAR, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, DRD_TEM.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, DRD_TEM.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, DRD_TEM.[RecordDate])) + ':00:00') > @LastDate
				AND DRD_TEM.[Summarized] = 0
			GROUP BY 
				D.DeviceId,
				DATEPART(YEAR, DRD_TEM.[RecordDate]),
				DATEPART(MONTH, DRD_TEM.[RecordDate]),
				DATEPART(DAY, DRD_TEM.[RecordDate]),
				DATEPART(HOUR, DRD_TEM.[RecordDate])


			UPDATE [dbo].[DeviceRawData] 
			SET [Summarized] = 1
			FROM [dbo].[DeviceRawData] DRD
			JOIN 
				[dbo].[Device] D
				ON DRD.[DeviceId] = D.[DeviceId]
					JOIN [dbo].[Sensor] S
						ON DRD.[Sensor] = S.[SensorLabel]
						AND S.[Description] IN ('Temperature','Humidity','Wind Speed') 
			WHERE
				D.[Id] = @deviceId 
				AND DRD.[RecordDate] < @NowOneHourBefore 	
				AND DRD.[Summarized] = 0
				
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