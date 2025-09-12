-- MatTailor AI Database Initialization Script

-- Create database and user if they don't exist
-- This is run automatically by PostgreSQL on container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create main tables for materials database
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    properties JSONB,
    composition JSONB,
    supplier_info JSONB,
    cost_data JSONB,
    sustainability_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_properties ON materials USING GIN (properties);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);

-- Create recommendations table for caching
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL,
    query_data JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX IF NOT EXISTS idx_recommendations_hash ON recommendations(query_hash);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires ON recommendations(expires_at);

-- Create user sessions table for rate limiting
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_identifier ON user_sessions(user_identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_user_sessions_window ON user_sessions(window_start);

-- Create API usage logs
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_ip INET,
    user_agent TEXT,
    request_data JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_ip ON api_logs(user_ip);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for materials table
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
    DELETE FROM recommendations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled cleanup (requires pg_cron extension in production)
-- SELECT cron.schedule('cleanup-recommendations', '0 * * * *', 'SELECT cleanup_expired_recommendations();');

-- Insert some sample materials for testing
INSERT INTO materials (name, category, description, properties, composition) VALUES
('Aluminum 6061', 'Metal', 'Versatile aluminum alloy with good strength and corrosion resistance', 
 '{"density": 2.7, "tensile_strength": 310, "yield_strength": 276, "elastic_modulus": 68.9}',
 '{"Al": 97.9, "Mg": 1.0, "Si": 0.6, "Cu": 0.3, "Cr": 0.2}'),
('Carbon Fiber Composite', 'Composite', 'High-strength, lightweight composite material',
 '{"density": 1.6, "tensile_strength": 3500, "yield_strength": 3500, "elastic_modulus": 230}',
 '{"carbon_fiber": 60, "epoxy_resin": 40}'),
('Stainless Steel 316L', 'Metal', 'Corrosion-resistant austenitic stainless steel',
 '{"density": 8.0, "tensile_strength": 580, "yield_strength": 290, "elastic_modulus": 200}',
 '{"Fe": 68, "Cr": 17, "Ni": 12, "Mo": 2.5, "C": 0.03}')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;