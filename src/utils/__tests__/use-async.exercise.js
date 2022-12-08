import {renderHook, act} from '@testing-library/react'

import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

// deferred - allows resolving or rejecting promises whenever desired
//   Usage:
//
//    const {promise, resolve} = deferred()
//    promise.then(() => console.log('resolved'))
//    // do stuff/make assertions you want to before calling resolve
//    resolve()
//    await promise
//    // do stuff/make assertions you want to after the promise has resolved
function deferred() {
  let resolve, reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return {promise, resolve, reject}
}

const defaultResult = {
  data: null,
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  reset: expect.any(Function),
  run: expect.any(Function),
  setData: expect.any(Function),
  setError: expect.any(Function),
  status: 'idle',
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()

  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual(defaultResult)

  await act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    isIdle: false,
    isLoading: true,
    status: 'pending',
  })

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    await resolve(resolvedValue)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    data: resolvedValue,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
  })

  await act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(defaultResult)
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()

  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual(defaultResult)

  await act(() => {
    result.current.run(promise).catch(() => {})
  })

  expect(result.current).toEqual({
    ...defaultResult,
    isIdle: false,
    isLoading: true,
    status: 'pending',
  })

  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    await reject(rejectedValue)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    error: rejectedValue,
    isIdle: false,
    isError: true,
    status: 'rejected',
  })

  await act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(defaultResult)
})

test('can specify an initial state', async () => {
  const error = Symbol('error')
  const customInitialOverrides = {
    error: error,
    isError: true,
    isIdle: false,
    status: 'rejected',
  }

  const {result} = renderHook(() => useAsync(customInitialOverrides))

  const customInitialState = {
    ...defaultResult,
    ...customInitialOverrides,
  }

  expect(result.current).toEqual(customInitialState)

  const {promise, resolve} = deferred()

  await act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual({
    ...customInitialState,
    isError: false,
    isIdle: false,
    isLoading: true,
    status: 'pending',
  })

  await act(async () => {
    await resolve()
  })

  expect(result.current).toEqual({
    ...customInitialState,
    isError: false,
    data: undefined,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
  })

  await act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(customInitialState)
})

test('can set the data', async () => {
  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual(defaultResult)

  const data = Symbol('mock data')

  await act(() => {
    result.current.setData(data)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    data,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
  })
})

test('can set the error', async () => {
  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual(defaultResult)

  const error = Symbol('mock error')

  await act(() => {
    result.current.setError(error)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    error,
    isError: true,
    isIdle: false,
    status: 'rejected',
  })
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())

  expect(result.current).toEqual(defaultResult)

  await act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual({
    ...defaultResult,
    isIdle: false,
    isLoading: true,
    status: 'pending',
  })

  unmount()

  await act(async () => {
    await resolve()
  })

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())

  expect(() => result.current.run('')).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
