import express from 'express'; // Framework para crear el servidor
import cors from 'cors'; // Permite peticiones a un servidor desde otro dominio
import jwt from 'jsonwebtoken';
import fs from 'fs';
import bcrypt from 'bcrypt'; // Librería para hashear contraseñas
import {createClient} from '@supabase/supabase-js'; // Cliente de supabase
import {verificarTokenMiddleware} from './authMiddleware.mjs'; // Para verificar JWT

// Cargamos ruta de los archivos y directorios para que no haya errores a la hora de iniciar el servidor
import path from 'path'; // Para el tema de / en Mac o Linux y \ en Windows
import {fileURLToPath} from 'url'; 
const __filename = fileURLToPath(import.meta.url); // Obtener dirección
const __dirname = path.dirname(__filename) // Obtenemos directorio

import dotenv from 'dotenv';
dotenv.config({path: path.resolve(__dirname, '.env')});

const app = express(); // Crear servidor
app.use(cors()); // Lee peticiones del front-end
app.use(express.json()); // Lee body de las peticiones

// Definimos ruta a la app-web para que se pueda abrir
const frontendPath = path.join(__dirname, '..', '..', 'app-web');
console.log(`Abriendo archivos desde: ${frontendPath}`);

// Hacemos que sea accesible 
app.use(express.static(frontendPath));

// Redirección a index.html si alguien va a /
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Claves JWT
const clavePrivada = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');
const clavePublica = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY);
// Conexión a supabase
const SUPABASE_URL = "https://cdulvsxglpepjvgkrcmq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
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

// Obtener candidatos
app.get('/api/candidates', async (req, res) => {
    // Consulta SQL sobre los candidatos
    const { data, error } = await supabase
        .from('candidate')
        .select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// Endpoint Votar
app.post('/api/votar', verificarTokenMiddleware, async (req, res) => {
    // verificarTokenMiddleare verificará el token 
    // ---- START DEBUG LOGS ----
    console.log("----- VOTE ATTEMPT -----");
    console.log("User from Token:", req.usuario);
    const { id: userId } = req.usuario;
    const { candidateId } = req.body;
    console.log(`Received vote for candidate: ${candidateId} from user: ${userId}`);
    if (!candidateId) {
        return res.status(400).json({ error: 'No se especificó un candidateId' });
    }

    // Comprobamos que el usuario no haya votado ya
    try {
        // Consulta SQL para encontrar voto
        const { data: candidateData, error: candidateError } = await supabase
            .from('candidate')
            .select('elections_id')
            .eq('id', candidateId) // Para ver que ese candidato es de esas elecciones
            .single(); 

        if (candidateError || !candidateData) {
            return res.status(404).json({ error: 'Candidato no encontrado' });
        }
        
        const electionId = candidateData.elections_id;
        console.log(`Determined Election ID: ${electionId}`);
        // Consulta SQL para encontrar si ha votado ya
        const { data: existingVote, error: voteError } = await supabase
            .from('vote') 
            .select('id') 
            .eq('user_id', userId) // Encontrar usuario
            .eq('elections_id', electionId) // Coincide voto
            .maybeSingle(); // Devuelve un resultado (el voto) o 'null'

        console.log("Existing vote query result:", { existingVote, voteError }); // Log query result
        if (voteError) {
            throw new Error(voteError.message); // Error de base de datos
        }

        console.log(existingVote);

        if (existingVote) {
            // Voto duplicado
            // 409 Conflict es el código HTTP correcto para esto.
            return res.status(409).json({ error: 'Ya has votado en esta elección' });
        }

        console.log(`Voto válido: Usuario ${userId} votando por candidato ${candidateId} en elección ${electionId}`);

        // Añadimos voto a la blockchain
        const nuevoVotoPayload = {
            userId: userId, // ID del usuario (del JWT)
            candidato: candidateId,
            electionId: electionId,
            timestamp: Math.floor(Date.now() / 1000)
        };
        
        // Llamamos API de Python
        console.log("Enviando voto a la API de Python...");
        const pythonResponse = await fetch('http://localhost:8000/add_vote', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoVotoPayload)
        });
        
        const pythonData = await pythonResponse.json();

        if (!pythonResponse.ok) {
            console.error("Error desde la API de Python:", pythonData);
            throw new Error(pythonData.error || pythonData.detail || 'Error en el servicio de Blockchain');
        }
        console.log("Respuesta de la API de Python:", pythonData); // Loguea el éxito
        
        console.log("Guardando voto en Supabase");
        
        // Consulta para añadir voto
        const { error: insertError } = await supabase
            .from('vote')
            .insert({
                user_id: userId,
                candidate_id: candidateId,
                elections_id: electionId,
                date: new Date().toISOString()
            });

        if (insertError) {
            throw new Error(insertError.message);
        }

        res.json({ message: 'Voto registrado exitosamente' });

    } catch (err) {
        console.error('Error procesando el voto:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el voto' });
    }
});

app.post('/api/finalize-election', verificarTokenMiddleware, async (req, res) => {
    console.log("----- FINALIZE ELECTION ATTEMPT -----");
    // Gracias a verificarTokenMiddleware, sabemos que el usuario está autenticado.
    const requestingUser = req.usuario; // Datos del usuario que pide finalizar
    console.log(`Petición recibida de: ${requestingUser.email}`);

    try {
        // Llamar a la API de Python para forzar el último bloque 
        console.log("Llamando a Python API para forzar creación de bloque...");
        const pythonForceResponse = await fetch('http://localhost:8000/force_block_creation', {
            method: 'POST',
        });

        const pythonForceData = await pythonForceResponse.json();

        if (!pythonForceResponse.ok) {
            // Si la API de Python dio error al forzar el bloque
            console.error("Error desde API Python (force_block_creation):", pythonForceData);
            throw new Error(pythonForceData.error || pythonForceData.detail || 'Error al forzar bloque en Python');
        }
        console.log("Respuesta de API Python (force_block_creation):", pythonForceData.message);

        // Calcular los resultados desde Supabase 
        console.log("Calculando resultados desde Supabase...");

        // Consulta para contar votos por candidato y obtener el nombre del candidato
        const { data: resultsData, error: resultsError } = await supabase
            .from('vote') // Desde la tabla de votos
            .select(`
                candidate_id, 
                candidate (full_name) 
            `)
            // .eq('elections_id', ID_DE_LA_ELECCION_ACTUAL) // <-- IMPORTANTE: Filtra por la elección que quieres cerrar!
            ; // No agrupamos aquí, Supabase no tiene GROUP BY directo complejo en JS client

        if (resultsError) {
            console.error("Error al obtener votos de Supabase:", resultsError);
            throw new Error(`Error al leer votos: ${resultsError.message}`);
        }

        // Procesar los resultados 
        if (!resultsData || resultsData.length === 0) {
             console.log("No se encontraron votos para calcular resultados.");
             return res.json({ message: "Votación finalizada (sin votos)", results: [] });
        }

        // Contar votos por candidato
        const voteCounts = resultsData.reduce((acc, vote) => {
            const candidateId = vote.candidate_id;
            const candidateName = vote.candidate ? vote.candidate.full_name : `ID ${candidateId}`;

            if (!acc[candidateId]) {
                acc[candidateId] = { candidateId: candidateId, count: 0, name: candidateName };
            }
            acc[candidateId].count += 1;
            return acc;
        }, {});

        // Convertir el objeto de conteo en un array
        const resultsArray = Object.values(voteCounts);

        // Ordenar por número de votos (descendente)
        resultsArray.sort((a, b) => b.count - a.count);

        // Tomar el Top 3
        const top3Results = resultsArray.slice(0, 3);

        console.log("Resultados Top 3 calculados:", top3Results);

        // Devolver los resultados al cliente 
        res.json({
            message: "Votación finalizada exitosamente.",
            results: top3Results
        });

    } catch (err) {
        console.error('Error al finalizar la votación:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al finalizar la votación' });
    }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
