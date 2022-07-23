import * as React from 'react'
import {useQuery, queryCache} from 'react-query'

import bookPlaceholderSvg from 'assets/book-placeholder.svg'
import {useClient} from 'context/auth-context'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

// 🦉 note that this is *not* treated as a hook and is instead called by other hooks
// So we'll continue to accept the user here.
const getBookSearchConfig = (query, authClient) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    authClient(`books?query=${encodeURIComponent(query)}`).then(
      data => data.books,
    ),
  config: {
    onSuccess(books) {
      for (const book of books) {
        setQueryDataForBook(book)
      }
    },
  },
})

function useBookSearch(query) {
  const authClient = useClient()

  const result = useQuery(getBookSearchConfig(query, authClient))

  return {...result, books: result.data ?? loadingBooks}
}

function useBook(bookId) {
  const authClient = useClient()

  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () => authClient(`books/${bookId}`).then(data => data.book),
  })
  return data ?? loadingBook
}

const useRefetchBookSearchQuery = () => {
  const authClient = useClient()

  return React.useCallback(async () => {
    queryCache.removeQueries('bookSearch')

    await queryCache.prefetchQuery(getBookSearchConfig('', authClient))
  }, [authClient])
}

const bookQueryConfig = {
  staleTime: 1000 * 60 * 60,
  cacheTime: 1000 * 60 * 60,
}

function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book, bookQueryConfig)
}

export {useBook, useBookSearch, useRefetchBookSearchQuery, setQueryDataForBook}
