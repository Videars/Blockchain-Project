var currentPage = 1;
var search_boolean = 0;
var card_counter = 0;
var mode_general = "DEFAULT_MODE";

var departure_search_id = "";
var destination_search_id = "";
var date_box_id = "";

var new_post_departure_id = "";
var new_post_destination_id = "";
var new_post_date_departure_id = "";
var new_post_booking_deadline_id = "";
var new_post_available_spots_id = "";
var new_post_gear_cost_input_id = "";

var effective_travel_id = "";

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

    get_from_db(currentPage, mode_general);

    document.getElementById('next_page_btn').addEventListener('click', function(){
        currentPage=currentPage+1;
        get_from_db(currentPage, mode_general);
        window.scrollTo(0, 0);
    });

    document.getElementById('previous_page_btn').addEventListener('click', function(){
        if(currentPage>1){
            currentPage=currentPage-1;
            get_from_db(currentPage, mode_general);
            window.scrollTo(0, 0);
        }
    });

    document.getElementById('search_post_btn').addEventListener('click', function(){
        search_boolean = 1;
        currentPage = 1;
        mode_general = "SEARCH_MODE";
        departure_search_id = document.getElementById('departure_search').value;
        destination_search_id = document.getElementById('destination_search').value;
        date_box_id = document.getElementById('date_box').value;
        get_from_db(currentPage, mode_general);
    });

    document.getElementById('new_trip_post_btn').addEventListener('click', function(){
        check_session(function (isSessionValid) {
            if (isSessionValid) {
                document.getElementById('invisible_div_unclickable').style.visibility = "visible";
                document.getElementById('close_pop_up_btn').addEventListener('click', function(){
                    document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
                });
                document.getElementById('new_post_confirm_button').addEventListener('click', function(){
                    if(validateForm()){
                        new_post_departure_id = document.getElementById('new_post_location_departure_input').value;
                        new_post_destination_id = document.getElementById('new_post_location_destination_input').value;
                        new_post_date_departure_id = document.getElementById('new_post_date_departure_input').value;
                        new_post_booking_deadline_id = document.getElementById('new_post_booking_deadline_input').value;
                        new_post_available_spots_id = document.getElementById('new_post_available_spots_input').value;
                        new_post_gear_cost_input_id = document.getElementById('new_post_gear_cost_input').value;

                        new_post_date_departure_id = new_post_date_departure_id.replace(/T/g, ' ');
                        new_post_booking_deadline_id = new_post_booking_deadline_id.replace(/T/g, ' ');
                        
                        if(input_check_trip_publication(new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id) == 1){
                            trip_publication(new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id);
                        }

                        } else {
                            alert("You have to compile all the new_post fields!");
                        }
                });
            } else {
                console.log("La sessione non è valida.");
                alert("You have to LOGIN in order to post a new TRIP!");
            }
        });
    });
});

function getCurrentDateTime(offset) {
    const now = new Date();
    now.setHours(now.getHours() + offset);

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function subtractHoursFromDateTime(dateTimeString, hoursToSubtract) {
    const originalDateTime = new Date(dateTimeString);
    const newDateTime = new Date(originalDateTime.getTime() - hoursToSubtract * 60 * 60 * 1000);
  
    const year = newDateTime.getFullYear();
    const month = (newDateTime.getMonth() + 1).toString().padStart(2, '0');
    const day = newDateTime.getDate().toString().padStart(2, '0');
    const hours = newDateTime.getHours().toString().padStart(2, '0');
    const minutes = newDateTime.getMinutes().toString().padStart(2, '0');
    const seconds = newDateTime.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function input_check_trip_publication(new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id){
    var currentDateTime = getCurrentDateTime(5);
    if(currentDateTime < new_post_date_departure_id){
        if(getCurrentDateTime(0) < new_post_booking_deadline_id){
            var new_booking_limit = subtractHoursFromDateTime(new_post_date_departure_id, 4);
            if(new_post_booking_deadline_id < new_booking_limit){
                if(Number(new_post_available_spots_id) > 0){
                    if(Number(new_post_gear_cost_input_id) > 0){
                        return 1;
                    } else {
                        document.getElementById('error_message_departure_date').innerHTML = "";
                        document.getElementById('error_message_booking_deadline_date').innerHTML = "";
                        document.getElementById('error_message_available_spots').innerHTML = "";
                        document.getElementById('error_message_gear_cost').innerHTML = "";
                        document.getElementById('error_message_gear_cost').innerHTML = "You must enter a positive number greater than 0!";
                        return 0;                         
                    }
                } else {
                    document.getElementById('error_message_departure_date').innerHTML = "";
                    document.getElementById('error_message_booking_deadline_date').innerHTML = "";
                    document.getElementById('error_message_available_spots').innerHTML = "";
                    document.getElementById('error_message_gear_cost').innerHTML = "";
                    document.getElementById('error_message_available_spots').innerHTML = "You must enter a positive number greater than 0!";
                    return 0;                    
                }
            } else {
                document.getElementById('error_message_departure_date').innerHTML = "";
                document.getElementById('error_message_booking_deadline_date').innerHTML = "";
                document.getElementById('error_message_available_spots').innerHTML = "";
                document.getElementById('error_message_gear_cost').innerHTML = "";
                document.getElementById('error_message_booking_deadline_date').innerHTML = "You must enter a deadline that is 4 hours<br>before departure or more!";
                return 0;
            }
        } else {
            document.getElementById('error_message_departure_date').innerHTML = "";
            document.getElementById('error_message_booking_deadline_date').innerHTML = "";
            document.getElementById('error_message_available_spots').innerHTML = "";
            document.getElementById('error_message_gear_cost').innerHTML = "";
            document.getElementById('error_message_booking_deadline_date').innerHTML = "You must enter a deadline greater than now!";
            return 0;
        }
    } else {
        document.getElementById('error_message_departure_date').innerHTML = "";
        document.getElementById('error_message_booking_deadline_date').innerHTML = "";
        document.getElementById('error_message_available_spots').innerHTML = "";
        document.getElementById('error_message_gear_cost').innerHTML = "";
        document.getElementById('error_message_departure_date').innerHTML = "Departure must be more<br>than 5 hours from now!";
        return 0;
    }
};                    

function check_to_book_trips(event){
    check_session(function (isSessionValid) {
        if (isSessionValid) {
            console.log("BOOK A TRIP ENABLED!");
            var divClicked = event.target;
            var div_id = divClicked.parentNode.id;
            
            var card_x = div_id.slice(0, 6);

            var temp_travel_id = document.getElementById(card_x + '_travel_id').innerHTML;
            effective_travel_id = temp_travel_id.slice(11);
            
            book_trip(effective_travel_id);
        } else {
            console.log("La sessione non è valida.");
            alert("You have to LOGIN in order to BOOK a TRIP!");
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

function get_from_db(currentPage, mode_general){
    console.log("PAGE: " + currentPage + ", MODE: " + mode_general);
    console.log("Departure: " + departure_search_id + ", Destination: " + destination_search_id + ", Date: " + date_box_id);
    $.ajax({
        url: '../php_scripts/script_get_trips.php',
        type: 'GET',
        dataType: 'json',
        data: { page: currentPage,
                mode: mode_general,
                departure: departure_search_id,
                destination: destination_search_id,
                date: date_box_id},
        success: function(data) {

            if (data.length > 0) {               
                for(var i=0; i<data.length; i++){
                    offer=data[i];

                    document.getElementById('trip_boxes').style.display = "block";
                    document.getElementById('empty_box').style.display = "none";
                    document.getElementById('card_'+i).style.display = "block";

                    var departure_id = document.getElementById('card_' + i + '_departure');
                    var destination_id = document.getElementById('card_' + i + '_destination');
                    var departure_date_id = document.getElementById('card_' + i + '_departure_date');
                    var username_id = document.getElementById('card_' + i + '_username');
                    var available_spots_id = document.getElementById('card_' + i + '_available_spots');
                    var booked_spots_id = document.getElementById('card_' + i + '_booked_spots');
                    var book_btn_id = document.getElementById('card_' + i + '_gear_cost_text');
                    var travel_id = document.getElementById('card_' + i + '_travel_id');

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
                document.getElementById('trip_boxes').style.display = "none";
                document.getElementById('empty_box').style.display = "block";
                document.getElementById('empty_box').append('No trips found');
                $('#next_page_btn').prop('disabled', true);
            }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

function trip_publication(new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id){
    console.log("new_post_departure_id:", new_post_departure_id);
    console.log("new_post_destination_id:", new_post_destination_id);
    console.log("new_post_date_departure_id:", new_post_date_departure_id);
    console.log("new_post_booking_deadline_id:", new_post_booking_deadline_id);
    console.log("new_post_available_spots_id:", new_post_available_spots_id);
    console.log("new_post_gear_cost_input_id:", new_post_gear_cost_input_id);

    $.ajax({
        url: '../php_scripts/script_post_new_trip.php',
        type: 'POST',
        dataType: 'json',
        data: { new_post_departure: new_post_departure_id,
                new_post_destination: new_post_destination_id,
                new_post_date_departure: new_post_date_departure_id,
                new_post_booking_deadline: new_post_booking_deadline_id,
                new_post_available_spots: new_post_available_spots_id,
                new_post_gear_cost_input: new_post_gear_cost_input_id },
        success: function(data) {
            
            var received_message = data.message;

            alert("Message from the server: " + received_message);
            console.log("Message from the server:", received_message);

            document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
            
            document.getElementById('compilable_form_new_post').submit();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("POST was not successful!");
            document.getElementById('compilable_form_new_post').submit();
        }
    });
};

function book_trip(trip_id){
    $.ajax({
        url: '../php_scripts/script_book_trip_notification.php',
        type: 'POST',
        dataType: 'json',
        data: { book_trip_id: trip_id },
        success: function(data) {
            
            var received_message = data.message;

            alert("Message from the server: " + received_message);
            console.log("Message from the server:", received_message);
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("BOOKING was not successful!");
        }
    });
}

function validateForm(){
    var form = document.getElementById('compilable_form_new_post');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

};