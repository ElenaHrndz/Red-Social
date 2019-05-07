(function(window, document) {
  let isEditable = false;
  let d = new Date(); //obtener fecha
  let fechaHoy = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  library.controller('enter', {

    showFormLogin: function() {
      const loginSection = library.get('login-section');
      loginSection.style.display = "block";
    },
    showFormSingUp: function() {
      const registerSection = library.get('register-section');
      registerSection.style.display = "block";
    },
    signUp: function(form) {
      const email = form.email_input.value;
      const password = form.password.value;
      const passwordConfirm = form.confirm_password.value;

      document.getElementById("alert-password").style.display = "none";
      document.getElementById("alert-confirm-pass").style.display = "none";
      document.getElementById("alert-email").style.display = "none";



      const checkPasswords = window.redSocial.checkPasswords(password, passwordConfirm);
      if (checkPasswords) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(function(result) {
            window.location.hash = '#/editprofile';
            result = window.redSocial.checkEmail()
            return result
          })
          .then(function(response) {

            response = response.json;

          })
          .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            switch (errorCode) {
              case 'auth/email-already-in-use':
                document.getElementById("alert-email").style.display = "block";
                document.getElementById("email_text").innerHTML = 'this email already exist';
                break;
              case 'auth/invalid-email':
                document.getElementById("alert-email").style.display = "block";
                document.getElementById("email_text").innerHTML = 'El correo electrónico es invalido';
                break;
              default:
                break;
            }
          });
      }
    },

    logIn: function(form) {

      const emailSingIn = form.email_sing_in.value;
      const passwordSingIn = form.password_sing_in.value;

      firebase.auth().signInWithEmailAndPassword(emailSingIn, passwordSingIn)
        .then(function() {

          let userSigIn = window.redSocial.obtainUser();
          if (userSigIn.emailVerified) {
            window.location.hash = '#/editprofile';
          } else {
            window.redSocial.signOut();
            alert('Favor de ir a u correo y validar el email que registraste');

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
          if(location.href.includes('editprofile')){
            const postButton = library.get('add-btn');
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

            postButton.addEventListener('click', () => {
              library.getController().addPost();
              })

          }else if(location.href.includes('wall')){
            library.getController().printWall();
          }
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
        editButton.innerHTML = `<i class="far fa-save"></i> Save`;
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
        editButton.innerHTML = `<i class="far fa-edit"></i> Editar Nombre`;
      }
    },

    addPost: function() {
      const postField = document.getElementById('post-field');
      const user = firebase.auth().currentUser;
      const privacyField = document.getElementById('privacy');
      const isPublic = privacyField.options[privacyField.selectedIndex].value;
      if (postField.value != null || postField.value != '') {
        db.collection("posts").doc(user.uid).set({
            userId: user.uid
          })
          .then(function() {
            console.log("Document successfully written!");
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });

        let userNamePost;
        if (user.displayName == null) {
          userMail = user.email.split('@');
          userNamePost = userMail[0];
        }
        else {
          userNamePost = user.displayName;
        }
        db.collection("posts").doc(user.uid).collection('private_post').add({
            userName: userNamePost,
            message: postField.value,
            time: fechaHoy,
            isPublic: isPublic,
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

    printData: function() {
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
                  <button id="edit-button${doc.id}" class="btn btn-warning" type="submit"><i id="icon${doc.id}" class="far fa-edit"></i></button>
                  <button id="delete-button${doc.id}" class="btn btn-danger" type="submit"><i class="far fa-trash-alt"></i></button>
                </div>
              </div>
            </td>
          </tr>
          `;
          tabla.insertAdjacentHTML("beforeend", messages);
          library.getController().eventEdit(user.uid, doc.id);
          library.getController().eventDelete(user.uid, doc.id);
        })
      })
    },

    gotUserLike: function(docId, likesArray) {
      const likeButoon = library.get('like' + docId);
      const userCurrent = window.redSocial.obtainUser();
      if (likesArray.includes(userCurrent.uid)) {
        likeButoon.classList.add('like');
      } else {
        likeButoon.classList.remove('like');
      }
    },

    likes: function(docId, userIdPost, likesArray) {
      const labelLike = library.get('likes-label' + docId);
      const userCurrent = window.redSocial.obtainUser();

      var postRef = db.collection("posts").doc(userIdPost).collection('private_post').doc(docId);

      if(likesArray.length > 0){
        likesArray.forEach(element => {
          if(element === userCurrent.uid){
            // Elimina el elemento de un campo de tipo array
            postRef.update({
              likes: firebase.firestore.FieldValue.arrayRemove(userCurrent.uid)
            }).then(function(){
              console.log('el like se eliminó');
              let tabla = library.get('tabla');
              tabla.innerHTML = '';
              library.getController().printWall();
            });
          }
          else{
            // agrega un elemento al campo likes que es de tipo array
            postRef.update({
              likes: firebase.firestore.FieldValue.arrayUnion(userCurrent.uid)
            }).then(function(){
              console.log('el like se agregó');
            });
          }
        });
      }else{
        postRef.update({
          likes: firebase.firestore.FieldValue.arrayUnion(userCurrent.uid)
        }).then(function(){
          console.log('el like se agregó');
          let tabla = library.get('tabla');
          tabla.innerHTML = '';
          library.getController().printWall();
        });
      }
    },

    printWall: function() {
      let tabla = library.get('tabla');
      tabla.innerHTML = '';
      db.collection('posts').onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(docMain) {
          console.log(docMain.id, " => ", docMain.data());
          db.collection('posts').doc(docMain.data().userId).collection('private_post').orderBy('time', 'desc').limit(10).onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(`${doc.id}=>${doc.data()}`);
              if(doc.data().isPublic === 'true'){
                const likesCount = (doc.data().likes.length > 0) ? doc.data().likes.length : '';
                let messages = `
                  <tr>
                    <td>
                      <div class="card">
                        <div class="card-body">
                          <h5 class="card-title">${doc.data().userName}</h5>
                          <h6 class="card-subtitle mb-2 text-muted">${doc.data().time}</h6>
                          <textarea id="message${doc.id}" class="form-control" readOnly>${doc.data().message}</textarea><br>
                          <button id="like${doc.id}" class="btn btn-primary" type="button"><i class="fab fa-gratipay"></i></button>
                          <label id="likes-label${doc.id}">${likesCount}</label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  `;
                tabla.insertAdjacentHTML("beforeend", messages);
                library.getController().eventLike(doc.id, docMain.data().userId, doc.data().likes);
                library.getController().gotUserLike(doc.id, doc.data().likes);
              }
            })
          })
        });
      });

    },

    addPostWall: function(){
     library.getController().addPost();
     library.getController().printWall();
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

    confirmDelete: (userId, docId) => {
      if (confirm('¿Estas seguro de eliminar este post?')) {

        library.getController().deletePost(userId, docId);
      }
    },

    eventEdit: (userId, docId) => {
      const editButton = library.get('edit-button' + docId);
      editButton.addEventListener('click', () => {
        library.getController().updatePost(userId, docId);

      })
    },

    eventDelete: (userId, docId) => {
      const deleteButton = library.get('delete-button' + docId);
      deleteButton.addEventListener('click', () => {
        library.getController().confirmDelete(userId, docId);
      })
    },

    eventLike: (docId, userIdPost, likesArray) => {
      const likeButoon = library.get('like' + docId);
      let tabla = library.get('tabla');
      likeButoon.addEventListener('click', () => {
        library.getController().likes(docId, userIdPost, likesArray);

      })
    },

    backPerfil: () => {
      window.location.hash = '/editprofile';
    },

    goWall: () => {
      window.location.hash = '/wall';
    },

    googleSigIn: function() {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then(function(result) {
          var token = result.credential.accessToken;
          console.log(result)
          console.log("success.goole Account")
          window.location.hash = '#/editprofile';
        })
        .catch(function(err) {
          console.log(err);
          console.log("Intento fallido")
        })
    }
  });
})(window, document);
