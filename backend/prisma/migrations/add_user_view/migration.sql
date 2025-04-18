CREATE VIEW UserView AS
SELECT
  id,
  username,
  phoneNumber,
  NULL AS email,
  'CUSTOMER' AS role
FROM Customer

UNION ALL

SELECT 
    id, 
    username, 
    phoneNumber, 
    email, 
    'SERVICE_PROVIDER' AS role 

FROM ServiceProvider

UNION ALL

SELECT 
    id,
    username,        
    phoneNumber,
    NULL AS email,
    'WORKER' AS role
FROM Worker

UNION ALL

SELECT
  id,
  username,
  phoneNumber,
  NULL AS email,
  'ADMIN' AS role
From Admin


