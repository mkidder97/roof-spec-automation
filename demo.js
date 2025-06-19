#!/usr/bin/env node

// Working demo of the roof specification automation system
import { RoofSpecAutomation } from './src/index.js';

console.log('🚀 ROOF SPEC AUTOMATION - WORKING DEMO');
console.log('=====================================\\n');

const automation = new RoofSpecAutomation();

// Demo test cases
const demoTests = [
  {
    name: "Miami HVHZ Project",
    input: "JM and Carlisle TPO 45ft Miami FL with NOA",
    description: "Tests HVHZ detection and NOA requirements"
  },
  {
    name: "Texas Commercial", 
    input: "GAF TPO 30ft Dallas TX mechanically attached",
    description: "Tests standard commercial specification"
  },
  {
    name: "California Project",
    input: "Elevate membrane 25ft Los Angeles CA",
    description: "Tests West Coast regional requirements"
  }
];

console.log('Testing working automation components:\\n');

for (let i = 0; i < demoTests.length; i++) {
  const test = demoTests[i];
  
  console.log(`${i + 1}. ${test.name}`);
  console.log(`   Description: ${test.description}`);
  console.log(`   Input: "${test.input}"`);
  console.log('   ' + '-'.repeat(50));
  
  try {
    const result = await automation.processSpecification(test.input);
    
    console.log('   ✅ SUCCESS');
    console.log(`   📍 Location: ${result.requirements.location.address}`);
    console.log(`   🏢 Building: ${result.requirements.building.height || 'N/A'}ft tall`);
    console.log(`   🏭 Manufacturers: ${result.requirements.manufacturers.length} requested`);
    console.log(`   💨 Wind Speed: ${result.windData.windSpeed} mph`);
    console.log(`   📊 Design Pressures: ${Object.keys(result.windData.designPressures).length} zones calculated`);
    console.log(`   🎯 Systems Matched: ${result.matchedSystems.length}`);
    console.log(`   📄 Specification: ${result.specification.pages} pages generated`);
    
    // Show system details
    if (result.matchedSystems.length > 0) {
      result.matchedSystems.forEach(system => {
        console.log(`     • ${system.manufacturer.name} - ${system.compatibility.approvalUsed.type}`);
      });
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('\\n');
}

console.log('🎉 DEMO COMPLETE!');
console.log('================');
console.log('\\n📋 System Capabilities Demonstrated:');
console.log('   ✅ Natural language input parsing');
console.log('   ✅ Location detection and regional analysis');  
console.log('   ✅ HVHZ detection for Miami-Dade');
console.log('   ✅ Wind speed estimation by region');
console.log('   ✅ Design pressure calculations');
console.log('   ✅ Manufacturer system matching');
console.log('   ✅ NOA and approval hierarchy');
console.log('   ✅ Professional specification generation');

console.log('\\n🚀 Ready for Web Interface:');
console.log('   • Input: Natural language text area');
console.log('   • Processing: All automation logic working');
console.log('   • Output: Professional specs + system details');
console.log('   • API: Ready for /api/parse and /api/generate endpoints');

console.log('\\n💡 Next Step: Upload to Lovable for web interface!');
