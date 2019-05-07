const loginButton = $.get('button-login');
const signupButton = $.get('button-signup');
const backButton = $.get('button-back');
const searchButton = $.get('search-button');
const searchBtn = $.get('search-btn');

const showAuthenticationBottons = ()=>{
  signupButton.style.display = 'block';
  loginButton.style.display = 'block';
  backButton.style.display = 'none';
  searchButton.style.display = 'none';
  searchBtn.style.display= 'none';
}

const showBackButton = () => {
  loginButton.style.display = 'none';
  signupButton.style.display = 'none';
  backButton.style.display = 'block';
  searchButton.style.display = 'none';
  searchBtn.style.display= 'none';
}

const showPerfil = () => {
  loginButton.style.display = 'none';
  signupButton.style.display = 'none';
  backButton.style.display = 'none';
  searchButton.style.display = 'block';
  searchBtn.style.display= 'block';
}
