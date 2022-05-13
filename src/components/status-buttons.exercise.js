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

import {CircleButton, Spinner} from 'components/lib'
import * as colors from 'styles/colors'
import {useAsync} from 'utils/hooks'
import {
  useCreateListItem,
  useListItem,
  useRemoveListItem,
  useUpdateListItem,
} from 'utils/list-items'

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
  const listItem = useListItem(user, book.id)

  const [update] = useUpdateListItem(user)
  const [remove] = useRemoveListItem(user)
  const [create] = useCreateListItem(user)

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
