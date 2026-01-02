// 1. IMPORT (The tools)
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');

// 2. INITIALIZE (The "app")
const app = express(); // <--- This MUST come before you use "app.use"
const httpServer = createServer(app);

// 3. CONFIGURE (The settings)
app.use(cors({ origin: '*' })); // Now 'app' is defined and this will work!
app.use(express.json());        // Allows your server to read JSON data
app.use(express.static('public')); // Serves your maker.html and widget.js


// Route to save a new bot from your Maker UI
app.post('/api/create-bot', async (req, res) => {
    const { name, greeting, context } = req.body;
    const { data, error } = await _supabase.from('chatbots').insert([{ name, greeting, context }]).select();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.status(200).json({ success: true, id: data[0].id });
});

// Route for the widget to load bot settings
app.get('/api/get-bot', async (req, res) => {
    const { id } = req.query;
    const { data, error } = await _supabase.from('chatbots').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: "Bot not found" });
    res.json(data);

});
