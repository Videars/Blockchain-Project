var currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    
    get_from_db(currentPage);

    document.getElementById('next_page_btn').addEventListener('click', function(){
        currentPage=currentPage+1;
        get_from_db(currentPage);
    });

    document.getElementById('previous_page_btn').addEventListener('click', function(){
        if(currentPage>1){
            currentPage=currentPage-1;
            get_from_db(currentPage);
        }
    });
});

function get_from_db(currentPage){
    console.log(currentPage);
    $.ajax({
        url: '../php_scripts/script_get_trips.php',
        type: 'GET',
        dataType: 'json',
        data: { page: currentPage },
        success: function(data) {

            if (data.length > 0) {
                for(i=0; i<data.length; i++){
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
                }
            } else {
                document.getElementById('empty_box').innerHTML = "";
                document.getElementById('trip_boxes').style.display = "none";
                document.getElementById('empty_box').style.display = "block";
                document.getElementById('empty_box').append('No trips found');
                $('#next_page_btn').prop('disabled', true);
            }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX:', error);
        }
    });
};
