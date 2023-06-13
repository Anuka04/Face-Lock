import React, { Component } from "react";
import { transaction } from "./TransactionFunctions";
import { getUserDetails } from "./TransactionFunctions";
import jwt_decode from "jwt-decode";

class Transaction extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      account: "",
      reciever_name: "",
      recieveraccount_number: "",
      amount: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    if (token) {
      const decoded = jwt_decode(token);
      console.log(decoded);
      this.setState({
        username: decoded.sub.username,
        account: decoded.sub.account,
      });
    } else {
      this.props.history.push("/transaction");
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const txn = {
      username: this.state.username,
      account: this.state.account,
      reciever_name: this.state.reciever_name,
      recieveraccount_number: this.state.recieveraccount_number,
      amount: this.state.amount,
    };

    transaction(txn).then((res) => {
      this.props.history.push(`/verify`);
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">
                Transaction Details
              </h1>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter Username"
                  value={this.state.username}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="account">Account Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="account"
                  placeholder="Enter Account Number"
                  // value={this.state.account}
                  defaultValue={this.state.account}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="receiver">Receiver</label>
                <input
                  type="text"
                  className="form-control"
                  name="reciever_name"
                  placeholder="Enter Receiver Username"
                  value={this.state.reciever_name}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="receiver_accnt">Receiver Account</label>
                <input
                  type="number"
                  className="form-control"
                  name="recieveraccount_number"
                  placeholder="Enter Receiver Account"
                  value={this.state.recieveraccount_number}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="amount"
                  placeholder="Enter Amount"
                  value={this.state.amount}
                  onChange={this.onChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Proceed to authentication
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Transaction;
