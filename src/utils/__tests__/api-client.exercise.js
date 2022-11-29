import * as auth from 'auth-provider'
import {queryCache} from 'react-query'

import {server, rest} from 'test/server'
import {client} from 'utils/api-client'

jest.mock('react-query', () => {
  return {
    ...jest.requireActual('react-query'),
    queryCache: {
      clear: jest.fn().mockName('mockClear'),
    },
  }
})

jest.mock('auth-provider', () => {
  return {
    ...jest.requireActual('auth-provider'),
    logout: jest.fn().mockName('mockLogout'),
  }
})

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

test('automatically logs out and clears cache if response is a 401', async () => {
  const data = {
    name: 'Bobby Tables',
  }

  const endpoint = 'test-endpoint'

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({message: 'You need to log in for this!'}),
      )
    }),
  )

  const response = await client(endpoint, {data}).catch(e => e)

  expect(response.message).toMatchInlineSnapshot(`"Please re-authenticate."`)

  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(auth.logout).toHaveBeenCalledTimes(1)
})

test('if the response is not successful, then we get the error back', async () => {
  const data = {
    name: 'Bobby Tables',
  }

  const errPayload = {message: 'That name would delete everything!'}

  const endpoint = 'test-endpoint'

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(400), ctx.json(errPayload))
    }),
  )

  await expect(client(endpoint, {data})).rejects.toEqual(errPayload)
})
