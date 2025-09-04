-- =============================================
-- Author:		<Esteban Brenes>
-- Create date: <2022/12>
-- Description:	<Moves the RawData to the Measurement table>
-- =============================================
-- Change History
--DATE		CHANGED BY		CHANGE CODE		DESCRIPTION
--exec [dbo].[ProcessDeviceRawData] ''
-- =============================================
CREATE PROCEDURE [dbo].[ProcessDeviceRawData]
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

			DECLARE @lastSummarizedRecordId INT
			SET @lastSummarizedRecordId = ISNULL((SELECT MAX([Id]) FROM [dbo].[DeviceRawData] WHERE [DeviceId] = @deviceId AND [Summarized] = 1), 0)

			DECLARE @lastRecordId INT
			SET @lastRecordId = ISNULL((SELECT MAX([Id]) FROM [dbo].[DeviceRawData] WHERE [DeviceId] = @deviceId AND [Summarized] = 0), 0)

			DECLARE @existingRecordDate DATETIME
			DECLARE @existingDeviceId NVARCHAR(32)
			DECLARE @existingVariable NVARCHAR(32)
			DECLARE @existingMax FLOAT
			DECLARE @existingMin FLOAT
			DECLARE @existingAvg FLOAT
			DECLARE @existingSum FLOAT

			SELECT
				@existingRecordDate = CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate])) + ':00:00',
				@existingDeviceId = MAX(RD.[DeviceId]), 
				@existingVariable = MAX([Sensor]), 
				@existingMax = MAX(CAST(ISNULL([Payload],0) AS FLOAT)),
				@existingMin = MIN(CAST(ISNULL([Payload],0) AS FLOAT)),
				@existingAvg = AVG(CAST(ISNULL([Payload],0) AS FLOAT)),
				@existingSum = SUM(CAST(ISNULL([Payload],0) AS FLOAT))
			FROM [dbo].[DeviceRawData] RD
				JOIN [dbo].[Measurement] M ON RD.[Sensor] = M.[Variable]
			WHERE RD.[DeviceId] = @deviceId AND RD.[Id] > @lastSummarizedRecordId AND  RD.[Id] <= @lastRecordId
				AND TRY_CAST([Payload] AS float) IS NOT NULL
				GROUP BY
				RD.Sensor,
				DATEPART(YEAR, RD.[RecordDate]),
				DATEPART(MONTH, RD.[RecordDate]),
				DATEPART(DAY,RD.[RecordDate]),
				DATEPART(HOUR, RD.[RecordDate])


			UPDATE [dbo].[Measurement] SET 
				[MaxValue] = @existingMax, 
				[MinValue] = @existingMin, 
				[AvgValue] = @existingAvg, 
				[SumValue] = @existingSum
			WHERE [RecordDate] = @existingRecordDate AND [DeviceId] = @existingDeviceId AND [Variable] = @existingVariable


			INSERT INTO [dbo].[Measurement]
				([RecordDate], [DeviceId], [Variable], [MaxValue], [MinValue], [AvgValue], [SumValue])
			SELECT
				CONVERT(VARCHAR(4), DATEPART(YEAR, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(MONTH, RD.[RecordDate])) + '/' + CONVERT(VARCHAR(2),DATEPART(DAY, RD.[RecordDate])) + ' ' + CONVERT(VARCHAR(2),DATEPART(HOUR, RD.[RecordDate])) + ':00:00',
				MAX(RD.[DeviceId]), 
				MAX([Sensor]), 
				MAX(CAST(ISNULL([Payload],0) AS FLOAT)),
				MIN(CAST(ISNULL([Payload],0) AS FLOAT)),
				AVG(CAST(ISNULL([Payload],0) AS FLOAT)),
				SUM(CAST(ISNULL([Payload],0) AS FLOAT))
			FROM [dbo].[DeviceRawData] RD
			WHERE [DeviceId] = @deviceId 
					AND RD.[Id] > @lastSummarizedRecordId AND  RD.[Id] <= @lastRecordId
					AND TRY_CAST([Payload] AS float) IS NOT NULL
					AND [Summarized] = 0
				GROUP BY
					RD.Sensor,
					DATEPART(YEAR, RD.[RecordDate]),
					DATEPART(MONTH, RD.[RecordDate]),
					DATEPART(DAY,RD.[RecordDate]),
					DATEPART(HOUR, RD.[RecordDate])

			UPDATE [dbo].[DeviceRawData] SET [Summarized] = 1 WHERE [DeviceId] = @deviceId AND [Id] > @lastSummarizedRecordId AND [Id] <= @lastRecordId AND [Summarized] = 0

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