/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import {useQuery, useMutation, queryCache} from 'react-query'

import {CircleButton, Spinner} from 'components/lib'
import * as colors from 'styles/colors'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'

function TooltipButton({label, highlight, onClick, icon, ...rest}) {
  const {isLoading, isError, error, run} = useAsync()

  function handleClick() {
    run(onClick())
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
              ? colors.danger
              : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({user, book}) {
  const LIST_ITEMS_QUERY_KEY = 'list-items'

  const {data: listItems} = useQuery({
    queryKey: LIST_ITEMS_QUERY_KEY,
    queryFn: () =>
      client('list-items', {token: user.token}).then(data => data.listItems),
  })

  const listItem = listItems?.find(item => item.bookId === book.id) ?? null

  const [update] = useMutation(
    data =>
      client(`list-items/${data.id}`, {method: 'PUT', data, token: user.token}),
    {onSettled: () => queryCache.invalidateQueries(LIST_ITEMS_QUERY_KEY)},
  )

  const [remove] = useMutation(
    ({listItemId}) =>
      client(`list-items/${listItemId}`, {method: 'DELETE', token: user.token}),
    {onSettled: () => queryCache.invalidateQueries(LIST_ITEMS_QUERY_KEY)},
  )

  const [create] = useMutation(
    ({bookId}) => client('list-items', {data: {bookId}, token: user.token}),
    {onSettled: () => queryCache.invalidateQueries(LIST_ITEMS_QUERY_KEY)},
  )

  return (
    <React.Fragment>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            highlight={colors.yellow}
            icon={<FaBook />}
            label="Unmark as read"
            onClick={() => update({id: listItem.id, finishDate: null})}
          />
        ) : (
          <TooltipButton
            highlight={colors.green}
            icon={<FaCheckCircle />}
            label="Mark as read"
            onClick={() => update({id: listItem.id, finishDate: Date.now()})}
          />
        )
      ) : null}
      {listItem ? (
        <TooltipButton
          highlight={colors.danger}
          icon={<FaMinusCircle />}
          label="Remove from list"
          onClick={() => remove({listItemId: listItem.id})}
        />
      ) : (
        <TooltipButton
          highlight={colors.indigo}
          icon={<FaPlusCircle />}
          label="Add to list"
          onClick={() => create({bookId: book.id})}
        />
      )}
    </React.Fragment>
  )
}

export {StatusButtons}
