export interface FeeItem {
  id: string;
  name: string;
  category: 'Tuition' | 'Development' | 'ICT & Robotics' | 'Laboratory' | 'Transport' | 'Meals' | 'Uniform';
  amount: number;
  isMandatory: boolean;
  description: string;
}

/**
 * Returns the standardized fee schedule for a given class level at Dominion International School.
 * Conforms to Nigerian private Cambridge-accredited institutions.
 */
export function getFeeScheduleForClass(classLevel: string, hasBus: boolean = false): FeeItem[] {
  const isPreOrNursery = classLevel.toLowerCase().includes('nursery') || classLevel.toLowerCase().includes('pre');
  const isBasic = classLevel.toLowerCase().includes('basic') || classLevel.toLowerCase().includes('primary');
  const isJSS = classLevel.toLowerCase().includes('jss');
  const isSSS = classLevel.toLowerCase().includes('sss');

  if (isPreOrNursery) {
    return [
      {
        id: 'fee-tuition',
        name: 'Early Years Tuition & Montessori Curriculum',
        category: 'Tuition',
        amount: 180000,
        isMandatory: true,
        description: 'Covers full term early childhood education, play-based learning and phonics materials.'
      },
      {
        id: 'fee-dev',
        name: 'School Development & Campus Maintenance Levy',
        category: 'Development',
        amount: 25000,
        isMandatory: true,
        description: 'Facility upgrades, security infrastructure, power supply, and hygiene maintenance.'
      },
      {
        id: 'fee-ict',
        name: 'Early STEM & Digital Play Literacy',
        category: 'ICT & Robotics',
        amount: 20000,
        isMandatory: true,
        description: 'Interactive smartboards, early coding toys, and tablet-guided learning modules.'
      },
      {
        id: 'fee-bus',
        name: 'School Bus Shuttle Service (Two-Way)',
        category: 'Transport',
        amount: 40000,
        isMandatory: false,
        description: 'Morning pick-up and afternoon drop-off with GPS-monitored air-conditioned buses.'
      },
      {
        id: 'fee-lunch',
        name: 'Nutritious Hot Lunch & Fruit Program',
        category: 'Meals',
        amount: 35000,
        isMandatory: false,
        description: 'Freshly prepared chef-curated balanced lunches and healthy fruit breaks every school day.'
      },
      {
        id: 'fee-uniform',
        name: 'School Uniform Pack & Sports Jersey',
        category: 'Uniform',
        amount: 30000,
        isMandatory: false,
        description: '2 complete bespoke uniforms, 1 House sports kit, cardigan, and school tie/socks.'
      }
    ];
  }

  if (isBasic) {
    return [
      {
        id: 'fee-tuition',
        name: 'Primary Tuition & Cambridge Primary Curriculum',
        category: 'Tuition',
        amount: 220000,
        isMandatory: true,
        description: 'Academic instruction in Cambridge Primary Checkpoint subjects, workbooks, and continuous assessment.'
      },
      {
        id: 'fee-dev',
        name: 'Campus Development & Library Maintenance Levy',
        category: 'Development',
        amount: 30000,
        isMandatory: true,
        description: 'Digital library licenses, power, sports grounds, and school clinic medical coverage.'
      },
      {
        id: 'fee-ict',
        name: 'ICT Laboratory & Coding / Robotics Academy',
        category: 'ICT & Robotics',
        amount: 25000,
        isMandatory: true,
        description: 'Hands-on computer laboratory sessions, Scratch coding, and introductory robotics.'
      },
      {
        id: 'fee-bus',
        name: 'School Bus Shuttle Service (Two-Way)',
        category: 'Transport',
        amount: 45000,
        isMandatory: false,
        description: 'Dedicated bus routes with escort caregiver and real-time arrival notifications.'
      },
      {
        id: 'fee-lunch',
        name: 'Nutritious Hot Lunch Program',
        category: 'Meals',
        amount: 40000,
        isMandatory: false,
        description: 'Daily hot nutritious meal plan prepared under strict pediatric hygiene standards.'
      },
      {
        id: 'fee-uniform',
        name: 'School Uniform & House Sportswear Pack',
        category: 'Uniform',
        amount: 35000,
        isMandatory: false,
        description: 'Official monogrammed blazer, 2 shirts/blouses, trousers/skirts, and house sports wear.'
      }
    ];
  }

  if (isSSS) {
    return [
      {
        id: 'fee-tuition',
        name: 'Senior Secondary Tuition (WAEC / Cambridge IGCSE)',
        category: 'Tuition',
        amount: 300000,
        isMandatory: true,
        description: 'Advanced academic instruction, WAEC / Cambridge mock exams, and career counseling.'
      },
      {
        id: 'fee-dev',
        name: 'Institutional Development & Examination Infrastructure',
        category: 'Development',
        amount: 40000,
        isMandatory: true,
        description: 'Campus maintenance, e-learning servers, multimedia auditoriums, and security.'
      },
      {
        id: 'fee-ict',
        name: 'Advanced ICT, Robotics & AI Computer Lab',
        category: 'ICT & Robotics',
        amount: 40000,
        isMandatory: true,
        description: 'Python programming, web engineering, computer science laboratory, and high-speed Wi-Fi.'
      },
      {
        id: 'fee-lab',
        name: 'Science & Engineering Consumables (Physics/Chem/Bio)',
        category: 'Laboratory',
        amount: 35000,
        isMandatory: true,
        description: 'Specialized glassware, chemical reagents, biological specimens, and lab safety attire.'
      },
      {
        id: 'fee-bus',
        name: 'School Bus Shuttle Service (Two-Way)',
        category: 'Transport',
        amount: 50000,
        isMandatory: false,
        description: 'Air-conditioned luxury shuttle covering major residential corridors.'
      },
      {
        id: 'fee-lunch',
        name: 'Senior Dining & Hot Lunch Program',
        category: 'Meals',
        amount: 40000,
        isMandatory: false,
        description: 'Full hot lunch dining hall service with fresh seasonal fruit and beverage.'
      },
      {
        id: 'fee-uniform',
        name: 'Senior School Blazer & Ceremonial Uniform Pack',
        category: 'Uniform',
        amount: 40000,
        isMandatory: false,
        description: 'Senior bespoke navy blazer, 2 oxford shirts, trousers/skirts, house jersey, tie.'
      }
    ];
  }

  // Default: Junior Secondary (JSS 1 - 3)
  return [
    {
      id: 'fee-tuition',
      name: 'Junior Secondary Tuition & Cambridge Lower Secondary',
      category: 'Tuition',
      amount: 260000,
      isMandatory: true,
      description: 'Full academic tuition, BECE preparation, Cambridge Lower Secondary syllabus, and assessments.'
    },
    {
      id: 'fee-dev',
      name: 'School Development & Campus Amenities Levy',
      category: 'Development',
      amount: 35000,
      isMandatory: true,
      description: 'Campus facility maintenance, continuous 24/7 power, sports complex, and medical clinic.'
    },
    {
      id: 'fee-ict',
      name: 'ICT, Coding & Robotics STEM Laboratory',
      category: 'ICT & Robotics',
      amount: 35000,
      isMandatory: true,
      description: 'Hands-on robotics hardware kits, digital design software, and dedicated PC workstations.'
    },
    {
      id: 'fee-lab',
      name: 'Integrated Science & Practical Laboratory Consumables',
      category: 'Laboratory',
      amount: 25000,
      isMandatory: true,
      description: 'Laboratory chemicals, microscopes, apparatus, and experimental consumables.'
    },
    {
      id: 'fee-bus',
      name: 'School Bus Shuttle Service (Two-Way)',
      category: 'Transport',
      amount: 45000,
      isMandatory: false,
      description: 'Comfortable air-conditioned transport service covering your residential zone.'
    },
    {
      id: 'fee-lunch',
      name: 'Dining Hall Hot Lunch Program',
      category: 'Meals',
      amount: 40000,
      isMandatory: false,
      description: 'Chef-prepared hot balanced mid-day meals and fresh fruit salad every school day.'
    },
    {
      id: 'fee-uniform',
      name: 'Junior Secondary Uniform & House Sportswear Pack',
      category: 'Uniform',
      amount: 35000,
      isMandatory: false,
      description: '2 sets of uniforms, 1 House sports kit, school cardigan, tie, and sports cap.'
    }
  ];
}

