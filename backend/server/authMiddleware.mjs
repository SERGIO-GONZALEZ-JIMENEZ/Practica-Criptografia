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
            return res.status(403).json({ error: 'Token no válido o expirado' });
        }
        req.usuario = usuario; // Añade los datos del usuario (id, email) a la petición
        next(); // Pasa al siguiente
    });
};