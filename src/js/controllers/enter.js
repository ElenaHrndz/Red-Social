(function(window, document) {
let isEditable = false;
  library.controller('enter', {
    
    showFormLogin: function(){
      const loginSection = library.get('login-section');
      loginSection.style.display = "block";
    },
    showFormSingUp: function(){
      const registerSection = library.get('register-section');
      registerSection.style.display = "block";
    },
    signUp: function(form) {
      const email = form.email_input.value;
      const password = form.password.value;
      const passwordConfirm = form.confirm_password.value;
      const checkPasswords = window.redSocial.checkPasswords(password,passwordConfirm); 
      if (checkPasswords) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(function(result) {
            console.log(result)
            window.location.hash = '#/editprofile';
            result = window.redSocial.checkEmail()
            return result
          })
          .then(function(response) {
            console.log(response);
            //parse json to create a js object
            response = response.json;
            //get a user object inside the response object
            const user = response.user;
            //Save the data for the current User
            let userData = {
              id: user.uid,
              email: user.email,
            }
          })
          .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            switch (errorMessage) {
              case 'EMAIL_EXISTS':
                alert('this email already exist');
                break;
              case 'INVALID_EMAIL':
                alert('this email is invalid please enter a valid one');
                break;
            }
          });
      }
    },

    logIn: function(form) {
      console.log('click')
      const emailSingIn = form.email_sing_in.value;
      const passwordSingIn = form.password_sing_in.value;

      firebase.auth().signInWithEmailAndPassword(emailSingIn, passwordSingIn)
        .then(function() {
          
          console.log('userSigIn')
          let userSigIn = window.redSocial.obtainUser();
          if (userSigIn.emailVerified) {
            console.log('si hay ver')
            window.location.hash = '#/editprofile';
          } else {
            console.log('no hay ver')
            alert('debes validar tu email')
            window.redSocial.signOut();
          }
        })
        .catch(function(error) {
          //Handle Erros here.
          const errorCode = error.code;
          const errorMessages = error.messages;
        });
    },

    observer: function() {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log('hay usuario')
          
          library.getController().printData();
          var displayName = user.displayName;
          if (displayName == null) {
            displayName = user.email;
          }

          var photoURL = 'img/profile.jpg';
          if (user.photoURL != null) {
            photoURL = user.photoURL;
          }

          const photoDefault = library.get('cliente-photo');
          const userNameField = library.get('user-name');
          photoDefault.setAttribute("src", photoURL);
          userNameField.value = displayName;
        } else {
          window.location.hash = '#/';
        }
      });
    }, 


    editUser: function() {
      const userNameField = library.get('user-name');
      const editButton = library.get('edit_button');
      isEditable = !isEditable;
      if (isEditable) {
        userNameField.readOnly = false;
        editButton.innerHTML = 'Save';
      } else {
        firebase.auth().currentUser.updateProfile({
            displayName: userNameField.value
          })
          .then(() => {

          })
          .catch(() => {
            alert('something went wrong');
          })
        userNameField.readOnly = true;
        editButton.innerHTML = 'Edit';
      }
    },

    addPost: function() {
      let d = new Date(); //obtener fecha
      let fechaHoy = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
      const postField = document.getElementById('post-field');
      const user = firebase.auth().currentUser;
      if (postField.value != null) {
        db.collection("posts").doc(user.uid).set({
            userId: user.uid
          })
          .then(function() {
            console.log("Document successfully written!");
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });
        db.collection("posts").doc(user.uid).collection('private_post').add({
            userName: user.displayName,
            message: postField.value,
            time: fechaHoy,
            isPublic: false,
            likes: [],
            comments: []
          })

          .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            postField.value = '';
          })
          .catch(function(error) {
            console.error("Error adding document: ", error);
          });
      }
    },

    printData: function () {
      var tabla = document.getElementById('tabla');
      const user = firebase.auth().currentUser;
      db.collection('posts').doc(user.uid).collection('private_post').orderBy('time', 'desc').limit(10).onSnapshot((querySnapshot) => {
        tabla.innerHTML = '';
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id}=>${doc.data()}`);
          let messages = `
          <tr>
            <td>
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">${doc.data().userName}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${doc.data().time}</h6>
                  <textarea id="message${doc.id}" class="form-control" readOnly>${doc.data().message}</textarea><br>
                  <button id="edit-button${doc.id}" class="btn btn-primary" type="submit"onclick="updatePost('${user.uid}','${doc.id}','${doc.data().message}')"><i id="icon${doc.id}" class="far fa-edit"></i></button>
                  <button class="btn btn-primary" type="submit" onclick="library.getController().confirmDelete('${user.uid}','${doc.id}')"><i class="far fa-trash-alt"></i></button>
                </div>
              </div>
            </td>
          </tr>
          `;
          tabla.insertAdjacentHTML("beforeend", messages);
        })
      })
    },

    printWall: function() {
      var tabla = library.get('tabla');
      tabla.innerHTML = '';
      db.collection('posts').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(docMain) {
            console.log(docMain.id, " => ", docMain.data());
            db.collection('posts').doc(docMain.data().userId).collection('private_post').orderBy('time', 'desc').limit(10).onSnapshot((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log(`${doc.id}=>${doc.data()}`);
                let messages = `
                <tr>
                  <td>
                    <div class="card">
                      <div class="card-body">
                        <h5 class="card-title">${doc.data().userName}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${doc.data().time}</h6>
                        <textarea id="message${doc.id}" class="form-control" readOnly>${doc.data().message}</textarea><br>
                      </div>
                    </div>
                  </td>
                </tr>
                `;
                tabla.insertAdjacentHTML("beforeend", messages);
              })
            })
        });
      });
    },
    
     updatePost: function(userId, docId) {
      const button = library.get('edit-button' + docId);
      const editIcon = library.get('icon' + docId);
      const txtMessage = library.get('message' + docId);
      editIcon.classList.toggle('fa-edit');
      editIcon.classList.toggle('fa-save');
      txtMessage.readOnly = false;
    
      button.onclick = function() {
        var postRef = db.collection("posts").doc(userId).collection('private_post').doc(docId);
        let d = new Date(); //obtener fecha
        let fechaHoy = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
        return postRef.update({
            message: txtMessage.value,
            time: fechaHoy
          })
          .then(function() {
            console.log("Document successfully updated!");
            editIcon.classList.toggle('fa-save');
            editIcon.classList.toggle('fa-edit');
            txtMessage.readOnly = true;
          })
          .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
          });
      }
    },

    
    deletePost: function(userId, docId) {
      db.collection("posts").doc(userId).collection('private_post').doc(docId).delete()
        .then(function() {
          console.log("Document successfully deleted!");
        }).catch(function(error) {
          console.error("Error removing document: ", error);
        });
    },

    confirmDelete: (userId, docId)=>{
      if (confirm('¿Estas seguro de eliminar este post?')){
           deletePost(userId, docId)
        }
     },


    googleSigIn: function(){
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
      .then(function(result){
        db.collection('users').add({
          user: user.uid,
          last: user.displayName,
        })
        console.log(result)
        console.log("success.goole Account")

        window.location.hash = '#/editprofile';
      })
      .catch(function(err){
        console.log(err);
        console.log("Intento fallido")
      })
    }
  });
})(window, document);
