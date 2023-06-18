import React, { Component } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import "./Profile.css";
class Profile extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      threshold: "",
      account: "",
    };
    this.onTransactionClick = this.onTransactionClick.bind(this);
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    const username = decoded.sub.username;
    const account = decoded.sub.account;
    this.setState({
      username: decoded.sub.username,
      account: decoded.sub.account,
    });

    axios
      .post("http://localhost:5000/profiledata", { username: username })
      .then((response) => {
        console.log(response);
        const { threshold } = response.data;
        this.setState({
          threshold: threshold,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  onTransactionClick() {
    this.props.history.push(`/transaction`);
  }

  render() {
    return (
      <div className="container-prof">
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center-prof">PROFILE</h1>
          </div>
          <div className="img-prof"></div>
          <table className="table-prof col-md-6 mx-auto">
            <tbody>
              <tr>
                <td className="left">Username</td>
                <td>{this.state.username}</td>
              </tr>
              <tr>
                <td className="left">Account</td>
                <td>{this.state.account}</td>
              </tr>
              {this.state.threshold > 0 && (
                <tr>
                  <td className="left">Threshold</td>
                  <td>{this.state.threshold}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn-prof btn-lg btn-primary btn-block"
          onClick={this.onTransactionClick}
        >
          Make a Transaction
        </button>
      </div>
    );
  }
}

export default Profile;
