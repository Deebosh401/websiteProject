import type { Attraction } from '../Data'

// Intelligent search function with fuzzy matching and synonyms
export function intelligentSearch(attraction: Attraction, query: string): boolean {
  if (!query) return true
  
  const searchFields = [
    attraction.name || '',
    attraction.description || '',
    ...(attraction.categories || []),
    attraction.location || '',
    attraction.meetingPoint || '',
    attraction.endPoint || ''
  ].map(field => field.toLowerCase())
  
  const searchText = searchFields.join(' ')
  
  // Direct match (highest priority)
  if (searchText.includes(query)) {
    return true
  }
  
  // Fuzzy matching for misspellings
  if (fuzzyMatch(query, searchText)) {
    return true
  }
  
  // Synonym and related term matching
  if (synonymMatch(query, searchText)) {
    return true
  }
  
  // Natural language query handling
  if (naturalLanguageMatch(query, searchText)) {
    return true
  }
  
  return false
}

// Generic intelligent search for any text content
export function intelligentTextSearch(text: string, query: string): boolean {
  if (!query) return true
  
  const searchText = text.toLowerCase()
  
  // Direct match (highest priority)
  if (searchText.includes(query)) {
    return true
  }
  
  // Fuzzy matching for misspellings
  if (fuzzyMatch(query, searchText)) {
    return true
  }
  
  // Synonym and related term matching
  if (synonymMatch(query, searchText)) {
    return true
  }
  
  // Natural language query handling
  if (naturalLanguageMatch(query, searchText)) {
    return true
  }
  
  return false
}

// Fuzzy matching function (Levenshtein distance based)
function fuzzyMatch(query: string, text: string): boolean {
  const words = text.split(/\s+/)
  const queryWords = query.split(/\s+/)
  
  for (const queryWord of queryWords) {
    for (const word of words) {
      if (word.length < 3) continue // Skip very short words
      
      // Check if words are similar (allowing for 1-2 character differences)
      const distance = levenshteinDistance(queryWord, word)
      const maxDistance = Math.max(1, Math.floor(queryWord.length * 0.3))
      
      if (distance <= maxDistance) {
        return true
      }
    }
  }
  
  return false
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Synonym and related term matching
function synonymMatch(query: string, text: string): boolean {
  const synonyms: Record<string, string[]> = {
    // Food related
    'ресторан': ['кафе', 'бар', 'пиццерия', 'столовая', 'еда', 'кухня', 'питание'],
    'кафе': ['ресторан', 'бар', 'кофейня', 'еда', 'напитки'],
    'бар': ['ресторан', 'кафе', 'паб', 'напитки', 'алкоголь'],
    'еда': ['ресторан', 'кафе', 'бар', 'пища', 'кухня', 'питание'],
    
    // Entertainment
    'кино': ['фильм', 'кинотеатр', 'сеанс', 'премьера'],
    'театр': ['спектакль', 'представление', 'драма', 'комедия'],
    'концерт': ['музыка', 'выступление', 'группа', 'певец'],
    'выставка': ['музей', 'галерея', 'искусство', 'экспозиция'],
    
    // Activities
    'экскурсия': ['тур', 'прогулка', 'осмотр', 'достопримечательности'],
    'прогулка': ['экскурсия', 'тур', 'пешком', 'пройтись'],
    'активный': ['спорт', 'фитнес', 'тренировка', 'движение'],
    'отдых': ['релакс', 'покой', 'спокойствие', 'расслабление'],
    
    // Places
    'замок': ['крепость', 'дворец', 'форт', 'цитадель'],
    'музей': ['галерея', 'выставка', 'коллекция', 'экспозиция'],
    'парк': ['сад', 'сквер', 'аллея', 'природа'],
    'церковь': ['храм', 'собор', 'монастырь', 'святыня'],
    
    // Time related
    'старый': ['древний', 'исторический', 'античный', 'ветхий'],
    'новый': ['современный', 'актуальный', 'свежий'],
    'исторический': ['старый', 'древний', 'памятник', 'история'],
    
    // Size/type
    'большой': ['крупный', 'огромный', 'масштабный'],
    'маленький': ['небольшой', 'компактный', 'миниатюрный'],
    'красивый': ['прекрасный', 'великолепный', 'очаровательный'],
    
    // People/Guides
    'гид': ['экскурсовод', 'проводник', 'сопровождающий', 'наставник'],
    'экскурсовод': ['гид', 'проводник', 'сопровождающий'],
    'проводник': ['гид', 'экскурсовод', 'сопровождающий'],
    
    // Cities/Locations
    'калининград': ['калининград', 'калининградская', 'кенигсберг'],
    'кенигсберг': ['калининград', 'калининградская', 'кенигсберг'],
    'черняховск': ['черняховск', 'инстербург'],
    'инстербург': ['черняховск', 'инстербург'],
    'советск': ['советск', 'тильзит'],
    'тильзит': ['советск', 'тильзит'],
    'багратионовск': ['багратионовск', 'пройсиш-эйлау'],
    'пройсиш-эйлау': ['багратионовск', 'пройсиш-эйлау'],
    'гвардейск': ['гвардейск', 'тапиау'],
    'тапиау': ['гвардейск', 'тапиау'],
    'полесск': ['полесск', 'лабиау'],
    'лабиау': ['полесск', 'лабиау'],
    'светлогорск': ['светлогорск', 'раушен'],
    'раушен': ['светлогорск', 'раушен'],
    'зеленоградск': ['зеленоградск', 'кранц'],
    'кранц': ['зеленоградск', 'кранц'],
    
    // Events
    'событие': ['мероприятие', 'акция', 'встреча'],
    'мероприятие': ['событие', 'акция', 'встреча'],
    
    // Travel/Trips
    'путешествие': ['поездка', 'тур', 'вояж'],
    'поездка': ['путешествие', 'тур', 'вояж'],
    'тур': ['путешествие', 'поездка', 'экскурсия', 'вояж']
  }
  
  const queryWords = query.split(/\s+/)
  
  for (const queryWord of queryWords) {
    if (synonyms[queryWord]) {
      for (const synonym of synonyms[queryWord]) {
        if (text.includes(synonym)) {
          return true
        }
      }
    }
    
    // Check reverse synonyms
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(queryWord) && text.includes(key)) {
        return true
      }
    }
  }
  
  return false
}

// Natural language query handling
function naturalLanguageMatch(query: string, text: string): boolean {
  // Handle queries like "an old castle" or "something to eat"
  const naturalPatterns = [
    // "something to [verb]" patterns
    { pattern: /что-то\s+для?\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /что-то\s+чтобы\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /где\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /как\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    
    // "old/new/big/small [noun]" patterns
    { pattern: /(старый|новый|большой|маленький|красивый)\s+(\w+)/, extract: (match: RegExpMatchArray) => match[2] },
    
    // "I don't remember" patterns - extract context words
    { pattern: /не\s+помню\s+как\s+называется/, extract: () => 'название' },
    { pattern: /забыл\s+название/, extract: () => 'название' },
    
    // Guide/people related patterns
    { pattern: /кто\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /гид\s+по\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    
    // Event related patterns
    { pattern: /когда\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /где\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    
    // Location-based patterns - "X в Y" or "X в городе Y"
    { pattern: /(\w+)\s+в\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /(\w+)\s+в\s+городе\s+(\w+)/, extract: (match: RegExpMatchArray) => match[1] },
    { pattern: /(\w+)\s+в\s+(\w+)\s+городе/, extract: (match: RegExpMatchArray) => match[1] },
    
    // "What to see in X" patterns
    { pattern: /что\s+посмотреть\s+в\s+(\w+)/, extract: () => 'достопримечательности' },
    { pattern: /что\s+посетить\s+в\s+(\w+)/, extract: () => 'достопримечательности' },
    { pattern: /куда\s+сходить\s+в\s+(\w+)/, extract: () => 'развлечения' }
  ]
  
  for (const { pattern, extract } of naturalPatterns) {
    const match = query.match(pattern)
    if (match) {
      const extractedWord = extract(match)
      if (extractedWord && text.includes(extractedWord)) {
        return true
      }
    }
  }
  
  // Handle partial word matches for common words
  const commonWords = [
    'замок', 'музей', 'парк', 'ресторан', 'кафе', 'театр', 'кино', 'экскурсия',
    'гид', 'проводник', 'экскурсовод', 'событие', 'мероприятие', 'концерт',
    'путешествие', 'поездка', 'тур', 'город', 'место', 'достопримечательность',
    'крепость', 'дворец', 'собор', 'церковь', 'монастырь', 'памятник',
    'галерея', 'выставка', 'кинотеатр', 'концертный зал', 'стадион',
    'зоопарк', 'аквапарк', 'развлекательный центр', 'торговый центр'
  ]
  
  for (const word of commonWords) {
    if (query.includes(word.substring(0, 3)) && text.includes(word)) {
      return true
    }
  }
  
  return false
}
