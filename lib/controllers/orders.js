const { Router } = require('express');
const Order = require('../models/Order');
const pool = require('../utils/pool');

module.exports = Router()
  .post('/', async (req, res) => {

    const order = await Order.insert(req.body);

    res.json(order);
  })

  .get('/:id', async (req, res) => {
    console.log(req.params);
    const order = await Order.getById(req.params.id);
    res.json(order);
  })

  .get('/', async (req, res) => {
    const orders = await Order.getAll();

    res.json(orders);
  })

  .patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Order.getById(id);

      const existingOrder = result;

      if (!existingOrder) {
        const error = new Error(`Order ${id} not found`);
        error.status = 404;
        throw error;
      }

      const product = req.body.product ?? existingOrder.product;
      const quantity = req.body.quantity ?? existingOrder.quantity;

      const order = await Order.updateById(id, product, quantity);

      res.json(order);
    } catch (error) {
      next(error);
    }
  })

  .delete('/:id', async (req, res) => {
    const { rows } = await pool.query(
      'DELETE FROM orders WHERE id=$1 RETURNING *;',
      [req.params.id]
    );

    if (!rows[0]) return null;
    const order = new Order(rows[0]);

    res.json(order);
  });
