// Specification Generator - Professional document generation
export class SpecGenerator {
  constructor() {
    this.templates = {};
  }

  async generate(requirements, windData, matchedSystems) {
    console.log('📄 Generating specification document...');
    
    const specification = {
      header: this.generateHeader(requirements),
      windAnalysis: this.generateWindAnalysis(windData),
      approvedSystems: this.generateApprovedSystems(matchedSystems),
      specifications: this.generateDetailedSpecs(requirements, windData, matchedSystems),
      footer: this.generateFooter(),
      timestamp: new Date().toISOString(),
      pages: 1
    };

    // Generate the complete document
    const document = this.assembleDocument(specification);
    console.log('✅ Specification generated successfully');
    
    return specification;
  }

  generateHeader(requirements) {
    const location = requirements.location.address || 'Project Location';
    const building = `${requirements.building.height || 'N/A'}ft H x ${requirements.building.width || 'N/A'}ft W`;
    
    return {
      title: 'ROOF SYSTEM SPECIFICATION',
      subtitle: 'Automated Specification System',
      project: {
        location,
        building,
        date: new Date().toLocaleDateString(),
        specifiedBy: 'Roof Specification Automation System'
      }
    };
  }

  generateWindAnalysis(windData) {
    return {
      title: 'WIND LOAD ANALYSIS',
      standard: (windData.asceStandard || 'ASCE 7-22').replace('_', ' ').toUpperCase(),
      windSpeed: `${windData.windSpeed} mph`,
      exposureCategory: windData.location?.exposureCategory || 'C',
      riskCategory: windData.riskCategory || 'II',
      designPressures: this.formatWindPressures(windData.designPressures || {}),
      location: windData.location
    };
  }

  formatWindPressures(pressures) {
    const formatted = {};
    for (const [zone, pressure] of Object.entries(pressures)) {
      formatted[zone] = {
        name: this.getZoneName(zone),
        pressure: `-${pressure.toFixed(1)} psf`
      };
    }
    return formatted;
  }

  getZoneName(zone) {
    const zoneNames = {
      'zone1_prime': 'Zone 1\\' (Field)',
      'zone2': 'Zone 2 (Perimeter)', 
      'zone3': 'Zone 3 (Corner)'
    };
    return zoneNames[zone] || zone;
  }

  generateApprovedSystems(matchedSystems) {
    const systems = matchedSystems.map(system => ({
      manufacturer: system.manufacturer.name,
      approval: {
        type: system.compatibility.approvalUsed.type,
        number: system.compatibility.approvalUsed.data.noa || 
                system.compatibility.approvalUsed.data.approval || 
                system.compatibility.approvalUsed.data.report,
        system: system.compatibility.approvalUsed.data.system,
        mdp: `${system.compatibility.approvalUsed.data.mdp} psf`
      },
      products: {
        membrane: system.manufacturer.products.membrane?.name || 'N/A',
        fasteners: system.manufacturer.products.fasteners?.name || 'N/A'
      },
      compatibility: system.compatibility
    }));

    return {
      title: 'APPROVED ROOF SYSTEMS',
      count: systems.length,
      systems
    };
  }

  generateDetailedSpecs(requirements, windData, matchedSystems) {
    return {
      title: 'DETAILED SPECIFICATIONS',
      systems: matchedSystems.map(system => ({
        manufacturer: system.manufacturer.name,
        membrane: system.manufacturer.products.membrane,
        requirements: [
          'Membrane to be installed per manufacturer instructions',
          'All seams to be heat welded with minimum 1.5" weld width',
          'Daily seam probing required with documentation'
        ]
      }))
    };
  }

  generateFooter() {
    return {
      notes: [
        'This specification is generated based on current manufacturer approvals',
        'Contractor to verify all approvals are current at time of installation',
        'Local building department requirements take precedence'
      ],
      generated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  assembleDocument(specification) {
    const sections = [];

    // Header
    sections.push(`${specification.header.title}\\n${specification.header.subtitle}\\n`);
    sections.push(`Project: ${specification.header.project.location}`);
    sections.push(`Building: ${specification.header.project.building}`);
    sections.push(`Date: ${specification.header.project.date}\\n`);
    
    // Wind Analysis
    sections.push(`WIND LOAD ANALYSIS`);
    sections.push(`Standard: ${specification.windAnalysis.standard}`);
    sections.push(`Wind Speed: ${specification.windAnalysis.windSpeed}`);
    sections.push(`Exposure Category: ${specification.windAnalysis.exposureCategory}\\n`);
    
    // Approved Systems
    sections.push(`APPROVED ROOF SYSTEMS (${specification.approvedSystems.count} found)`);
    specification.approvedSystems.systems.forEach(system => {
      sections.push(`${system.manufacturer}`);
      sections.push(`  Approval: ${system.approval.number} (System ${system.approval.system})`);
      sections.push(`  MDP: ${system.approval.mdp}`);
      sections.push(`  Membrane: ${system.products.membrane}\\n`);
    });

    return sections.join('\\n');
  }
}
