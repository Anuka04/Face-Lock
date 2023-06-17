import React, { Component } from "react";
import axios from "axios";

class PostPay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transaction: {},
    };
  }

  componentDidMount() {
    this.fetchTransactionData();
  }

  fetchTransactionData = () => {
    axios
      .get("http://localhost:5000/success-data")
      .then((response) => {
        this.setState({ transaction: response.data });
      })
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });
  };

  render() {
    const { transaction } = this.state;

    return (
      <div>
        <h1>PAYMENT SUCCESS YEAH</h1>
        <div>
          <h2>Transaction Details</h2>
          <p>Username: {transaction.username}</p>
          <p>Account: {transaction.account}</p>
          <p>Receiver Name: {transaction.reciever_name}</p>
          <p>Receiver Account Number: {transaction.recieveraccount_number}</p>
          <p>Amount: {transaction.amount}</p>
          <br />
          <br />
          <a href="/profile" rel="noopener noreferrer">
            <button>Back to Profile</button>
          </a>
        </div>
      </div>
    );
  }
}

export default PostPay;
