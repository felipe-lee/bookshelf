import {queryCache, useMutation, useQuery} from 'react-query'

import {client} from 'utils/api-client'
import {setQueryDataForBook} from 'utils/books.exercise'

const LIST_ITEMS_QUERY_KEY = 'list-items'

const useListItems = user => {
  const {data: listItems} = useQuery({
    queryKey: LIST_ITEMS_QUERY_KEY,
    queryFn: () =>
      client('list-items', {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess: listItems => {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      },
    },
  })

  return listItems ?? []
}

const useListItem = (user, bookId) => {
  const listItems = useListItems(user)

  return listItems.find(item => item.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onError: (err, variables, recover) => {
    if (typeof recover === 'function') {
      recover()
    }
  },
  onSettled: () => queryCache.invalidateQueries(LIST_ITEMS_QUERY_KEY),
}

const useUpdateListItem = (user, mutationOptionOverrides = {}) => {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {method: 'PUT', data, token: user.token}),
    {
      ...defaultMutationOptions,
      onMutate: data => {
        const currentData = queryCache.getQueryData(LIST_ITEMS_QUERY_KEY)

        queryCache.setQueryData(LIST_ITEMS_QUERY_KEY, currentData => {
          return currentData.map(item => {
            return item.id === data.id ? {...item, ...data} : item
          })
        })

        return () => queryCache.setQueryData(LIST_ITEMS_QUERY_KEY, currentData)
      },
      ...mutationOptionOverrides,
    },
  )
}
const useRemoveListItem = (user, mutationOptionOverrides = {}) => {
  return useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token: user.token}),
    {
      ...defaultMutationOptions,
      onMutate: ({listItemId}) => {
        const currentData = queryCache.getQueryData(LIST_ITEMS_QUERY_KEY)

        queryCache.setQueryData(LIST_ITEMS_QUERY_KEY, currentData => {
          return currentData.filter(item => item.id !== listItemId)
        })

        return () => queryCache.setQueryData(LIST_ITEMS_QUERY_KEY, currentData)
      },
      ...mutationOptionOverrides,
    },
  )
}
const useCreateListItem = (user, mutationOptionOverrides = {}) => {
  return useMutation(
    ({bookId}) => client('list-items', {data: {bookId}, token: user.token}),
    {...defaultMutationOptions, ...mutationOptionOverrides},
  )
}

export {
  useListItem,
  useListItems,
  useUpdateListItem,
  useRemoveListItem,
  useCreateListItem,
}
