const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors'); // Import cors
// const cors = require("cors");


const app = express();
app.use(cors({ origin: "*" })); // Allow all origins

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: 'http://localhost:3001', // Still needed for Socket.IO
    methods: ['GET', 'POST'],
  },
});

// Function to fetch and emit real-time stock data
async function streamStockData(socket, symbol) {
    try {
      const response = await axios.get(
        `YOUR_REAL_TIME_STOCK_API_ENDPOINT?symbol=${symbol}`
      );
      const price = response.data.price;
      const change = response.data.change; // Assuming your API returns a "change" field
      socket.emit('stockUpdate', { symbol, price, change });
    } catch (error) {
      console.error('Error fetching real-time stock data:', error);
    }
  }

io.on('connection', (socket) => {
  console.log('New client connected');

  let activeSymbols = {}; // Track symbols for each socket

  socket.on('getStockPrice', (symbol) => {
    if (!activeSymbols[symbol]) {
      activeSymbols[symbol] = setInterval(() => {
        streamStockData(socket, symbol);
      }, 1000); // Adjust interval as needed (e.g., 1 second)
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Clear intervals for disconnected socket
    for (const symbol in activeSymbols) {
      clearInterval(activeSymbols[symbol]);
    }
    activeSymbols = {};
  });
});


server.listen(5000, () => console.log("Server running on port 5000"));
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//       origin: 'http://localhost:3000',
//       methods: ['GET', 'POST'],
//     },
//   })

// const PORT = 3000;

// // Function to fetch and emit real-time stock data
// async function streamStockData(socket, symbol) {
//   try {
//     console.log(`Fetching stock data for: ${symbol}`); // Log symbol
//     const response = await axios.get(
//       `YOUR_REAL_TIME_STOCK_API_ENDPOINT?symbol=${symbol}`  // Replace with your API endpoint
//     );
//     console.log(response.data);  // Log the API response for debugging
//     const price = response.data.price; // Adjust based on actual API response structure
//     const change = response.data.change; // Adjust as necessary
//     socket.emit('stockUpdate', { symbol, price, change });
//   } catch (error) {
//     console.error('Error fetching real-time stock data:', error);
//   }
// }

// io.on('connection', (socket) => {
//   console.log('New client connected');

//   let activeSymbols = {}; // Track symbols for each socket

//   socket.on('getStockPrice', (symbol) => {
//     console.log(`Received getStockPrice request for: ${symbol}`); // Log received symbol
//     if (!activeSymbols[symbol]) {
//       activeSymbols[symbol] = setInterval(() => {
//         streamStockData(socket, symbol);
//       }, 1000); // Adjust interval as needed (e.g., 1 second)
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//     // Clear intervals for disconnected socket
//     for (const symbol in activeSymbols) {
//       clearInterval(activeSymbols[symbol]);
//     }
//     activeSymbols = {};
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });
