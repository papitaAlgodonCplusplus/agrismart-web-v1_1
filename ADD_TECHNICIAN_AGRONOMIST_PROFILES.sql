-- Add TechnicianUser and AgronomistUser profiles
-- Run this against the AgriSmart database

-- Rename existing profile names to match the new role labels (optional but recommended for clarity)
UPDATE [dbo].[Profile] SET [Name] = 'Admin User', [Description] = 'Administrator with access to all configuration and management features' WHERE [Id] = 2;

-- Insert Technician User profile (Id = 5)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Profile] WHERE [Id] = 5)
BEGIN
    SET IDENTITY_INSERT [dbo].[Profile] ON;
    INSERT INTO [dbo].[Profile] ([Id], [Name], [Description], [Active], [DateCreated], [CreatedBy])
    VALUES (5, 'Technician User', 'Technical user with access to hardware configuration, sensors, devices, and technical tools', 1, GETDATE(), 1);
    SET IDENTITY_INSERT [dbo].[Profile] OFF;
END

-- Insert Agronomist User profile (Id = 6)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Profile] WHERE [Id] = 6)
BEGIN
    SET IDENTITY_INSERT [dbo].[Profile] ON;
    INSERT INTO [dbo].[Profile] ([Id], [Name], [Description], [Active], [DateCreated], [CreatedBy])
    VALUES (6, 'Agronomist User', 'Agronomist with access to day-to-day operative components: crop production, irrigation, and analytics', 1, GETDATE(), 1);
    SET IDENTITY_INSERT [dbo].[Profile] OFF;
END

-- Insert Agronomist + Technician combined profile (Id = 7)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Profile] WHERE [Id] = 7)
BEGIN
    SET IDENTITY_INSERT [dbo].[Profile] ON;
    INSERT INTO [dbo].[Profile] ([Id], [Name], [Description], [Active], [DateCreated], [CreatedBy])
    VALUES (7, 'Agronomist + Technician', 'Combined role with full access to both technical/configuration and operative/agronomic features', 1, GETDATE(), 1);
    SET IDENTITY_INSERT [dbo].[Profile] OFF;
END

SELECT [Id], [Name], [Description], [Active] FROM [dbo].[Profile] ORDER BY [Id];
