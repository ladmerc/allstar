## Testing
The endpoints for testing are below:
```
  GET(getCustomer) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/customers/{id} ()
  POST(createSubscription) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/subscriptions
  DELETE(deleteSubscription) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/subscriptions/{id}
  POST(createWebhook) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/webhooks
  POST(processWebhook) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/secret-webhook
  POST(updateSubscriptionStatus) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/user
  GET(getUserLogs) - https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev/user/{id}/logs
```

The `createSubscription` requires an `email` in the request body.
The `updateSubscriptionStatus` requires the `subscriptionId` in the request body.
For `getUserLogs` endpoint, the id can be either an email, subscriptionId, or valid objectId

The react frontend is in the `App.js` file.


## Deploying

- Run `npm i` in the root of the project. This project has been tested on node>12.x
- Create a `.env.yml` file in the root of your project with the corresponding values below:
```
    PRICE_ID_SUB: xxxx
    STRIPE_KEY: xxx
    DB_URL: xxx
    STRIPE_WEBHOOK_SECRET: hello
    STRIPE_WEBHOOK_PATH: secret_webhook
```
- Run `sls deploy`