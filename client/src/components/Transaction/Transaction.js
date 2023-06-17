import React, { Component } from "react";
import axios from "axios";
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
      faceRec: false,
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

    axios
      .post("txn/transaction", txn)
      .then((response) => {
        console.log(response.data);
        if (response.data.facever) {
          // Handle face recognition verification
          console.log(response.data.facever);
          this.props.history.push({
            pathname: "/verify",
            state: { facever: response.data.facever },
          });
          // Redirect to face verification page or show appropriate message
        } else {
          console.log("New transaction");
          this.props.history.push(`/verify`);
        }
      })
      .catch((error) => {
        console.log(error);
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
              <p>
                You will recive an OTP on your registered email for
                authentication
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Transaction;
