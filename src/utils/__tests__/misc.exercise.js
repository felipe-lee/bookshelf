import {formatDate} from 'utils/misc'

test('formatDate formats the date to look nice', () => {
  const date = new Date('November 23, 2022')

  expect(formatDate(date)).toBe('Nov 22')
})
