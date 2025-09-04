-- =============================================
-- Author:		<Esteban Brenes>
-- Create date: <2023/02
-- Description:	<Gets the Measurement for the dates and user>
-- =============================================
-- Change History
--DATE		CHANGED BY		CHANGE CODE		DESCRIPTION
--exec [dbo].[ProcessRawData] ''
-- =============================================
CREATE PROCEDURE [dbo].[GetMeasurement]
	@StartDate DATETIME,
	@EndDate DATETIME,
	@User NVARCHAR(32)
AS
	BEGIN
		DECLARE @transtate BIT
		IF @@TRANCOUNT = 0
		BEGIN
			SET @transtate = 1
			BEGIN TRANSACTION transtate
		END
 
	BEGIN TRY

			SELECT * FROM [dbo].[Measurement] 
			WHERE [RecordDate] > @StartDate AND [RecordDate] < @EndDate


			IF @transtate = 1 
				AND XACT_STATE() = 1
				COMMIT TRANSACTION transtate


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