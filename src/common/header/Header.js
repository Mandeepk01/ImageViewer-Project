import React, { Component } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import Input from '@material-ui/core/Input'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from 'react-router-dom';
import profileImage from "../../assets/upgrad.svg"
import { MenuList } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom'

import "./Header.css";


// Custom Styles to over ride material ui default styles
const styles = (theme => ({
    menuItems: {  //Style for the menu items 
        "text-decoration": "none",
        "color": "black",
        "text-decoration-underline": "none",
    },
    searchText: {  //seach text styling 
        "position": "relative",
        "width": "100%",
    },
    menuList: { //Styling for the menulist component
        "width": "150px",
        padding: "0px"

    }

}))



class Header extends Component {
    constructor() {
        super();
        this.state = {
            menuIsOpen: false,
            isLoggedIn: true,
        };

    }

    //This method is to handle the open menu when profile button is clicked
    openMenu = () => this.setState({
        ...this.state,
        menuIsOpen: !this.state.menuIsOpen
    })
    //This method is called when the profile icon is clicked to open the menu
    profileButtonClicked = (event) => {
        this.state.anchorEl ? this.setState({ anchorEl: null }) : this.setState({ anchorEl: event.currentTarget });
        this.openMenu();
    };

    // This method is called when text is entered into search input, 
    //this inturn calls method onSearchTextChange of Home component and passes the text entered in the search input
    onSearchChangeHandler = (event) => {
        this.props.onSearchTextChange(event.target.value);
    }

    //This method is called when log out is clicked in the menu 
    //The method clears the session deatils like access-token and changes the logged to false
    onLogOutClicked = (event) => {
        sessionStorage.removeItem("access-token"); //Clearing access-token
        this.setState({
            isLoggedIn:false
        })  
    }

    // This is called everytime the page renders so that to check if the user is not logged to redirect to login page
    redirectToLogin = () => {
        if (!this.state.isLoggedIn) {
           return <Redirect to = "/"/>
        }
    }

    render() {

        //custom Styles are stored in classes
        const { classes } = this.props;
        return (
            <div>
                {/* this is called everytime the page reloads to check if the user is logged out if yes the redirects to login page */}
                {this.redirectToLogin()}
                <header className="app-header">
                    <a href='/home' id="app-logo">Image Viewer</a>
                    {this.props.showSearchBox ?                 //checking if the showSearchBox is true,only then it is shown  
                        <span className="header-searchbox">
                            <SearchIcon id="search-icon"></SearchIcon>
                            <Input className={classes.searchText} placeholder="Search…" disableUnderline={true} onChange={this.onSearchChangeHandler} />
                        </span>
                        : <span className="header-searchbox-false" /> //To maintain the design stability
                    }
                    {this.props.showProfileIcon ?   // checking if the showSearchBox is true,only then it is shown 
                        <span>
                            <IconButton id="profile-icon" onClick={event => this.profileButtonClicked(event)}>
                                <img src={this.props.profile_picture} alt={profileImage} id="profile-picture" />
                            </IconButton>
                            <Menu id="profile-menu" anchorEl={this.state.anchorEl} open={this.state.menuIsOpen} onClose={this.profileButtonClicked}>
                                <MenuList className={classes.menuList}>
                                    {this.props.showMyAccount === true ?
                                    <div>
                                        <Link to={"/profile"} className={classes.menuItems} underline="none" color={"default"}>
                                            <MenuItem className={classes.menuItems} onClick={this.onMyAccountClicked} disableGutters={false}>My account</MenuItem>
                                        </Link>
                                    
                                    <div className="horizontal-line"> </div>
                                    </div>
                                    : ""
                                    }
                                        <MenuItem className="menu-items" onClick={this.onLogOutClicked}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        </span>
                        : ""
                    }

                </header>

            </div>


        )
    }


}

export default withStyles(styles)(Header);