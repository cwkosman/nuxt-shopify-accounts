const countrycitystatejson = require('countrycitystatejson')

/**
 * Use the countrycitystatejson package to fetch the provinces belonging to a country
 * @param {Object} event - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 * @param {Object} context - https://docs.netlify.com/functions/build-with-javascript/#synchronous-function-format
 */
exports.handler = function (_event, _context) {
  try {
    const countries = countrycitystatejson.getCountries()

    return {
      statusCode: 200,
      body: JSON.stringify(countries),
      headers: { 'content-type': 'application/json' }
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: `Could not find get countries from countries database: ${err.message}`
    }
  }
}
