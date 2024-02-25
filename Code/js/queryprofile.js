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

var effective_travel_id = "";
var effective_my_wallet_id = "";
var effective_trip_cost = "";

var effective_balance = "";

var web3 = undefined;

var contract_address = "";

var contract_address_vendor = "";

var effective_sc = "";
var effective_sc_vendor = "";

var effective_address = '0x0'

// initializes the various buttons and sections of the profile page
document.addEventListener('DOMContentLoaded', function() {
  
    check_session(function (isSessionValid) {
        if (isSessionValid) {

          initialize_web3_connection().then((result) => {
            
            document.getElementById('nav_text_login').innerHTML = "Logout";
            document.getElementById('section_nav_login').href = "#";                
            document.getElementById('section_nav_login').addEventListener('click', function(event) {
                logout_function();
            });

            get_user_info();
            get_user_notification(currentPage);
            get_ongoing_trips_from_db(currentPage_ongoing_trips);
            get_unminted_trips();
            get_my_offer(effective_address);

            document.getElementById('profile_gear_update_btn').addEventListener('click', function() {
              if(effective_address !== '0x0' && effective_address !== undefined){
                get_user_balance(effective_address)
                .then(function(result){
                  var profile_gear_text_id = document.getElementById('profile_gear_text');
                  profile_gear_text_id.innerHTML = "";
                  profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">' + result + '</span>';
                })
                .catch((error) => {
                  console.log("get balance error: ", error);
                });
              } else {
                alert("Please install Metamask to use this website functionality!");
              }
            });

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

            document.getElementById('add_wallet_btn').addEventListener('click', async () => {
                if (window.ethereum){
                  console.log('MetaMask è installato!');
                  effective_address = await connectToMetaMask();
                  if(effective_address !== '0x0' && effective_address !== undefined){
                    change_metamask_div_style();
                    document.getElementById('metamask_address').innerHTML = 'Address: <span style="font-weight: bold;">' +  effective_address + '</span>';
                  } else {
                    alert("Please login to your Metamask profile to use this website functionality!");
                  }
                } else {
                  console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
                  alert("Please install Metamask to use the website functionalities!");
                }
            });
          }).catch((error) => {
            console.error('Errore durante l\'inizializzazione di web3.0: ', error);
          });
        } else {
          console.log("La sessione non è valida.");
          alert("You cannot access in this way to this page, you have to LOGIN!");
          window.location.href = "../index.html";
        }
    });
});

// function used to initialize the web3.0 connection by getting contracts
// and current metamask address.
// Also checking all the possible fields on the page that requires a Metamask connection
const initialize_web3_connection = async () => {
  var contract_remora_gears_json = "../smart_contract/build/contracts/RemoraGears.json";
  var contract_gears_vendor_json = "../smart_contract/build/contracts/GearsVendor.json";
  
  if(window.ethereum){
    web3 = new Web3(window.ethereum);

    await $.getJSON(contract_remora_gears_json)
    .then(function( contractData ) {
      contract_address = contractData.networks['5777'].address;
      effective_sc = new web3.eth.Contract(contractData.abi, contract_address);
    })
    .catch((error) => {
      console.error(error);
    });

    await $.getJSON(contract_gears_vendor_json)
    .then(function( contractData ) {
      contract_address_vendor = contractData.networks['5777'].address;
      effective_sc_vendor = new web3.eth.Contract(contractData.abi, contract_address_vendor);
    })
    .catch((error) => {
      console.error(error);
    });

    effective_address = await connectToMetaMask();

    window.ethereum.on("accountsChanged", async function (accounts) {
      location.reload();
      effective_address = await connectToMetaMask();
      console.log("Account changed:", effective_address);
      if(effective_address === undefined){
        document.getElementById('metamask_address').innerHTML = "";
        change_metamask_div_style_off();
        var profile_gear_text_id = document.getElementById('profile_gear_text');
        profile_gear_text_id.innerHTML = "";
        profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">UNDEFINED</span>';
      } else {
        change_metamask_div_style();
        document.getElementById('metamask_address').innerHTML = 'Address: <span style="font-weight: bold;">' +  effective_address + '</span>';
        get_user_balance(effective_address)
        .then(function(result){
          var profile_gear_text_id = document.getElementById('profile_gear_text');
          profile_gear_text_id.innerHTML = "";
          profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">' + result + '</span>';
        })
        .catch((error) => {
          console.log("get balance error: ", error);
        });
      }
    });

    if(effective_address !== '0x0' && effective_address !== undefined){
      console.log('MetaMask è installato!');
      change_metamask_div_style();
      document.getElementById('metamask_address').innerHTML = 'Address: <span style="font-weight: bold;">' +  effective_address + '</span>';
      get_user_balance(effective_address)
      .then(function(result){
        var profile_gear_text_id = document.getElementById('profile_gear_text');
        profile_gear_text_id.innerHTML = "";
        profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">' + result + '</span>';
      })
      .catch((error) => {
        console.log("get balance error: ", error);
      });
    } else {
      console.log('MetaMask non è installato o non hai effettuato l\'accesso. Installa MetaMask per utilizzare questa funzionalità o esegui il login.');
      document.getElementById('metamask_address').innerHTML = "";
      var profile_gear_text_id = document.getElementById('profile_gear_text');
      profile_gear_text_id.innerHTML = "";
      profile_gear_text_id.innerHTML = 'Gear Balance: ' + '<span style="font-weight: bold;">UNDEFINED</span>';
      change_metamask_div_style_off();
      alert("Please login to your Metamask wallet to use the website functionalities!");
    }
  } else {
    console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
    alert('Please install Metamask to use the website functionalities!');
    window.location.href = "https://metamask.io/";
  }
};

// gets the current active metamask address
async function connectToMetaMask() {
  try {
    // Request account access from MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // Get the current account address
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log(accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
  }
};

// function that gets the user Gears balance with a view
// on the 'GearsVendor' smart contract (it interacts with the 'Update Balance' page button)
const get_user_balance = async (walletAddress) => {
  const balance = await effective_sc.methods.balanceOf(walletAddress).call();
  effective_balance = BigInt(balance);
  return effective_balance;
};

// function that gets the user current address and perform a view
// on the 'GearsVendor' smart contract to get his offer if it exists
const get_my_offer = async (actual_address) => {
  
  var my_offer_update_value = false;

  if(effective_address !== '0x0' && effective_address !== undefined){
    var my_offer = await effective_sc_vendor.methods.getMyOffer().call({from: actual_address});
    my_offer_update_value = my_offer.updated;
  }

  if(my_offer_update_value){
    
    document.getElementById('card_0_my_offer').style.display = "block";
    document.getElementById('empty_box_my_offer').style.display = "none";

    var gears_offered_id = document.getElementById('card_0_my_offer_gears_offered_text');
    var ethereum_requested_id = document.getElementById('card_0_my_offer_eth_requested_text');
    var wallet_id = document.getElementById('card_0_my_offer_footer_seller');

    gears_offered_id.innerHTML = "";
    ethereum_requested_id.innerHTML = "";
    wallet_id.innerHTML = "";

    gears_offered_id.append('Gears: ' + my_offer.offerAmount);
    ethereum_requested_id.append('ETH per Gear: ' + Web3.utils.fromWei(my_offer.tokenPrice, 'ether'));
    wallet_id.append('Wallet: ' + actual_address);

  } else {
    document.getElementById('empty_box_my_offer').innerHTML = "";
    document.getElementById('card_0_my_offer').style.display = "none";
    document.getElementById('empty_box_my_offer').style.display = "block";
    document.getElementById('empty_box_my_offer').append('No offer for this wallet');
  }
};

// function that interacts with 'Update Price' button by validating form inputs
function check_input_values_eth_price(new_eth_price){
  var wei = BigInt(Web3.utils.toWei(new_eth_price, 'ether'));

  //ethereum > 1e(-18) and < 1000
  if((wei >= 1 && wei <= 1000000000000000000000) && (new_eth_price.length <= 20)){
    document.getElementById('error_message_payment_receiver').innerHTML = "";
    return 1;
  } else {
    document.getElementById('error_message_payment_receiver').innerHTML = "";
    document.getElementById('error_message_payment_receiver').innerHTML = "The ethereum value must be<br>greater than 1e(-18) and lesser than 1000!";
    return 0;
  }
};

// function that interacts with 'Add Gears' and 'Retrieve Gears' buttons by validating form inputs
function check_input_values_retrieve_or_add_gears(new_gears){
  try{
    var effective_gears = BigInt(new_gears);
    if(effective_gears > 0){
      document.getElementById('error_message_payment_receiver').innerHTML = "";
      return 1;
    } else {
      document.getElementById('error_message_payment_receiver').innerHTML = "";
      document.getElementById('error_message_payment_receiver').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
      return 0;
    }
  } catch {
    document.getElementById('error_message_payment_receiver').innerHTML = "";
    document.getElementById('error_message_payment_receiver').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
    return 0;
  }
};

//function that effectively calls the 'approve' method from the 'RemoraGears' smart contract
// in oredr to allow the smart contract itself to move Gears from the user wallet
const sc_approve_call = async (my_wallet, gears_offered) => {
  const approve_call = await effective_sc.methods.approve(contract_address_vendor, gears_offered).send({from: my_wallet, gasLimit: 300000});

  return approve_call;
};

// function that effectively calls the 'GearsVendor' smart contract
// to update the ETH price of the user Gears offer
const sc_update_eth_price = async () => {

  if(validateForm()){
    var eth_price_id = document.getElementById('new_payment_receiver_wallet_input').value;
    if(check_input_values_eth_price(eth_price_id) == 1){

      var new_eth_price = BigInt(Web3.utils.toWei(eth_price_id, 'ether'));

      effective_sc_vendor.methods.updatePrice(new_eth_price).send({from: effective_address, gasLimit: 200000})
      .on('transactionHash', function(hash){
          // La transazione è stata inviata, ma non è ancora stata confermata dal network
          console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
      })
      .on('receipt', function(receipt){
          // La transazione è stata confermata dal network
          console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
          // Puoi aggiungere qui la logica per gestire il successo della transazione
      })
      .on('confirmation', function(confirmationNumber, receipt){
          // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
          console.log('Confirmation Number:', confirmationNumber);
          console.log('Receipt after confirmation:', receipt);
          location.reload();
      })
      .on('error', function(error, receipt) {
          // Si è verificato un errore durante l'invio o la conferma della transazione
          console.error('Transaction Error:', error);
          console.error('Receipt on error:', receipt);
          // Puoi aggiungere qui la logica per gestire gli errori della transazione
      });
    }
  } else {
    alert("You have to compile all the fields!");
  }
};

// function that sets up the 'Update Price' form
function update_eth_price(){
  check_session(function (isSessionValid) {
    if (isSessionValid) {

      document.getElementById('new_payment_receiver_wallet_input_id').innerHTML = "New ETH price per Gear:";
      document.getElementById('new_payment_receiver_wallet_input').readOnly = false;
      document.getElementById('new_payment_receiver_wallet_input').type = "number";
      document.getElementById('new_payment_receiver_wallet_input').min = "0.000000000000000001";
      document.getElementById('new_payment_receiver_wallet_input').max = "1000";
      document.getElementById('new_payment_receiver_wallet_input').value = "";
      document.getElementById('error_message_payment_receiver').innerHTML = "";
      
      document.getElementById('invisible_div_unclickable').style.visibility = "visible";
      document.getElementById('invisible_div_unclickable').style.zIndex = "10";

      document.getElementById('close_pop_up_btn').addEventListener('click', function(){
        document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
        document.getElementById('new_payment_confirm_button').removeEventListener('click', sc_update_eth_price);
      });
      document.getElementById('new_payment_confirm_button').addEventListener('click', sc_update_eth_price);
    } else {
      console.log("La sessione non è valida.");
      alert("You have to LOGIN in order to update the offer!");
    }
  }); 
};

// function that effectively calls the 'GearsVendor' smart contract to retrieve Gears from the user offer
const sc_retrieve_gears_from_my_offer = async () => {

  if(validateForm()){
    var gears_to_retrieve = document.getElementById('new_payment_receiver_wallet_input').value;
    if(check_input_values_retrieve_or_add_gears(gears_to_retrieve) == 1){

      var new_gears_to_retrieve = BigInt(gears_to_retrieve);

      var my_offer = async () => {
        const my_offer_obtained = await effective_sc_vendor.methods.getMyOffer().call({from: effective_address});
        return my_offer_obtained;
      };

      my_offer()
        .then(function(result){
          if(result.offerAmount >= new_gears_to_retrieve){
            effective_sc_vendor.methods.retrieveToken(new_gears_to_retrieve).send({from: effective_address, gasLimit: 200000})
            .on('transactionHash', function(hash){
                // La transazione è stata inviata, ma non è ancora stata confermata dal network
                console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
            })
            .on('receipt', function(receipt){
                // La transazione è stata confermata dal network
                console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
                // Puoi aggiungere qui la logica per gestire il successo della transazione
            })
            .on('confirmation', function(confirmationNumber, receipt){
                // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
                console.log('Confirmation Number:', confirmationNumber);
                console.log('Receipt after confirmation:', receipt);
                location.reload();
            })
            .on('error', function(error, receipt) {
                // Si è verificato un errore durante l'invio o la conferma della transazione
                console.error('Transaction Error:', error);
                console.error('Receipt on error:', receipt);
                // Puoi aggiungere qui la logica per gestire gli errori della transazione
            });
          } else {
            alert("You are trying to retrieve too many Gears!");
          }
        })
        .catch((error) => {
          console.log("get balance error: ", error);
        });
    }
  } else {
    alert("You have to compile all the fields!");
  }
};

// function that sets up the 'Retrieve Gears' form
function retrieve_gears_from_my_offer(){
  check_session(function (isSessionValid) {
    if (isSessionValid) {

      document.getElementById('new_payment_receiver_wallet_input_id').innerHTML = "Insert how many Gears you want to retrieve:";
      document.getElementById('new_payment_receiver_wallet_input').readOnly = false;
      document.getElementById('new_payment_receiver_wallet_input').type = "number";
      document.getElementById('new_payment_receiver_wallet_input').min = "1";
      document.getElementById('new_payment_receiver_wallet_input').value = "";
      document.getElementById('error_message_payment_receiver').innerHTML = "";

      document.getElementById('invisible_div_unclickable').style.visibility = "visible";
      document.getElementById('invisible_div_unclickable').style.zIndex = "10";

      document.getElementById('close_pop_up_btn').addEventListener('click', function(){
        document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
        document.getElementById('new_payment_confirm_button').removeEventListener('click', sc_retrieve_gears_from_my_offer);
      });
      document.getElementById('new_payment_confirm_button').addEventListener('click', sc_retrieve_gears_from_my_offer);
    } else {
      console.log("La sessione non è valida.");
      alert("You have to LOGIN in order to update the offer!");
    }
  }); 
};

// function that effectively calls the 'GearsVendor' smart contract to add Gears to the user offer
const sc_add_gears_to_my_offer = async () => {

  if(validateForm()){
    var gears_to_add = document.getElementById('new_payment_receiver_wallet_input').value;
    if(check_input_values_retrieve_or_add_gears(gears_to_add) == 1){

      var new_gears_to_add = BigInt(gears_to_add);

      var eth_price_offer = await effective_sc_vendor.methods.getMyOffer().call({from: effective_address});

      get_user_balance(effective_address)
      .then(function(result){
        if(result >= new_gears_to_add){
          sc_approve_call(effective_address, new_gears_to_add)
          .then((result) => {
            effective_sc_vendor.methods.updateOffer(new_gears_to_add, eth_price_offer.tokenPrice).send({from: effective_address, gasLimit: 200000})
            .on('transactionHash', function(hash){
                // La transazione è stata inviata, ma non è ancora stata confermata dal network
                console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
            })
            .on('receipt', function(receipt){
                // La transazione è stata confermata dal network
                console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
                // Puoi aggiungere qui la logica per gestire il successo della transazione
            })
            .on('confirmation', function(confirmationNumber, receipt){
                // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
                console.log('Confirmation Number:', confirmationNumber);
                console.log('Receipt after confirmation:', receipt);
                location.reload();
            })
            .on('error', function(error, receipt) {
                // Si è verificato un errore durante l'invio o la conferma della transazione
                console.error('Transaction Error:', error);
                console.error('Receipt on error:', receipt);
                // Puoi aggiungere qui la logica per gestire gli errori della transazione
            });
          })
          .catch((error) => {
            console.log("approve smart contract error: ", error);
          });
        } else {
          alert("You do not have enough Gears to add!");
        }
      })
      .catch((error) => {
        console.log("get balance error: ", error);
      });
      
    }
  } else {
    alert("You have to compile all the fields!");
  }
};

// function that sets up the 'Add Gears' form
function add_gears_to_my_offer(){
  check_session(function (isSessionValid) {
    if (isSessionValid) {

      document.getElementById('new_payment_receiver_wallet_input_id').innerHTML = "Insert how many Gears you want to add:";
      document.getElementById('new_payment_receiver_wallet_input').readOnly = false;
      document.getElementById('new_payment_receiver_wallet_input').type = "number";
      document.getElementById('new_payment_receiver_wallet_input').min = "1";
      document.getElementById('new_payment_receiver_wallet_input').step = "1";
      document.getElementById('new_payment_receiver_wallet_input').value = "";
      document.getElementById('error_message_payment_receiver').innerHTML = "";

      document.getElementById('invisible_div_unclickable').style.visibility = "visible";
      document.getElementById('invisible_div_unclickable').style.zIndex = "10";

      document.getElementById('close_pop_up_btn').addEventListener('click', function(){
        document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
        document.getElementById('new_payment_confirm_button').removeEventListener('click', sc_add_gears_to_my_offer);
      });
      document.getElementById('new_payment_confirm_button').addEventListener('click', sc_add_gears_to_my_offer);
    } else {
      console.log("La sessione non è valida.");
      alert("You have to LOGIN in order to update the offer!");
    }
  });
};

// function that checks if the wallet is able to mint some Gears from past trips,
// it shows a button that will call the 'RemoraGears' smart contract to mint some Gears
// and finally calls the javascript function to update the database user statistics
const sc_get_unminted_trips = async (address) => {
  const unminted_trips = await effective_sc.methods.unmintedTripsOf(address).call();

  const unminted_trips_required = await effective_sc.methods.tripsBeforeMinting().call();

  const minted_tokens = await effective_sc.methods.mintedTokens().call();

  document.getElementById('profile_unminted_trips_counter').innerHTML = 'Unminted Trips: ' + '<span style="font-weight: bold;">' + Number(unminted_trips) + '</span> / ' + Number(unminted_trips_required);

  if(Number(unminted_trips) >= Number(unminted_trips_required)){
    document.getElementById('personal_info_minting_button_section').style.display = "block";
    document.getElementById('personal_info_minting_btn').addEventListener('click', function(){
      effective_sc.methods.mintTokensByTrips().send({from: address, gasLimit: 100000})
      .on('transactionHash', function(hash){
          // La transazione è stata inviata, ma non è ancora stata confermata dal network
          console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
      })
      .on('receipt', function(receipt){
          // La transazione è stata confermata dal network
          console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
          // Puoi aggiungere qui la logica per gestire il successo della transazione
      })
      .on('confirmation', function(confirmationNumber, receipt){
          // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
          console.log('Confirmation Number:', confirmationNumber);
          console.log('Receipt after confirmation:', receipt);

          update_user_minted_tokens_stats(Number(minted_tokens));

      })
      .on('error', function(error, receipt) {
          // Si è verificato un errore durante l'invio o la conferma della transazione
          console.error('Transaction Error:', error);
          console.error('Receipt on error:', receipt);
          // Puoi aggiungere qui la logica per gestire gli errori della transazione
      });      
    });
  }

};

// function that effectively increase the number of minted Gears of an user on the database
function update_user_minted_tokens_stats(minted_tokens){
  $.ajax({
    url: '../php_scripts/script_update_minted_tokens_stats.php',
    type: 'POST',
    dataType: 'json',
    data: { tokens: minted_tokens },
    success: function(data) {
        
        var received_message = data.message;

        console.log(received_message);

        location.reload();
        
    },
    error: function(error) {
        console.log('Errore durante la chiamata AJAX: ', error);
    }
  });
};

// function that checks if the current Metamask address of the user is valid to initiate the minting phase
function get_unminted_trips(){
  if(effective_address !== '0x0' && effective_address !== undefined){
    sc_get_unminted_trips(effective_address);
  } else {
    document.getElementById('profile_unminted_trips_counter').innerHTML = '<--> connect to metamask to see your unminted trips here <-->';
    document.getElementById('profile_unminted_trips_counter').style.color = "red";
  }
};

// function that activates (green) the metamask logo on the page
function change_metamask_div_style(){
    var my_metamask_div = document.getElementById('check_metamask_connection');

    my_metamask_div.style.background = "#14dc50";
    my_metamask_div.style.boxShadow = "0 0 0 0 #14dc50";
    my_metamask_div.style.animation = "glow_connected 1.8s linear infinite";
};

// function that deactivates (red) the metamask logo on the page
function change_metamask_div_style_off(){
  var my_metamask_div = document.getElementById('check_metamask_connection');

  my_metamask_div.style.background = "#dc143c";
  my_metamask_div.style.boxShadow = "0 0 0 0 #dc143c";
  my_metamask_div.style.animation = "glow_disconnected 1.8s linear infinite";
};

// function that retrieves the logged user information to populate the profile website page
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
                    var participated_trips_id = document.getElementById('participated_trips');
                    var profile_trips_given_id = document.getElementById('profile_trips_given');
                    var profile_trips_received_id = document.getElementById('profile_trips_received');
                    var profile_minted_gears_id = document.getElementById('profile_minted_gears');

                    profile_username_id.innerHTML = "";
                    profile_email_id.innerHTML = "";
                    participated_trips_id.innerHTML = "";
                    profile_trips_given_id.innerHTML = "";
                    profile_trips_received_id.innerHTML = "";
                    profile_minted_gears_id.innerHTML = "";


                    profile_username_id.innerHTML = 'Username: ' + '<span style="font-weight: bold;">' + offer.username + '</span>';
                    profile_email_id.innerHTML = 'Email: ' + '<span style="font-weight: bold;">' + offer.email + '</span>';
                    participated_trips_id.innerHTML = 'Participated Trips (both as passenger and driver): ' + '<span style="font-weight: bold;">' + offer.travel_stats + '</span>';
                    profile_trips_given_id.innerHTML = 'Number of passages given: ' + '<span style="font-weight: bold;">' + offer.trips_given + '</span>';
                    profile_trips_received_id.innerHTML = 'Number of passages received: ' + '<span style="font-weight: bold;">' + offer.trips_received + '</span>';
                    profile_minted_gears_id.innerHTML = 'Total minted Gears: ' + '<span style="font-weight: bold;">' + offer.minted_gears + '</span>';
                    
                    /* mechanism used to generate a profile image that has as a seed the username of the current logged user,
                      in this way the user will have every time the same profile image
                      function used at the end of the file: hashCode, seededRandom, getRandomNumber
                    */                    
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
};

// function that gets the current logged user trips notifications from the database
function get_user_notification(currentPage){
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

                    if(offer.type === 'INFORMATION_REFUSED' || offer.type === 'INFORMATION_ACCEPTED' || offer.type === 'PAYMENT_RECEIVED'){
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
};

// function that manages the deny_notification sent from a driver to a refused passenger
function deny_trip_notification(notification_id){
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
};

// function that manages the confirm_notification sent from a driver to an accepted passenger
// and adds the trip on the ongoing_trips profile section both for the passenger and the driver
// (only if the driver has not one already for this trip)
function confirm_trip_notification(notification_id){
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
};

// function that notifies the passenger of a trip booking outcome or the driver of a trip payment outcome
function confirm_notification_ok_button(notification_id){
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
};

// function that sets the correct notification html for each notification if the user has any
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
                    var card_text_notification_ok_id = document.getElementById('card_'+index+'_notification_ok_text');

                    card_text_notification_confirmation_id.innerHTML = "";
                    card_text_notification_ok_id.innerHTML = "";
                    
                    if(type === 'CONFIRMATION'){
                        document.getElementById('card_'+index+'_notification_confirm_btn').addEventListener('click', function(){
                            
                            
                            confirm_trip_notification(notification_id);
                            
                        });
                        
                        document.getElementById('card_'+index+'_notification_deny_btn').addEventListener('click', function(){
                            
                            
                            deny_trip_notification(notification_id);
                        });
                        
                        card_text_notification_confirmation_id.innerHTML = 'The user ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + ' wants to join your trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    }

                    if(type === 'INFORMATION_REFUSED'){
                        document.getElementById('card_'+index+'_notification_ok_btn').addEventListener('click', function(){
                            

                            confirm_notification_ok_button(notification_id);
                        });

                        card_text_notification_ok_id.innerHTML = 'The driver ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + '<span style="font-weight: bold; color: red;">' + ' REFUSED' + '</span>' + ' your participation to the trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    
                    }

                    if(type === 'INFORMATION_ACCEPTED'){
                        document.getElementById('card_'+index+'_notification_ok_btn').addEventListener('click', function(){
                            

                            confirm_notification_ok_button(notification_id);
                        });

                        card_text_notification_ok_id.innerHTML = 'The driver ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + '<span style="font-weight: bold; color: green;">' + ' HAS ACCEPTED' + '</span>' + ' your participation to the trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                    
                    }

                    if(type === 'PAYMENT_RECEIVED'){
                      document.getElementById('card_'+index+'_notification_ok_btn').addEventListener('click', function(){
                          

                          confirm_notification_ok_button(notification_id);
                      });

                      card_text_notification_ok_id.innerHTML = 'The user ' + '<span style="font-weight: bold;">' + offer.issuer + '</span>' + '<span style="font-weight: bold; color: green;">' + ' HAS PAID' + '</span>' + ' your trip from ' + '<span style="font-weight: bold;">' + offer.departure + '</span>' + ' to ' + '<span style="font-weight: bold;">' + offer.destination + '</span>' + ' for ' + '<span style="font-weight: bold;">' + offer.departure_date + '</span>' + '.';
                  
                    }

                }
                
            }
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that changes some particular database parameters used to change the relative payment status
// and sends a notification to the driver to notify him that the payment has benn performed.
// It also update the passenger statistics
function update_status_and_payment_notification(travel_id){
    $.ajax({
        url: '../php_scripts/script_status_and_payment_confirmation.php',
        type: 'POST',
        dataType: 'json',
        data: { trip_id: travel_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that gets ongoing_trips of the logged user
function get_ongoing_trips_from_db(currentPage_ongoing_trips){
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
                    var div_store_on_blockchain_id = document.getElementById('card_'+ i +'_store_on_blockchain');
                    var div_end_trip_on_blockchain_id = document.getElementById('card_'+ i +'_end_trip_on_blockchain');
                    var card_trip_payed_id = document.getElementById('card_'+ i +'_trip_payed');

                    if(offer.role == 'DRIVER'){
                        
                        div_buy_btn_id.style.display = "none";
                        card_trip_payed_id.style.display = "none";

                        if(offer.status == 'NOT_STORED'){

                          div_store_on_blockchain_id.style.display = "block";
                          div_end_trip_on_blockchain_id.style.display = "none";

                        } else {
                          div_store_on_blockchain_id.style.display = "none";
                          div_end_trip_on_blockchain_id.style.display = "block";
                          var card_trip_wallet_id = document.getElementById('card_'+ i +'_wallet_ongoing_id');
                          var wallet_section = document.getElementById('card_'+ i +'_wallet_ongoing_section');

                          card_trip_wallet_id.innerHTML = "";
                          card_trip_wallet_id.append('End trip with this account: ' + offer.wallet);
                          wallet_section.style.marginTop = "-12px";
                        }
                    }

                    if(offer.role == 'PASSENGER'){
                      var card_trip_wallet_id = document.getElementById('card_'+ i +'_wallet_ongoing_id');
                      card_trip_wallet_id.innerHTML = "";
                      card_trip_wallet_id.append('Pay with this Account: ' + offer.wallet);

                      var wallet_section = document.getElementById('card_'+ i +'_wallet_ongoing_section');

                      div_store_on_blockchain_id.style.display = "none";
                      div_end_trip_on_blockchain_id.style.display = "none";

                      if(offer.status == 'PAY_UNLOCKED'){
                        div_buy_btn_id.style.display = "block";
                        card_trip_payed_id.style.display = "none";
                        wallet_section.style.marginTop = "-5px";

                      } else if(offer.status == 'PAY_LOCKED'){

                        div_buy_btn_id.style.display = "none";
                        card_trip_payed_id.style.display = "none";
                        wallet_section.style.marginTop = "8px";

                      } else if(offer.status == 'PAID'){

                        div_buy_btn_id.style.display = "none";
                        card_trip_payed_id.style.display = "block";
                      }
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

// function that sets up the receiver wallet in the payment form
function confirm_payment_handler(){
  new_payment_receiver_wallet_id = document.getElementById('new_payment_receiver_wallet_input').value;
  var effective_wallet = new_payment_receiver_wallet_id.toString();
  sc_get_trip_identifier_from_history(effective_travel_id, effective_wallet);
};

// function that effectively calls the 'RemoraGears' smart contract to pay the driver
// and then calls the above update_status_and_payment_notification function
function sc_get_trip_identifier_from_history(travel_id, effective_wallet){
  $.ajax({
      url: '../php_scripts/script_get_trip_identifier_from_history.php',
      type: 'GET',
      dataType: 'json',
      data: { trip_id: travel_id },
      success: function(data) {

        if (data.length > 0) {

          var trip_identifier;

          for(var i=0; i<data.length; i++){
            offer=data[i];
            trip_identifier = offer.trip_identifier_blockchain;
          }
          
          console.log(effective_my_wallet_id);
          if(effective_address.toLowerCase() === effective_my_wallet_id.toLowerCase()){
            var my_balance = async () => {
              const account_balance = await effective_sc.methods.balanceOf(effective_address).call();
              return account_balance;
            };

            my_balance()
            .then(function(result){
              if(result >= BigInt(effective_trip_cost)){
                effective_sc.methods.confirmTripParticipation(effective_wallet, trip_identifier).send({from: effective_address, gasLimit: 250000})
                .on('transactionHash', function(hash){
                    // La transazione è stata inviata, ma non è ancora stata confermata dal network
                    console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
                })
                .on('receipt', function(receipt){
                    // La transazione è stata confermata dal network
                    console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
                    // Puoi aggiungere qui la logica per gestire il successo della transazione
                })
                .on('confirmation', function(confirmationNumber, receipt){
                    // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
                    console.log('Confirmation Number:', confirmationNumber);
                    console.log('Receipt after confirmation:', receipt);
    
                    update_status_and_payment_notification(travel_id);
    
                })
                .on('error', function(error, receipt) {
                    // Si è verificato un errore durante l'invio o la conferma della transazione
                    console.error('Transaction Error:', error);
                    console.error('Receipt on error:', receipt);
                    // Puoi aggiungere qui la logica per gestire gli errori della transazione
                });
              } else {
                alert("You do not have enough Gears to pay!");
              }
            })
            .catch((error) => {
              console.error(error);
            });
          } else {
            alert("You are trying to pay with the wrong address!");
          }        
        }
      },
      error: function(error) {
          console.log('Errore durante la chiamata AJAX: ', error);
      }
  });
};

// function that simply takes the driver wallet from the database
function get_driver_wallet_to_pay(travel_id) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: '../php_scripts/script_get_driver_wallet_from_history.php',
      type: 'GET',
      dataType: 'json',
      data: { trip_id: travel_id },
      success: function(data) {
        if (data.length > 0) {
          const driver_wallet = data[0].driver_wallet;
          resolve(driver_wallet);
        } else {
          reject('Nessun dato trovato');
        }
      },
      error: function(error) {
        console.log('Errore durante la chiamata AJAX: ', error);
        reject(error);
      }
    });
  });
};

// function that obtain the driver wallet to pay for the correct trip and then sets up
// the driver wallet just obtained with the confirm_payment_handler function
function payment_function(event){
    check_session(function (isSessionValid) {
        if (isSessionValid && (effective_address !== '0x0') && effective_address !== undefined){
            console.log("PAYMENT ENABLED!");
            var divClicked = event.target;
            var div_id = divClicked.parentNode.id;
            
            var card_x = div_id.slice(0, 6);

            var temp_travel_id = document.getElementById(card_x + '_travel_id').innerHTML;
            var temp_my_wallet_id = document.getElementById(card_x + '_wallet_ongoing_id').innerHTML;
            var temp_gear_cost = document.getElementById(card_x + '_gear_cost_text').innerHTML;

            effective_travel_id = temp_travel_id.slice(11);

            effective_my_wallet_id = temp_my_wallet_id.slice(23).toLowerCase();

            effective_trip_cost = temp_gear_cost;

            document.getElementById('invisible_div_unclickable').style.visibility = "visible";
            document.getElementById('invisible_div_unclickable').style.zIndex = "10";

            get_driver_wallet_to_pay(effective_travel_id)
            .then(function(driver_wallet) {
              new_payment_receiver_wallet_id = document.getElementById('new_payment_receiver_wallet_input')
              new_payment_receiver_wallet_id.value = driver_wallet;
            })
            .catch(function(error) {
              console.error('Errore: ', error);
            });            

            document.getElementById('close_pop_up_btn').addEventListener('click', function(){
              document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
              document.getElementById('new_payment_confirm_button').removeEventListener('click', confirm_payment_handler);
            });
            document.getElementById('new_payment_confirm_button').addEventListener('click', confirm_payment_handler);
        } else {
            console.log("La sessione non è valida.");
            alert("You have to LOGIN and install Metamask in order to PAY a TRIP!");
        }
    });   
};

// function that changes some particular database parameters used to manage
// the storing on blockchain of a trip, then it calls the check_travel_id_correctness_and_wallet function
function blockchain_porting_trip_function(event){
    check_session(function (isSessionValid) {
        if (isSessionValid) {
          console.log("STORE on Blockchain ENABLED!");
          var divClicked = event.target;
          var div_id = divClicked.parentNode.id;
          
          var card_x = div_id.slice(0, 6);

          var temp_travel_id = document.getElementById(card_x + '_travel_id').innerHTML;
          effective_travel_id = temp_travel_id.slice(11);
          
          if(effective_address !== '0x0' && effective_address !== undefined){
            check_travel_id_correctness_and_wallet(effective_travel_id);
          } else {
            alert("Please login to your Metamask wallet to use this website functionality!");
          }

        } else {
          console.log("La sessione non è valida.");
          alert("You have to LOGIN in order to STORE on Blockchain!");
        }
    });
};

// function that denies travel_id tampering attacks from the html code,
// then it calls the sc_get_and_send_passenger_wallets function
function check_travel_id_correctness_and_wallet(travel_id){
  $.ajax({
    url: '../php_scripts/script_check_travel_id_correctness_and_wallet.php',
    type: 'GET',
    dataType: 'json',
    data: { trip_id: travel_id },
    success: function(data) {

      if (data.length > 0) {
        var counter = data[0].check;
        var wallet_check = 0;
        for(var i=1; i<data.length; i++){
          element=data[i];
          if(effective_address.toLowerCase() === (element.wallet).toLowerCase()){
            wallet_check = 1;
            break;
          }
        }

        if(wallet_check == 0){
          if(counter == 1){
            sc_get_and_send_passenger_wallets(travel_id);
          } else {
            alert('Store on blockchain disabled because the travel_id has been tampered! The page will reload');
            location.reload();
          }
        } else {
          alert("You cannot store on blockchain this trip using the same wallet of a passenger!");
        }
      } else {
        console.log('No data received');
      }
    },
    error: function(error) {
        console.log('Errore durante la chiamata AJAX: ', error);
    }
  });
}; 

// function that gets the trip participants wallets and the trip Gears cost,
// then calls the function push_trip_on_blockchain_event
function sc_get_and_send_passenger_wallets(travel_id){
    $.ajax({
        url: '../php_scripts/sc_script_get_passenger_wallets.php',
        type: 'GET',
        dataType: 'json',
        data: { trip_id: travel_id },
        success: function(data) {

          if (data.length > 0) {        
              
            var arrayOfAddresses = [];
            var gear_cost_to_send;
            var number_of_participants;
            
            for(var i=0; i<data.length-1; i++){
              offer=data[i];
              arrayOfAddresses.push(offer.wallet);
            }

            offer = data[data.length - 1];
            gear_cost_to_send = BigInt(offer.gear_cost);

            number_of_participants = data.length - 1;

            var bytes_array = web3.utils.hexToBytes(travel_id);

            push_trip_on_blockchain_event(travel_id, bytes_array, number_of_participants, arrayOfAddresses, gear_cost_to_send, effective_address);
              
          } else {
            console.log('No data received');
          }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that finally calls the 'RemoraGears' smart contract to store the trip on blockchain,
// but also gets the trip_identifier_blockchain from the receipt outcome of the smart contract function
// thanks to the event that has been released. Then it calls the update_available_spots_and_status function
// and the register_trip_history_on_db
const push_trip_on_blockchain_event = async (travel_id, paddedHexString, number_of_participants, arrayOfAddresses, gear_cost_to_send, driver_address) => {
  const receipt = await effective_sc.methods.createNewTrip(paddedHexString, number_of_participants, arrayOfAddresses, gear_cost_to_send).send({from: driver_address, gasLimit: 400000})
  
  update_available_spots_and_status(travel_id);

  console.log('Evento ricevuto: ', receipt.events);
  const trip_identifier_blockchain = receipt.events.providedTravelIdHash.returnValues['returnValue'];
  register_trip_history_on_db(travel_id, trip_identifier_blockchain.toString(), driver_address);
};

// function that updates the available spots of a trip and the 'expired' database field
// to not show it anymore on the trips page
function update_available_spots_and_status(travel_id){
    $.ajax({
        url: '../php_scripts/script_update_available_spots_and_status.php',
        type: 'POST',
        dataType: 'json',
        data: { trip_id: travel_id },
        success: function(data) {
            
          var received_message = data.message;

          console.log(received_message);
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that register on the database the trip just stored on the blockchain, 
// in oredr to save other important trip information for future certification
function register_trip_history_on_db(travel_id, trip_identifier_blockchain, driver_wallet){
    $.ajax({
        url: '../php_scripts/script_trip_history_new_entry.php',
        type: 'POST',
        dataType: 'json',
        data: { trip_id: travel_id,
                trip_id_blockchain: trip_identifier_blockchain,
                wallet_driver: driver_wallet },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that initialize the 'End Trip' procedure by calling the get_trip_identifier function
function blockchain_end_trip_function(event){
  check_session(function (isSessionValid) {
    if (isSessionValid) {
      console.log("END TRIP ENABLED!");
      var divClicked = event.target;
      var div_id = divClicked.parentNode.id;
      
      var card_x = div_id.slice(0, 6);

      var temp_travel_id = document.getElementById(card_x + '_travel_id').innerHTML;
      effective_travel_id = temp_travel_id.slice(11);

      if(effective_address !== '0x0' && effective_address !== undefined){
        get_trip_identifier(effective_travel_id);
      } else {
        alert("Please login to your Metamask wallet to use this website functionality!");
      }

    } else {
        console.log("La sessione non è valida.");
        alert("You have to LOGIN in order to END a TRIP!");
    }
  });
};

// function that gets the trip_identifier from the history_trips table of the database,
// then checks if all the passenger have paid with the 'RemoraGears' smart contract function,
// finally end the trip on blockchain wit another 'RemoraGears' smart contract function
// and the calls the update_trip_and_reference_removal function
function get_trip_identifier(travel_id){
    $.ajax({
        url: '../php_scripts/script_get_trip_identifier.php',
        type: 'GET',
        dataType: 'json',
        data: { trip_id: travel_id },
        success: function(data) {
            
          if (data.length > 0) {
            
            var trip_identifier;
            var driver_wallet;

            for(var i=0; i<data.length; i++){
              offer=data[i];
              trip_identifier = offer.trip_identifier_blockchain;
              driver_wallet = offer.driver_wallet;
            }
            
            if(driver_wallet.toLowerCase() === effective_address.toLowerCase()){
              var have_all_paid = async () => {
                const value = await effective_sc.methods.hasEveryOnePaid(effective_address, trip_identifier).call();
                return value;
              };

              have_all_paid().then(function(result){
                if(result){
                  effective_sc.methods.endTrip(trip_identifier).send({from: effective_address, gasLimit: 250000})
                  .on('transactionHash', function(hash){
                      // La transazione è stata inviata, ma non è ancora stata confermata dal network
                      console.log('La transazione è stata inviata, ma non è ancora stata confermata dal network(hash): ', hash);
                  })
                  .on('receipt', function(receipt){
                      // La transazione è stata confermata dal network
                      console.log('La transazione è stata confermata dal network(Transaction Receipt):', receipt);
                      // Puoi aggiungere qui la logica per gestire il successo della transazione
                  })
                  .on('confirmation', function(confirmationNumber, receipt){
                      // La transazione è stata confermata da almeno 'confirmationNumber' blocchi
                      console.log('Confirmation Number:', confirmationNumber);
                      console.log('Receipt after confirmation:', receipt);
    
                      update_trip_and_reference_removal(travel_id);
    
                  })
                  .on('error', function(error, receipt) {
                      // Si è verificato un errore durante l'invio o la conferma della transazione
                      console.error('Transaction Error:', error);
                      console.error('Receipt on error:', receipt);
                      // Puoi aggiungere qui la logica per gestire gli errori della transazione
                      alert('You cannot close the trip yet!\ntrip identifier: ' + trip_identifier + '\nNot every passenger has confirmed the participation, or you are using the wrong wallet!');
                  });
                } else {
                  alert('Not everyone has paid this trip yet!');
                } 
              })
              .catch((error) => {
                console.error(error);
              });
            } else {
              alert("You are using the wrong wallet! Use the suggested one:\n" + driver_wallet);
            }
          } else {
            console.log('No data received');
          }
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that removes all the trips reference form everywhere on the database,
// except for the 'history_trips' table, that will be used for certification purposes.
// Furthermore, it increments the driver statistics
function update_trip_and_reference_removal(travel_id){
    $.ajax({
        url: '../php_scripts/script_update_trip_reference_removal.php',
        type: 'POST',
        dataType: 'json',
        data: { trip_id: travel_id },
        success: function(data) {
            
            var received_message = data.message;

            console.log(received_message);

            location.reload();
            
        },
        error: function(error) {
            console.log('Errore durante la chiamata AJAX: ', error);
        }
    });
};

// function that checks if the user is logged in using a php script and has a session
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

// function that logs out the user by destroying its session with a php script
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

// function used to validate the changes that can be applied to the Gears offer relative
// to the current Metamask address
function validateForm(){
    var form = document.getElementById('compilable_form_payment');
    var required_fields = form.querySelectorAll('[required]');

    for(let i = 0; i < required_fields.length; i++){
        if(!required_fields[i].value){
            return false;
        }
    }

    return true;

};

// function used to create a hashed seed for the seededRandom function
function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

// function that generates a random seed
function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// function to get a random number between 0 and 15
function getRandomNumber(seed) {
    return Math.floor(seededRandom(seed) * 16);
};
