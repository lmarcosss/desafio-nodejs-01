const express = require("express")
const cors = require("cors")
const { uuid, isUuid } = require("uuidv4")

const app = express()

app.use(express.json())
app.use(cors())

const repositories = []

function logRequests(request, response, next) {
  const { method, url } = request

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)

  next()

  console.timeEnd(logLabel)

}

function validateRepositoryId(request, response, next) {
  const { id } = request.params

  if (!isUuid(id)) {
      return response.status(400).json({ error: 'Invalid repository ID.' })
  }

  return next()
}

app.use(logRequests)
app.use('/repositories/:id', validateRepositoryId)

app.get("/repositories", (request, response) => {
  return response.json(repositories)
})

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repository)

  return response.json(repository)
})

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params
  const { title, url, techs } = request.body

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id,
  )

  if (repositoryIndex < 0) {
    response.status(400).json({ error: "Repository not found." })
  }

  const repository = repositories[repositoryIndex]

  const newRepository = {
    ...repository,
    title: title === undefined ? repository.title : title,
    url: url === undefined ? repository.url : url,
    techs: techs === undefined ? repository.techs : techs,
  }

  repositories[repositoryIndex] = newRepository

  return response.json(newRepository)
})

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id,
  )

  if (repositoryIndex < 0) {
    response.status(400).json({ error: "Repository not found." })
  }

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
})

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id,
  )

  if (repositoryIndex < 0) {
    response.status(400).json({ error: "Repository not found." })
  }

  repositories[repositoryIndex].likes += 1

  return response.json(repositories[repositoryIndex])
})

module.exports = app
