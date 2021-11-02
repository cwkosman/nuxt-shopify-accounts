const Multipassify = require('multipassify')

/**
 * Use the multipassify package to generate a Multipass login URL
 * @param {Object} event - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 * @param {Object} event.body - HTTP request body
 * @param {Object} event.body.customerData - customer data object
 * @param {Object} event.body.customerData.email - the customer's email address
 * @param {Object} event.body.customerData.return_to - the URL that the customer should be directed to after login
 * @param {Object} context - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 */
exports.handler = function (event, _context) {
  try {
    const { customerData } = JSON.parse(event.body)
    const multipassify = new Multipassify(process.env.SHOPIFY_MULTIPASS_SECRET)
    const multipassUrl = multipassify.generateUrl(
      customerData,
      process.env.MYSHOPIFY_DOMAIN
    )

    return {
      statusCode: 200,
      body: multipassUrl,
      headers: { 'content-type': 'text/html' }
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: `Could not generate Multipass URL: ${err.message}`
    }
  }
}
