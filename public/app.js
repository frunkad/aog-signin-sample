let client_id, redirect_uri, state, response_type, database, currentUser, ui;

const getUiConfig = function () {
    return uiConfig = {
        callbacks: {
            // Called when the user has been successfully signed in.
            'signInSuccessWithAuthResult': function () {
              return false;
            }
          },
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
            //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
            //   firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: '<your-tos-url>',
        signInFlow: "popup",
        // Privacy policy url/callback.
        privacyPolicyUrl: function () {
            window.location.assign('<your-privacy-policy-url>');
        }
    };
}

const handleSignedInUser = function (user) {
    currentUser = user;
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    document.getElementById('name').textContent = user.displayName;
    document.getElementById('email').textContent = user.email;
    if (user.photoURL) {
        var photoURL = user.photoURL;
        // Append size to the photo URL for Google hosted images to avoid requesting
        // the image with its original resolution (using more bandwidth than needed)
        // when it is going to be presented in smaller size.
        if ((photoURL.indexOf('googleusercontent.com') != -1) ||
            (photoURL.indexOf('ggpht.com') != -1)) {
            photoURL = photoURL + '?sz=' +
                document.getElementById('photo').clientHeight;
        }
        document.getElementById('photo').src = photoURL;
        document.getElementById('photo').style.display = 'block';
    } else {
        document.getElementById('photo').style.display = 'none';
    }
}


/**
 * Displays the UI for a signed out user.
 */
const handleSignedOutUser = function () {
    currentUser = false;
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    console.log(ui);
    ui.start('#firebaseui-auth-container', getUiConfig());
};





function continueToGA() {
    if (currentUser) {
        database.ref(`users/${currentUser.uid}`).update({
            "name": currentUser.displayName,
            "photoURL": currentUser.photoURL,
            "email": currentUser.email,
            "special-thing": "hee"
        }).then(() => {
            if(state) {
                // user came here from Google Assistant invoked login
                if (redirect_uri === "https://oauth-redirect.googleusercontent.com/r/"+firebase.apps[0].options_.projectId && client_id === "dontBeEvil") {
                    window.location = `${redirect_uri}#access_token=${firebase.auth().currentUser.uid}&token_type=bearer&state=${state}`;
                }
                else {
                    alert("Something doesn't seem good.")
                }
            }
            else {
                window.location = "<my-assistant-app-url>";
            }
        }).catch((error) => {
            alert("An error occurred");
            console.log(error);
        })
    } else {
        alert("You aren't logged in!");
    }
}

const initApp = function () {
    database = firebase.database();
    let params = (new URL(document.location)).searchParams;
    client_id = params.get("client_id");
    redirect_uri = params.get("redirect_uri");
    state = params.get("state");
    response_type = params.get("response_type");
    ui = new firebaseui.auth.AuthUI(firebase.auth());
    document.getElementById('sign-out').addEventListener('click', function () {
        firebase.auth().signOut();
    });
    document.getElementById('continue').addEventListener('click', continueToGA);
    // Listen to change in auth state so it displays the correct UI for when
    // the user is signed in or not.
    firebase.auth().onAuthStateChanged(function (user) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('loaded').style.display = 'block';
        user ? handleSignedInUser(user) : handleSignedOutUser();
    });
}
window.onload = initApp;