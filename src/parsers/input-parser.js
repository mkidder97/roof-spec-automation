import fs from 'fs/promises';
import path from 'path';

export class InputParser {
  constructor() {
    this.manufacturerAliases = {
      'jm': 'johns_manville',
      'johns manville': 'johns_manville',
      'johns-manville': 'johns_manville',
      'elevate': 'elevate',
      'holcim': 'elevate',
      'holcim/elevate': 'elevate',
      'holcim elevate': 'elevate',
      'carlisle': 'carlisle',
      'carlisle syntec': 'carlisle',
      'gaf': 'gaf',
      'firestone': 'firestone',
      'versico': 'versico'
    };
    
    this.stateAbbreviations = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };
  }

  async parse(input) {
    console.log(`Parsing nationwide input: \"${input}\"`);
    
    const requirements = {
      manufacturers: this.extractManufacturers(input),
      building: this.extractBuildingInfo(input),
      location: this.extractLocationNationwide(input),
      roofSystem: this.extractRoofSystem(input),
      compliance: this.extractComplianceNationwide(input),
      specialRequirements: this.extractSpecialRequirements(input),
      timestamp: new Date().toISOString()
    };

    console.log('Parsed requirements:', JSON.stringify(requirements, null, 2));
    return requirements;
  }

  extractManufacturers(input) {
    const manufacturers = [];
    const inputLower = input.toLowerCase();
    
    // Check for each manufacturer alias
    for (const [alias, canonical] of Object.entries(this.manufacturerAliases)) {
      if (inputLower.includes(alias)) {
        if (!manufacturers.includes(canonical)) {
          manufacturers.push(canonical);
        }
      }
    }
    
    // If no specific manufacturers mentioned, default to major ones
    if (manufacturers.length === 0) {
      console.log('No specific manufacturers found, will suggest alternatives');
    }
    
    return manufacturers;
  }

  extractBuildingInfo(input) {
    const building = {};
    
    // Extract height - Enhanced with multiple patterns
    const heightMatches = [
      /(\d+)\s*ft\s*high/i,
      /(\d+)\s*foot\s*high/i,
      /(\d+)\s*feet\s*high/i,
      /height\s*:\s*(\d+)/i,
      /(\d+)\s*ft\s*h/i,
      /(\d+)\s*ft\b/i  // Pattern for \"45ft\" without \"high\"
    ];
    
    for (const pattern of heightMatches) {
      const match = input.match(pattern);
      if (match) {
        building.height = parseInt(match[1]);
        break;
      }
    }
    
    // Extract width
    const widthMatches = [
      /(\d+)\s*ft\s*wide/i,
      /(\d+)\s*foot\s*wide/i,
      /(\d+)\s*feet\s*wide/i,
      /width\s*:\s*(\d+)/i,
      /(\d+)\s*ft\s*w/i
    ];
    
    for (const pattern of widthMatches) {
      const match = input.match(pattern);
      if (match) {
        building.width = parseInt(match[1]);
        break;
      }
    }
    
    // Extract deck type
    if (input.toLowerCase().includes('steel deck')) {
      building.deckType = 'steel';
    } else if (input.toLowerCase().includes('concrete deck')) {
      building.deckType = 'concrete';
    } else if (input.toLowerCase().includes('wood deck')) {
      building.deckType = 'wood';
    }
    
    return building;
  }

  extractLocationNationwide(input) {
    const location = {};
    
    // Enhanced location patterns to avoid manufacturer conflicts
    const locationPatterns = [
      // \"Miami FL\", \"Dallas TX\" with word boundaries
      /\b([A-Za-z\s]+?)\s+([A-Z]{2})\b(?!\d)/i,
      // \"Miami, FL\"
      /([A-Za-z\s]+),\s*([A-Z]{2})\b/i,
      // Just state abbreviation
      /\b([A-Z]{2})\b(?!\d)/i
    ];
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const pattern of locationPatterns) {
      const match = input.match(pattern);
      if (match) {
        let score = 1;
        let city = '';
        let state = '';
        
        if (match.length >= 3) {
          // Has both city and state
          city = match[1].trim();
          state = match[2].trim();
          score = 3;
          
          // Filter out non-city words from city
          city = city.replace(/^(ft|\d+|high|building|tpo|noa|with)\s*/gi, '').trim();
          
          // Validate that city is actually a city word
          if (city.length < 2 || /^(ft|\d+|high|building|tpo|noa|with|and|or)$/i.test(city)) {
            continue; // Skip this match
          }
        } else if (match.length >= 2) {
          // Just state
          state = match[1].trim();
          score = 1;
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = { city, state };
        }
      }
    }
    
    if (bestMatch) {
      if (bestMatch.city) {
        location.city = bestMatch.city;
      }
      location.state = this.normalizeState(bestMatch.state);
      location.address = location.city ? 
        `${location.city}, ${location.state}` : 
        location.state;
    }
    
    // Determine region characteristics
    if (location.state) {
      location.stateCode = location.state;
      location.region = this.determineRegion(location.state, location.city);
    }
    
    return location;
  }

  normalizeState(stateInput) {
    const normalized = stateInput.toLowerCase().trim();
    
    // Check if it's already a state abbreviation
    if (normalized.length === 2) {
      return normalized.toUpperCase();
    }
    
    // Look up in state abbreviations
    return this.stateAbbreviations[normalized] || stateInput.toUpperCase();
  }

  determineRegion(state, city = '') {
    const region = {
      state: state,
      stateCode: state
    };
    
    // Determine if coastal
    const coastalStates = ['FL', 'CA', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC', 'VA', 'MD', 'DE', 'NJ', 'NY', 'CT', 'RI', 'MA', 'NH', 'ME', 'WA', 'OR', 'AK', 'HI'];
    region.isCoastal = coastalStates.includes(state);
    
    // Determine hurricane risk
    const hurricaneStates = ['FL', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC'];
    region.hurricaneRisk = hurricaneStates.includes(state);
    
    // Determine if HVHZ (High Velocity Hurricane Zone)
    if (state === 'FL') {
      const cityLower = city?.toLowerCase() || '';
      
      if (cityLower.includes('miami') || cityLower.includes('dade')) {
        region.county = 'miami-dade';
        region.hvhz = true;
      } else if (cityLower.includes('fort lauderdale') || cityLower.includes('broward')) {
        region.county = 'broward';
        region.hvhz = true;
      } else if (cityLower.includes('west palm beach') || cityLower.includes('palm beach')) {
        region.county = 'palm beach';
        region.hvhz = true;
      }
    }
    
    // Determine climate zone
    const coldStates = ['AK', 'MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME', 'MT', 'ND', 'SD', 'WY'];
    const hotStates = ['FL', 'TX', 'AZ', 'NV', 'CA', 'LA', 'MS', 'AL', 'GA'];
    
    if (coldStates.includes(state)) {
      region.climateZone = 'cold';
    } else if (hotStates.includes(state)) {
      region.climateZone = 'hot';
    } else {
      region.climateZone = 'temperate';
    }
    
    return region;
  }

  extractRoofSystem(input) {
    const roofSystem = {};
    
    // Extract membrane type
    const membraneTypes = ['tpo', 'pvc', 'epdm', 'modified bitumen', 'built-up'];
    for (const type of membraneTypes) {
      if (input.toLowerCase().includes(type)) {
        roofSystem.membraneType = type.toUpperCase();
        break;
      }
    }
    
    // Extract attachment method
    if (input.toLowerCase().includes('fully adhered')) {
      roofSystem.attachmentMethod = 'fully_adhered';
    } else if (input.toLowerCase().includes('mechanically attached')) {
      roofSystem.attachmentMethod = 'mechanically_attached';
    } else if (input.toLowerCase().includes('ballasted')) {
      roofSystem.attachmentMethod = 'ballasted';
    }
    
    return roofSystem;
  }

  extractComplianceNationwide(input) {
    const compliance = {};
    
    // Check for specific compliance requirements
    if (input.toLowerCase().includes('miami dade noa') || 
        input.toLowerCase().includes('miami-dade noa') ||
        input.toLowerCase().includes('noa')) {
      compliance.miamaDadeNOA = true;
    }
    
    if (input.toLowerCase().includes('icc-es') || 
        input.toLowerCase().includes('icc es')) {
      compliance.iccES = true;
    }
    
    // Default to most recent standard
    compliance.asceStandard = 'asce_7_22';
    
    return compliance;
  }

  extractSpecialRequirements(input) {
    const special = {};
    
    // Hail resistance
    if (input.toLowerCase().includes('hail resistant') || 
        input.toLowerCase().includes('class 3') ||
        input.toLowerCase().includes('class 4')) {
      special.hailResistance = true;
    }
    
    // Seismic requirements
    if (input.toLowerCase().includes('seismic') ||
        input.toLowerCase().includes('earthquake')) {
      special.seismicRequirements = true;
    }
    
    return special;
  }
}
