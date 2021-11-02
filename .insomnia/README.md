# The Storefront API - Customer Accounts GrapqlQL Learning Kit

To help you take advantage of all the possibilities offered by the Storefront API in GraphQL, we’ve put together this learning kit. It will guide you through making various calls to the Shopify GraphQL Storefront API, using the [The Insomnia API client](https://insomnia.rest/).

## 1. Prerequisites
In order to follow along with this walkthrough, you’ll need a few things:

- Your own [private app that you’ve created on your store](https://help.shopify.com/en/manual/apps/private-apps)
    - It will need unauthenticated_read and unauthenticated_write permissions to:
        - Read and modify customer details
- [The Insomnia API client](https://insomnia.rest/)

- [The Storefront API - Customer Accounts Insomnia collection][inco]

## 2. Import the collection
Once you’ve [downloaded the walkthrough as a collection][inco], you’ll need to import it into Insomnia.

- Open the **Import/Export** window in Insomnia.
- From the **Data** tab, browse to the collection.
- Switch to the **Storefront API - Customer Accounts** workspace.

## 3. Configure your environment variables
Environment variables are JSON key-value pairs that allow you to refer to values without having to write them out every time.

For our setup, we'll define two environment variables:

- The `**store**` we'll be interacting with
    - If your store is mydevstore.myshopify.com, enter “mydevstore” here
- The `**access_token**` we'll be using
    - This is your private app's Storefront access token, visible on that app’s page
- The `**version**` we'll be using
    - This is the api's version we need at least "2020-04"

These will enable you to re-use all the queries in this collection with different Shopify stores, just by changing your Insomnia environment variables.

You can set your environment variables by opening the **Manage Environments** window, and adding your details to the environment

## 4. Run queries and mutations
Now it’s time to put it to the test. Create a **customer** and use the **accessToken** to take different actions!



[inco]: https://github.com/getnacelle/nacelle-launch-tests/blob/master/nuxt-shopify-accounts/.insomnia/Insomnia_2020-02-20.json