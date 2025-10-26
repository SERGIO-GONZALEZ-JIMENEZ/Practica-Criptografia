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
        //alert(data.message);

    } catch (error) {
        console.error('Error durante el registro:', error.message);
        //alert(error.message);
    }
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

        db_register(name, password);
    });
});