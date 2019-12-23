const axios = require('axios');

const product_fields = ['variants'];

const order_fields = [
  'id',
  'created_at',
  'closed_at',
  'name',
  'currency',
  'customer',
  'line_items',
  'shipping_address',
  'billing_address',
  'shipping_lines',
  'fulfillments',
];

module.exports = config => {
  const axiosConfig = {
    auth: {
      username: config.apiKey,
      password: config.password,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const get = path => axios.get(`${config.url}${path}`, axiosConfig);
  const post = (path, data) =>
    axios.post(`${config.url}${path}`, data, axiosConfig);
  const put = (path, data) =>
    axios.put(`${config.url}${path}`, data, axiosConfig);
  const del = path =>
    axios.delete(`${config.url}${path}`, axiosConfig);

  const cursor = (path, selector, items = []) => {
    return axios.get(path, axiosConfig).then(({ data, headers }) => {
      items = [...items, ...selector(data)];
      const matches =
        headers.link && headers.link.match('<([^>]*)>; rel="next"');
      const next = matches && matches.length >= 1 ? matches[1] : null;
      return next ? cursor(next, selector, items) : items;
    });
  };

  return {
    products: () =>
      cursor(
        `${
          config.url
        }/products.json?limit=250&fields=${product_fields.join(',')}`,
        r => r.products,
      ),
    orders: (status, createdAtMin = '') => {
      createdAtMin = createdAtMin
        ? `&created_at_min=${createdAtMin}`
        : '';
      return cursor(
        `${
          config.url
        }/orders.json?limit=250&status=${status}${createdAtMin}&fields=${order_fields.join(
          ',',
        )}`,
        r => r.orders,
      );
    },
    createOrder: order =>
      post('/orders.json', {
        order,
        inventory_behaviour: 'decrement_ignoring_policy',
        send_receipt: false,
      }),
    updateOrder: order => put(`/orders/${order.id}.json`, order),
    fulfillOrder: (id, fulfillment) =>
      post(`/orders/${id}/fulfillments.json`, {
        fulfillment,
      }).catch(e => console.log(e.response.data)),
    closeOrder: id =>
      post(`/orders/${id}/close.json`).catch(e =>
        console.log(e.response.data),
      ),
    deleteOrder: id => del(`/orders/${id}.json`),
  };
};
