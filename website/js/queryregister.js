var name_id = "";
var surname_id = "";
var email_id = "";
var username_id = "";
var password_id = "";
var check_password_id = "";

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('register_btn').addEventListener('click', function(){
        if(validateForm()){
            name_id = document.getElementById('name').value;
            surname_id = document.getElementById('surname').value;
            email_id = document.getElementById('email').value;
            username_id = document.getElementById('username').value;
            password_id = document.getElementById('password').value;
            check_password_id = document.getElementById('check_password').value;

            if(password_id === check_password_id){
                register_user(name_id, surname_id, email_id, username_id, password_id);
                } else {
                    alert("Passwords do not match!");
                }

        } else {
            alert("You have to compile all the fields!");
        }
    });

});

function register_user(name_id, surname_id, email_id, username_id, password_id){
    console.log("name_id:", name_id);
    console.log("surname_id:", surname_id);
    console.log("email_id:", email_id);
    console.log("username_id:", username_id);
    console.log("password_id:", password_id);

    $.ajax({
        url: '../php_scripts/script_register.php',
        type: 'POST',
        dataType: 'json',
        data: { name: name_id,
                surname: surname_id,
                email: email_id,
                username: username_id,
                password: password_id },
        success: function(data) {
            
            var received_message = data.message;

            alert("Message from the server: " + received_message);
            console.log("Message from the server:", received_message);
            
            window.location.href = "../login.html";
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("REGISTER was not successful!");
            document.getElementById('register_form').submit();
        }
    });
};

function validateForm(){
    var form = document.getElementById('register_form');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

}