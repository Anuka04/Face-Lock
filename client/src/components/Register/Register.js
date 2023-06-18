import React, { Component } from "react";
import { register } from "../UserFunctions";
import axios from "axios";
import "./Register.css";

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
      frame: null,
      frames: [],
    };
    this.videoRef = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = this.videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }

  startCapture = (e) => {
    e.preventDefault();
    const video = this.videoRef.current;
    if (video && !video.srcObject) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    }

    this.setState({ frame: null, capturing: true });

    this.captureInterval = setInterval(() => {
      const video = this.videoRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL("image/jpeg");
        this.setState((prevState) => ({
          frames: [...prevState.frames, dataURL],
        }));
      }
    }, 100); // Adjust the interval as needed
  };

  stopCapture = (e) => {
    e.preventDefault();
    clearInterval(this.captureInterval);
    this.setState({ capturing: false });

    // Send captured frames to the Flask backend for face recognition
    this.sendFramesToBackend();
  };
  sendFramesToBackend = async () => {
    const frame = this.state.frames[0];
    try {
      const response = await axios.post("http://localhost:5000/extract-faces", {
        frame: frame,
      });
      console.log(response.data); // Log the response data
      const { encodings, locations } = response.data;
      this.setState({
        encodings: encodings,
        locations: locations,
      });
    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };

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
      encodings: this.state.encodings,
      locations: this.state.locations,
    };

    register(newUser).then((res) => {
      this.props.history.push(`/login`);
    });

    const video = this.videoRef.current;
    if (video) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
  }

  render() {
    const { capturing, facialRecognitionEnabled } = this.state;
    return (
      <div className="container-reg">
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3_reg mb-3 font-weight-normal">Register</h1>

              <div className="form-group_reg">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control-reg"
                  name="username"
                  placeholder="Enter Username"
                  value={this.state.username}
                  onChange={this.onChange}
                />
              </div>

              <div className="form-group2_reg">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control-reg"
                  name="email"
                  placeholder="Enter Email"
                  value={this.state.email}
                  onChange={this.onChange}
                />
              </div>

              <div className="form-group3_reg">
                <label htmlFor="account">Account Number</label>
                <input
                  type="account"
                  className="form-control-reg"
                  name="account"
                  placeholder="Enter Account Number"
                  value={this.state.account}
                  onChange={this.onChange}
                />
              </div>

              <div className="form-group4_reg">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control-reg"
                  name="password"
                  placeholder="Enter Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
              </div>

              <div className="form-group5_reg form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="facialRecognitionEnabled"
                  checked={facialRecognitionEnabled}
                  onChange={this.onChange}
                />
                <label
                  className="form-check-label"
                  htmlFor="facialRecognitionEnabled"
                >
                  Facial Recognition Enabled
                </label>
              </div>

              {facialRecognitionEnabled && (
                <div>
                  <div className="form-group5_reg">
                    <label htmlFor="threshold">Threshold</label>
                    <input
                      type="number"
                      className="form-control-reg"
                      name="threshold"
                      placeholder="Enter Threshold"
                      value={this.state.threshold}
                      onChange={this.onChange}
                    />
                    <p>
                      *This threshold is the value below which facial
                      recognition will not be used
                    </p>
                  </div>

                  {!capturing ? (
                    <button className="capture" onClick={this.startCapture}>Start Capture</button>
                  ) : (
                    <button className="capture" onClick={this.stopCapture}>Stop Capture</button>
                  )}

                  <video ref={this.videoRef} autoPlay muted />
                </div>
              )}

              <button
                type="submit"
                className="btn_reg "
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
