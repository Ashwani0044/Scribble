export const WORD_BANK = [
    'APPLE', 'BANANA', 'SUNFLOWER', 'BICYCLE', 'AIRPLANE', 'TELEPHONE',
    'PENGUIN', 'CAMPFIRE', 'RAINBOW', 'LIGHTHOUSE', 'MUSHROOM', 'TELESCOPE',
    'DRAGON', 'GUITAR', 'VOLCANO', 'PYRAMID', 'DOUGHNUT', 'SUBMARINE',
    'CASTLE', 'ROBOT', 'SATELLITE', 'TREASURE', 'HELICOPTER', 'GIRAFFE'
];
  
export const getRandomWords = (count = 3) => {

    const maxCount = Math.min(count, WORD_BANK.length); 
    const result = [];
    const seenIndices = new Set();
  
    while (result.length < maxCount) {
      const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
      if (!seenIndices.has(randomIndex)) {
        seenIndices.add(randomIndex);
        result.push(WORD_BANK[randomIndex]);
      }
    }
  
    return result;
};