if (document.cookie.split(';').filter((item) => item.trim().startsWith('customerAccessToken=')).length) {
  // The cookie "customerAccessToken" exists
} else {
  // 'The cookie "customerAccessToken" does NOT exists'
  window.location = '/account/login'
}