// Demo data generator utility with different user profiles

// Session data interface
export interface DemoSession {
  id: string;
  date: string;
  strain: string;
  method: string;
  duration: string;
  rating: number;
  notes?: string;
  preMood?: number;
  postMood?: number;
}

// Strain data interface
export interface DemoStrain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thcContent: string;
  cbdContent: string;
  quantity: string;
  rating: number;
  effects?: string[];
  notes?: string;
}

// Profile summaries
export interface DemoProfileSummary {
  sessions: {
    count: number;
    last: string;
  };
  strains: {
    count: number;
    favorite: string;
  };
  mood: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Sample strain names
const strainNames = [
  'Blue Dream', 'Northern Lights', 'Sour Diesel', 'Girl Scout Cookies', 'OG Kush',
  'Purple Haze', 'White Widow', 'Pineapple Express', 'AK-47', 'Jack Herer',
  'Granddaddy Purple', 'Durban Poison', 'Super Lemon Haze', 'Wedding Cake', 'Gelato',
  'Gorilla Glue', 'Skywalker OG', 'Amnesia Haze', 'Bubba Kush', 'Purple Punch'
];

// Consumption methods
const methods = ['Vaporizer', 'Joint', 'Pipe', 'Bong', 'Edible', 'Tincture', 'Dab'];

// Session durations
const durations = ['15 min', '20 min', '30 min', '45 min', '1 hr', '1.5 hrs', '2 hrs', '3+ hrs'];

// Generate a random date within the last X days
const getRandomRecentDate = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
};

// Generate random strains based on profile
const generateStrains = (profile: 'light' | 'average' | 'heavy'): DemoStrain[] => {
  let count: number;
  
  switch(profile) {
    case 'light':
      count = 2 + Math.floor(Math.random() * 3); // 2-4 strains
      break;
    case 'average':
      count = 5 + Math.floor(Math.random() * 4); // 5-8 strains
      break;
    case 'heavy':
      count = 8 + Math.floor(Math.random() * 7); // 8-14 strains
      break;
  }
  
  const selectedStrains: DemoStrain[] = [];
  
  // Ensure no duplicates
  const shuffledStrains = [...strainNames].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < Math.min(count, shuffledStrains.length); i++) {
    const type = ['Indica', 'Sativa', 'Hybrid'][Math.floor(Math.random() * 3)] as 'Indica' | 'Sativa' | 'Hybrid';
    const thcContent = profile === 'light' 
      ? (10 + Math.floor(Math.random() * 8)) + '%'  // 10-17%
      : profile === 'average' 
        ? (15 + Math.floor(Math.random() * 10)) + '%'  // 15-24%
        : (20 + Math.floor(Math.random() * 10)) + '%'; // 20-29%
    
    const cbdContent = (Math.random() * 2).toFixed(1) + '%';
    
    const quantities = profile === 'light' 
      ? ['1g', '2g', '3.5g']
      : profile === 'average'
        ? ['1g', '3.5g', '7g']
        : ['3.5g', '7g', '14g', '28g'];
    
    const quantity = quantities[Math.floor(Math.random() * quantities.length)];
    
    const rating = profile === 'light' 
      ? 5 + Math.floor(Math.random() * 4)  // 5-8
      : profile === 'average' 
        ? 6 + Math.floor(Math.random() * 4)  // 6-9
        : 7 + Math.floor(Math.random() * 4); // 7-10
        
    const effects = ['Relaxing', 'Energizing', 'Uplifting', 'Sleepy', 'Creative', 'Focused', 'Euphoric', 'Pain Relief'];
    const selectedEffects = effects
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 3)); // 2-4 effects
    
    selectedStrains.push({
      id: `strain-${i + 1}`,
      name: shuffledStrains[i],
      type,
      thcContent,
      cbdContent,
      quantity,
      rating,
      effects: selectedEffects,
      notes: Math.random() > 0.5 ? 'Sample note about this strain.' : undefined
    });
  }
  
  return selectedStrains;
};

// Generate random sessions based on profile
const generateSessions = (profile: 'light' | 'average' | 'heavy', strains: DemoStrain[]): DemoSession[] => {
  if (strains.length === 0) return [];
  
  let sessionsPerWeek: number;
  let weeksOfHistory: number;
  
  switch(profile) {
    case 'light':
      sessionsPerWeek = 1 + Math.floor(Math.random() * 2); // 1-2 sessions per week
      weeksOfHistory = 3 + Math.floor(Math.random() * 3); // 3-5 weeks
      break;
    case 'average':
      sessionsPerWeek = 3 + Math.floor(Math.random() * 3); // 3-5 sessions per week
      weeksOfHistory = 6 + Math.floor(Math.random() * 4); // 6-9 weeks
      break;
    case 'heavy':
      sessionsPerWeek = 7 + Math.floor(Math.random() * 7); // 7-13 sessions per week
      weeksOfHistory = 8 + Math.floor(Math.random() * 8); // 8-15 weeks
      break;
  }
  
  const totalSessions = Math.floor(sessionsPerWeek * weeksOfHistory * (0.8 + Math.random() * 0.4)); // Randomize slightly
  const sessions: DemoSession[] = [];
  
  for (let i = 0; i < totalSessions; i++) {
    const strainIndex = Math.floor(Math.random() * strains.length);
    const strain = strains[strainIndex];
    
    // Bias towards more recent dates
    const daysBack = weeksOfHistory * 7 * (Math.random() * 0.8 + 0.2); 
    
    const preMood = 3 + Math.floor(Math.random() * 4); // 3-6
    const moodImprovement = profile === 'light' ? 1 : profile === 'average' ? 2 : 3;
    const postMood = Math.min(10, preMood + moodImprovement + Math.floor(Math.random() * 2));
    
    sessions.push({
      id: `session-${i + 1}`,
      date: getRandomRecentDate(daysBack),
      strain: strain.name,
      method: methods[Math.floor(Math.random() * methods.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      rating: Math.min(10, strain.rating + Math.floor(Math.random() * 3) - 1), // Based on strain rating with some variation
      preMood,
      postMood,
      notes: Math.random() > 0.7 ? 'Sample session notes.' : undefined
    });
  }
  
  // Sort by date, newest first
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate profile summary statistics
const generateSummary = (sessions: DemoSession[], strains: DemoStrain[]): DemoProfileSummary => {
  // Most recent session date
  const lastSessionDate = sessions.length > 0 ? sessions[0].date : '';
  
  // Find favorite strain (most frequently used or highest rated)
  const strainUsage = new Map<string, { count: number, totalRating: number }>();
  
  for (const session of sessions) {
    const current = strainUsage.get(session.strain) || { count: 0, totalRating: 0 };
    strainUsage.set(session.strain, {
      count: current.count + 1,
      totalRating: current.totalRating + session.rating
    });
  }
  
  let favoriteStrain = '';
  let highestScore = 0;
  
  strainUsage.forEach((stats, strain) => {
    const score = stats.count * (stats.totalRating / stats.count); // frequency * average rating
    if (score > highestScore) {
      highestScore = score;
      favoriteStrain = strain;
    }
  });
  
  // Calculate mood trend
  let moodTrend: 'up' | 'down' | 'stable' = 'stable';
  
  if (sessions.length >= 5) {
    const recentSessions = sessions.slice(0, Math.min(5, sessions.length));
    const olderSessions = sessions.slice(Math.max(5, sessions.length - 10), sessions.length);
    
    if (recentSessions.length > 0 && olderSessions.length > 0) {
      const recentMoodAvg = recentSessions.reduce((sum, session) => sum + (session.postMood || 0), 0) / recentSessions.length;
      const olderMoodAvg = olderSessions.reduce((sum, session) => sum + (session.postMood || 0), 0) / olderSessions.length;
      
      if (recentMoodAvg - olderMoodAvg > 0.5) {
        moodTrend = 'up';
      } else if (olderMoodAvg - recentMoodAvg > 0.5) {
        moodTrend = 'down';
      }
    }
  }
  
  // Calculate overall mood average
  const moodAverage = sessions.length > 0
    ? sessions.reduce((sum, session) => sum + (session.postMood || 0), 0) / sessions.length
    : 0;
    
  return {
    sessions: {
      count: sessions.length,
      last: lastSessionDate
    },
    strains: {
      count: strains.length,
      favorite: favoriteStrain
    },
    mood: {
      average: parseFloat(moodAverage.toFixed(1)),
      trend: moodTrend
    }
  };
};

// Main generator function
export const generateDemoProfile = (profile: 'light' | 'average' | 'heavy') => {
  const strains = generateStrains(profile);
  const sessions = generateSessions(profile, strains);
  const summary = generateSummary(sessions, strains);
  
  return {
    strains,
    sessions,
    summary
  };
};

// Default export of the utility
export default {
  generateDemoProfile
}; 