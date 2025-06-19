// System Matcher - NOA and approval hierarchy matching
export class SystemMatcher {
  constructor() {
    this.manufacturerData = {
      johns_manville: {
        name: 'Johns Manville',
        approvals: {
          miami_dade: { noa: 'NOA 17090.1', system: 'JM1', mdp: 185 },
          icc_es: { report: 'ESR-2003', mdp: 175 }
        },
        products: {
          membrane: { name: 'JM TPO Fleeceback', type: 'TPO', color: 'White' },
          fasteners: { name: 'JM Fasteners', plates: 'JM Plates' }
        }
      },
      carlisle: {
        name: 'Carlisle SynTec Systems',
        approvals: {
          miami_dade: { noa: 'NOA 14083.2-R33', system: 'C3', mdp: 185 },
          icc_es: { report: 'ESR-1768', mdp: 175 }
        },
        products: {
          membrane: { name: 'Sure-Weld FleeceBACK TPO', type: 'TPO', color: 'White' },
          fasteners: { name: 'Carlisle Fasteners', plates: 'Carlisle Plates' }
        }
      },
      gaf: {
        name: 'GAF',
        approvals: {
          florida_statewide: { approval: 'FL-4859', system: 'G4', mdp: 175 },
          icc_es: { report: 'ESR-3957', mdp: 165 }
        },
        products: {
          membrane: { name: 'EverGuard TPO Fleece-Back', type: 'TPO', color: 'White' },
          fasteners: { name: 'GAF Fasteners', plates: 'GAF Plates' }
        }
      }
    };
  }

  async findMatches(requirements, windData) {
    console.log('🔍 Matching systems nationwide...');
    
    const matchedSystems = [];
    const maxPressure = Math.max(...Object.values(windData.designPressures));
    
    // Determine required approval type
    const requiredApproval = this.determineRequiredApproval(windData.location);
    
    for (const manufacturerKey of requirements.manufacturers) {
      const manufacturer = this.manufacturerData[manufacturerKey];
      
      if (!manufacturer) {
        console.warn(`❌ Manufacturer not found: ${manufacturerKey}`);
        continue;
      }
      
      // Check approval compatibility
      const approvalMatch = this.checkApprovals(manufacturer, requiredApproval);
      
      if (approvalMatch.hasRequired) {
        // Check wind pressure compatibility
        const systemMDP = approvalMatch.approvalUsed.data.mdp;
        
        if (systemMDP >= maxPressure) {
          matchedSystems.push({
            manufacturerKey,
            manufacturer,
            compatibility: {
              compatible: true,
              approvalUsed: approvalMatch.approvalUsed,
              pressureMargin: systemMDP - maxPressure
            }
          });
          
          console.log(`✅ ${manufacturer.name} - Compatible (${approvalMatch.approvalUsed.type})`);
        } else {
          console.log(`❌ ${manufacturer.name} - Insufficient pressure capacity`);
        }
      } else {
        console.log(`❌ ${manufacturer.name} - No suitable approval found`);
      }
    }
    
    console.log('✅ System matching complete');
    return matchedSystems;
  }

  determineRequiredApproval(location) {
    if (location.region?.hvhz) {
      return {
        type: 'miami_dade',
        description: 'Miami-Dade NOA required for HVHZ',
        mandatory: true
      };
    }
    
    if (location.region?.state === 'FL') {
      return {
        type: 'florida_statewide',
        description: 'Florida Product Approval required',
        mandatory: true,
        fallback: 'icc_es'
      };
    }
    
    return {
      type: 'icc_es',
      description: 'ICC-ES Report recommended',
      mandatory: false
    };
  }

  checkApprovals(manufacturer, requiredApproval) {
    const approvals = manufacturer.approvals;
    const required = requiredApproval.type;
    
    // Check for exact match first
    if (approvals[required]) {
      return {
        hasRequired: true,
        approvalUsed: {
          type: required,
          data: approvals[required]
        }
      };
    }
    
    // Check fallback if available
    if (requiredApproval.fallback && approvals[requiredApproval.fallback]) {
      return {
        hasRequired: !requiredApproval.mandatory,
        approvalUsed: {
          type: requiredApproval.fallback,
          data: approvals[requiredApproval.fallback]
        }
      };
    }
    
    return {
      hasRequired: false,
      reason: `No valid ${required} approval found`
    };
  }
}
