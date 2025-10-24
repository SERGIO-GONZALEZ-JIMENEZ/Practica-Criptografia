// Creación y verificación del token JWT

import jwt from 'jsonwebtoken';
import fs from 'node:fs';

const usuario = {
    id: 1,
    nombre: 'Javascript.com.es',
    rol: 'admin'
};

// Creación del token JWT

const clavePrivada = fs.readFileSync('private.key', 'utf8');
const token = jwt.sign(usuario, clavePrivada, { algorithm: 'RS256', expiresIn: '1h' });

// Verificar token

const clavePublica = fs.readFileSync('public.key', 'utf8');
jwt.verify(token, clavePublica, { algorithm: 'RS256' }, (error, decoded) => {
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Token decodificado:', decoded);
    }
});

export {usuario, token, clavePrivada, clavePublica};