-- =============================================
-- Author:		<Esteban Brenes>
-- Create date: <2022/08>
-- Description:	<Authenticates the deviceid and password to provide access to the API>
-- =============================================
-- Change History
--DATE		CHANGED BY		CHANGE CODE		DESCRIPTION

-- =============================================
CREATE PROCEDURE [dbo].[AuthenticateDevice]
	@deviceId NVARCHAR(32),
	@password NVARCHAR(32),
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

			IF (SELECT COUNT([Id]) FROM [dbo].[Device] WHERE [DeviceId] = @deviceId AND ([Password] = @password) AND [Active] = 1) > 0
			BEGIN
				SELECT 
					[Id], 
					[CompanyId],
					[DeviceId],
					[Password],
					[ConnectUsername],
					[ConnectPassword],
					[Active],
					[DateCreated],
					[DateUpdated],
					[CreatedBy],
					[UpdatedBy]
				FROM [dbo].[Device]
				WHERE [DeviceId] = @deviceId 
					AND [Password] = @password
					AND [Active] = 1
			END		

			IF @transtate = 1 
				AND XACT_STATE() = 1
				COMMIT TRANSACTION transtate

			SET @resultMessage = OBJECT_NAME(@@PROCID) + ' Successfully Executed' 

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