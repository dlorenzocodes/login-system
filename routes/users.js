const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const csrf = require('csurf');

// CSRF Protection
const csrfProtection = csrf();
router.use(csrfProtection)

const User = require('../schemas/User')

// Login Page
router.get('/login', (req, res) => {
    res.render('login')
});

// Register Page
router.get('/register', (req, res) => {
    res.render('register', {csrfToken: req.csrfToken()});
});

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    const errorMesseges = [];

    let { error } = validateForm(name, email, password, password2);

    if(error){
        errorMesseges.push({msg: error.message});
        console.log(errorMesseges);
    }

    if(errorMesseges.length > 0){
        // makes the page stay if there are errors
        res.render('register', {
            errorMesseges,
            name,
            email,
            password,
            password2
        })
    } else{
        // Validation pass - add user, but first check if it doesn't exist
        User.findOne({email: email})
            .then(user => {
                if(user){
                    errorMesseges.push({msg: 'Email is already registered'})
                    res.render('register', {
                        errorMesseges,
                        name,
                        email,
                        password,
                        password2
                    })
                } else{
                    // new User
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, function(err, hash){
                            if(err) throw err;

                            newUser.password = hash;
                            
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered!')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))
                        })
                    })
                }
            })
    }
})


function validateForm(name, email, password, password2){
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required().min(6),
        password2: Joi.ref('password')
    })
    return schema.validate({
            name: name, 
            email: email, 
            password: password, 
            password2: password2
        })
}


module.exports = router;