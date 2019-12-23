const run = require('./sync');
const {
  DESCRIPTION,
  SHOPIFY_MASTER_APIURL,
  SHOPIFY_MASTER_APIKEY,
  SHOPIFY_MASTER_PASSWORD,
  SHOPIFY_SLAVE_APIURL,
  SHOPIFY_SLAVE_APIKEY,
  SHOPIFY_SLAVE_PASSWORD,
  SHOPIFY_SLAVE_LOCATION_ID,
  SLACK_WEBHOOK,
} = require('./config');

const master = {
  url: SHOPIFY_MASTER_APIURL,
  apiKey: SHOPIFY_MASTER_APIKEY,
  password: SHOPIFY_MASTER_PASSWORD,
};
const slave = {
  url: SHOPIFY_SLAVE_APIURL,
  apiKey: SHOPIFY_SLAVE_APIKEY,
  password: SHOPIFY_SLAVE_PASSWORD,
  locationId: SHOPIFY_SLAVE_LOCATION_ID,
};
const slackSettings = {
  url: SLACK_WEBHOOK,
};

run(DESCRIPTION, master, slave, slackSettings);
