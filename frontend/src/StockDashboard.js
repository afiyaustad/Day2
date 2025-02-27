import React, { Component } from 'react';
import io from 'socket.io-client';
import './StockDashboard.css';
// const response = await axios.get(`/stock/${stock}`);
import axios from "axios";

class StockDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockSymbol: '',
      stockPrice: null,
      priceChange: null,
      lastPrices: [],
      socket: null,
      theme: 'dark',
    };
  }
  

  componentDidMount() {
    this.setupSocket();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stockSymbol !== prevState.stockSymbol && this.state.stockSymbol !== '') {
      this.fetchStockPrice(this.state.stockSymbol);
    }
    if (this.state.socket && this.state.socket.connected) {
      this.state.socket.on('stockUpdate', (data) => {
        if (data && data.symbol === this.state.stockSymbol) {
          this.setState((prevState) => ({
            stockPrice: data.price,
            priceChange: data.change,
            lastPrices: [...prevState.lastPrices, data.price].slice(-4), // Keep last 4 prices
          }));
        }
      });
    }
  }

  componentWillUnmount() {
    if (this.state.socket) {
      this.state.socket.disconnect();
    }
  }

  setupSocket = () => {
    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      this.setState({ socket: socket });
    });
  };

  fetchStockPrice = (symbol) => {
    if (this.state.socket) {
      this.state.socket.emit('getStockPrice', symbol);
    }
  };

  handleInputChange = (event) => {
    this.setState({ stockSymbol: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.state.stockSymbol) {
      this.fetchStockPrice(this.state.stockSymbol);
    }
  };

  handleThemeChange = () => {
    this.setState((prevState) => ({
      theme: prevState.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  render() {
    const { stockSymbol, stockPrice, priceChange, lastPrices, theme } = this.state;
    const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';

    return (
      <div className={`stock-dashboard ${themeClass}`}>
        <button className="theme-toggle" onClick={this.handleThemeChange}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <h1 className="dashboard-title">📈 Stock Market Dashboard</h1>
        <form onSubmit={this.handleSubmit} className="stock-form">
          <input
            type="text"
            className="stock-input"
            placeholder="Enter Stock Symbol"
            value={stockSymbol}
            onChange={this.handleInputChange}
          />
          <button className="fetch-button" type="submit">
            Fetch
          </button>
        </form>
        {stockPrice !== null && (
          <div className="stock-info">
            <div className="stock-symbol">Stock: {stockSymbol}</div>
            <div className="stock-price">
              <span role="img" aria-label="price">
                📈
              </span>
              Price: ${stockPrice}
            </div>
            <div className={`stock-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
              <span role="img" aria-label="change">
                {priceChange >= 0 ? '💹' : '📉'}
              </span>
              Change: {priceChange}%
            </div>
          </div>
        )}
        {lastPrices.length > 0 && (
          <div className="last-prices">
            <div className="last-prices-title">Last Prices</div>
            <div className="last-prices-list">
              {lastPrices.map((price, index) => (
                <span key={index} className="last-price">
                  <span role="img" aria-label="coin">
                    💰
                  </span>
                  {price}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default StockDashboard;