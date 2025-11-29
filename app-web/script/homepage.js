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
        // Guardar token
        localStorage.setItem('token', data.token);
        alert(data.message);
        return data;

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

async function genAndSendCSR(nombreUsuario) {

  console.log("Generando claves y CSR para:", nombreUsuario);
  // Generar par de claves
  const keys = forge.pki.rsa.generateKeyPair({bits: 2048});
  const privatePem = forge.pki.privateKeyToPem(keys.privateKey);

  // Crear CSR 
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  const nombreLimpio = nombreUsuario.replace(/[^a-zA-Z0-9]/g, '');
  const commonNameUnique = `${nombreLimpio}-${Date.now()}`;

  console.log("Common Name generado:", commonNameUnique);

  csr.setSubject([
    { name: 'commonName', value: commonNameUnique },
    { name: 'countryName', value: 'ES' },
    { name: 'organizationName', value: 'Civium' }
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

    $('#register').on('click', async function(e) {
        e.preventDefault();
        console.log("Botón register pulsado");

        const name = $("#user").val().trim()
        const password = $("#password").val().trim()

        if (!validarPassword(password)) {
        alert("La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.");
        return;
        }
        try {
            await db_register(name, password);

            console.log("Solicitando el certificado...");
            try {
                await genAndSendCSR(name);
                alert("Cuenta creada y certificado generado correctamente");
            } catch (certError) {
                console.error("Error en certificado:", certError);
                alert("Cuenta creada, pero hubo un error con el certificado. Podrás entrar igual.");
            }

            
        } catch(error) {
            console.error("Error crítico:", error);
            alert("Error: " + error.message);
        }

    });
});