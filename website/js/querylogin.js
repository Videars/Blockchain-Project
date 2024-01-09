var username_id = "";
var password_id = "";

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('login_btn').addEventListener('click', function(){
        if(validateForm()){
            username_id = document.getElementById('username').value;
            password_id = document.getElementById('password').value;

            login_user(username_id, password_id);

        } else {
            alert("You have to compile all the fields!");
        }
    });

});

function login_user(username_id, password_id){
    console.log("username_id:", username_id);
    console.log("password_id:", password_id);

    $.ajax({
        url: '../php_scripts/script_login.php',
        type: 'GET',
        dataType: 'json',
        data: { username: username_id,
                password: password_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log("Message from the server:", received_message);
            
            if(received_message === "Login Successful"){
                alert("Message from the server: " + received_message);
                window.location.href = "../index.html";
            }
            
            if(received_message === "Wrong Password!"){
                document.getElementById('error_message_username_login').innerHTML = "";
                document.getElementById('error_message_password_login').innerHTML = received_message;
                //window.location.href = "../login.html";
            }
            
            if(received_message === "User not found :("){
                document.getElementById('error_message_password_login').innerHTML = "";
                document.getElementById('error_message_username_login').innerHTML = received_message;
                //window.location.href = "../login.html";
            }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("LOGIN was not successful!");

            window.location.href = "../login.html";
        }
    });
};

function validateForm(){
    var form = document.getElementById('login_form');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

}