import React, { Component } from "react";
import jwt_decode from "jwt-decode";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      threshold: "",
    };
    this.onTransactionClick = this.onTransactionClick.bind(this);
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    console.log(decoded);
    this.setState({
      username: decoded.sub.username,
    });
  }

  onTransactionClick() {
    this.props.history.push(`/transaction`);
  }

  render() {
    return (
      <div className="container">
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">PROFILE</h1>
          </div>
          <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td>Username</td>
                <td>{this.state.username}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn btn-lg btn-primary btn-block"
          onClick={this.onTransactionClick}
        >
          Make a Transaction
        </button>
      </div>
    );
  }
}

export default Profile;
