import jwt from 'jsonwebtoken';
import fs from 'node:fs';

// Cargamos ruta de los archivos y directorios para que no haya errores a la hora de iniciar el servidor
import path from 'path'; // Para el tema de / en Mac o Linux y \ en Windows
import {fileURLToPath} from 'url'; 
const __filename = fileURLToPath(import.meta.url); // Obtener dirección
const __dirname = path.dirname(__filename) // Obtenemos directorio

const clavePublica = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8'); 

export const verificarTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Saca el token del "Bearer ..."

    // Verificar que existe token
    if (token == null) {
        return res.status(401).json({ error: 'No se proporcionó token' });
    }

    // Comprobamos token usuario con clave pública de JWT
    jwt.verify(token, clavePublica, { algorithms: ['RS256'] }, (err, usuario) => {
        if (err) {
            // Mensajes log en caso de fallo
            console.log("--- FALLO VERIFICACIÓN FIRMA DIGITAL ---");
            console.log("Error: La firma no corresponde a la clave pública o el token expiró.");
            return res.status(403).json({ error: 'Token no válido o expirado' });
        }
        // Mensajes de log en caso de acierto
        console.log("--- VERIFICACIÓN DE FIRMA DIGITAL ---");
        console.log("Algoritmo: RS256");
        console.log("Clave utilizada para verificar: RSA Pública (2048 bits)");
        console.log("Resultado: FIRMA VÁLIDA. Integridad del mensaje asegurada.");
        req.usuario = usuario; // Añade los datos del usuario (id, email) a la petición
        next(); // Pasa al siguiente
    });
};