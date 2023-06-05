import React, { Component } from "react";
import { register } from "./UserFunctions";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      email: "",
      account: "",
      password: "",
      facialRecognitionEnabled: false,
      threshold: 0,
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    if (e.target.name === "facialRecognitionEnabled") {
      this.setState({
        facialRecognitionEnabled: e.target.checked,
        threshold: e.target.checked ? this.state.threshold : 0,
      });
    } else if (e.target.name === "threshold") {
      this.setState({ threshold: e.target.value });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const newUser = {
      username: this.state.username,
      account: this.state.account,
      password: this.state.password,
      email: this.state.email,
      facialRecognitionEnabled: this.state.facialRecognitionEnabled,
      threshold: this.state.threshold,
    };

    register(newUser).then((res) => {
      this.props.history.push(`/login`);
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Register</h1>
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter Email"
                  value={this.state.email}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="account">Account Number</label>
                <input
                  type="account"
                  className="form-control"
                  name="account"
                  placeholder="Enter Account Number"
                  value={this.state.account}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Enter Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="facialRecognitionEnabled"
                  checked={this.state.facialRecognitionEnabled}
                  onChange={this.onChange}
                />
                <label
                  className="form-check-label"
                  htmlFor="facialRecognitionEnabled"
                >
                  Facial Recognition Enabled
                </label>
              </div>
              {this.state.facialRecognitionEnabled && (
                <div className="form-group">
                  <label htmlFor="threshold">Threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    name="threshold"
                    placeholder="Enter Threshold"
                    value={this.state.threshold}
                    onChange={this.onChange}
                  />
                  <p>
                    *This threshold is the value below which facial recognition
                    will not be used
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
