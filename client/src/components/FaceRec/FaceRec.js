import React, { Component } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

class FaceRec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      capturing: false,
      frames: [],
      result: "",
    };
    this.videoRef = React.createRef();
    this.captureInterval = null;
    this.startCapture = this.startCapture.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
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

  sendFramesToBackend = async () => {
    try {
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      const username = decoded.sub.username;
      const response = await axios.post("http://localhost:5001/facerec_data", {
        frames: this.state.frames,
        username: username,
      });
      this.setState({
        username: username,
      });
      // Handle the response from the Flask backend
      console.log(response.data); // Log the response data
      const { prediction, predictionliveness, probability } = response.data;
      this.setState({
        result: prediction.result,
        predictionliveness: predictionliveness,
        probability: probability,
        matches: prediction.matches,
        non_matches: prediction.non_matches,
      });
    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };

  startCapture = () => {
    this.setState({ frames: [], capturing: true });

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

  stopCapture = () => {
    clearInterval(this.captureInterval);
    this.setState({ capturing: false });

    // Send captured frames to the Flask backend for face recognition
    this.sendFramesToBackend();
  };

  render() {
    const {
      capturing,
      result,
      predictionliveness,
      probability,
      matches,
      non_matches,
    } = this.state;

    const accuracy =
      matches !== undefined && non_matches !== undefined
        ? (matches / (matches + non_matches)) * 100
        : 0;

    return (
      <div>
        <h1>Face Recognition</h1>
        <video ref={this.videoRef} autoPlay muted />
        <br />
        <br />
        {!capturing ? (
          <button onClick={this.startCapture}>Start Capture</button>
        ) : (
          <button onClick={this.stopCapture}>Stop Capture</button>
        )}
        {result && (
          <div>
            <h2>Result</h2>
            <p>{result}</p>
          </div>
        )}
        {matches !== undefined && non_matches !== undefined && (
          <div>
            <p>Confidence: {accuracy}%</p>
          </div>
        )}
        {predictionliveness && (
          <div>
            <h2>Liveness</h2>
            <p>{predictionliveness}</p>
            <p>Probability: {probability}%</p>
            <br />

            <a href="/success" rel="noopener noreferrer">
              <button>Go to next page</button>
            </a>
          </div>
        )}
      </div>
    );
  }
}

export default FaceRec;
