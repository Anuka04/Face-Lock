import React, { Component } from "react";
import { login } from "../UserFunctions";
import "./Login.css";
class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password,
    };

    login(user).then((res) => {
      if (!res || !res.error) {
        this.props.history.push(`/profile`);
      }
    });
  }

  render() {
    return (
      <body>
      <div className="container-login">
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3-login ">Login</h1>
              <div className="form-group1">
                <label htmlFor="username">Username</label>
                <input
                  type="username"
                  className="form-control-login"
                  name="username"
                  placeholder="Enter Username"
                  value={this.state.username}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group2">
                <label htmlFor="password">Password </label>
                <input
                  type="password"
                  className="form-control-login"
                  name="password"
                  placeholder="Enter Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
              </div>

              <button
                type="submit"
                className="btn-login btn-lg btn-primary btn-block"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
      </body>
    );
  }
}

export default Login;
