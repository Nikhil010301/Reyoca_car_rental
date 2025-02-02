const url = require('url');
const CartModel = require('../models/cartModel');

function cartApi(req, res) {
  try {
    //========================================== ADD TO CART =====================================================
    if (req.method === 'POST') {
      if (req.url === '/cart/add-to-cart') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const postBody = JSON.parse(body);

            CartModel.addToCart(postBody, (err, result) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              } else {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Added to cart successfully' }));
              }
            });
          } catch (error) {
            console.error('Error parsing request body:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
          }
        });
      }
    } else if (req.method === 'GET') {
      const chunks = [];
      let id;
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      if (req.method === 'GET') {
        req.on('end', () => {
          let requestData = {};
          try {
            const data = Buffer.concat(chunks);
            const stringData = data.toString();
            const parsedData = new URLSearchParams(stringData);
            for (var pair of parsedData.entries()) {
              requestData[pair[0]] = pair[1];
            }
            id = requestData['id'];
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid formatting of the request' }));
            return;
          }
          CartModel.view_cart(id, (err, result) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err }));
            } else if (typeof(result)=="string") {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: result }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });                 
              res.end(JSON.stringify(result));
            }
          });
        });
      } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    // Handle any uncaught exceptions gracefully
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}

module.exports = cartApi;
