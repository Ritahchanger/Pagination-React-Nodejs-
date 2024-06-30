const express = require('express')

const PORT = process.env.PORT || 8000

const axios = require('axios')

const app = express()

const cors = require("cors")

app.use(cors())

const fetchUsers = async () => {
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    )

    return response.data
  } catch (error) {
    console.error('Error fetching users: ', error)

    return []
  }
}

app.get('/users', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const users = await fetchUsers();

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Validate page and limit
    if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
        return res.status(400).json({ error: 'Invalid page or limit parameters' });
    }

    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;

    // Handle case where startIndex exceeds available data
    if (startIndex >= users.length) {
        return res.status(404).json({ error: 'Page not found' });
    }

    const paginatedUsers = users.slice(startIndex, endIndex);

    const totalPages = Math.ceil(users.length / limitInt);

    // Next and previous page URLs
    const nextPage =
        endIndex < users.length
            ? `http://localhost:${PORT}/users?page=${pageInt + 1}&limit=${limitInt}`
            : null;
    const prevPage =
        startIndex > 0
            ? `http://localhost:${PORT}/users?page=${pageInt - 1}&limit=${limitInt}`
            : null;

    res.json({
        page: pageInt,
        limit: limitInt,
        total: users.length,
        totalPages: totalPages,
        nextPage,
        prevPage,
        data: paginatedUsers
    });
});


app.listen(PORT, () => {
  console.log(
    `The application has been started and it's running on PORT: ${PORT}`
  )
})
