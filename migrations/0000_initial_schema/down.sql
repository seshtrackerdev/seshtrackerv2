-- Drop all tables in reverse order of creation to respect foreign key constraints

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS dashboard_widgets;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS strains;
DROP TABLE IF EXISTS users; 