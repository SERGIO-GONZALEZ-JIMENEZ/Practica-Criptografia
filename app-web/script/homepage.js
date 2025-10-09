require('dotenv').config();


async function db_login() {
    const { user, session, error } = await supabase.auth.signIn({
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
    })

}

function validate_form() {
    const name = $("#user").val().trim()
    const password = $("password").val().trim()


}

$(document).ready(function () {

});