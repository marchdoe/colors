export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function unslugify(slug, colors) {
  const entry = Object.keys(colors).find(name => slugify(name) === slug)
  return entry ?? null
}
