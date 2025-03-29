
export const convertToLeetSpeak = (text: string): string => {
  if (!text) return "";
  
  const leetMap: Record<string, string> = {
    a: "@",
    b: "8",
    c: "(",
    d: "D",
    e: "3",
    f: "F",
    g: "6",
    h: "H",
    i: "1",
    j: "J",
    k: "K",
    l: "L",
    m: "M",
    n: "N",
    o: "0",
    p: "P",
    q: "Q",
    r: "R",
    s: "5",
    t: "7",
    u: "U",
    v: "V",
    w: "W",
    x: "X",
    y: "Y",
    z: "Z"
  };

  return text
    .split("")
    .map(char => {
      // Randomly decide whether to convert this character (70% chance)
      const shouldConvert = Math.random() < 0.7;
      if (!shouldConvert) return char;
      
      const lowerChar = char.toLowerCase();
      return leetMap[lowerChar] || char;
    })
    .join("");
};

// Function to create a mixed password with text + random characters
export const createMixedPassword = (
  baseText: string, 
  length: number, 
  includeLowercase: boolean, 
  includeUppercase: boolean, 
  includeNumbers: boolean, 
  includeSymbols: boolean,
  excludeAmbiguous: boolean
): string => {
  if (!baseText) return "";
  
  // Convert base text to leet speak
  const leetText = convertToLeetSpeak(baseText);
  
  // If the leet text is already long enough, return it truncated
  if (leetText.length >= length) {
    return leetText.substring(0, length);
  }
  
  // We need to add some random characters
  const charsToAdd = length - leetText.length;
  
  // Build character set for random part
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+";
  const ambiguousChars = "iIl1Lo0O";
  
  let availableChars = "";
  
  if (includeLowercase) availableChars += lowercaseChars;
  if (includeUppercase) availableChars += uppercaseChars;
  if (includeNumbers) availableChars += numberChars;
  if (includeSymbols) availableChars += symbolChars;
  
  // Remove ambiguous characters if option is selected
  if (excludeAmbiguous) {
    for (const char of ambiguousChars) {
      availableChars = availableChars.replace(char, "");
    }
  }
  
  // Default to alphanumeric if nothing is selected
  if (!availableChars) {
    availableChars = lowercaseChars + uppercaseChars + numberChars;
  }
  
  // Generate random part
  let randomPart = "";
  for (let i = 0; i < charsToAdd; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    randomPart += availableChars[randomIndex];
  }
  
  // Return combined password
  return leetText + randomPart;
};
