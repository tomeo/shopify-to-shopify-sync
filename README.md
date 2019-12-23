# Shopify to Shopify Sync
Syncs orders from a slave Shopify to a master Shopify. Currently supports:
* If a new order is created in slave it will be posted to master
* If an order is updated in slave it will be posted to master
* If an order is fulfilled and closed in master that fulfillment and close will get posted to slave

### Run locally
1. Rename `config.example.js` and replace the values/set env vars.
```
cp config.example.js config.js
```
2. Run `npm install`.
3. Run `node index.js`.

### Deploy as AWS Lambda
1. Create AWS account
2. Create SSM Parameter Store parameters (See SSM Parameter Store)
3. Edit `serverless.yml` to use your values
4. Run `sls deploy`

#### SSM Parameter Store
Make sure aws-cli is installed.

```
# Shopify master parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopify/apiurl" --value "{{YOUR SHOPIFY MASTER API URL}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopify/apikey" --value "{{YOUR SHOPIFY MASTER API KEY}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopify/password" --value "{{YOUR SHOPIFY MASTER PASSWORD KEY}}" --type "SecureString"

# Shopify slave parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopifyEU/apiurl" --value "{{YOUR SHOPIFY MASTER API URL}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopifyEU/apikey" --value "{{YOUR SHOPIFY MASTER API KEY}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/shopifyEU/password" --value "{{YOUR SHOPIFY MASTER PASSWORD KEY}}" --type "SecureString"

# Slack parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/slack/omswebhook" --value "{{YOUR SLACK WEBHOOK URL}}" --type "SecureString"
```