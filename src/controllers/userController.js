import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt"
import session from "express-session";

export const getJoin = (req, res) => {
    res.render("join", {pageTitle: "Join"});
};

export const postJoin = async(req, res) => {
    const { name, email, username, password, password2, location } = req.body;
    const pageTitle = "Join"

    if (password !== password2){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:"Password confirmation does not match.",
        });
    }

    const exists = await User.exists({ $or: [{username},{email}] }); 
    if (exists){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:"This username/email is already taken.",
        });
    }

    try {
        await User.create({
            name,
            email,
            username,
            password,
            location,
        });
    } catch(error){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:error._message,
        });
    }
    return res.redirect("login");
};


export const getLogin = (req, res) => {
    res.render("login", {pageTitle: "Login"});
};


export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username, socialOnly:false});
    const pageTitle = "Login"

    if(!user){
        return res.status(400).render("login", {
            pageTitle, 
            errorMessage:"An account with this username does not exists.",
        });
    }

    const ok = await bcrypt.compare(password, user.password)
    if(!ok){
        return res.status(400).render("login", {
            pageTitle, 
            errorMessage:"Wrong password.",
        });
    }
    
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
};


export const startGithubLogin = (req, res) => {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const config = {
        client_id:process.env.GH_CLIENT_ID,
        allow_signup:false,
        scope:"read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl)
};


export const finishGithubLogin = async(req, res) => {
    const baseUrl = 'https://github.com/login/oauth/access_token';
    const config = {
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
            method:"POST",
            headers:{
                Accept: "application/json",
            },
        })
    ).json();

    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`,{
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();

        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        
        let user = await User.findOne({email: emailObj.email});
        if(!user){
            const user = await User.create({
                name: userData.name,
                avatarUrl: userData.avatar_url,
                email: emailObj.email,
                username: userData.login,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};


export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};


export const getEdit = (req, res) =>{
    res.render("editUser", {pageTitle: "Edit Profile"});
};


export const postEdit = async(req, res) =>{
    const {
        session:{
            user:{_id:id},
         },
         body:{ name, email, username, location },
     } = req; //const id =req.session.user._id;
     
     const findUsername = await User.findOne({username});
     const findEmail = await User.findOne({email});
     if(findUsername&&findEmail){
        if (findUsername._id != id || findEmail._id != id){
            return res.status(404).render("404", { pageTitle: "User exists." });
        }
    }
    const updatedUser = await User.findByIdAndUpdate(id, {
        name,
        email,
        username,
        location,
    }, {new:true});
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
};


export const deleteUser = (req, res) => {
    res.render("deleteUser", {pageTitle: "Delete USer"});
};


export const see = (req, res) => {
    res.render("see", {pageTitle: "See USer"});
};
