import React, { Component } from "react";
import axios from "axios";
import "./PostPay.css";

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
      <div className="container-pay">
        <div className="success-img"></div>
        <h1 className="h1-pay">Payment Successful</h1>
        <div className="lower">
          <h2 className="h2-pay">Transaction Details</h2>
          <table className="table-pay">
            <tr>
              <td>Username:</td>
              <td>{transaction.username}</td>
            </tr>
            <tr>
              <td>Account:</td>
              <td className="two">{transaction.account}</td>
            </tr>
            <tr>
              <td>Receiver Name:</td>
              <td className="two">{transaction.reciever_name}</td>
            </tr>
            <tr>
              <td>Receiver Account Number:</td>
              <td className="two">{transaction.recieveraccount_number}</td>
            </tr>
            <tr>
              <td>Amount:</td>
              <td className="two">{transaction.amount}</td>
            </tr>
          </table>
          <br />
          <br />
          <a href="/profile" rel="noopener noreferrer">
            <button className="btn-pay">Back to Profile</button>
          </a>
        </div>
      </div>
    );
  }
}

export default PostPay;
