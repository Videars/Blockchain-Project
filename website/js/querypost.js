var currentPage = 1;
var search_boolean = 0;
var card_counter = 0;
var mode_general = "DEFAULT_MODE";

var departure_search_id = "";
var destination_search_id = "";
var date_box_id = "";

var new_post_username_id = "";
var new_post_departure_id = "";
var new_post_destination_id = "";
var new_post_date_departure_id = "";
var new_post_booking_deadline_id = "";
var new_post_available_spots_id = "";
var new_post_gear_cost_input_id = "";

document.addEventListener('DOMContentLoaded', function() {
    
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
        document.getElementById('invisible_div_unclickable').style.visibility = "visible";
        document.getElementById('close_pop_up_btn').addEventListener('click', function(){
            document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
        });
        document.getElementById('new_post_confirm_button').addEventListener('click', function(){
            if(validateForm()){
                new_post_username_id = document.getElementById('new_post_username_input').value;
                new_post_departure_id = document.getElementById('new_post_location_departure_input').value;
                new_post_destination_id = document.getElementById('new_post_location_destination_input').value;
                new_post_date_departure_id = document.getElementById('new_post_date_departure_input').value;
                new_post_booking_deadline_id = document.getElementById('new_post_booking_deadline_input').value;
                new_post_available_spots_id = document.getElementById('new_post_available_spots_input').value;
                new_post_gear_cost_input_id = document.getElementById('new_post_gear_cost_input').value;

                new_post_date_departure_id = new_post_date_departure_id.replace(/T/g, ' ');
                new_post_booking_deadline_id = new_post_booking_deadline_id.replace(/T/g, ' ');
                
                trip_publication(new_post_username_id, new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id);
                } else {
                    alert("You have to compile all the new_post fields!");
                }
        });
    });
});

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

function trip_publication(new_post_username_id, new_post_departure_id, new_post_destination_id, new_post_date_departure_id, new_post_booking_deadline_id, new_post_available_spots_id, new_post_gear_cost_input_id){
    console.log("new_post_username_id:", new_post_username_id);
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
        data: { new_post_username: new_post_username_id,
                new_post_departure: new_post_departure_id,
                new_post_destination: new_post_destination_id,
                new_post_date_departure: new_post_date_departure_id,
                new_post_booking_deadline: new_post_booking_deadline_id,
                new_post_available_spots: new_post_available_spots_id,
                new_post_gear_cost_input: new_post_gear_cost_input_id },
        success: function(data) {
            
            var received_message = data.message;

            alert("Messaggio dal server: " + received_message);
            console.log("Messaggio dal server:", received_message);

            document.getElementById('invisible_div_unclickable').style.visibility = "hidden";

        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
            alert("POST was not successful!");
        }
    });
};

function validateForm(){
    var form = document.getElementById('compilable_form_new_post');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

}