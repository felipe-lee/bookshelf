import {queryCache, useMutation, useQuery} from 'react-query'

import {client} from 'utils/api-client'

const LIST_ITEMS_QUERY_KEY = 'list-items'

const useListItems = user => {
  const {data: listItems} = useQuery({
    queryKey: LIST_ITEMS_QUERY_KEY,
    queryFn: () =>
      client('list-items', {token: user.token}).then(data => data.listItems),
  })

  return listItems ?? []
}

const useListItem = (user, bookId) => {
  const listItems = useListItems(user)

  return listItems.find(item => item.bookId === bookId) ?? null
}

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries(LIST_ITEMS_QUERY_KEY),
}

const useUpdateListItem = user => {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {method: 'PUT', data, token: user.token}),
    defaultMutationOptions,
  )
}
const useRemoveListItem = user => {
  return useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token: user.token}),
    defaultMutationOptions,
  )
}
const useCreateListItem = user => {
  return useMutation(
    ({bookId}) => client('list-items', {data: {bookId}, token: user.token}),
    defaultMutationOptions,
  )
}

export {
  useListItem,
  useListItems,
  useUpdateListItem,
  useRemoveListItem,
  useCreateListItem,
}
