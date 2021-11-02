const countrycitystatejson = require('countrycitystatejson')

/**
 * Use the countrycitystatejson package to fetch the provinces belonging to a country
 * @param {Object} event - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 * @param {Object} event.body - HTTP request body
 * @param {Object} event.body.countryShortName - Country short name code (e.g. 'US' for United States, 'AR' for Argentina) - Discount code for which we need to look up the associated Price Rule
 * @param {Object} context - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 */
exports.handler = function (event, _context) {
  const { countryShortName } = JSON.parse(event.body)
  try {
    const provinces = countrycitystatejson.getStatesByShort(countryShortName)

    return {
      statusCode: 200,
      body: JSON.stringify(provinces),
      headers: { 'content-type': 'application/json' }
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: `Could not find states or provinces for country with name ${countryShortName} in countries database: ${err.message}`
    }
  }
}
