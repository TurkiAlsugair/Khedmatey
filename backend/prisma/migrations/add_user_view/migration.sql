CREATE VIEW UserView AS
SELECT 
    id, 
    username, 
    phoneNumber, 
    NULL AS email,
    'customer' AS role 
FROM Customer

UNION ALL

SELECT 
    id, 
    username, 
    phoneNumber, 
    email, 
    'serviceProvider' AS role 
FROM ServiceProvider;
