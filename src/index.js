#!/usr/bin/env node

import { InputParser } from './parsers/input-parser.js';
import { WindCalculator } from './calculators/wind-calculator.js';
import { SystemMatcher } from './matchers/system-matcher.js';
import { SpecGenerator } from './generators/spec-generator.js';

class RoofSpecAutomation {
  constructor() {
    this.parser = new InputParser();
    this.windCalculator = new WindCalculator();
    this.systemMatcher = new SystemMatcher();
    this.specGenerator = new SpecGenerator();
  }

  async processSpecification(input) {
    try {
      console.log('🏗️  Roof Specification Automation System');
      console.log('==========================================\n');
      
      // Step 1: Parse input requirements
      console.log('📝 Parsing input requirements...');
      const requirements = await this.parser.parse(input);
      console.log('✅ Requirements parsed successfully\n');
      
      // Step 2: Calculate wind pressures
      console.log('💨 Calculating wind pressures...');
      const windData = await this.windCalculator.calculate(requirements);
      console.log('✅ Wind calculations complete\n');
      
      // Step 3: Match approved systems
      console.log('🔍 Matching approved NOA systems...');
      const matchedSystems = await this.systemMatcher.findMatches(requirements, windData);
      console.log('✅ System matching complete\n');
      
      // Step 4: Generate specification
      console.log('📄 Generating specification document...');
      const specification = await this.specGenerator.generate(requirements, windData, matchedSystems);
      console.log('✅ Specification generated successfully\n');
      
      return {
        requirements,
        windData,
        matchedSystems,
        specification
      };
      
    } catch (error) {
      console.error('❌ Error processing specification:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node index.js "<specification requirements>"');
    console.log('\nExample:');
    console.log('node index.js "JM and Carlisle TPO 45ft Miami FL with NOA"');
    console.log('node index.js "GAF TPO 30ft Dallas TX mechanically attached"');
    process.exit(1);
  }
  
  const input = args.join(' ');
  const automation = new RoofSpecAutomation();
  
  try {
    const result = await automation.processSpecification(input);
    
    console.log('🎉 Processing Complete!');
    console.log('======================\n');
    
    console.log('📋 Summary:');
    console.log(`• Location: ${result.requirements.location.address}`);
    console.log(`• Building: ${result.requirements.building.height || 'N/A'}ft H x ${result.requirements.building.width || 'N/A'}ft W`);
    console.log(`• Wind Speed: ${result.windData.windSpeed} mph`);
    console.log(`• Systems Found: ${result.matchedSystems.length || 0}`);
    console.log(`• Specification: ${result.specification.pages} pages generated\n`);
    
  } catch (error) {
    console.error('Failed to process specification:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { RoofSpecAutomation };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
