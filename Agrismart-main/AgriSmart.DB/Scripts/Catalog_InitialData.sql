INSERT INTO [dbo].[Catalog] ([ClientId],[Name], [CreatedBy]) VALUES (0, 'Default', 1)


INSERT INTO [dbo].[ProductionUnitType] ([Name],[CreatedBy]) VALUES ('Campo',1)
INSERT INTO [dbo].[ProductionUnitType] ([Name],[CreatedBy]) VALUES ('Invernadero',1)
INSERT INTO [dbo].[ProductionUnitType] ([Name],[CreatedBy]) VALUES ('Area Protegida',1)

INSERT INTO [dbo].[Crop]
           ([Name]
           ,[Description]
           ,[CreatedBy])
VALUES
('Genérica frutos','',1),
('Tomate','',1),
('Chile dulce','',1),
('Berenjena','',1),
('Melón','',1),
('Sandía','',1),
('Pepino','',1),
('Suchini','',1),
('Ayote','',1),
('Fresa','',1),
('Arándano','',1),
('Generica hojas','',1),
('Lechuga sustrato','',1),
('Lechuga NFT','',1),
('Culantro','',1),
('Apio','',1),
('Perejil','',1),
('Kale','',1),
('Vainica','',1),
('Ornamental','',1),
('Clavel','',1),
('Rosas','',1),
('Gerbera','',1)

INSERT INTO [dbo].[Profile] ([Name],[Description],[CreatedBy]) VALUES ('SuperUser','System Super User', 1)
INSERT INTO [dbo].[Profile] ([Name],[Description],[CreatedBy]) VALUES ('ClientAdmin','Client Admin User', 1)
INSERT INTO [dbo].[Profile] ([Name],[Description],[CreatedBy]) VALUES ('CompanyUser','Company Regular User', 1)
INSERT INTO [dbo].[Profile] ([Name],[Description],[CreatedBy]) VALUES ('Application','Application account', 1)


INSERT INTO [dbo].[UserStatus] ([Name],[Description],[CreatedBy]) VALUES ('Registrado','Usuario registrado - debe validarse', 1)
INSERT INTO [dbo].[UserStatus] ([Name],[Description],[CreatedBy]) VALUES ('Validado','Usuario validado - debe activarse (actualizar contraseña)', 1)
INSERT INTO [dbo].[UserStatus] ([Name],[Description],[CreatedBy]) VALUES ('Desactivado','Usuario desactivado - debe activarse (actualizar contraseña)', 1)
INSERT INTO [dbo].[UserStatus] ([Name],[Description],[CreatedBy]) VALUES ('Reseteado','Usuario reseteado - debe activarse (actualizar contraseña)', 1)
INSERT INTO [dbo].[UserStatus] ([Name],[Description],[CreatedBy]) VALUES ('Activado','Usuario activado - puedo utilizar el sistema', 1)


INSERT INTO [dbo].[GrowingMedium] ([Name],[Description],[CreatedBy]) VALUES ('Registrado','Usuario registrado - debe validarse', 1)

INSERT INTO [dbo].[ContainerType] ([Name],[CreatedBy]) VALUES ('Cónico',1)
INSERT INTO [dbo].[ContainerType] ([Name],[CreatedBy]) VALUES ('Cilíndrico',1)
INSERT INTO [dbo].[ContainerType] ([Name],[CreatedBy]) VALUES ('Cúbico',1)


INSERT INTO [dbo].[TimeZone] ([Name],[CreatedBy]) VALUES ('Dateline Standard Time',1)
INSERT INTO [dbo].[TimeZone] ([Name],[CreatedBy]) VALUES ('UTC-11',1)
INSERT INTO [dbo].[TimeZone] ([Name],[CreatedBy]) VALUES ('Samoa Standard Time',1)
INSERT INTO [dbo].[TimeZone] ([Name],[CreatedBy]) VALUES ('Hawaiian Standard Time',1)