var currentPage = 1;
var card_counter = 0;

document.addEventListener('DOMContentLoaded', function() {
    
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

});

function get_from_db(currentPage, mode_general){
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
