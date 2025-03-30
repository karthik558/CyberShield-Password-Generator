
// Common consonant and vowel patterns
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonantPairs = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'ph', 'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr'];
const vowelPairs = ['ai', 'ay', 'ea', 'ee', 'ei', 'ie', 'oa', 'oo', 'ou', 'ui'];

// Get a random item from an array
const getRandomItem = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

// Capitalize the first letter of a string
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate a pronounceable syllable
const generateSyllable = (): string => {
  // Various syllable patterns
  const patterns = [
    // CV (consonant-vowel)
    () => getRandomItem(consonants) + getRandomItem(vowels),
    // CVC (consonant-vowel-consonant)
    () => getRandomItem(consonants) + getRandomItem(vowels) + getRandomItem(consonants),
    // VC (vowel-consonant)
    () => getRandomItem(vowels) + getRandomItem(consonants),
    // CCV (consonant pair-vowel)
    () => getRandomItem(consonantPairs) + getRandomItem(vowels),
    // VCC (vowel-consonant pair)
    () => getRandomItem(vowels) + getRandomItem(consonantPairs),
    // CVCC (consonant-vowel-consonant pair)
    () => getRandomItem(consonants) + getRandomItem(vowels) + getRandomItem(consonantPairs),
    // CCVC (consonant pair-vowel-consonant)
    () => getRandomItem(consonantPairs) + getRandomItem(vowels) + getRandomItem(consonants),
    // VV (vowel pair)
    () => getRandomItem(vowelPairs),
  ];

  return getRandomItem(patterns)();
};

// Add numbers and special characters to make the password more secure
const addComplexity = (
  word: string, 
  length: number,
  includeNumbers: boolean,
  includeSymbols: boolean,
  includeUppercase: boolean
): string => {
  let result = word;
  
  // Add uppercase if needed
  if (includeUppercase) {
    result = capitalize(result);
  }
  
  // Add numbers and symbols until we reach the desired length
  const numbersSet = '0123456789';
  const symbolsSet = '!@#$%^&*()-_=+';
  
  while (result.length < length) {
    if (includeNumbers && includeSymbols) {
      // Alternate between numbers and symbols
      if (Math.random() > 0.5) {
        result += numbersSet.charAt(Math.floor(Math.random() * numbersSet.length));
      } else {
        result += symbolsSet.charAt(Math.floor(Math.random() * symbolsSet.length));
      }
    } else if (includeNumbers) {
      result += numbersSet.charAt(Math.floor(Math.random() * numbersSet.length));
    } else if (includeSymbols) {
      result += symbolsSet.charAt(Math.floor(Math.random() * symbolsSet.length));
    } else {
      // If no numbers or symbols are allowed, add another syllable
      result += generateSyllable();
    }
  }
  
  // Trim to exact length if it's longer
  if (result.length > length) {
    result = result.slice(0, length);
  }
  
  return result;
};

// Main function to generate a pronounceable password
export const generatePronounceablePassword = (
  length: number,
  includeUppercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string => {
  // Start with an empty password
  let password = '';
  
  // Generate syllables until we reach at least 2/3 of the desired length
  while (password.length < Math.ceil(length * 0.66)) {
    password += generateSyllable();
  }
  
  // Add complexity to reach the exact length
  return addComplexity(
    password,
    length,
    includeNumbers,
    includeSymbols,
    includeUppercase
  );
};
