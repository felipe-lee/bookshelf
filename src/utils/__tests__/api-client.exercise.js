import {server, rest} from 'test/server'
import {client} from 'utils/api-client'

beforeAll(() => server.listen())

afterAll(() => server.close())

afterEach(() => server.resetHandlers())

const apiURL = process.env.REACT_APP_API_URL

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const response = await client(endpoint)

  expect(response).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const fakeToken = 'superSecureToken'
  let request
  const endpoint = 'test-endpoint'

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('hi'))
    }),
  )

  await client(endpoint, {token: fakeToken})

  expect(request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`)
})

test('allows for config overrides', async () => {
  const customHeader = 'Awesome-Header'
  const headerValue = 'Secret sauce'

  const customConfig = {
    method: 'POST',
    headers: {[customHeader]: headerValue},
  }

  let request
  const endpoint = 'test-endpoint'

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('hi'))
    }),
  )

  await client(endpoint, customConfig)

  expect(request.headers.get(customHeader)).toBe(headerValue)
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const data = {
    name: 'Bobby Tables',
  }

  let request
  const endpoint = 'test-endpoint'

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('You deleted all our records!'))
    }),
  )

  await client(endpoint, {data})

  expect(request.body).toEqual(data)
})
