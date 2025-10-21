//require('dotenv').config();

const SUPABASE_URL = 'https://cdulvsxglpepjvgkrcmq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdWx2c3hnbHBlcGp2Z2tyY21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc4MTksImV4cCI6MjA3NjYzMzgxOX0.MJ1on3Q_qsUViqY3QziTGFNgndHUcWBGOdaNLyret7E'; 

// Creamos cliente de Supabase
const {createClient} = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function db_login(email, password) {
    // Login to the database
    try {
        const {data, error} = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }
        
        // Successful login
        console.log('Login successful:', data);
        localStorage.setItem('token', data.session.access_token);

    } catch (error) {
        console.error('Error during login:', error);
    }

}

async function db_register(email, password) {
    // Register to the database
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            throw error; 
        }

        // Successful registration
        console.log('Register successful:', data);

    } catch (error) {
        console.error('Error during registration:', error.message);
    }
}

$(document).ready(function () {
    $('#login').on('click', function (e) {
        e.preventDefault();

        console.log("Button clicked");
        const name = $("#user").val().trim()
        const password = $("#password").val().trim()

        db_login(name, password);
    });

    $('#register').on('click', function(e) {
        e.preventDefault();
        console.log("Botón 'Registrar' clickado.");

        const name = $("#user").val().trim()
        const password = $("#password").val().trim()

        db_register(name, password);
    });
});