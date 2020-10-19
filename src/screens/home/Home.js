import React, { Component } from 'react';
import { Grid, FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Header from '../../common/header/Header';
import profileImage from "../../assets/upgrad.svg"
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import IconButton from '@material-ui/core/IconButton'
import FavoriteIcon from '@material-ui/icons/Favorite';
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Redirect } from 'react-router-dom'

import "./Home.css";

// Custom Styles to over ride material ui default styles
const styles = (theme => ({
    root: { //style for the root 
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper
    },
    grid: { //style for the grid component 
        padding: "20px",
        "margin-left": "10%",
        "margin-right": "10%",
    },
    card: { //style for the card component 
        maxWidth: "100%",
    },
    media: { // style for the image in the card
        height: "56.25%",
        width: "100%",
        // paddingTop: '56.25%', // 16:9
    },
    avatar: { //style for the avatar in the card header 

        margin: 10,
        width: 60,
        height: 60,
    },
    title: { //Style for the title of the card 
        'font-weight': '600',
    },

    addCommentBtn: { // ADD button styling 
        "margin-left": "15px",
    },

    comment: { //for the form control
        "flex-direction": "row",
        "margin-top": "25px",
        "align-items": "baseline",
        "justify-content": "center",
    },

    commentUsername: {  //style for the userName of the comment
        fontSize: "inherit"
    }

}));

// Creating Home class component to render the home page as per the design
class Home extends Component {


    constructor() {
        super()
        this.state = {
            images: [],
            comments: [],
            profile_picture: "",
            userName: "",
            commentText: "",
            searchOn: false,
            originalImageArr: {},
            isLoggedIn: sessionStorage.getItem("access-token") == null ? false : true,
            accessToken: sessionStorage.getItem("access-token"),
            count: 1,
        };
    }
    // As per the warning UNSAFE_ is prefixed before componentWillMount method
    // In this method all the api will be called before the component is show,
    UNSAFE_componentWillMount() {
        // Get data from first API endpoint
        //This is called to get the profile details of the user such as username and profile_picture
        //API calls are made only when the user is Logged in
        let that = this;
        if (this.state.isLoggedIn) {
            let data = null;
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    that.setState({
                        //Profile picture obtained from the API is stored in profile_picture & username in userName
                        profile_picture: JSON.parse(this.responseText).data.profile_picture,
                        userName: JSON.parse(this.responseText).data.username

                    });
                };
            });
            xhr.open("GET", this.props.baseUrl + "/me/media?fields=id,caption&?access_token=" + that.state.accessToken);
            xhr.send(data);
        }

        // Get data from second api all the images
        // This api is called to get all the images data posted by the user
        // This data will maintained in state as an array and the same of the array is images
        //API calls are made only when the user is Logged in
        if (this.state.isLoggedIn) {
            let xhrImages = new XMLHttpRequest();
            xhrImages.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {

                    let imageArr = JSON.parse(this.responseText).data
                    //As the created_time are in milliseconds it would be  converted as per the required format 
                    imageArr.forEach(element => {
                        var date = parseInt(element.created_time, 10);
                        date = new Date(date * 1000);
                        //changing the format to Locale String  
                        element.created_time = date.toLocaleString()

                    });
                    //loadHomePage method called to set the state of the images and render the page
                    that.loadHomePage(imageArr);

                }
            })
            xhrImages.open("GET", this.props.baseUrl + "id?fields=id,media_type,media_url,username,timestamp="+ that.state.accessToken);
            xhrImages.send();
        }
    }

    //This method takes the image array as sets it to the state images array triggering rerender
    loadHomePage = (imageArr) => {
        this.setState({
            ...this.state,
            images: imageArr
        });
    }

    //Method used to handle changes in the comment input text
    //This method takes the imageId as one parameter which is added to comment object and then updates the commentText state  
    //ImageId is given so that the comment input line of active card only shows the input text given.  
    onCommentTextChangeHandler = (event, imageId) => {
        var comment = {
            id: imageId,
            text: event.target.value,
        }
        this.setState({
            ...this.state,
            commentText: comment,
        });
    }

    //This method is to handle the ADD button beside the comment text box 
    onClickAddBtn = (imageId) => {
        var count = this.state.count
        var comment = {
            id: count,
            imageId: imageId,
            username: this.state.userName,
            text: this.state.commentText.text,
        }
        count++;
        var comments = [...this.state.comments, comment];
        this.setState({
            ...this.state,
            count: count,
            comments: comments,
            commentText: "",
        })
    }


    likeBtnHandler = (imageId) => {
        var i = 0
        var imageArray = this.state.images
        for (i; i < imageArray.length; i++) {
            if (imageArray[i].id === imageId) {
                if (imageArray[i].user_has_liked === true) { // check to see if user has already liked
                    imageArray[i].user_has_liked = false; // changing the status os user_has_liked
                    imageArray[i].likes.count--; // Changing the count of the likes
                    this.setState({
                        images: imageArray
                    });
                    break;
                } else {
                    imageArray[i].user_has_liked = true;  // changing the status os user_has_liked
                    imageArray[i].likes.count++; // Changing the count of the likes
                    this.setState({
                        images: imageArray
                    });
                    break;

                }
            }


        }
    };
  
    onSearchTextChange = (keyword) => {
        if (!(keyword === "")) {//check if search input value is empty
            var originalImageArr = [];
            this.state.searchOn ? originalImageArr = this.state.originalImageArr : originalImageArr = this.state.images;
            var updatedImageArr = [];
            var searchOn = true;                            // changing the searchOn to true until it is keyword is null
            keyword = keyword.toLowerCase();                //changing to lower case for comparison
            originalImageArr.forEach((element) => {
                var caption = element.caption.text.split("\n")[0];          // extracting the caption
                caption.toLowerCase();                                         // changing to lower case
                if (caption.includes(keyword)) {                        //checking if keyword is substring of caption 
                    updatedImageArr.push(element);                      //if yes adding to the updatedImageArr 
                }
            })
            if (!this.state.searchOn) {                        // For the first search
                this.setState({
                    ...this.state,
                    searchOn: searchOn,
                    images: updatedImageArr,
                    originalImageArr: originalImageArr,

                })
            } else {
                this.setState({                 //Until keyword is null
                    ...this.state,
                    images: updatedImageArr
                })
            }
        } else {                     //If keyword is null then search is not On and corresponding changes are done
            searchOn = false
            this.setState({
                ...this.state,
                searchOn: searchOn,
                images: this.state.originalImageArr,
                originalImageArr: [],
            })

        }
    }

    render() {
        // Styles are stored in the const classes
        const { classes } = this.props;
        return (
            <div>
                {/* Rending the Header and passing three parameter profile_picture,showSearchBox & showProfileIcon based on the value it is shown in the header */}
                <Header  profile_picture={this.state.profile_picture}  showSearchBox={this.state.isLoggedIn ? true : false} showProfileIcon={this.state.isLoggedIn ? true : false} onSearchTextChange={this.onSearchTextChange} showMyAccount = {true} />
                {this.state.isLoggedIn === true ?    //checking isLoggedIn is true only then the images are shown
                    <div className="flex-container">
                        <Grid container spacing={3} wrap="wrap" alignContent="center" className={classes.grid}>
                            {this.state.images.map(image => (           //Iteration over images array and rendering each element of array as per the design.
                                // components are data to the components are given as per the design and guidelines given
                                //Grid Used to create two coloumns
                                //Card used to show the images in two columns
                                //Card Header to set the header of the card
                                //Card Content to set the card content
                                <Grid key={image.id} item xs={12} sm={6} className="grid-item">
                                    <Card className={classes.card}>
                                        <CardHeader
                                            classes={{
                                                title: classes.title,
                                            }}
                                            avatar={
                                                <Avatar src={image.caption.from.profile_picture} className={classes.avatar}></Avatar>
                                            }
                                            title={image.caption.from.username}
                                            subheader={image.created_time}
                                            className={classes.cardheader}
                                        />

                                        <CardContent>
                                            <img src={image.images.standard_resolution.url} alt={profileImage} className={classes.media} />
                                            <div className="horizontal-rule"></div>
                                            <div className="image-caption">
                                                {image.caption.text.split("\n")[0]}
                                            </div>
                                            <div className="image-hashtags">
                                                {image.caption.text.split("\n")[1]}
                                            </div>
                                            <div>
                                                <IconButton className="like-button" aria-label="like-button" onClick={() => this.likeBtnHandler(image.id)}>
                                                    {/* Based on the condition of the icon will be filled red or only the border */}
                                                    {image.user_has_liked ? <FavoriteIcon className="image-liked-icon" fontSize="large" /> : <FavoriteBorderIcon className="image-like-icon" fontSize="large" />}
                                                </IconButton>
                                                {/* if like count is 1 it will show like or else likes */}
                                                {image.likes.count === 1 ?
                                                    <span>
                                                        {image.likes.count} like
                                                </span>
                                                    : <span>
                                                        {image.likes.count} likes
                                                </span>
                                                }
                                            </div>
                                            {this.state.comments.map(comment => (         //Iterating over comment array to show the comment to the corresponding image only

                                                image.id === comment.imageId ?  //check if comment.imageId and imageId is same only the append the comment
                                                    <div className="comment-display" key={comment.id}>
                                                        <Typography variant="subtitle2" className={classes.commentUsername} gutterbottom="true" >
                                                            {comment.username}:
                                                        </Typography>
                                                        <Typography variant="body1" className="comment-text" gutterbottom="true">
                                                            {comment.text}
                                                        </Typography>
                                                    </div>
                                                    : ""

                                            ))}
                                            {/* Input to add comment consist of Input ,InputLabel and ADD button */}
                                            <FormControl className={classes.comment} fullWidth={true}>
                                                <InputLabel htmlFor="comment" >Add a comment</InputLabel>
                                                <Input id="comment" className="comment-text" name="commentText" onChange={(event) => this.onCommentTextChangeHandler(event, image.id)} value={image.id === this.state.commentText.id ? this.state.commentText.text : ""} />
                                                <Button variant="contained" color="primary" className={classes.addCommentBtn} onClick={() => this.onClickAddBtn(image.id)}>
                                                    ADD
                                            </Button>
                                            </FormControl>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>


                    </div>
                    : <Redirect to="/" /> //If the user is not logged in then redirecting to login page
                }

            </div>


        )


    }


}

export default withStyles(styles)(Home);