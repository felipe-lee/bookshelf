import {queryCache, useQuery} from 'react-query'

import bookPlaceholderSvg from 'assets/book-placeholder.svg'
import {client} from 'utils/api-client'

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

const useBook = (bookId, user) => {
  const BOOK_QUERY_KEY = ['book', {bookId}]

  const {data: book = loadingBook} = useQuery({
    queryKey: BOOK_QUERY_KEY,
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })

  return book
}

const BASE_BOOK_SEARCH_QUERY_KEY = 'bookSearch'

const getQueryOptionsToSearchForBooks = (query, user) => {
  const bookSearchQueryKey = [BASE_BOOK_SEARCH_QUERY_KEY, {query}]

  return {
    queryKey: bookSearchQueryKey,
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
  }
}

const useBookSearch = (query, user) => {
  const queryOptions = getQueryOptionsToSearchForBooks(query, user)

  const result = useQuery(queryOptions)

  return {...result, books: result.data ?? loadingBooks}
}

const refetchBookSearchQuery = async user => {
  const queryOptions = getQueryOptionsToSearchForBooks('', user)

  queryCache.removeQueries(BASE_BOOK_SEARCH_QUERY_KEY)

  await queryCache.prefetchQuery(queryOptions)
}

export {refetchBookSearchQuery, useBook, useBookSearch}
