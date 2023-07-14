require("dotenv").config();
const { Op } = require("sequelize");

const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const db = require("../models");
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findOne({ where: { id: payload.id } });
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "405179135262-nrr7s0ugiirnjb3i09b691qua28lvksg.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:8000/user/google/callback`,
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, otherTokenDetails, profile, done) {
      try{
      console.log("user profile is: ", profile)      
      let token = {
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: otherTokenDetails.scope,
        token_type: otherTokenDetails.token_type,
        expiry_date:otherTokenDetails.expires_in
      }
      console.log("token is: ", token)      
      const email = profile._json.email;
      const existUser = await User.findOne({
        where: {
          email: {
            [Op.eq]: email,
          },
        },
       });
      if (existUser) {
       done(null, profile);
      } else {
        console.log('not found email');
        const hashedPassword = await bcrypt.hash(profile.id, 10);
        await User.create({
          social_id: profile.id,
          email: email,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          password: hashedPassword,
          role:"user"
        });
       done(null, profile);
       }
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 691743551857593,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `http://localhost:8000/user/facebook/callback`,
      profileFields: ['id', 'displayName', 'email', 'first_name', 'middle_name', 'last_name'],
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      try{
        console.log("user profile facebook is: ", profile)        
        const email = profile._json.email;
        const existUser = await User.findOne({
          where: {
            email: {
              [Op.eq]: email,
            },
          },
         });
        if (existUser) {
         done(null, profile);
        } else {
          console.log('not found email');
          const hashedPassword = await bcrypt.hash(profile.id, 10);
          await User.create({
            social_id: profile.id,
            email: email,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            password: hashedPassword,
            role:"user"
          });
         done(null, profile);
         }
        } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});