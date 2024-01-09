var currentPage = 1;
var card_counter = 0;
var currentPage_ongoing_trips = 1;
var card_counter_ongoing_trips = 0;

var new_post_departure_id = "";
var new_post_destination_id = "";
var new_post_date_departure_id = "";
var new_post_booking_deadline_id = "";
var new_post_available_spots_id = "";
var new_post_gear_cost_input_id = "";

document.addEventListener('DOMContentLoaded', function() {
    
    check_session(function (isSessionValid) {
        if (isSessionValid) {
            document.getElementById('nav_text_login').innerHTML = "Logout";
            document.getElementById('section_nav_login').href = "#";                
            document.getElementById('section_nav_login').addEventListener('click', function(event) {
                logout_function();
            });

            get_user_info();
            get_user_notification(currentPage);
            get_ongoing_trips_from_db(currentPage_ongoing_trips);

            document.getElementById('next_page_notification_btn').addEventListener('click', function(){
                currentPage=currentPage+1;
                get_user_notification(currentPage);
            });
        
            document.getElementById('previous_page_notification_btn').addEventListener('click', function(){
                if(currentPage>1){
                    currentPage=currentPage-1;
                    get_user_notification(currentPage);
                }
            });

            document.getElementById('next_page_trips_btn').addEventListener('click', function(){
                currentPage_ongoing_trips=currentPage_ongoing_trips+1;
                get_ongoing_trips_from_db(currentPage_ongoing_trips);
            });
        
            document.getElementById('previous_page_trips_btn').addEventListener('click', function(){
                if(currentPage_ongoing_trips>1){
                    currentPage_ongoing_trips=currentPage_ongoing_trips-1;
                    get_ongoing_trips_from_db(currentPage_ongoing_trips);
                }
            });

            document.getElementById('add_wallet_btn').addEventListener('click', function(){
                if (window.ethereum){
                    console.log('MetaMask è installato!');
                    connectToMetaMask();
                    // Altri controlli o azioni, se necessario
                } else {
                    console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
                }
            });

        } else {
            console.log("La sessione non è valida.");
            alert("You cannot access in this way to this page, you have to LOGIN!");
            window.location.href = "../index.html";
        }
    });

});

const connectToMetaMask = async () => {
    try {
        // Richiedi l'autorizzazione per accedere a MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connesso a MetaMask!');
        change_metamask_div_style();
        get_metamask_address();
    } catch (error) {
        console.error('Connessione a MetaMask fallita:', error);
    }
};

const get_metamask_address = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const walletAddress = accounts[0];

    document.getElementById('metamask_address').innerHTML = 'Address: <span style="font-weight: bold;">' +  walletAddress + '</span>';
};

function change_metamask_div_style(){
    var my_metamask_div = document.getElementById('check_metamask_connection');

    my_metamask_div.style.background = "#14dc50";
    my_metamask_div.style.boxShadow = "0 0 0 0 #14dc50";
    my_metamask_div.style.animation = "glow_connected 1.8s linear infinite";
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

function get_user_info(){
    $.ajax({
        url: '../php_scripts/get_user_info.php',
        type: 'GET',
        dataType: 'json',
        data: { },
        success: function(data) {
            
            if (data.length > 0) {
                for(var i=0; i<data.length; i++){
                    offer=data[i];
                    var profile_username_id = document.getElementById('profile_username');
                    var profile_email_id = document.getElementById('profile_email');
                    var profile_gear_text_id = document.getElementById('profile_gear_text');
                    var participated_trips_id = document.getElementById('participated_trips');
                    var profile_trips_given_id = document.getElementById('profile_trips_given');
                    var profile_trips_received_id = document.getElementById('profile_trips_received');
                    var profile_minted_gears_id = document.getElementById('profile_minted_gears');

                    profile_username_id.innerHTML = "";
                    profile_email_id.innerHTML = "";
                    profile_gear_text_id.innerHTML = "";
                    participated_trips_id.innerHTML = "";
                    profile_trips_given_id.innerHTML = "";
                    profile_trips_received_id.innerHTML = "";
                    profile_minted_gears_id.innerHTML = "";


                    profile_username_id.innerHTML = 'Username: ' + '<span style="font-weight: bold;">' + offer.username + '</span>';
                    profile_email_id.innerHTML = 'Email: ' + '<span style="font-weight: bold;">' + offer.email + '</span>';
                    profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">' + offer.balance + '</span>';
                    participated_trips_id.innerHTML = 'Participated Trips (both as passenger and driver): ' + '<span style="font-weight: bold;">' + offer.travel_stats + '</span>';
                    profile_trips_given_id.innerHTML = 'Number of passages given: ' + '<span style="font-weight: bold;">' + offer.trips_given + '</span>';
                    profile_trips_received_id.innerHTML = 'Number of passages received: ' + '<span style="font-weight: bold;">' + offer.trips_received + '</span>';
                    profile_minted_gears_id.innerHTML = 'Total minted Gears: ' + '<span style="font-weight: bold;">' + offer.minted_gears + '</span>';
                    
                    var seedString = offer.username;
                    var seedValue = hashCode(seedString);
                    var numeroCasuale = getRandomNumber(seedValue);

                    var nuovoSrc = '../profile_images/profile_image_' + numeroCasuale + '.png';
                    document.getElementById('profile_image').src = nuovoSrc;

                }
                
            }

        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function get_user_notification(currentPage){
    console.log("NOTIFICATION_PAGE: " + currentPage);
    $.ajax({
        url: '../php_scripts/script_get_user_notification.php',
        type: 'GET',
        dataType: 'json',
        data: { page: currentPage },
        success: function(data) {
            
            if (data.length > 0) {
                document.getElementById('notification_header_body').style.display = "block";
                document.getElementById('empty_box').style.display = "none";
                
                for(let i=0; i<data.length; i++){
                    offer=data[i];
                    var card_confirm_section_id = document.getElementById('card_'+i+'_confirm_section');
                    var card_ok_section_id = document.getElementById('card_'+i+'_ok_section');

                    if(offer.type === 'CONFIRMATION'){
                        get_notification_info(offer.notification_id, i, offer.type);
                        card_confirm_section_id.style.display = "block";
                    }

                    if(offer.type === 'INFORMATION_REFUSED' || offer.type === 'INFORMATION_ACCEPTED'){
                        get_notification_info(offer.notification_id, i, offer.type);
                        card_ok_section_id.style.display = "block";
                    }
                    
                    $('#next_page_notification_btn').prop('disabled', false);
                    card_counter = card_counter+1;            
                }
                if(card_counter < 4){
                    for(let i=card_counter; i<4; i++){
                        document.getElementById('card_'+i+'_confirm_section').style.display = "none";
                        document.getElementById('card_'+i+'_ok_section').style.display = "none";
                    }
                    $('#next_page_notification_btn').prop('disabled', true);
                }
                card_counter = 0;
                
            } else {
                document.getElementById('empty_box').innerHTML = "";
                document.getElementById('notification_header_body').style.display = "none";
                document.getElementById('empty_box').style.display = "block";
                document.getElementById('empty_box').append('No more notification');
                $('#next_page_notification_btn').prop('disabled', true);
            }
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function deny_trip_notification(notification_id){
    console.log(notification_id);
    $.ajax({
        url: '../php_scripts/script_resolve_deny_notification.php',
        type: 'POST',
        dataType: 'json',
        data: { notify_id: notification_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function confirm_trip_notification(notification_id){
    console.log(notification_id);
    $.ajax({
        url: '../php_scripts/script_resolve_confirm_notification.php',
        type: 'POST',
        dataType: 'json',
        data: { notify_id: notification_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function confirm_notification_ok_button(notification_id){
    console.log(notification_id);
    $.ajax({
        url: '../php_scripts/script_resolve_ok_notification.php',
        type: 'POST',
        dataType: 'json',
        data: { notify_id: notification_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function get_notification_info(notification_id, index, type){
    $.ajax({
        url: '../php_scripts/script_get_notification_info.php',
        type: 'GET',
        dataType: 'json',
        data: { notify_id: notification_id},
        success: function(data) {
            
            if (data.length > 0) {
                for(var i=0; i<data.length; i++){
                    offer=data[i];

                    var card_text_notification_confirmation_id = document.getElementById('card_'+index+'_notification_text');
                    var card_text_notification_refused_id = document.getElementById('card_'+index+'_notification_ok_text');

                    card_text_notification_confirmation_id.innerHTML = "";
                    card_text_notification_refused_id.innerHTML = "";
                    
                    if(type === 'CONFIRMATION'){
                        document.getElementById('card_'+index+'_notification_confirm_btn').addEventListener('click', function(){
                            console.log("confirm");

                            confirm_trip_notification(notification_id);
                        });
                        
                        document.getElementById('card_'+index+'_notification_deny_btn').addEventListener('click', function(){
                            console.log("deny");
                            
                            deny_trip_notification(notification_id);
                        });
                        
                        card_text_notification_confirmation_id.innerHTML = 'The user ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + ' wants to join your trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    }

                    if(type === 'INFORMATION_REFUSED'){
                        document.getElementById('card_'+index+'_notification_ok_btn').addEventListener('click', function(){
                            console.log("information_refused OK");

                            confirm_notification_ok_button(notification_id);
                        });

                        card_text_notification_refused_id.innerHTML = 'The driver ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + '<span style="font-weight: bold; color: red;">' + ' REFUSED' + '</span>' + ' your participation to the trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    
                    }

                    if(type === 'INFORMATION_ACCEPTED'){
                        document.getElementById('card_'+index+'_notification_ok_btn').addEventListener('click', function(){
                            console.log("information_refused OK");

                            confirm_notification_ok_button(notification_id);
                        });

                        card_text_notification_refused_id.innerHTML = 'The driver ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + '<span style="font-weight: bold; color: green;">' + ' HAS ACCEPTED' + '</span>' + ' your participation to the trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    
                    }

                }
                
            }
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
}

function get_ongoing_trips_from_db(currentPage_ongoing_trips){
    console.log("ONGOING_TRIPS_PAGE: " + currentPage_ongoing_trips);
    $.ajax({
        url: '../php_scripts/script_get_ongoing_trips.php',
        type: 'GET',
        dataType: 'json',
        data: { page: currentPage_ongoing_trips },
        success: function(data) {

            if (data.length > 0) {
                for(var i=0; i<data.length; i++){
                    offer=data[i];
                    document.getElementById('trip_boxes').style.display = "block";
                    document.getElementById('empty_box_ongoing_trips').style.display = "none";
                    document.getElementById('card_'+i).style.display = "block";

                    var departure_id = document.getElementById('card_' + i + '_departure');
                    var destination_id = document.getElementById('card_' + i + '_destination');
                    var departure_date_id = document.getElementById('card_' + i + '_departure_date');
                    var username_id = document.getElementById('card_' + i + '_username');
                    var available_spots_id = document.getElementById('card_' + i + '_available_spots');
                    var booked_spots_id = document.getElementById('card_' + i + '_booked_spots');
                    var book_btn_id = document.getElementById('card_' + i + '_gear_cost_text');
                    var travel_id = document.getElementById('card_' + i + '_travel_id');

                    var div_buy_btn_id = document.getElementById('card_'+ i +'_gear_cost');

                    if(offer.role == 'DRIVER'){
                        div_buy_btn_id.style.display = "none";
                    }

                    if(offer.role == 'PASSENGER'){
                        div_buy_btn_id.style.display = "block";
                    }

                    travel_id.innerHTML = "";
                    username_id.innerHTML = "";
                    departure_id.innerHTML = "";
                    destination_id.innerHTML = "";
                    departure_date_id.innerHTML = "";
                    book_btn_id.innerHTML = "";
                    available_spots_id.innerHTML = "";
                    booked_spots_id.innerHTML = "";

                    travel_id.append('Travel ID: ' + offer.travel_id);
                    username_id.append('Driver: ' + offer.username);
                    departure_id.append(offer.departure);
                    destination_id.append(offer.destination);
                    departure_date_id.append('Departure date: ' + offer.departure_date);
                    book_btn_id.append(offer.gear_cost);
                    available_spots_id.append('Available Spots: ' + offer.available_spots);
                    booked_spots_id.append('Booked spots: ' + offer.booked_spots);


                    $('#next_page_trips_btn').prop('disabled', false);
                    card_counter_ongoing_trips = card_counter_ongoing_trips+1;
                }
                if(card_counter_ongoing_trips < 3){
                    for(let i=card_counter_ongoing_trips; i<3; i++){
                        document.getElementById('card_'+i).style.display = "none";
                    }
                    $('#next_page_trips_btn').prop('disabled', true);
                }
                card_counter_ongoing_trips = 0;
            } else {
                document.getElementById('empty_box_ongoing_trips').innerHTML = "";
                document.getElementById('trip_boxes').style.display = "none";
                document.getElementById('empty_box_ongoing_trips').style.display = "block";
                document.getElementById('empty_box_ongoing_trips').append('No ongoing trips found');
                $('#next_page_trips_btn').prop('disabled', true);
            }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function getRandomNumber(seed) {
    return Math.floor(seededRandom(seed) * 16);
}
