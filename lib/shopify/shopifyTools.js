const ordersAreEqual = (a, b) => {
  [a, b] = [a, b].map(o => ({
    closed_at: o.closed_at,
    line_items: o.line_items
      .filter(l => l.fulfillable_quantity > 0)
      .map(l => ({
        sku: l.sku,
        quantity: l.quantity,
        price: l.price,
      })),
    shipping_address: {
      first_name: o.shipping_address.first_name,
      last_name: o.shipping_address.last_name,
      name: o.shipping_address.name,
      address1: o.shipping_address.address1,
      address2: o.shipping_address.address2,
      company: o.shipping_address.company,
      city: o.shipping_address.city,
      zip: o.shipping_address.zip,
      province: o.shipping_address.province,
      province_code: o.shipping_address.province_code,
      country: o.shipping_address.country,
      country_code: o.shipping_address.country_code,
    },
  }));
  return JSON.stringify(a) === JSON.stringify(b);
};

module.exports = {
  ordersAreEqual,
};
