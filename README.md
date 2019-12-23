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
# CDON parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/cdon/adminurl" --value "https://admin.marketplace.cdon.com" --type "String"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/cdon/addressId" --value "{{YOUR CDON RETURN ADDRESSID}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/cdon/apikey" --value "{{YOUR CDON MARKETPLACE API KEY}}" --type "SecureString"

# Ongoing parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/apiurl" --value "{{YOUR ONGOING REST API URL}}" --type "String"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/goodsownerid" --value "{{YOUR GOODS OWNER ID}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/username" --value "{{YOUR ONGOING USERNAME}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/password" --value "{{YOUR ONGOING PASSWORD}}" --type "SecureString"
```