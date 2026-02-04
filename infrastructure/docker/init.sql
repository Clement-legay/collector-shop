-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS articles;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS fraud;

-- Grant permissions
GRANT ALL ON SCHEMA users TO collector;
GRANT ALL ON SCHEMA articles TO collector;
GRANT ALL ON SCHEMA payments TO collector;
GRANT ALL ON SCHEMA fraud TO collector;
