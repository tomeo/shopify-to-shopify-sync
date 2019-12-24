const min = require('date-fns/min');
const formatISO = require('date-fns/formatISO');
const addHours = require('date-fns/addHours');
const createShopifyClient = require('./lib/shopify/shopifyClient');
const { ordersAreEqual } = require('./lib/shopify/shopifyTools');
const createLogClient = require('./lib/slackClient');
const { toMap, flatten } = require('./lib/helpers');

const createProductMap = products =>
  toMap(
    flatten(products.map(p => p.variants)).map(v => ({
      sku: v.sku,
      variant_id: v.id,
      product_id: v.product_id,
    })),
    v => v.sku,
  );

const adjustOrderProperties = (order, productMap) => ({
  ...order,
  buyer_accepts_marketing: false,
  line_items: order.line_items
    // Shopify doesn't allow to set fulfillable_quantity
    // so we need to remove any cancelled lines
    .filter(l => l.fulfillable_quantity > 0)
    .map(l => ({
      title: l.title,
      quantity: l.quantity,
      variant_inventory_management: l.variant_inventory_management,
      taxable: l.taxable,
      price: l.price,
      sku: l.sku,
      product_id: productMap[l.sku].product_id,
      variant_id: productMap[l.sku].variant_id,
    })),
});

const run = async (
  description,
  masterSettings,
  slaveSettings,
  slackSettings,
) => {
  const logger = createLogClient(slackSettings);
  const master = createShopifyClient(masterSettings);
  const slave = createShopifyClient(slaveSettings);

  logger.log(description);

  let slaveOrders = await slave.orders('open');
  if (!slaveOrders.length) {
    logger.log('No pending orders to sync');
    await logger.print();
    return;
  }

  const createdAtMin = addHours(
    min(slaveOrders.map(so => new Date(so.created_at))),
    -1,
  );
  const masterOrders = toMap(
    await master.orders('any', formatISO(createdAtMin)),
    order => order.name,
  );

  if (
    slaveOrders.every(
      so =>
        so.name in masterOrders &&
        ordersAreEqual(so, masterOrders[so.name]),
    )
  ) {
    logger.log('Everything already synced');
    await logger.print();
    return;
  }

  logger.log(`Found ${slaveOrders.length} pending orders`);

  const productMap = createProductMap(await master.products());

  // New orders to sync
  await Promise.all(
    slaveOrders
      .filter(order => !(order.name in masterOrders))
      .map(order => adjustOrderProperties(order, productMap))
      .map(order => {
        logger.log(`Adding ${order.name}`);
        return master.createOrder(order);
      }),
  );

  // Update order changes
  await Promise.all(
    slaveOrders
      .filter(
        order =>
          order.name in masterOrders &&
          !ordersAreEqual(order, masterOrders[order.name]) &&
          masterOrders[order.name].closed_at === null,
      )
      .map(order => {
        logger.log(
          `${order.name} has been updated in slave but not in master`,
        );
        // Shopify doesn't support line_item order updates so we must delete and recreate order in master
        return master
          .deleteOrder(masterOrders[order.name].id)
          .then(_response => {
            logger.log(`Deleted order ${order.name}`);
            master
              .createOrder(adjustOrderProperties(order, productMap))
              .then(
                logger.log(
                  `Created new version of order ${order.name}`,
                ),
              );
          });
      }),
  );

  // Fulfill orders
  const closedOrders = slaveOrders.filter(
    order =>
      order.name in masterOrders &&
      masterOrders[order.name].closed_at !== null,
  );
  await Promise.all(
    flatten(
      closedOrders.map(order => {
        logger.log(`Fulfilling ${order.name}`);
        return masterOrders[order.name].fulfillments.map(f =>
          slave.fulfillOrder(order.id, {
            order_id: order.id,
            location_id: slaveSettings.locationId,
            created_at: f.created_at,
            tracking_company: f.tracking_company,
            tracking_number: f.tracking_number,
            tracking_url: f.tracking_url,
          }),
        );
      }),
    ),
  );

  // Close orders
  await Promise.all(
    closedOrders.map(order => {
      logger.log(`Closing order ${order.name}`);
      return slave.closeOrder(order.id);
    }),
  );

  await logger.print();
};

module.exports = run;
