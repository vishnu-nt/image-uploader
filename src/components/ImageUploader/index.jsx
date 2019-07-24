import React, { PureComponent, Fragment } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import CloudUpload from "@material-ui/icons/CloudUpload";
import CircularProgress from "@material-ui/core/CircularProgress";

import ImageCropper from "./ImageCropper";
import "./styles.css";

class ImageUploader extends PureComponent {
  state = {
    croppedImageUrl: null,
    src: null,
    isUploading: false,
    showError: false,
  };

  onSelectFile = e => {
    this.setState({showError: false})
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        this.setState({
          src: reader.result,
          showImageCropper: true
        })
      );
      reader.readAsDataURL(e.target.files[0]);
      const file = e.target.files[0];
      if(file.size > 1048576) {
        this.setState({showError: 'Select an image less than 1MB'})
      } else {
        this.setState({ filename: file.name });
      }
    }
  };

  cancelCrop = () => this.setState({ showImageCropper: false });

  applyCrop = () => {
    if (this.state.croppedImageUrl) {
      this.cancelCrop();
    } else {
      this.setState({ showError: "Crop image to continue" });
    }
  };

  enablePreview = croppedImageUrl => this.setState({ croppedImageUrl });

  removeFile = () => this.setState({ croppedImageUrl: null, filename: null });

  saveImage = () => {
    this.setState({ isUploading: true });
    fetch("http://lorempixel.com/800/100/cats/", {
      mode: "no-cors"
    })
      .then(response => {
        return response.blob();
      })
      .then(image => {
        const imageUrl = URL.createObjectURL(image);
        this.setState({ previewImage: imageUrl, isUploading: false });
        this.cancelCrop();
      });
  };

  render() {
    const {
      croppedImageUrl,
      src,
      showImageCropper,
      filename,
      previewImage,
      isUploading,
      showError
    } = this.state;
    return (
      <Fragment>
        <div className="wrapper">
          <div className="container">
            <form className="form">
              <div
                className="file-upload-wrapper"
                data-text={`${filename || "Select a file"}`}
              >
                <input
                  name="file-upload-field"
                  type="file"
                  className="file-upload-field"
                  accept="image/jpeg" 
                  key={src}
                  onChange={this.onSelectFile}
                />
              </div>
            </form>
          </div>
          <Button onClick={this.saveImage} className="upload-btn">
            {isUploading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <span className="wrapper">
                <CloudUpload color="inherit" />
                Save
              </span>
            )}
          </Button>
        </div>
        {!!src ? (
          <Dialog
            onClose={this.cancelCrop}
            aria-labelledby="crop-image"
            open={showImageCropper}
          >
            <DialogTitle id="simple-dialog-title">Crop Image</DialogTitle>
            <DialogContent>
              <div className="crop-container">
                <ImageCropper onComplete={this.enablePreview} src={src} />
              </div>
            </DialogContent>
            {showError ? <h5 className="error">{showError}</h5> : null}
            <DialogActions>
              <Button onClick={this.applyCrop} color="primary">
                Apply
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
        {!!croppedImageUrl ? (
          <Fragment>
            <img src={croppedImageUrl} alt="cropped" />
          <div className="filename-container">
            {filename}
            <IconButton aria-label="Delete" onClick={this.removeFile}>
              <DeleteIcon style={{ color: "white" }} />
            </IconButton>
          </div>
          </Fragment>
        ) : null}

        <Fab
          variant="extended"
          aria-label="preview"
          disabled={!previewImage}
          className="preview-image-btn"
        >
          Print Preview
        </Fab>
      </Fragment>
    );
  }
}

export default ImageUploader;
