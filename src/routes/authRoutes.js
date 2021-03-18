const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const path = require("path");
var crypto = require("crypto");
const bcrypt = require("bcrypt");

//SEND GRID MAIL
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

const User = mongoose.model("User");

const router = express.Router();

router.post("/api/signup", async (req, res) => {
  
  try {
    const { name, email, type, password } = req.body;

    if (!name) {
      return res.status(422).send({ error: "Must provide Name" });
    }
    if (!email) {
      return res.status(422).send({ error: "Must provide Email" });
    }
    if (!password) {
      return res.status(422).send({ error: "Must provide Password" });
    }

    const user = new User({ name, email, type, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    res.send({ token, user });

    const msg = {
      to: email,
      from: "vishhow@gmail.com",
      subject: "Email verification",
      text:
        `Dear Friend\n\n` +
        `Please click the confirmation link or paste it in the browser ${process.env.SERVER_ORIGIN}/confirm?id=${user._id} to activate your account and login.\n` +
        `From now on please login to your account using your email address and password.\n` +
        `Thank you\n` +
        `This is an autogenerated mail, please do not reply.\n\n`,
    };
    sgMail
      .send(msg)
      .then((status) => {
        //console.log(status)
      })
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
    return res
      .status(422)
      .send({ error: "Someone's already using this email" });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw true;
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      throw true;
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    res.send({ token, user });
  } catch (err) {
    return res.status(422).send({ error: "Invalid Email address or Password" });
  }
});

router.get("/api/confirm", async (req, res) => {
  const { id } = req.query;

  User.findById(id)
    .then((user) => {
      // A user with that id does not exist in the DB. Perhaps some tricky
      // user tried to go to a different url than the one provided in the
      // confirmation email.
      if (!user) {
        console.log("invalid user");
      }

      // The user exists but has not been confirmed. We need to confirm this
      // user and let them know their email address has been confirmed.
      else if (user && !user.emailVerified) {
        User.findByIdAndUpdate(id, { emailVerified: true })
          .then(() => console.log("user verified"))
          .catch((err) => console.log(err));

        return res.redirect(`${process.env.CLIENT_ORIGIN}`);
      }
      // The user has already confirmed this email address.
      else {
        console.log("user already verified");
        return res.redirect(`${process.env.CLIENT_ORIGIN}`);
      }
    })
    .catch((err) => console.log(err));
});

router.post("/api/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).send({ error: "Must provide Email" });
    }

    const user = await User.findOne({ email });

    if (user === null) {
      res.send("We didn't find any user with this email address");
    } else {
      const token = crypto.randomBytes(20).toString("hex");
      console.log(token);

      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 1);

      User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: token,
            resetPasswordExpires: new Date(currentDate.toISOString()),
          },
        },
        function (err, updated) {
          console.log(err);
        }
      );

      const msg = {
        to: email,
        from: "vishhow@gmail.com",
        subject: "Link to reset password",
        text:
          `You are receiving this because you have requested the reset of password for your account.\n\n` +
          `Plase click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
          `${process.env.CLIENT_ORIGIN}/reset/${token}\n\n` +
          `If you did not receive this, please ignore this email and your password remain unchanged.\n`,
      };
      sgMail
        .send(msg)
        .then(() => {
          res.status(200).send({ linkSent: true });
        })
        .catch((err) => console.log(err));
    }
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: "Something went wrong" });
  }
});

router.get("/api/reset", (req, res) => {
  console.log(new Date());
  User.findOne(
    {
      resetPasswordToken: req.query.resetPasswordToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    },
    function (err, obj) {
      console.log(err);
    }
  ).then((user) => {
    if (user == null) {
      res.send("Password reset link is invalid or has expired");
    } else {
      res
        .status(200)
        .send({ userId: user._id, message: "Password reset link is ok" });
    }
  });
});

router.put("/api/updatePasswordViaEmail", (req, res, next) => {
  User.findById(req.body.userId).then((user) => {
    if (user != null) {
      bcrypt.genSalt(10).then((salt) => {
        bcrypt
          .hash(req.body.password, salt)
          .then((hash) => {
            User.findOneAndUpdate(
              { _id: user._id },
              {
                $set: {
                  password: hash,
                  resetPasswordToken: null,
                  resetPasswordExpires: null,
                },
              },
              function (err, updated) {
                console.log(err);
              }
            );
          })
          .then(() => {
            res.status(200).send("Password updated");
          });
      });
    } else {
      res.status(404).send("User not found");
    }
  });
});

module.exports = router;
