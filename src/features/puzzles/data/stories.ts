import type { Puzzle } from '../types'

/** Short stories read out to the room; the answer hides in a detail of the story. */
export const STORIES: Puzzle[] = [
  // Easy
  {
    type: 'story',
    level: 'easy',
    story:
      'Mrs Kapoor came home at lunchtime to find her kitchen window smashed. She called the three children from next door over and said, “Someone broke my kitchen window this morning.” Arjun said, “I was at the dentist all morning.” Leila said, “I was helping Dad wash the car.” Sam said, “Well, it wasn’t my cricket ball!”',
    q: 'Who broke the window?',
    options: ['Arjun', 'Leila', 'Sam'],
    answerIndex: 2,
    emoji: '🏏',
    why: 'Mrs Kapoor never said how the window was broken. Only the person who did it would know it was a cricket ball.',
    hint: 'Listen to exactly what Mrs Kapoor told them.',
  },
  {
    type: 'story',
    level: 'easy',
    story:
      'Grandma baked a chocolate cake and cut it into 8 equal slices. Dad ate 2 slices, the twins ate 1 slice each, and while nobody was looking the dog pinched another slice off the table. To make what was left go further, Grandma cut every remaining slice in half.',
    q: 'How many pieces of cake were left?',
    answer: '6 pieces',
    emoji: '🎂',
    why: '8 − 2 − 2 − 1 = 3 slices left, and cutting each in half makes 6 pieces.',
    hint: 'Count the slices first, then halve them.',
  },
  {
    type: 'story',
    level: 'easy',
    story:
      'On a freezing January morning, Leo built a snowman in the garden. He gave it a carrot nose, two lumps of coal for eyes and his dad’s old striped scarf. A week later the sun came out and stayed out for days. When Leo went back, the carrot, the coal and the scarf were lying on a wet patch of grass, and the snowman was gone.',
    q: 'Who took the snowman?',
    answer: 'Nobody — it melted',
    emoji: '⛄',
    why: 'Days of sunshine turned the snowman into the wet patch, leaving only the things that don’t melt.',
    hint: 'What does a week of sunshine do to snow?',
  },
  {
    type: 'story',
    level: 'easy',
    story:
      'Priya caught the 9:15 train to the seaside. The journey is timetabled to take 2 hours and 30 minutes, but the train arrived 20 minutes late. From the station, Priya walked for 10 minutes to reach the beach.',
    q: 'What time did Priya reach the beach?',
    options: ['11:55', '12:05', '12:15', '12:25'],
    answerIndex: 2,
    emoji: '🏖️',
    why: '9:15 + 2 h 30 min = 11:45. Twenty minutes late makes 12:05, and the 10-minute walk makes 12:15.',
    hint: 'Add one step at a time.',
  },
  // Medium
  {
    type: 'story',
    level: 'medium',
    story:
      'Detective Rao arrived at the old house on the hottest afternoon of July. The butler said, “I brought Mr Fernandes a glass of iced lemonade two hours ago, and I haven’t been back in the study since.” On the desk sat the glass, still full, with sharp-edged ice cubes floating at the top.',
    q: 'Why did Detective Rao know the butler was lying?',
    answer: 'The ice hadn’t melted',
    emoji: '🧊',
    why: 'On a scorching day, ice cubes would have melted long before two hours were up. The drink had been poured only minutes earlier.',
    hint: 'Look closely at what’s in the glass.',
  },
  {
    type: 'story',
    level: 'medium',
    story:
      'Four friends, Ana, Ben, Cara and Dev, sat in a row at the cinema. Cara sat in the seat at the far left. Ana sat next to Ben. Ben sat next to Dev. Dev did not sit next to Cara.',
    q: 'Who sat in the second seat from the left?',
    options: ['Ana', 'Ben', 'Cara', 'Dev'],
    answerIndex: 0,
    emoji: '🍿',
    why: 'Cara is in seat 1, so Dev must be in seat 3 or 4. If Dev were in seat 3, Ana and Ben would be in seats 2 and 4, which aren’t next to each other. So Dev is in seat 4, Ben (next to Dev) in seat 3, and Ana in seat 2.',
    hint: 'Start with Cara, then work out where Dev can go.',
  },
  {
    type: 'story',
    level: 'medium',
    story:
      'Zoe sent her gran a postcard: “Greetings from Sydney! It’s Christmas Day and we spent the morning building snowmen on Bondi Beach. Then we came inside for a roast dinner to warm up. Wish you were here! Love, Zoe.”',
    q: 'Why does Gran think Zoe made the postcard up?',
    answer: 'December is summer in Australia',
    emoji: '☀️',
    why: 'Christmas falls in the middle of the Australian summer. Sydney doesn’t get snow, let alone on Bondi Beach.',
    hint: 'Think about the seasons in the southern hemisphere.',
  },
  {
    type: 'story',
    level: 'medium',
    story:
      'A farmer had 17 sheep. One night a storm blew down the fence, and all but 9 of them ran away. The next morning, the farmer went to market and bought twice as many sheep as he had left.',
    q: 'How many sheep does the farmer have now?',
    options: ['16', '24', '27', '34'],
    answerIndex: 2,
    emoji: '🐑',
    why: '“All but 9 ran away” means 9 stayed. He bought twice that, 18 more, so he has 9 + 18 = 27.',
    hint: 'Read “all but 9” carefully.',
  },
  // Hard
  {
    type: 'story',
    level: 'hard',
    story:
      'In the depths of winter, Mr Grey was found knocked out cold in his study. The windows were locked from the inside, the door was bolted, and the fire had long since gone out. The police searched every inch of the room but found no weapon, only a small puddle of water on the floor beside him.',
    q: 'What was he hit with?',
    answer: 'An icicle',
    emoji: '🧊',
    why: 'The icicle melted in the warm room, leaving nothing behind but the puddle.',
    hint: 'The weapon is still in the room, just not in the same form.',
  },
  {
    type: 'story',
    level: 'hard',
    story:
      'Mum came back to find the biscuit tin empty and asked her three sons who had eaten the last biscuit. Adam said, “Ben ate it.” Ben said, “Adam is lying.” Charlie said, “I didn’t eat it.” Mum knows her boys well, and she can tell that exactly one of them is telling the truth.',
    q: 'Who ate the last biscuit?',
    options: ['Adam', 'Ben', 'Charlie'],
    answerIndex: 2,
    emoji: '🍪',
    why: 'Adam and Ben contradict each other, so one of them must be the truthful one. That means Charlie is lying, so Charlie ate it. Check: Adam’s claim is false, Ben’s is true, and Charlie’s is false, which is exactly one truth.',
    hint: 'Two of the statements can’t both be true or both be false.',
  },
  {
    type: 'story',
    level: 'hard',
    story:
      'At the summer garden party, Ruby gulped down five glasses of iced fruit punch in ten minutes and then ran off to dance. Her sister Nell sipped a single glass slowly all afternoon in the shade. That evening Nell felt terribly ill, but Ruby was absolutely fine, even though both glasses were filled from the same bowl.',
    q: 'How can that be?',
    answer: 'The ice was bad',
    emoji: '🍹',
    why: 'The ice cubes were made with bad water. Ruby drank her glasses before the ice could melt, but Nell’s ice melted slowly into her drink all afternoon.',
    hint: 'What was different about how fast they drank?',
  },
  {
    type: 'story',
    level: 'hard',
    story:
      'Mr Lim lives on the 10th floor of a tall block of flats. Every morning he takes the lift all the way down to the ground floor. Every evening he takes the lift up to the 7th floor and walks up the last three flights of stairs. On rainy days, though, he rides the lift all the way to the 10th floor.',
    q: 'Why?',
    answer: 'He is too short to reach the button for floor 10',
    emoji: '☔',
    why: 'He can only reach as high as the 7th-floor button. On rainy days he carries an umbrella, which he uses to press 10.',
    hint: 'What does he have with him only when it rains?',
  },
]
