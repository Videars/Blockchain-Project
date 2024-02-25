var currentPage = 1;
var card_counter = 0;

var new_sell_gears_offered_id = "";
var new_sell_gears_ethereum_requested_id = "";
var new_sell_gears_receiver_wallet_id = "";

var vendor_wallet_temp = "";
var temp_token_price_gui = "";

var web3 = undefined;

var contract_address = "";

var contract_address_vendor = "";

var effective_sc = "";
var effective_sc_vendor = "";

var effective_address = '0x0'

var event_emitter;
var notification_array = [];
var global_array_index = 0;

const pageLimit = 5;

// initializes the various buttons and sections of the Gears offer page
// but also the notification system for the Gear offers
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
        console.log("The session is not valid!");
      }
    });

    initialize_web3_connection()
    .then(function(result){
      var switch_element = document.getElementById('switch_element');
      get_from_blockchain(currentPage);
      if(window.ethereum){
        var interval_identifier;
        if(switch_element.checked){
          check_session(function (isSessionValid) {
            if (isSessionValid) {
              console.log('Notification Enabled!');
              subscribe_to_events()
                .then(function(emitter){
                  event_emitter = emitter;
                  event_emitter.on("data", event_handler);
                });
                
              interval_identifier = setInterval(show_notification, 2000);
            } else {
              console.log("The session is not valid!");
              document.getElementById('switch_notification').style.display = "none";
            }
          });
        }
        switch_element.addEventListener('change', function(){
          check_session(function (isSessionValid) {
            if (isSessionValid) {
              if(switch_element.checked){
                console.log('Notification Enabled!');
                event_emitter.on("data", event_handler);
                interval_identifier = setInterval(show_notification, 2000);
              } else {
                console.log('Notification Disabled :(');
                event_emitter.off("data", event_handler);
                clearInterval(interval_identifier);
                notification_array = [];
                global_array_index = 0;
              }
            } else {
              console.log("The session is not valid!");
              alert("You have to login to receive offer notification!");
            }
          });
        });
      } else {
        console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
        alert('Please install Metamask to use the website functionalities!');          
      }
    })
    .catch((error) => {
      console.error(error);
    });

    document.getElementById('next_page_btn').addEventListener('click', function(){
        currentPage=currentPage+1;
        get_from_blockchain(currentPage);
        window.scrollTo(0, 0);
    });

    document.getElementById('previous_page_btn').addEventListener('click', function(){
        if(currentPage>1){
            currentPage=currentPage-1;
            get_from_blockchain(currentPage);
            window.scrollTo(0, 0);
        }
    });

    document.getElementById('new_sell_post_btn').addEventListener('click', function(){
        check_session(function (isSessionValid) {
            if (isSessionValid) {
              if(effective_address !== '0x0' && effective_address !== undefined){
                console.log('Indirizzo MetaMask:', effective_address);
                new_sell_gears_receiver_wallet_id = document.getElementById('new_sell_gears_receiver_wallet_input');
                new_sell_gears_receiver_wallet_id.value = effective_address;
                
                document.getElementById('invisible_div_unclickable').style.visibility = "visible";
                document.getElementById('invisible_div_unclickable').style.zIndex = "5";
                document.getElementById('close_pop_up_btn').addEventListener('click', function(){
                    document.getElementById('new_sell_gears_confirm_button').removeEventListener('click', sell_gears_publication_handler);
                    document.getElementById('invisible_div_unclickable').style.visibility = "hidden";
                });
                document.getElementById('new_sell_gears_confirm_button').addEventListener('click', sell_gears_publication_handler);
              } else {
                console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
                alert('Please install Metamask to use the website functionalities!');
              }
            } else {
                console.log("The session is not valid!");
                alert("You have to LOGIN in order to post a new OFFER!");
            }
        });
    }); 
});

// function used to initialize the web3.0 connection by getting contracts and current metamask address 
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
      // Handle account changes
      // Get the current account and update your contract interactions
      effective_address = await connectToMetaMask();
      console.log("Account changed:", effective_address);
    });

    console.log('MetaMask è installato!');

  } else {
    console.log('MetaMask non è installato. Installa MetaMask per utilizzare questa funzionalità.');
    alert('Please install Metamask to use the website functionalities!');
    //window.location.href = "https://metamask.io/";
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
    alert("Cannot get Metamask address, please login on your metamask account and try again.");
  }
};

// setting up the definition of the notification_object event
function notification_object(event_owner, new_amount, new_eth_price){
  this.event_owner = event_owner;
  this.new_amount = new_amount;
  this.new_eth_price = new_eth_price;
};

// function that gets values from the offer event and creates a notification_object element. Also populates the notification_array
function event_handler(event){
  console.log("enabled: ", event);
  var new_amount = event.returnValues['newAmount'];
  var new_price = event.returnValues['newPrice'];
  var eth_price = Web3.utils.fromWei(new_price, 'ether');
  var event_owner = event.returnValues['owner'];
  if(event_owner.toLowerCase() !== effective_address.toLowerCase()){
    var new_notification = new notification_object(event_owner, new_amount, eth_price);
    notification_array.push(new_notification);
  }
};

// function that 'subscribes' to the 'OfferUpdated' event of the 'GearsVendor' smart contract
const subscribe_to_events = async () => {
  const emitter = await effective_sc_vendor.events.OfferUpdated();
  return emitter;
};

// function that shows the notification on the screen if an 'OfferUpdated' event happens
function show_notification(){
  var notification_div = document.getElementById('notification_event');
  if(notification_div.classList[1] === "hide" || notification_div.classList[1] === undefined){
    if(global_array_index < notification_array.length){
      console.log("There is a new_element!");
      notification_div.innerHTML = "";
      notification_div.innerHTML = 'Address: <span style="font-weight: bold;">' + (notification_array[global_array_index].event_owner).toLowerCase() + '</span> has updated his offer. <br> New Gears Amount: <span style="font-weight: bold;">' + notification_array[global_array_index].new_amount + '</span> <br> New ETH Price: <span style="font-weight: bold;">' + notification_array[global_array_index].new_eth_price + '</span>';
      notification_div.classList.remove('hide');
      notification_div.classList.add('show');
      notification_div.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      
      setTimeout(function() {
        notification_div.classList.remove('show');
        notification_div.classList.add('hide');
        notification_div.style.boxShadow = 'none';
      }, 10000);
      
      global_array_index = global_array_index + 1;
    } else {
      console.log("No new_element :(");
    }
  }
};

// function that gets the user Gears balance with a view on the 'GearsVendor' smart contract
const get_user_balance = async (walletAddress) => {
  const balance = await effective_sc.methods.balanceOf(walletAddress).call();
  effective_balance = BigInt(balance);
  return effective_balance;
};

// function that gets the offers from the 'GearsVendor' smart contract
// and shows them on the website page by converting ETH in WEi
const get_from_blockchain = async(currentPage) => {
    var selling_addressess_array_raw = await effective_sc_vendor.methods.getAllAddresses().call();
    var selling_addressess_array = [];
    for(var j = 0; j < selling_addressess_array_raw.length; j++){
      var offer = await effective_sc_vendor.methods.getOfferByAddress(selling_addressess_array_raw[j]).call();
      if(BigInt(offer.offerAmount) != 0){
        selling_addressess_array.push(selling_addressess_array_raw[j]);
      }
    }
    var offers_list = [];
    if((currentPage*pageLimit) <= selling_addressess_array.length){
        for(var i = ((currentPage-1)*pageLimit); i < (currentPage*pageLimit); i++){
            var offer = await effective_sc_vendor.methods.getOfferByAddress(selling_addressess_array[i]).call();
            var ether_value = Web3.utils.fromWei((offer.tokenPrice).toString(), 'ether')
            var offer_from_blockchain = {
                address_wallet: selling_addressess_array[i],
                token_to_sell: BigInt(offer.offerAmount),
                token_price: ether_value
            }
            offers_list.push(offer_from_blockchain);
        }
    } else {
      for(var i = ((currentPage-1)*pageLimit); i < selling_addressess_array.length; i++){
        var offer = await effective_sc_vendor.methods.getOfferByAddress(selling_addressess_array[i]).call();
        var ether_value = Web3.utils.fromWei((offer.tokenPrice).toString(), 'ether')
        var offer_from_blockchain = {
            address_wallet: selling_addressess_array[i],
            token_to_sell: BigInt(offer.offerAmount),
            token_price: ether_value
        }
        offers_list.push(offer_from_blockchain);
      }
    }
    
    if(offers_list.length > 0){
        for(var i=0; i<offers_list.length; i++){
            offer=offers_list[i];
            document.getElementById('sell_boxes').style.display = "block";
            document.getElementById('empty_box').style.display = "none";
            document.getElementById('card_'+i).style.display = "flex";

            var gears_offered_id = document.getElementById('card_' + i + '_gears_offered_text');
            var ethereum_requested_id = document.getElementById('card_' + i + '_eth_requested_text');
            var wallet_id = document.getElementById('card_' + i + '_footer_seller');

            gears_offered_id.innerHTML = "";
            ethereum_requested_id.innerHTML = "";
            wallet_id.innerHTML = "";

            gears_offered_id.append('Gears: ' + offer.token_to_sell);
            ethereum_requested_id.append('ETH per Gear: ' + offer.token_price);
            wallet_id.append('Wallet: ' + offer.address_wallet);

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

};

// function used to automatically compute and show the total ETH price
// of an offer that an user is buying in real-time
function updateInput(value){
  if(check_input_values_buy(value) == 1){
    var calculated_wei = BigInt(value) * BigInt(Web3.utils.toWei(temp_token_price_gui, 'ether'));
    document.getElementById('buy_offer_trade_ethereum_input').value = Web3.utils.fromWei(calculated_wei, 'ether');
    console.log(calculated_wei);
  }
};

// function that post a new Gears offer on the market and makes currency conversion
function sell_gears_publication_handler(){
    
    if(validateForm()){
        new_sell_gears_offered_id = document.getElementById('new_sell_gears_trade_gears_input').value;
        new_sell_gears_ethereum_requested_id = document.getElementById('new_sell_gears_trade_ethereum_input').value;
        new_sell_gears_receiver_wallet_id = document.getElementById('new_sell_gears_receiver_wallet_input').value;
        
        if(check_input_values(new_sell_gears_offered_id, new_sell_gears_ethereum_requested_id) == 1){
          
          var gears_offered = BigInt(new_sell_gears_offered_id);
          var token_price = new_sell_gears_ethereum_requested_id;

          var ether_value = BigInt(Web3.utils.toWei(token_price, 'ether'));

          get_user_balance(effective_address)
          .then(function(current_balance_value){
            if(current_balance_value >= gears_offered){
              sc_public_new_offer(new_sell_gears_receiver_wallet_id, gears_offered)
              .then((result) => {
                effective_sc_vendor.methods.updateOffer(gears_offered, ether_value).send({from: new_sell_gears_receiver_wallet_id, gasLimit: 300000})
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
              alert("You do not have enough Gears!");
            }
          }).catch((error) => {
            console.log("get user balance smart contract error: ", error);
          });
          
            
        }
    } else {
        alert("You have to compile all the new_offer fields!");
    }
};

// function that effectively call the 'GearsVendor' smart contract to publish a new Gears offer
const sc_public_new_offer = async (new_sell_gears_receiver_wallet_id, gears_offered) => {
    const approve_call = await effective_sc.methods.approve(contract_address_vendor, gears_offered).send({from: new_sell_gears_receiver_wallet_id, gasLimit: 300000});

    return approve_call;
}; 

// function that validates the just inserted values of the form for the new Gears offer post
function check_input_values(new_sell_gears_gears_offered_id, new_sell_gears_ethereum_requested_id){
  try{
    var gears = BigInt(new_sell_gears_gears_offered_id);
    var wei = BigInt(Web3.utils.toWei(new_sell_gears_ethereum_requested_id, 'ether'));
    if(gears >= 1){
      if((wei >= 1 && wei <= 1000000000000000000000) && (new_sell_gears_ethereum_requested_id.length <= 20)){
        document.getElementById('error_message_ethereum').innerHTML = "";
        document.getElementById('error_message_gears').innerHTML = "";
        return 1;
      } else {
        document.getElementById('error_message_gears').innerHTML = "";
        document.getElementById('error_message_ethereum').innerHTML = "";
        document.getElementById('error_message_ethereum').innerHTML = "The ethereum value must be<br>greater than 1e(-18) and lesser than 1000!";
        return 0;
      }
    } else {
      document.getElementById('error_message_ethereum').innerHTML = "";
      document.getElementById('error_message_gears').innerHTML = "";
      document.getElementById('error_message_gears').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
      return 0;
    }
  } catch {
    document.getElementById('error_message_ethereum').innerHTML = "";
    document.getElementById('error_message_gears').innerHTML = "";
    document.getElementById('error_message_gears').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
    return 0;
  }
};

// function that validates the just inserted values of the form
// for the Gears offer that an user is trying to buy
function check_input_values_buy(new_buy_gears){
  try{
    var gears = BigInt(new_buy_gears);
    if(gears >= 1){
      document.getElementById('error_message_gears_buy').innerHTML = "";
      return 1;
    } else {
      document.getElementById('error_message_gears_buy').innerHTML = "";
      document.getElementById('error_message_gears_buy').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
      return 0;
    }
  } catch {
    document.getElementById('error_message_gears_buy').innerHTML = "";
    document.getElementById('error_message_gears_buy').innerHTML = "The value must be an Integer<br>equal or greater than 1!";
    return 0;
  }
};

// function that makes price conversion from ETH to WEi and makes security checks
// to allow the user to buy the Gears offer
function buy_gears_handler(){

  if(validateFormBuy()){
    var new_buy_gears = document.getElementById('buy_offer_trade_gears_input').value;
    var ethereum_calculated = document.getElementById('buy_offer_trade_ethereum_input').value;
    
    if(check_input_values_buy(new_buy_gears) == 1){

      var gears_to_buy = BigInt(new_buy_gears);
      var ethereum = temp_token_price_gui;

      var ether_value = BigInt(Web3.utils.toWei(ethereum, 'ether'));
      var total_ethereum = BigInt(Web3.utils.toWei(ethereum_calculated, 'ether'));

      var offer_to_check = async () => {
        const offer = await effective_sc_vendor.methods.getOfferByAddress(vendor_wallet_temp).call();
        return offer;
      }

      if(vendor_wallet_temp.toLowerCase() === effective_address.toLowerCase()){
        alert('You cannot buy from yourself!');
      } else {
        offer_to_check()
        .then(function(offer){
          if(offer.offerAmount >= gears_to_buy){
            effective_sc_vendor.methods.buyOffer(vendor_wallet_temp, gears_to_buy, ether_value).send({from: effective_address, value: total_ethereum, gasLimit: 300000})
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
            alert("You are trying to buy too many Gears!");
          }
        }).catch((error) => {
          console.error(error);
        });
      }
    }
  } else {
      alert("You have to compile all the new_offer fields!");
  }
};

// function that checks if you are using a Metamask address to open the compilable form
// and identifies which offer you want to buy from 
function check_to_buy_an_offer(event){
    check_session(function (isSessionValid) {
        if (isSessionValid && effective_address !== '0x0' && effective_address !== undefined) {
          console.log("BUY ENABLED!");

          var divClicked = event.target;
          var div_id = divClicked.parentNode.id;
          
          var card_x = div_id.slice(0, 6);

          var temp_vendor_wallet = document.getElementById(card_x + '_footer_seller').innerHTML;
          var effective_vendor_wallet = temp_vendor_wallet.slice(8);
          vendor_wallet_temp = effective_vendor_wallet;

          var temp_token_price = document.getElementById(card_x + '_eth_requested_text').innerHTML;
          temp_token_price_gui = temp_token_price.slice(14);

          console.log('Indirizzo MetaMask:', effective_address);
          var new_sender_wallet_id = document.getElementById('buy_offer_sender_wallet_input');
          new_sender_wallet_id.value = effective_address;
          
          document.getElementById('invisible_div_unclickable_buy_offer').style.visibility = "visible";
          document.getElementById('invisible_div_unclickable_buy_offer').style.zIndex = "5";
          document.getElementById('close_pop_up_btn_buy').addEventListener('click', function(){
              document.getElementById('buy_offer_confirm_button').removeEventListener('click', buy_gears_handler);
              document.getElementById('invisible_div_unclickable_buy_offer').style.visibility = "hidden";
          });
          document.getElementById('buy_offer_confirm_button').addEventListener('click', buy_gears_handler);
        } else {
          console.log("The session is not valid!");
          alert("You have to LOGIN and install Metamask in order to BUY something!");
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

// function used to validate the sell publication form
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

// function used to validate the buy publication form
function validateFormBuy(){
  var form = document.getElementById('compilable_form_buy_offer');
  var required_fields = form.querySelectorAll('[required]');

  for(let i = 0; i < required_fields.length; i++){
      if(!required_fields[i].value){
          return false;
      }
  }
  return true;
}