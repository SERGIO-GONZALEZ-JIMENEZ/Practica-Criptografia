import express from 'express'; // Framework para crear el servidor
import cors from 'cors'; // Permite peticiones a un servidor desde otro dominio
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import bcrypt from 'bcrypt'; // Librería para hashear contraseñas
import {createClient} from '@supabase/supabase-js'; // Cliente de supabase

const app = express(); // Crear servidor
app.use(cors()); // Lee peticiones del front-end
app.use(express.json()); // Lee body de las peticiones

// Claves JWT
const clavePrivada = fs.readFileSync('private.key', 'utf8');
const clavePublica = fs.readFileSync('public.key', 'utf8');

// Conexión a supabase
const SUPABASE_URL = 'https://cdulvsxglpepjvgkrcmq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdWx2c3hnbHBlcGp2Z2tyY21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA1NzgxOSwiZXhwIjoyMDc2NjMzODE5fQ.9_3JNT39GsldPBybtRTNncyHC6cQ5Uj7xfpGdpFXbl0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Registro de usuario
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Comprobar si el usuario ya existe
    let {data: usuarioExistente, error: selectError} = await supabase
        // Consulta de SQL
        .from('user')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Devuelve usuario o null

    if (usuarioExistente) {
        // 400 Bad Resquest
        return res.status(400).json({error: 'Email ya registrado'})
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10); // Genera cadena aleatoria con 10 rondas para que el hash sea distinto cada vez
    const passwordHash = await bcrypt.hash(password, salt);

    // Guardar email y password hasheada en base de datos
    let {data, error: insertError} = await supabase
        // Inserción de SQL
        .from('user')
        .insert([{email: email, password_hash: passwordHash}]);
    
    if (insertError) {
        // 500 Internal Server Error
        return res.status(500).json({error: 'Error al insertar en Supabase'});
    }

    res.json({ message: 'Usuario registrado exitosamente' });
});

// Login de usuario
app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    // Comprobar si el usuario existe
    let {data: usuario, error: selectError} = await supabase
        // Consulta de SQL
        .from('user')
        .select('id, email, password_hash')
        .eq('email', email)
        .single(); // Devuelve usuario o error
    
    if (!usuario || selectError) {
        // 401 Unauthorized
        return res.status(401).json({error: 'Credenciales inválidas'});
    }
    
    // Comprobar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
        // 401 Unauthorized
        return res.status(401).json({error: 'Credenciales inválidas'});
    }

    // Crear token JWT
    const usuarioPayload = {
        id: usuario.id,
        email: usuario.email
    };

    const token = jwt.sign(usuarioPayload, clavePrivada, {algorithm: 'RS256', expiresIn: '1h'});

    // Enviar token al cliente
    res.json({token: token});
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
