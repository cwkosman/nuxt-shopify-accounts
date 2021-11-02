# Accounts

Utilizing Shopify Storefront API and Multipass

---

## Summary

We want a simple solution to handling customer accounts that doesn't involve maintaining code in Shopify's Theme. This example should give us all of the basic account functionality that we need.

If you want to have a better understanding of the queries and mutations that we are utlizing, check out the `.insomnia` directory and play around with the api directly. You'll just need to download [The Insomnia API client](https://insomnia.rest/) and [downloaded the walkthrough as a collection][inco]

## Account Page Actions

**example structure:**

```tree
├── Page
│   └── resource
│       └── ACTION
```

```tree
├── Account Page
│   ├── customer                        # requires customerAccessToken
│   │   ├── READ
│   │   └── UPDATE
│   ├── orders                          # requires customerAccessToken
│   │   └── READ
│   └── addresses                       # requires customerAccessToken
│       ├── READ
│       ├── UPDATE
│       ├── CREATE
│       └── DELETE
├── Login Page
│   └── customerAccessToken
│       └── CREATE                      # create customerAccessToken w/ email and password
├── Register Page
│   └── customer
│       └── CREATE                      # create customer account w/ email and password
├── Recover Password Page
│   └── resetToken
│       └── CREATE                      # sends password recovery email to customer
└── Reset Password Page
    └── customer
        └── UPDATE                      # updates customer password with resetToken from recovery email
```

## Prerequisites

- Must be on the [Shopify Plus](https://www.shopify.com/plus/enterprise-ecommerce) plan and have [Multipass](https://help.shopify.com/en/api/reference/plus/multipass) enabled.
- You'll need your store's:
  - Storefront API token
  - Multipass secret

## Setup

1. add a few items to our `.env` file:

```sh
SHOPIFY_MULTIPASS_SECRET="15b40af008bfad7b5dfbf36c389abf70"
MYSHOPIFY_DOMAIN="nacelle-accounts.myshopify.com"
SHOPIFY_STOREFRONT_ACCESS_TOKEN="789bfb8d1376a93439b27953b60ac357"
SHOPIFY_CUSTOM_DOMAIN="nacelle.commercejam.com"
```

2. We'll need to expose these to various parts of our application through our `nuxt.config.js`:

Note that `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is your store's Storefront API Token.

```js
{
   env: {
    // ...other environment variables,
    myshopifyDomain: process.env.MYSHOPIFY_DOMAIN,
    shopifyToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
  nacelle: {
    // ...other Nacelle config,
    customEndpoint: process.env.NACELLE_CUSTOM_ENDPOINT,
    myshopifyDomain: process.env.MYSHOPIFY_DOMAIN,
    shopifyCustomDomain: process.env.SHOPIFY_CUSTOM_DOMAIN,
    shopifyToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  }
}
```

3. The following three dependencies need to be installed:

- `npm install cookie-universal-nuxt`

For more information about these dependencies, check out their repositories:

- [cookie-universal-nuxt](https://github.com/microcipcip/cookie-universal/tree/master/packages/cookie-universal-nuxt)

4. Cookie Universal Nuxt requires an update to `nuxt.config.json`. Add to modules array.

```js
{
  modules: [
    ...,
    'cookie-universal-nuxt',
  ]
}
```

5. Plugins

We'll need to add `authOnLoad.js` plugin to `nuxt.config.js:

```js
plugins: [
  { src: '~/plugins/authOnLoad.js', ssr: false }
],
```

## Serverless Functions

To use Multipass and the address form for account pages this project relies on two packages:

- [multipassify](https://github.com/beaucoo/multipassify)
- [countrycitystatejson](https://github.com/khkwan0/countryCityStateJson)

Both of these packages are _large_ and can add a lot to your client bundle, so using them only in serverless functions keeps the client a little more lightweight. But if you want another reason, it also keeps your Multipass secret outside of client code.

This project includes two different folders for serverless functions:

- Vercel in [api/\*](./api)
- Netlify [functions/\*](./functions)

Those folder names are useful conventions for using serverless with these different platforms. Both of those folders use shared code in ./accounts related to making use of account data.

Specify your serverless endpoint in your .env, for example:

```bash
SERVERLESS_ENDPOINT='/api'
```

ℹ️ NOTE: For a Netlify configuration, it's convenient to use a [netlify.toml](./netlify.toml) to redirect the requests to the `/functions` to point to `/api`.

When testing your serverless functions locally make sure to use the respective platform's CLI ([Vercel CLI](https://vercel.com/docs/cli), [Netlify CLI](https://github.com/netlify/cli)). NPM scripts for running the project with these CLI's are provided in the `package.json`.

### 🚧 **Known Issues** 🚧

- The Netlify CLI can be a bit buggy sometimes, especially when hotreloading. Sometimes the sockets hangup during the proxying process. It can cause the nuxt project to run on port 3000 in the background.
  - This is only an issue during development.
  - To clean this up run:
    - `sudo lsof -i :3000` find the PID that is running (ie. 12583)
    - `kill -9 12583` this will stop the process from running.

## Other Code Additions

| Dir                                          | Description                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| [components/account/\*][dirac]               | Account components                                                        |
| [gql/\*][dirgql]                             | exports GraphQl queries and related utility functions.                    |
| [middleware/\*][dirmid]                      | SPA style route guards. Included on certain pages                         |
| [pages/account/\*][dirpg]                    | Account Page Templates                                                    |
| [plugins/authOnLoad.js][dirplu]              | Router on ready plugin for auth middleware                                |
| [static/account-head.js][dirah]              | On page load guard clause for better UX                                   |
| [static/email-referrer-head-check.js][dirrh] | On page load guard clause for better UX when being redirected from emails |
| [store/account.js][dirst]                    | Account related Actions and Mutations                                     |

## File Modifications

| File                                            | Description                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| [components/CartFlyoutCheckoutButton.vue][ficc] | intercept checkout url and modify with custom domain                |
| [layouts/default.vue][fild]                     | add read token action to mounted hook                               |
| [nuxt.config.js][finc]                          | add nuxt-universal-cookie module and environment variable additions |

## Shopify Email Notifications

1. Password Recovery and Reset

   - During the password recovery flow, an email is sent to the customer with a link to the reset their password. We'll want to make sure to edit this link to point towards our app instead of the Shopify hosted domain.
   - We are using using query parameters vs url parameters since we are using static site generation and can't handle dynamic routes.
   - The url path will appear like:

     - `/account/reset?id=2864558604347&token=a000add20a69bb53954976edd74870a4-1581119357`

     versus:

     - `/account/reset/2864558604347/a000add20a69bb53954976edd74870a4-1581119357`

```liquid
{% comment %}
  Edit Customer Account Reset (/admin/email_templates/customer_account_reset/edit)
  ----
  Old tag:
  <a href="{{ customer.reset_password_url }}" class="button__text">Reset your password</a>
{% endcomment %}
{% assign url_parts = customer.reset_password_url  | split: '/' %}
<a href="http://domain.com/account/activate?id={{url_parts[5]}}&token={{url_parts[6]}}" class="button__text">Reset your password</a>
```

1. Account Activate

   - The merchant can send an account activation email with a link to the storefront to create a password and activate their account. We'll want to make sure to edit this link to point towards our app instead of the Shopify hosted domain.
   - We are using using query parameters vs url parameters since we are using static site generation and can't handle dynamic routes.
   - The url path will appear like:

     - `/account/activate?id=2864558604347&token=a000add20a69bb53954976edd74870a4-1581119357`

     versus:

     - `/account/activate/2864558604347/a000add20a69bb53954976edd74870a4-1581119357`

```liquid
{% comment %}
  Edit Customer Account Invite (/admin/email_templates/customer_account_activate/edit)
  ----
  Old tag:
  <a href="{{ customer.account_activation_url }}" class="button__text">Activate Account</a>
{% endcomment %}
{% assign url_parts = customer.account_activation_url  | split: '/' %}
<a href="http://domain.com/account/activate?id={{url_parts[5]}}&token={{url_parts[6]}}" class="button__text">Activate Account</a>
```

## Social Login

If you want to add OAuth-style social login you will also need some additional pieces.
However, if you don't need social login for your store, then the pieces mentioned below can be removed.

We will need a backend service to handle some of these actions -- again here is where serverless saves the day.

One serverless function will be served:

- `auth.js`

Five routes will be exposed:

- `auth/google`
- `auth/google/callback`
- `auth/facebook`
- `auth/facebook/callback`
- `auth/status`

This are provided in the `accounts` directory.

```tree
accounts
├── app
│   ├── app.js                     # exports instance of App class which is an express app
│   └── routes.js                  # declares and exports routes that will accessible to frontend.
├── controllers
│   └── auth.controller.js         # a set of functions that handles payloads, state, callbacks, etc.
├── utils
│   ├── logger.js                  # a custom logger
│   ├── passport.js                # handles our auth strategies
│   └── secrets.js                 # A secrets store that exposes environment variables to our app
└── auth.js                        # Root level files represent lambdas and export a handler function
```

### Add a few new items to our `.env` file

```sh
BASE_URL="http://localhost:8888"
NACELLE_PASSPORT_SECRET="makeitso"
FACEBOOK_APP_ID="123423453456"
FACEBOOK_APP_SECRET="123423453456"
GOOGLE_CLIENT_ID="123423453456.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="123423453456"
```

## Social App Setup

1. In order to use Facebook authentication with `passport-facebook`, you must first create an app at [Facebook Developers](https://developers.facebook.com/). When created, an app is assigned an App ID and App Secret. Your application must also implement a redirect URL, to which Facebook will redirect users after they have approved access for your application. (ie. `https://<your-domain>/api/auth/facebook/callback`)

   - Note facebook assumes to whitelist a localhost callback, so explicitly adding one is not necessary while the app status is set to "In Development"

2. Before using `passport-google-oauth20`, you must register an application with Google. If you have not already done so, a new project can be created in the [Google Developers Console](https://console.developers.google.com/). Your application will be issued a client ID and client secret, which need to be provided to the strategy. You will also need to configure a redirect URI which matches the route in your application. (ie. `https://<your-domain>/api/auth/google/callback` )
   - Note google will require a callback for development and production (ie. `http://localhost:8888/.netlify/functions/auth/google/callback`)

[dirgql]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/gql
[dirmid]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/middleware
[dirplu]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/plugins/authOnLoad.js
[dirpg]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/pages/account
[dirst]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/store/account.js
[dirah]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/static/account-head.js
[dirrh]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/static/email-referrer-head-check.js
[dirac]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/components/account
[fild]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/layouts/default.vue
[ficc]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/components/CartFlyoutCheckoutButton.vue
[finc]: https://github.com/getnacelle/nacelle-launch-tests/tree/master/nuxt-shopify-accounts/nuxt.config.js
[fisi]: https://github.com/getnacelle/nacelle-launch-tests/blob/master/nuxt-shopify-accounts/store/index.js
[inco]: https://github.com/getnacelle/nacelle-launch-tests/blob/master/nuxt-shopify-accounts/.insomnia/Insomnia_2020-02-20.json
