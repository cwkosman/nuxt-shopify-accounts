// Expected request body:
//
//  {
//    orderID: "the-order-id",
//    transactionID: "the-transaction-id",
//  }

const axios = require('axios')

exports.handler = async function (event, context, callback) {
  const { orderID, transactionID } = JSON.parse(event.body)

  const endpoint = `https://${process.env.MYSHOPIFY_DOMAIN}/admin/api/2020-04/orders/${orderID}/transactions/${transactionID}.json`

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_PASSWORD
      }
    })

    const body = JSON.stringify(response.data.transaction)
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}
