import { describe, it, expect } from 'vitest'
import { validateEmail, truncateString, formatCurrency } from '@/utils/stringUtils'
import { formatDate, isValidDate, addDays, formatDateRange } from '@/utils/dateUtils'

describe('String Utils', () => {
  it('formats email validation', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  it('truncates strings correctly', () => {
    expect(truncateString('Hello World', 5)).toBe('Hello...')
    expect(truncateString('Hi', 5)).toBe('Hi')
    expect(truncateString('Test String', 4)).toBe('Test...')
  })

  it('formats currency', () => {
    const formatted = formatCurrency(100)
    expect(formatted).toContain('100')
  })

  it('formats date', () => {
    const date = new Date('2025-01-15')
    const formatted = formatDate(date)
    expect(formatted).toBeDefined()
    expect(formatted.length).toBeGreaterThan(0)
  })
})

describe('Date Utils', () => {
  it('validates dates', () => {
    expect(isValidDate(new Date())).toBe(true)
    expect(isValidDate(new Date('invalid'))).toBe(false)
    expect(isValidDate(null)).toBe(false)
  })

  it('adds days to date', () => {
    const startDate = new Date('2025-01-15')
    const resultDate = addDays(startDate, 5)
    
    expect(resultDate.getDate()).toBe(20)
  })

  it('formats date range', () => {
    const startDate = new Date('2025-01-15')
    const endDate = new Date('2025-01-20')
    
    const range = formatDateRange(startDate, endDate)
    expect(range).toBeDefined()
    expect(range.length).toBeGreaterThan(0)
  })

  it('handles edge cases', () => {
    const date = new Date('2025-01-31')
    const result = addDays(date, 1)
    
    expect(result.getMonth()).toBe(1) // February
  })
})
