'use strict';

const AWS = require('aws-sdk');
const sync = require('./sync');

const SHOPIFY = {
  APIURL: `/${process.env.ACCOUNT}/shopify/apiurl`,
  API_KEY: `/${process.env.ACCOUNT}/shopify/apikey`,
  PASSWORD: `/${process.env.ACCOUNT}/shopify/password`,
};

const SHOPIFY_EU = {
  APIURL: `/${process.env.ACCOUNT}/shopifyEU/apiurl`,
  API_KEY: `/${process.env.ACCOUNT}/shopifyEU/apikey`,
  PASSWORD: `/${process.env.ACCOUNT}/shopifyEU/password`,
};

const SLACK = {
  WEBHOOK: `/${process.env.ACCOUNT}/slack/omswebhook`,
};

const DESCRIPTION = process.env.DESCRIPTION;

const ssm = new AWS.SSM();
const keyPromise = ssm
  .getParameters({
    Names: [
      SHOPIFY.APIURL,
      SHOPIFY.API_KEY,
      SHOPIFY.PASSWORD,
      SHOPIFY_EU.APIURL,
      SHOPIFY_EU.API_KEY,
      SHOPIFY_EU.PASSWORD,
      SLACK.WEBHOOK,
    ],
    WithDecryption: true,
  })
  .promise();

exports.handler = async event => {
  const result = await keyPromise;

  const master = {
    url: result.Parameters.find(p => p.Name === SHOPIFY.APIURL).Value,
    apiKey: result.Parameters.find(p => p.Name === SHOPIFY.API_KEY)
      .Value,
    apiKey: result.Parameters.find(p => p.Name === SHOPIFY.PASSWORD)
      .Value,
  };

  const slave = {
    url: result.Parameters.find(p => p.Name === SHOPIFY_EU.APIURL)
      .Value,
    apiKey: result.Parameters.find(p => p.Name === SHOPIFY_EU.API_KEY)
      .Value,
    apiKey: result.Parameters.find(
      p => p.Name === SHOPIFY_EU.PASSWORD,
    ).Value,
  };

  const slack = {
    url: result.Parameters.find(p => p.Name === SLACK.WEBHOOK).Value,
  };

  return sync(DESCRIPTION, master, slave, slack);
};
