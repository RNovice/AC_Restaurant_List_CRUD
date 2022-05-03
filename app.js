const express = require('express')
const exhbs = require('express-handlebars')
const mongoose = require('mongoose')
const Restaurant = require('./models/restaurants')
const app = express()
const port = 3000

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.aruzh.mongodb.net/restauramt_list_CRUD?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
    console.log('mongobd error')
})

db.once('open', () => { 
    console.log('mongodb connected')
})

app.engine('handlebars', exhbs.engine({ defaultLayout : 'main' }))
app.set ('view engine', 'handlebars')

app.use(express.static('public'))

app.get('/', (req, res) => {

    Restaurant.find()
        .lean()
        .then(restaurants => res.render('index', { restaurants }))
        .catch(error => console.error(error))
})

app.get('/restaurants/:id', (req, res) => {
    Restaurant.findById(req.params.id)
        .lean()
        .then( restaurant => res.render('show',{ restaurant }))
        .catch(error => console.log(error))
})

app.get('/search', (req, res)  => {

    Restaurant.find()
        .lean()
        .then(restaurants => {
            const keyword = [
                ...(restaurants.filter( 
                    rtr => rtr.name.toLowerCase().includes(req.query.keyword.toLowerCase()))),
                ...(restaurants.filter( 
                    rtr => rtr.name_en.toLocaleLowerCase().includes(req.query.keyword.toLowerCase()))),
                ...(restaurants.filter( 
                    rtr => rtr.category.includes(req.query.keyword)))
            ]

            const filteredSearchResults = keyword.filter((item,index,arr)=>{
                return arr.indexOf(item) === index
            })

            res.render('index', { restaurants : filteredSearchResults, keyword : req.query.keyword })            
        })
        .catch(error => console.error(error))


})

app.listen(port, () =>{
    console.log(`Express is listening on http://localhost:${port}`)
})
