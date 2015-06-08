var Scrape = Scrape || {};

Scrape.New = (function() {

  var password, password_confirmation, email, firstName, lastName, user_token, foundPairings;
loggedIn = false;




//NEEDS WORK
  function _hideLogin() {
    $('#loginModal').modal('hide');
    $('#login-button').hide();
    $('#profile-dropdown').removeClass('hidden');
  }


//NEEDS WORK
  function _success() {
    $('#login-success').modal('show');
    _hideLogin();
    _clearPass();
    loggedIn = true;
  }

//NEEDS WORK
  function _failure(failText) { //If login fails, hide modal and highlight erros
    $('.alert-danger').html('<strong>'+failText+'</strong><br><p>Please check fields and try again</p>');
    $('#login-fail').modal('show');
  }


  /*CLEAR PASSWORD FIELDS AFTER SUCCESS*/
  function _clearPass () {
    $('#uEmail').val('');
    $('#uEmailNew').val('');
    $('#uPassword').val('');
    $('#uPasswordNew').val('');
    $('#firstName').val('');
    $('#lastName').val('');
    $('#uPasswordConfirmation').val('');
  }
  /*END CLEAR PASSWORD FIELDS AFTER SUCCESS*/


/*CREDENTIALS GENERATOR*/
  function _generateCredentials(userType) {
    if (userType == "new") {
      return JSON.stringify({
        credentials: {
          email: $('#uEmailNew').val(),
          password: $('#uPasswordNew').val(),
          first_name: $('#uFirstName').val(),
          last_name: $('#uLastName').val(),
          password_confirmation: $('#uPasswordConfirmation').val()
        }
      });
    } else {
      return JSON.stringify({
        credentials: {
          email: $('#uEmail').val(),
          password: $('#uPassword').val()
        }
      });
    }

  }
/*END CREDENTIALS GENERATOR*/

/*REGISTER FUNCTION*/
  function _register() {
    params = _generateCredentials("new");
    $.ajax({
        url: 'https://mysterious-ocean-5529.herokuapp.com/register',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: params
      })
      .done(function() {
        console.log("success");
        $('#loginModal').modal('hide');
      })
      .fail(function() {
        _failure("Registration Error");
        console.log("error");
      });
  }
/*END REGISTER FUNCTION*/

/*LOGIN FUNCTION*/
  function _login() {
    params = _generateCredentials("old");
    $.ajax({
        url: 'https://mysterious-ocean-5529.herokuapp.com/login',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: params
      })
      .done(function(data, textStatus) {
        console.log('Success');
        user_token = data.token;
        _success();
        flavors = data.flavors;
        drinks = data.drinks;
      })
      .fail(function(jqxhr, textStatus, errorThrown) {
        console.log("error");
        _failure("Login Error");
      });
  }
/*END LOGIN FUNCTION*/

/*POPULATE PAIRINGS*/
function _popPairings (pairingList, objType) {
  var nameType = objType =="drink"? "roast_name":"name";
  var IdType = objType == "drink"? "drink_id":"flavor_id";
  var thingName;
  $('#pairings-div').show();
  $('#pairings-list').html('');
  for (var i = 0; i < pairingList.length; i++) {
    $.ajax({
       url: 'https://mysterious-ocean-5529.herokuapp.com/'+objType+'/'+pairingList[i][IdType],
       type: 'GET',
       headers: {Authorization: "Token token="+user_token},
       contentType: 'application/json',
       dataType: 'json'
     })
     .done(function(data) {
       console.log(data[objType][nameType]);
       thingName =  data[objType][nameType];
       $('#pairings-list').append('<li>' + thingName + '</li>');
     });

  }
}
/*END POPULATE PAIRINGS*/

/*GET PAIRINGS*/
function _getPairings (pairingSearch, objectType) {
  params = _generateCredentials();
  $.ajax({
    url: 'https://mysterious-ocean-5529.herokuapp.com/pairing',
    type: 'GET',
    headers: {Authorization: "Token token="+user_token},
    contentType: 'application/json',
    dataType: 'json',
  })
  .done(function(data) {
    console.log("success");
    console.log(data);
    foundPairings = data.pairing;
    _popPairings(foundPairings, objectType);
  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });

}

/*END GET PAIRINGS*/


/*NORMALIZER*/
  function normalize (textToNormalize) {
  return textToNormalize.replace(/\W+|™|®/, '').toLowerCase();
  }


/*AUTOPOPULATOR*/
  function _autoPop(checkStr, $listEl, targetType) {
    // console.log(checkStr, $listEl, targetType);
    $listEl.html('');
    checkStr = normalize(checkStr);

    if (targetType == "flavor") {
      for (var i = 0; i < flavors.length; i++) {
        var flavName = flavors[i].name;
        var flavNameStripped = normalize(flavName);

        if (flavNameStripped.search(checkStr) != -1) {
          var $newOption = '<option value="' + flavName + '"></option';
          $listEl.append($newOption);

        }
      }
    } else {
      for (var j = 0; j < drinks.length; j++) {
        var brewName = drinks[j].roast_name;
        var brewNameStripped = normalize(brewName);
        if (brewNameStripped.search(checkStr) != -1) {
          var $newOption1 = '<option value="' + brewName + '"></option';
          $listEl.append($newOption1);

        }
      }
    }

  }

  /*END AUTOPOPULATOR*/

/*RETURN FUNCTIONS*/
  return {
    login: _login,
    register: _register,
    autoPop: _autoPop,
    getPairings: _getPairings,
    fail: _failure
  };
/*END RETURN FUNCTIONS*/

})(); //IIFE END & INVOCATION
