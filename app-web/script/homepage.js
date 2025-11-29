//require('dotenv').config();

async function db_login(email, password) {
    try {
        // Llamar a servidor localhost:3000
        const answer = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email,  password: password})
        });

        // Respuesta del servidor
        const data = await answer.json();
        
        if (!answer.ok) {
            throw new Error(data.error || 'Error en el login');
        }

        // Successful login
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);
        alert('Login exitoso');
        window.location.href = "vote.html";

    } catch (error) {
        console.error('Error during login:', error.message);
        //alert(error.message);
    }

}

async function db_register(email, password) {
    // Register to the database
    try {
        // Llamar a servidor localhost:3000
        const answer = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email,  password: password})
        });

        // Respuesta del servidor
        const data = await answer.json();
        
        if (!answer.ok) {
            throw new Error(data.error || 'Error en el register');
        }

        // Successful registration
        console.log('Register successful:', data);
        alert(data.message);
        window.location.href = "vote.html";

    } catch (error) {
        console.error('Error durante el registro:', error.message);
        //alert(error.message);
    }
}

function validarPassword(password) {
    // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(password);
}

// TODO: Hay que llamar a esta función en el registro para generar el par de claves y el certificado
async function genAndSendCSR(nombreUsuario) {
  // Generar par de claves
  const keys = forge.pki.rsa.generateKeyPair({bits: 2048});
  const privatePem = forge.pki.privateKeyToPem(keys.privateKey);

  // Crear CSR 
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    { name: 'commonName', value: nombreUsuario }
  ]);
  csr.sign(keys.privateKey, forge.md.sha256.create());

  const csrPem = forge.pki.certificationRequestToPem(csr);

  // Enviar el CSR al backend
  const resp = await fetch('/request-cert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csr: csrPem, nombre: nombreUsuario })
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error solicitando certificado');

  // Guardar clave privada y certificado en localStorage
  localStorage.setItem("userPrivateKey", privatePem);
  localStorage.setItem("userCert", data.cert);

  return { privatePem, certPem: data.cert };
}


$(document).ready(function () {

    console.log("JQuery y homepage.js cargados");

    $('#login').on('click', function (e) {
        e.preventDefault();

        console.log("Botón login pulsado");

        const name = $("#user").val().trim()
        const password = $("#password").val().trim()

        db_login(name, password);
    });

    $('#register').on('click', function(e) {
        e.preventDefault();
        console.log("Botón register pulsado");

        const name = $("#user").val().trim()
        const password = $("#password").val().trim()

        if (!validarPassword(password)) {
        alert("La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.");
        return;
        }

        db_register(name, password);
        genAndSendCSR(name);

    });
});