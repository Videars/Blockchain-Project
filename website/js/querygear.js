var currentPage = 1;
var card_counter = 0;

var new_sell_gears_gears_offered_id = "";
var new_sell_gears_ethereum_requested_id = "";

document.addEventListener('DOMContentLoaded', function() {
    
    check_session(function (isSessionValid) {
        if (isSessionValid) {
            document.getElementById('nav_text_login').innerHTML = "Logout";
            document.getElementById('section_nav_login').href = "#";
            document.getElementById('section_nav_profile').href = "../profile.html";
            document.getElementById('section_nav_login').addEventListener('click', function(event) {
                logout_function();
            });            
        } else {
            console.log("La sessione non è valida.");
        }
    });

    get_from_db(currentPage);

    document.getElementById('next_page_btn').addEventListener('click', function(){
        currentPage=currentPage+1;
        get_from_db(currentPage);
        window.scrollTo(0, 0);
    });

    document.getElementById('previous_page_btn').addEventListener('click', function(){
        if(currentPage>1){
            currentPage=currentPage-1;
            get_from_db(currentPage);
            window.scrollTo(0, 0);
        }
    });

    document.getElementById('new_sell_post_btn').addEventListener('click', function(){
        check_session(function (isSessionValid) {
            if (isSessionValid) {
                document.getElementById('invisible_div_unclickable').style.visibility = "visible";
                document.getElementById('close_pop_up_btn').addEventListener('click', function(){
                    document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
                });
                document.getElementById('new_sell_gears_confirm_button').addEventListener('click', function(){
                    
                    if(validateForm()){
                        new_sell_gears_gears_offered_id = document.getElementById('new_sell_gears_trade_gears_input').value;
                        new_sell_gears_ethereum_requested_id = document.getElementById('new_sell_gears_trade_ethereum_input').value;
                        
                        if(check_input_values(new_sell_gears_gears_offered_id, new_sell_gears_ethereum_requested_id) == 1){
                            sell_post_publication(new_sell_gears_gears_offered_id, new_sell_gears_ethereum_requested_id);
                        }
                    } else {
                        alert("You have to compile all the new_offer fields!");
                    }
                });
            } else {
                console.log("La sessione non è valida.");
                alert("You have to LOGIN in order to post a new OFFER!");
            }
        });
    });
});

function check_input_values(new_sell_gears_gears_offered_id, new_sell_gears_ethereum_requested_id){
    var gears = Number(new_sell_gears_gears_offered_id);
    var ethereum = Number(new_sell_gears_ethereum_requested_id);

    if(gears == Math.floor(gears) && gears >= 1){
        if(ethereum >= 0.0001){
            return 1;
        } else {
            document.getElementById('error_message_gears').innerHTML = "";
            document.getElementById('error_message_ethereum').innerHTML = "";
            document.getElementById('error_message_ethereum').innerHTML = "The value must be greater than 0.0001!";
            return 0;
        }
    } else {
        document.getElementById('error_message_ethereum').innerHTML = "";
        document.getElementById('error_message_gears').innerHTML = "";
        document.getElementById('error_message_gears').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
        return 0;
    }
};

function get_from_db(currentPage){
    console.log("PAGE: " + currentPage);
    $.ajax({
        url: '../php_scripts/script_get_gears.php',
        type: 'GET',
        dataType: 'json',
        data: { page: currentPage },
        success: function(data) {

            if (data.length > 0) {
                for(var i=0; i<data.length; i++){
                    offer=data[i];
                    document.getElementById('sell_boxes').style.display = "block";
                    document.getElementById('empty_box').style.display = "none";
                    document.getElementById('card_'+i).style.display = "flex";

                    var gears_offered_id = document.getElementById('card_' + i + '_gears_offered_text');
                    var ethereum_requested_id = document.getElementById('card_' + i + '_eth_requested_text');
                    var seller_username_id = document.getElementById('card_' + i + '_footer_seller');
                    var offer_id = document.getElementById('card_' + i + '_offer_id');

                    gears_offered_id.innerHTML = "";
                    ethereum_requested_id.innerHTML = "";
                    seller_username_id.innerHTML = "";
                    offer_id.innerHTML = "";

                    gears_offered_id.append('Gears: ' + offer.gears_offered);
                    ethereum_requested_id.append('Ethereum: ' + offer.eth_requested);
                    seller_username_id.append('Seller Username: ' + offer.username);
                    offer_id.append('Offer ID: ' + offer.offer_id);

                    $('#next_page_btn').prop('disabled', false);
                    card_counter = card_counter+1;
                }
                if(card_counter < 5){
                    for(let i=card_counter; i<5; i++){
                        document.getElementById('card_'+i).style.display = "none";
                    }
                }
                card_counter = 0;
            } else {
                document.getElementById('empty_box').innerHTML = "";
                document.getElementById('sell_boxes').style.display = "none";
                document.getElementById('empty_box').style.display = "block";
                document.getElementById('empty_box').append('No offers found');
                $('#next_page_btn').prop('disabled', true);
            }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

function sell_post_publication(new_sell_gears_gears_offered_id, new_sell_gears_ethereum_requested_id){
    console.log("new_sell_gears_gears_offered_id:", new_sell_gears_gears_offered_id);
    console.log("new_sell_gears_ethereum_requested_id:", new_sell_gears_ethereum_requested_id);

    $.ajax({
        url: '../php_scripts/script_post_new_offer.php',
        type: 'POST',
        dataType: 'json',
        data: { new_sell_gears_offered: new_sell_gears_gears_offered_id,
                new_sell_ethereum_requested: new_sell_gears_ethereum_requested_id },
        success: function(data) {
            
            var received_message = data.message;

            alert("Message from the server: " + received_message);
            console.log("Message from the server:", received_message);

            document.getElementById('invisible_div_unclickable').style.visibility = "hidden";

            document.getElementById('compilable_form_new_sell_gears').submit();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("POST was not successful!");
            document.getElementById('compilable_form_new_sell_gears').submit();
        }
    });
};

function check_to_buy_an_offer(){
    check_session(function (isSessionValid) {
        if (isSessionValid) {
            console.log("BUY ENABLED!");
        } else {
            console.log("La sessione non è valida.");
            alert("You have to LOGIN in order to BUY something!");
        }
    });   
};

function check_session(callback){
    $.ajax({
        url: '../php_scripts/script_check_session.php',
        type: 'POST',
        dataType: 'json',
        data: { },
        success: function(data) {
            
            var received_message = data.message;

            if(received_message === "You are not logged in :("){
                console.log(received_message);
                callback(false);
            } else {
                console.log("Welcome ", received_message);
                callback(true);
            }
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            callback(false);
        }
    });
};

function logout_function(){
    $.ajax({
        url: '../php_scripts/script_logout.php',
        type: 'POST',
        dataType: 'json',
        data: { },
        success: function(data) {
            
            var received_message = data.message;

            if(received_message === "You have logged out successfully"){
                console.log(received_message);
                alert("Message from the server: " + received_message);
                window.location.href = "../index.html";
            }
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

function validateForm(){
    var form = document.getElementById('compilable_form_new_sell_gears');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

}