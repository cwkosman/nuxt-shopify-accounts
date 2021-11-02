function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href
  }

  const nameClean = name.replace(/[[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + nameClean + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)

  if (!results) {
    return null
  }

  if (!results[2]) {
    return ''
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 * Used in:
 *
 * pages/account/reset
 * --> referred from Shopify Notification (Customer account password reset [customer_account_reset])
 *
 * pages/account/activate
 * --> referred from Shopify Notification (Customer account invite [customer_account_activate])
 */

if (getParameterByName('id') && getParameterByName('token')) {
  // The "id" and "token" exist
} else {
  // The "id" and "token" do NOT exist
  window.location = '/account/login'
}
