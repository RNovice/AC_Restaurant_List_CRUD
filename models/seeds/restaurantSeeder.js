const mongoose = require('mongoose')
const Restaurant = require('../restaurants')
const restaurantList = require('../../restaurant.json')

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.aruzh.mongodb.net/restauramt_list_CRUD?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () =>{
    console.log('mogodb error')
})

db.once('open', () => {
    console.log('mongodb connected')

    restaurantList.results.forEach(info => {
        Restaurant.create(info)
    } )

    console.log('done')
})