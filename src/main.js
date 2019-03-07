const btnOut = document.getElementById('btnOut');


var mainApp = {};

(function(){
  var firebase = app_fireBase;
  var uid = null;
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        uid=user.uid;
      }else{
          uid=null;
          window.location.replace("login.html");
      }
    });
    btnOut.addEventListener ('click', function logOut(){
     firebase.auth().signOut();
 });
//mainApp.logOut = logOut;

})() 

(function app(){
  document.getElementById('user-name').innerHTML= user.displayName;
  })()



