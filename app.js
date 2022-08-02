const express = require('express')
const exhbs = require('express-handlebars')
const mongoose = require('mongoose')
const Restaurant = require('./models/restaurants')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

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
app.use(bodyParser.urlencoded({ extended: true }))

//根目錄
app.get('/', (req, res) => {

    Restaurant.find()
        .lean()
        .then(restaurants => res.render('index', { restaurants }))
        .catch(error => console.error(error))
})

//各餐廳詳細資料
app.get('/restaurants/:id', (req, res) => {
    Restaurant.findById(req.params.id)
        .lean()
        .then( restaurant => res.render('show',{ restaurant }))
        .catch(error => console.log(error))
})

//搜尋功能
app.get('/search', (req, res)  => {

    Restaurant.find()
        .lean()
        .then(restaurants => {
            //將與關鍵字相符的資料放入keyword中
            const arr = ['name', 'name_en', 'category']
            let keyword = []
            arr.forEach(each => {
                keyword.push(...(restaurants.filter(
                    rtr => rtr[each].toLowerCase().includes(req.query.keyword.toLowerCase()))))
            })
            //移除重複的資料
            const filteredSearchResults = keyword.filter((item,index,arr)=>{
                return arr.indexOf(item) === index
            })

            res.render('index', { restaurants : filteredSearchResults, keyword : req.query.keyword })            
        })
        .catch(error => console.error(error))

})

//新增頁面
app.get('/add', (req, res) => {
    res.render('add')
})

//新增餐廳資料
app.post('/restaurants', (req, res) => {
    Restaurant.create(req.body)
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    
})

//刪除餐廳資料
app.post('/restaurants/:id/delete', (req, res) => {
    Restaurant.findById(req.params.id)
        .then(rtr => rtr.remove())
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
})

//編輯頁面
app.get('/restaurants/:id/edit', (req, res) => {
    Restaurant.findById(req.params.id)
        .lean()
        .then( restaurant => res.render('edit',{ restaurant }))
        .catch(error => console.log(error))
})

//編輯餐廳資料
app.post('/restaurants/:id/edit', (req, res) => {
    Restaurant.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.redirect(`/restaurants/${req.params.id}`))
        .catch(error => console.log(error))
})

app.listen(port, () =>{
    console.log(`Express is listening on http://localhost:${port}`)
})
