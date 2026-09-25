export default function acronym(name = '') {
    const shortName = name.match(/\b(\w)/g)
    return shortName ? shortName.join('') : name
}
