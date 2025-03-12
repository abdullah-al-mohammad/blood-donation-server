const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

// middleware
app.use(cors())
app.use(express.json())


app.get('/', async (req, res) => {
  res.send('blood donation port is running')
})
app.listen(port, () => {
  console.log(`blood donation is running on ${port}`);
})