const express = require("express");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const app = express();

//Connecting Database
const database = "mongodb+srv://ravicchandra45:Ravi1234@cluster0.xiojy1i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(database).then((success) => {
    console.log(" Database Connected");
    app.listen(5000);
}).catch((error) => {
    console.log(error);
});

//Data Schema
const Data = mongoose.model("MyCollection", new mongoose.Schema({
    firstname:
    {
        type: String
    },
    lastname:
    {
        type: String
    },
    email:
    {
        type: String
    },
    password:
    {
        type: String
    },
    donation:
    {
        type: Object
    },
    membership:
    {
        type: Object
    },
    inneed:
    {
        type: Object
    }
}))

app.set("view engine", "ejs");
app.use('/public/images', express.static(__dirname + '/public/images'));
app.use('/public/videos', express.static(__dirname + '/public/videos'));
app.use(express.urlencoded({ extended: true }));

//Mail Options
var transporter = nodemailer.createTransport(
    {
        service: "gmail",
        auth:
        {
            user: "helpinghandsmaillogin@gmail.com",
            pass: "gneh hagg goam vswd"
        }
    }
);

//Variables
let otp, OTP, wrongemail = 0, wrongpassword = 0, alreadyemail = 0, wrongotp = 0, tempemail;

app.get("/", (req, res) => {
    res.render("welcome");
});
app.get("/authenticate", (req, res) => {
    res.render("login", { wrongemail: 0, wrongpassword: 0, alreadyemail: 0 });
});
app.get("/home", (req, res) => {
    res.render("home");
})
app.post("/home", (req, res) => {
    if (req.body.newpassword) {
        Data.find({
            email: req.body.email
        }).then((success) => {
            if (success[0].email == req.body.email) {
                res.render("loginsignup", { wrongemail: 0, wrongpassword: 0, alreadyemail: 1 });
            }
        }).catch((error) => {
            bcryptjs.genSalt(5, function (error, Salt) {
                if (error)
                    console.log(error);
                bcryptjs.hash(req.body.confirmpassword, Salt, function (err, Hash) {
                    if (err)
                        console.log(err)
                    req.body.password = Hash;
                    delete req.body.newpassword;
                    delete req.body.confirmpassword;
                    tempemail = req.body.email;
                    const data = new Data(req.body);
                    data.save().then((success) => {
                        otp = Math.floor(100000 + Math.random() * 900000);
                        //console.log(otp);
                        mailOptions = {
                            from: "helpinghandsmaillogin@gmail.com",
                            to: req.body.email,
                            subject: "Helping Hands Sign Up",
                            html: `<h2>OTP to Sign In to Helping Hands : ${otp}</h2>`
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                            }
                            else {
                            }
                        });
                    }).catch((error) => {
                        console.log(error);
                    })
                });
            });
        });

    }
    else if (req.body.email) {
        Data.find({
            email: req.body.email
        }).then((success) => {
            if (success[0].email == req.body.email) {
                bcryptjs.compare(req.body.password, success[0].password, function (error, data) {
                    if (error) {
                        console.log(error);
                    }
                    if (data) {
                        res.render("home");
                    }
                    else {
                        res.render("login", { wrongemail: 0, wrongpassword: 1, alreadyemail: 0 });
                    }

                });
            }
        }).catch((error) => {
            res.render("login", { wrongemail: 1, wrongpassword: 0, alreadyemail: 0 });
        });

    }
    else {

        OTP = +(req.body.n1 + req.body.n2 + req.body.n3 + req.body.n4 + req.body.n5 + req.body.n6);
        if (otp == OTP) {
            res.render("home");
        }
        else {
            Data.deleteOne({ email: tempemail }).then((success) => {

            }).catch((error) => {
                throw error;
            })
            res.render("loginotp", { wrongemail: 0, wrongpassword: 0, alreadyemail: 0, wrongotp: 1 });
        }
    }
});

app.post("/donationinfo", (req, res) => {
    Data.find({
        email: req.body.email
    }).then((success) => {
        if (success[0].email == req.body.email) {
            let emailid = req.body.email;
            delete req.body.email;
            Data.updateOne({ email: emailid }, { donation: req.body }).then((success) => {
                // console.log(success);
                res.redirect("/home");
            }).catch((error) => {
                console.log(error);
            });
        }
    }).catch((error) => {
        throw error;
    });

});
app.post("/membershipinfo", (req, res) => {
    Data.find({
        email: req.body.email
    }).then((success) => {
        if (success[0].email == req.body.email) {
            let emailid = req.body.email;
            delete req.body.email;
            Data.updateOne({ email: emailid }, { membership: req.body }).then((success) => {
                // console.log(success);
                res.redirect("/home");
            }).catch((error) => {
                console.log(error);
            });
        }
    }).catch((error) => {
        throw error;
    });
});
app.post("/inneed", (req, res) => {
    Data.find({
        email: req.body.email
    }).then((success) => {
        if (success[0].email == req.body.email) {
            let emailid = req.body.email;
            delete req.body.email;
            Data.updateOne({ email: emailid }, { inneed: req.body }).then((success) => {
                //console.log(success);
                res.redirect("/home");
            }).catch((error) => {
                console.log(error);
            });
        }
    }).catch((error) => {
        throw error;
    });
});
app.use("/", (req, res) => {
    res.send("Invalid Page");
})