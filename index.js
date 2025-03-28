require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
morgan.token('body', (req) => JSON.stringify(req.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

app.get('/api/persons', (req, res) =>
  Person.find({}).then((result) => res.json(result)),
);

app.get('/api/persons/:id', (req, res, next) =>
  Person.findById(req.params.id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }

      return res.json(person);
    })

    .catch((error) => next(error)),
);

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;
  const newPerson = new Person({ name, number });

  newPerson
    .save()
    .then((savedPerson) => res.status(201).json(savedPerson))
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { number } = req.body;

  Person.findById(req.params.id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }

      person.number = number;
      
      person
        .save()
        .then((updatedPerson) => res.json(updatedPerson))
        .catch((error) => next(error));
    })

    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) =>
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((error) => next(error)),
);

app.get('/info', (req, res) => {
  Person.find({}).then((persons) => {
    const info = `<p>Phonebook has info for ${
      persons.length
    } people</p><p>${new Date()}</p>`;

    return res.send(info);
  });
});

app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  return next(error);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
