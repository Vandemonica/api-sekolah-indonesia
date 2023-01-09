require('dotenv').config()

const express = require("express");
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

// get from env
const PORT = process.env.PORT || 3000;

const api_url = 'https://dapo.kemdikbud.go.id/api/getHasilPencarian';


app.get("/", async (req, res) => {
  const keyword = req.query.keyword ?? null;

  if (keyword == null) {
    res.send('ERROR: query param `keyword` is required');

  } else {
    const responses = await axios.get(`${api_url}?keyword=${keyword}`).then(function (response) {
      return response;
    }).catch(function (error) {
      res.send({
        status: '500',
        message: error
      });
    });

    const results = responses.data.map((item) => {
      let items = {};
      Object.keys(item).forEach((key) => {
        items[key] = item[key].toString().trim();
      });

      return items;
    });

    res.json(results);
  }
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
