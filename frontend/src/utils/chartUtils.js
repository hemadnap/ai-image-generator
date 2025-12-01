/**
 * D3 Chart utilities
 */
export const generateChartColors = (count = 10) => {
  const colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ]
  return colors.slice(0, count)
}

export const formatChartData = (rawData, keyField, valueField) => {
  if (!Array.isArray(rawData)) return []
  return rawData.map((item) => ({
    key: item[keyField],
    value: item[valueField],
  }))
}

export const groupByField = (data, field) => {
  return data.reduce((acc, item) => {
    const key = item[field]
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})
}

export const aggregateData = (data, groupBy, aggregateField, aggregateType = 'sum') => {
  const grouped = groupByField(data, groupBy)
  const result = []

  for (const [key, items] of Object.entries(grouped)) {
    let value
    const values = items.map((item) => item[aggregateField])

    switch (aggregateType) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0)
        break
      case 'avg':
        value = values.reduce((a, b) => a + b, 0) / values.length
        break
      case 'max':
        value = Math.max(...values)
        break
      case 'min':
        value = Math.min(...values)
        break
      case 'count':
        value = values.length
        break
      default:
        value = values.reduce((a, b) => a + b, 0)
    }

    result.push({ key, value })
  }

  return result
}
