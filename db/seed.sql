INSERT INTO users (user_id, external_id) VALUES
('usr_test123', 'auth0|123456789'),
('usr_test456', 'auth0|987654321');

-- Add some strains for testing
INSERT INTO strains (strain_id, user_id, name, type, thc_percent, cbd_percent, current_quantity_grams)
VALUES
('str_blue_dream', 'usr_test123', 'Blue Dream', 'hybrid', 21.5, 0.2, 10.0),
('str_og_kush', 'usr_test123', 'OG Kush', 'indica', 24.0, 0.1, 5.5);

-- Add some sessions
INSERT INTO sessions (session_id, user_id, start_time, duration_minutes, consumption_method, strain_id, session_type)
VALUES
('sesh_test1', 'usr_test123', unixepoch() - 86400, 30, 'vape', 'str_blue_dream', 'recreational'),
('sesh_test2', 'usr_test123', unixepoch() - 3600, 45, 'flower', 'str_og_kush', 'medical'); 