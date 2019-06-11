const path = require('path');
const fs = require('fs').promises;
const express = require('express')
const app = express()

const apiRoutes = express.Router()
app.use('/api', apiRoutes);

module.exports = {
    devServer: {
        before(app) {
            app.get('/api/getPieInfo', async (req, res) => {
                const data = await fs.readFile('./src/assets/data/data.json');
                res.send(data);
            });
        }
    }
}