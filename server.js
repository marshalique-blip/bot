// 1. IMPORT (The tools)
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { createClient } = require('@supabase/supabase-js');

// 2. ENVIRONMENT VARIABLES - Validate before using
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Validate environment variables (with helpful warnings)
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️  WARNING: Missing SUPABASE_URL or SUPABASE_KEY');
    console.warn('📝 Server will start but database operations will fail');
    console.warn('💡 Set environment variables in Render dashboard');
}

// Initialize Supabase client (will be null if env vars missing)
const supabase = SUPABASE_URL && SUPABASE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// 3. INITIALIZE (The "app")
const app = express();
const httpServer = createServer(app);

// 4. CONFIGURE (The settings)
app.use(cors({ 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// 5. ROUTES

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Route to save a new bot from your Maker UI
app.post('/api/create-bot', async (req, res) => {
    try {
        // Check if Supabase is configured
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_KEY.' 
            });
        }

        const { name, greeting, context } = req.body;
        
        // Validate input
        if (!name || !greeting) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and greeting are required' 
            });
        }

        const { data, error } = await supabase
            .from('chatbots')
            .insert([{ 
                name, 
                greeting, 
                context: context || '' 
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }

        if (!data || data.length === 0) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to create bot' 
            });
        }

        res.status(200).json({ 
            success: true, 
            id: data[0].id,
            bot: data[0]
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route for the widget to load bot settings
app.get('/api/get-bot', async (req, res) => {
    try {
        // Check if Supabase is configured
        if (!supabase) {
            return res.status(503).json({ 
                error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_KEY.' 
            });
        }

        const { id } = req.query;

        // Validate input
        if (!id) {
            return res.status(400).json({ 
                error: 'Bot ID is required' 
            });
        }

        const { data, error } = await supabase
            .from('chatbots')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(404).json({ 
                error: 'Bot not found' 
            });
        }

        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Route to get all bots (useful for listing in maker UI)
app.get('/api/list-bots', async (req, res) => {
    try {
        // Check if Supabase is configured
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_KEY.' 
            });
        }

        const { data, error } = await supabase
            .from('chatbots')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            bots: data 
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route to update a bot
app.put('/api/update-bot/:id', async (req, res) => {
    try {
        // Check if Supabase is configured
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_KEY.' 
            });
        }

        const { id } = req.params;
        const { name, greeting, context } = req.body;

        const { data, error } = await supabase
            .from('chatbots')
            .update({ name, greeting, context })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Bot not found' 
            });
        }

        res.json({ 
            success: true, 
            bot: data[0] 
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route to delete a bot
app.delete('/api/delete-bot/:id', async (req, res) => {
    try {
        // Check if Supabase is configured
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_KEY.' 
            });
        }

        const { id } = req.params;

        const { error } = await supabase
            .from('chatbots')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            message: 'Bot deleted successfully' 
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found' 
    });
});

// 6. START SERVER
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // CRITICAL for Render/Railway/Heroku

httpServer.listen(PORT, HOST, () => {
    console.log(`✅ Server running on ${HOST}:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
