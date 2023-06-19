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
      capturing: false,
      previewFrame: null,
    };
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  startCapture = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = this.videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    });
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

    this.setState({ capturing: true, previewFrame: null });
  };

  stopCapture = async (e) => {
    e.preventDefault();
    const video = this.videoRef.current;
    const stream = video && video.srcObject; // Check if video is defined before accessing srcObject
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }

    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frameDataUrl = canvas.toDataURL("image/jpeg");

    await this.setState({ capturing: false, frame: frameDataUrl }); // Await the state update

    console.log("FRAME:", this.state.frame);
    this.sendFrameToBackend();
  };

  sendFrameToBackend = async () => {
    const frameToSend = this.state.frame;
    console.log(frameToSend);
    try {
      const response = await axios.post("http://localhost:5000/extract-faces", {
        frame: frameToSend,
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
    const {
      username,
      account,
      password,
      email,
      facialRecognitionEnabled,
      threshold,
      encodings,
      locations,
    } = this.state;

    let newUser = {
      username: username,
      account: account,
      password: password,
      email: email,
      facialRecognitionEnabled: facialRecognitionEnabled,
      threshold: threshold,
    };
    if (encodings && locations) {
      newUser = {
        ...newUser,
        encodings: encodings,
        locations: locations,
      };
    } else {
      newUser = {
        ...newUser,
        encodings: null,
        locations: null,
      };
    }
    register(newUser).then((res) => {
      this.props.history.push(`/login`);
    });
  }

  render() {
    const {
      capturing,
      facialRecognitionEnabled,
      frame,
      previewFrame,
    } = this.state;

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
                    <button className="capture" onClick={this.startCapture}>
                      Start Camera
                    </button>
                  ) : (
                    <>
                      <button className="capture" onClick={this.stopCapture}>
                        Take Picture
                      </button>
                      <video ref={this.videoRef} autoPlay muted />
                    </>
                  )}

                  {previewFrame && (
                    <div>
                      <p>Make sure your face is clearly visible in the frame</p>
                      <h3>Preview:</h3>
                      <img src={previewFrame} alt="Preview" />
                    </div>
                  )}

                  <canvas
                    ref={this.canvasRef}
                    style={{ display: "none" }}
                  ></canvas>
                </div>
              )}

              {frame && <div>Your facial data has been extracted</div>}
              <br />
              <button type="submit" className="btn_reg ">
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
