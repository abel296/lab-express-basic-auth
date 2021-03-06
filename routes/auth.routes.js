const express = require('express')
const router = express.Router()

const bcrypt = require("bcrypt")

const User = require("../models/User.model")

// Sign Up
router.get('/registro', (req, res) => res.render('signup-form'))
router.post('/registro', (req, res) => {

    const {username, password} = req.body
    
    User
        .findOne({username})
        .then((user) => {
            // Validación en backend
            if (username.length === 0 || password.length === 0) {
                res.render("signup-form", { errorMsg: "Rellena los campos" })
                return;
            }

            if (user) {
                res.render("signup-form", { errorMsg: "Usuario ya registrado" })
                return;
            }

            if (password.length <= 1) {
                res.render("signup-form", { errorMsg: "Contraseña débil" })
                return;
            }

            const bcryptSalt = 10
            const salt = bcrypt.genSaltSync(bcryptSalt);
            const hashPass = bcrypt.hashSync(password, salt)

            User.create({ username, password: hashPass })
                .then(() => res.redirect("/"))
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))

})




/// LOG-IN //////

router.get('/iniciar-sesion', (req, res) => res.render('login-form'))
router.post('/iniciar-sesion', (req, res) => {
    const {username, password} = req.body
    // console.log(req.body)

    if (username.length === 0 || password.length === 0) {

        res.render('login-form', {errorMsg: 'Por favor introduce tus datos'})
        return
    }

    User
        .findOne({username})
        // console.log('oooooooooooo', username)
        .then(user => {
            // console.log(user)
            
            if (!user) {
                res.render('login-form', {errorMsg: 'Usuario no registrado'})
                return
            }
            
            if (!bcrypt.compareSync(password, user.password)) {
                res.render('login-form', {errorMsg: 'Contraseña no coincide'})
                return
            }
            // console.log('Esto es el objeto de sesion antes de la asignacion del usuario del formulario', req.session)
            req.session.currentUser = user
            // console.log(user)
            // console.log('Esto es el objeto de sesion', req.session)
            res.redirect('/perfil')
        })
        .catch(err => console.log(err))
})



router.get("/cerrar-sesion", (req, res) => {
    req.session.destroy((err) => res.redirect("/"))
})

// Custom middleware
router.use((req, res, next) => {
    if (req.session.currentUser) {
        next()
    }
    else {
        res.render('login-form', { errorMsg: 'Desautorizado, iniciar sesión antes' })
    }
})

router.get('/general', (req, res) => res.render('main'))

router.get('/privado', (req, res) => res.render('private'))

module.exports = router;