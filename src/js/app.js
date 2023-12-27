App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {
        if(window.ethereum) {
            console.log('MetaMask Installed...');
            App.web3provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/88ac0044e5be425f8a4bf77b579474d8');
        window.web3 = new Web3(window.ethereum);
      }
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON("Choice.json", function(choice) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Choice = TruffleContract(choice);
        // Connect provider to interact with contract
        App.contracts.Choice.setProvider(App.web3provider);

        App.listenForEvents();
        return App.render();
      });
    },
  
    listenForEvents: function() {
        App.contracts.Choice.deployed().then(function(instance) {
          instance.votedEvent({}, {
            fromBlock: 0,
            toBlock: 'latest'
          }).watch(function(error, event) {
            console.log("event triggered", event)
            // Reload when a new vote is recorded
            App.render();
          });
        });
      },

    render: function() {
      var choiceInstance;
      var loader = $("#loader");
      var content = $("#content");
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });
  
      // Load contract data
      App.contracts.Choice.deployed().then(function(instance) {
        choiceInstance = instance;
        return choiceInstance.offersCount();
      }).then(function(offersCount) {
        var offersResults = $("#offersResults");
        offersResults.empty();
  
        var offersSelect = $('#offersSelect');
        offersSelect.empty();

        for (var i = 1; i <= offersCount; i++) {
          choiceInstance.offers(i).then(function(offer) {
            var id = offer[0];
            var name = offer[1];
            var voteCount = offer[2];
  
            // Render candidate Result
            var offerTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            offersResults.append(offerTemplate);

            // Render candidate ballot option
            var offerOption = "<option value='" + id + "' >" + name + "</ option>"
            offersSelect.append(offerOption);
          });
        }
        return choiceInstance.voters(App.account);
    }).then(function(hasVoted) {
        // Do not allow a user to vote
        if(hasVoted) {
            $('form').hide();
        }
        loader.hide();
        content.show();
    }).catch(function(error) {
        console.warn(error);
    });
    },


    castVote: function() {
        var offerId = $('#offersSelect').val();
        App.contracts.Choice.deployed().then(function(instance) {
          return instance.vote(offerId, { from: App.account });
        }).then(function(result) {
          // Wait for votes to update
          $("#content").hide();
          $("#loader").show();
        }).catch(function(err) {
        console.error(err);
        });
        }
    };

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });