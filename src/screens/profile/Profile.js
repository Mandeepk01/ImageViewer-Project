import React, { Component } from 'react';
import Header from "../../common/header/Header";
import './Profile.css'
import { Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal'
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from "@material-ui/core/InputLabel";
import Input from '@material-ui/core/Input';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import IconButton from '@material-ui/core/IconButton'
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

const styles = theme => ({
    fab: {
        margin: theme.spacing(1.5),
    },
    gridListMain: {
        transform: 'translateZ(0)',
        cursor: 'pointer'
    },
    imageDetails: {
        top: 6
    },
    modalStyle: {
        width: 800,
        height: 400,
        marginTop: 100,
        marginLeft: 300,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    addCommentBtn: {
        "margin-left": "15px",
    },
    comment: {
        "flex-direction": "row",
        "margin-top": "5px",
        "align-items": "baseline",
        "justify-content": "center",
    },
    commentUsername: {
        fontSize: "inherit",
        fontWeight: "bolder"
    }
})

const TabContainer = function (props) {
    return (
        <Typography component="div" style={{ padding: 0, textAlign: "center" }}>{props.children}</Typography>
    );
}

class Profile extends Component {
    constructor() {
        super();
        this.state = {
            isLoggedIn: sessionStorage.getItem("access-token") == null ? false : true,
            profilePicture: "",
            username: "",
            fullname: "",
            noOfPosts: 0,
            follows: 0,
            followedBy: 0,
            modalIsOpen: false,
            newName: "",
            fullNameRequired: "dispNone",
            imagesData: null,
            imageModalIsOpen: false,
            currId: "",
            currImage: "",
            currProfilePicture: "",
            currCaption: "",
            currTags: "",
            currLikeStatus: false,
            likeCounts: 0,
            count: 0,
            comments: [],
            commentText: "",
            accessToken:sessionStorage.getItem("access-token"),
        }
    }

    componentDidMount() {
        if (this.state.isLoggedIn) {
            let resp = {};
            let data = null;
            let xhr = new XMLHttpRequest();
            let that = this;
            xhr.addEventListener("readystatechange", function () {
                if (xhr.readyState === 4) {
                    resp = JSON.parse(this.responseText).data;
                    that.setState({ profilePicture: resp["profile_picture"] });
                    that.setState({ username: resp["username"] });
                    that.setState({ noOfPosts: resp["counts"]["media"] });
                    that.setState({ follows: resp["counts"]["follows"] });
                    that.setState({ followedBy: resp["counts"]["followed_by"] });
                    that.setState({ fullname: resp["full_name"] });
                }
            });
            xhr.open("GET", this.props.baseUrl + "/me/media?fields=id,caption&access_token="+ that.state.accessToken);


            xhr.send(data);

            var imageData = null;
            let imageXhr = new XMLHttpRequest();
            imageXhr.addEventListener('readystatechange', function () {
                if (imageXhr.readyState === 4) {
                    that.setState({ imagesData: JSON.parse(this.responseText).data });
                }
            });
            imageXhr.open("GET", this.props.baseUrl + "/me/media?fields=id,caption&access_token="+that.state.accessToken );
            imageXhr.send(imageData);
        }
    }

    // Sets state of modalIsOpen to true to open the modal when EditIcon is clicked
    openModalHandler = () => {
        this.setState({ modalIsOpen: true });
    }

    // Sets modalIsOpen to false to close the modal
    closeModalHandler = () => {
        this.setState({ modalIsOpen: false });
    }

    // Stores User input for full name in the newName state variable
    editFullNameHandler = (e) => {
        this.setState({ newName: e.target.value });
    }

    // On click of the update button, the name input by the user is saved to fullname and displayed. If Update buttin is clicked
    // without providing the input, care is taken to prompt the user that it is a required field is you want to update.
    updateFullNameHandler = () => {
        this.state.newName === "" ? this.setState({ fullNameRequired: "dispBlock" }) : this.setState({
            fullNameRequired: "dispNone",
            fullname: this.state.newName,
            modalIsOpen: false
        });
    }

    imageClickHandler = (image) => {
        var data = image.caption.text
        this.setState({
            imageModalIsOpen: true,
            currId: image.id,
            currImage: image.images.standard_resolution.url,
            currProfilePicture: image.user.profile_picture,
            currImgName: image.user.fullName,
            currCaption: data.substring(0, data.indexOf('#')),
            currTags: data.substring(data.indexOf('#')),
            currLikeStatus: image.user_has_liked,
            likeCounts: image.likes.count
        });

    }

    // Sets imageModalIsOpen to false in order to close the modal
    closeImageModalHandler = () => {
        this.setState({ imageModalIsOpen: false });
    }

    // Handles liking of a Post
    likeBtnHandler = (imageId) => {
        var i = 0
        var imageArray = this.state.imagesData
        for (i; i < imageArray.length; i++) {
            if (imageArray[i].id === imageId) {
                if (imageArray[i].user_has_liked === true) {
                    imageArray[i].user_has_liked = false;
                    this.setState({ currLikeStatus: false })

                    this.setState({
                        imagesData: imageArray,
                        likeCounts: --imageArray[i].likes.count
                    });
                    break;
                } else {
                    imageArray[i].user_has_liked = true;
                    this.setState({ currLikeStatus: true });
                    this.setState({
                        imagesData: imageArray,
                        likeCounts: ++imageArray[i].likes.count
                    });
                    break;

                }
            }


        }
    };

    // Handles adding of comments to an image
    onClickAddBtn = (imageId) => {
        var count = this.state.count
        var comment = {
            id: count,
            imageId: imageId,
            username: this.state.username,
            text: this.state.commentText.text,
        }
        count++;
        var comments = [...this.state.comments, comment];
        this.setState({
            count: count,
            comments: comments,
            commentText: "",
        })
    };

    onCommentTextChangeHandler = (event, imageId) => {
        var comment = {
            id: imageId,
            text: event.target.value,
        }
        this.setState({
            commentText: comment,
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                {
                    this.state.username && this.state.imagesData ?
                        <div className="top">
                            {/* Imports Header component and based on whether the user is logged in and the page that is being loaded the contents of Header is modified  */}
                            <Header profile_picture={this.state.profilePicture} showSearchBox={false} showProfileIcon={this.state.isLoggedIn ? true : false} showMyAccount={false} />
                            {this.state.isLoggedIn === true ?
                                <div className="flex-container">
                                    <div className="flex-container">
                                        <div className="left">
                                            <div className="profile-summary">
                                                <img className="profile-image" src={this.state.profilePicture} alt={this.state.fullName} />
                                            </div>
                                        </div>
                                        <div className="profile-summary-1">
                                            <Typography variant="h5" component="h5">{this.state.username}</Typography><br />
                                            <Typography>
                                                <span> Posts: {this.state.noOfPosts} </span>
                                                <span className="spacing" > Follows: {this.state.follows} </span>
                                                <span className="spacing"> Followed By: {this.state.followedBy} </span>
                                            </Typography>
                                            <Typography variant="h6" component="h6">
                                                <div className="top-spacing">{this.state.fullname}
                                                    <Fab color="secondary" aria-label="edit" className={classes.fab} >
                                                        <EditIcon onClick={this.openModalHandler} />
                                                    </Fab>
                                                </div>
                                            </Typography>
                                            <Modal ariaHideApp={false} isOpen={this.state.modalIsOpen} contentLabel="Label" onRequestClose={this.closeModalHandler} style={customStyles}>
                                                <h2>Edit</h2><br />
                                                <TabContainer>
                                                    <FormControl required>
                                                        <InputLabel htmlFor="fullname">Full Name</InputLabel>
                                                        <Input id="fullname" type="text" fullname={this.state.fullname} onChange={this.editFullNameHandler} />
                                                        <FormHelperText className={this.state.fullNameRequired}><span className="red">required</span></FormHelperText>
                                                    </FormControl><br /><br />
                                                </TabContainer><br />
                                                <Button variant="contained" color="primary" onClick={this.updateFullNameHandler}>UPDATE</Button>
                                            </Modal>
                                        </div>
                                    </div><br />
                                    <div className="bottom image-margins">
                                        <GridList cellHeight={350} cols={3} className={classes.gridListMain}>
                                            {
                                                this.state.imagesData.map(image => (
                                                    <GridListTile onClick={() => this.imageClickHandler(image)} className="image-grid-item" key={"grid" + image.id}>
                                                        <img src={image["images"]["standard_resolution"]["url"]} alt={image.id} />
                                                    </GridListTile>
                                                ))}
                                        </GridList>
                                        <Modal isOpen={this.state.imageModalIsOpen} ariaHideApp={false} contentLabel="Label1" className="image-modal" onRequestClose={this.closeImageModalHandler} >
                                            <div className={classes.modalStyle}>
                                                <div className="modal-left">
                                                    <img className="clicked-image" src={this.state.currImage} alt={this.state.curImgName} />
                                                </div>
                                                <div className="modal-right">
                                                    <div className="right-top">
                                                        <img className="modal-profile-icon" src={this.state.currProfilePicture} alt={this.state.fullname} />
                                                        <span className="modal-username">{this.state.username}</span>
                                                        <hr />
                                                    </div>
                                        </Modal>
                                    </div>
                                </div> : <Redirect to="/" />
                            }
                        </div> : null
                }
            </div>
        )
    }

}

export default withStyles(styles)(Profile);