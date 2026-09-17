// Real Operational Store for Cruise Activity & Service Management System
// Persistent in localStorage, zero fake random data, strict computation

const STORAGE_KEY = 'oceanflow_operational_data_v1';

const initialData = {
  cruiseTours: [
    {
      id: 'tour-1',
      tourCode: 'OF-2026-PAC01',
      title: 'Pacific Horizon & East Asia Odyssey',
      vesselName: 'OceanFlow Grand Voyager',
      originPort: 'SGPIN',
      destinationPort: 'JPTYO',
      departureDate: '2026-10-15',
      returnDate: '2026-10-25',
      durationDays: 10,
      capacity: 1850,
      currentBookings: 1420,
      status: 'In Progress',
      notes: 'Premier flagship autumn sailing crossing Singapore, Vietnam, Hong Kong, and Tokyo.'
    },
    {
      id: 'tour-2',
      tourCode: 'OF-2026-MED04',
      title: 'Mediterranean Sapphire Riviera',
      vesselName: 'OceanFlow Celesta',
      originPort: 'ESBCN',
      destinationPort: 'ITFCO',
      departureDate: '2026-11-02',
      returnDate: '2026-11-09',
      durationDays: 7,
      capacity: 1400,
      currentBookings: 1180,
      status: 'Planning',
      notes: 'Classic western Mediterranean route calling at Barcelona, Marseille, Genoa, and Rome.'
    },
    {
      id: 'tour-3',
      tourCode: 'OF-2026-VIE02',
      title: 'Indochina Coastal Discovery',
      vesselName: 'OceanFlow Grand Voyager',
      originPort: 'VNSGN',
      destinationPort: 'VNDAD',
      departureDate: '2026-11-18',
      returnDate: '2026-11-23',
      durationDays: 5,
      capacity: 1850,
      currentBookings: 960,
      status: 'Planning',
      notes: 'Expedition cruise exploring the central coast of Vietnam with docking at Da Nang.'
    },
    {
      id: 'tour-4',
      tourCode: 'OF-2026-CAR08',
      title: 'Caribbean Azure Transit',
      vesselName: 'OceanFlow Mariner',
      originPort: 'USMIA',
      destinationPort: 'USMIA',
      departureDate: '2026-08-10',
      returnDate: '2026-08-17',
      durationDays: 7,
      capacity: 1600,
      currentBookings: 1600,
      status: 'Completed',
      notes: 'Full capacity Caribbean summer journey completed successfully with zero incidents.'
    }
  ],

  itineraries: [
    {
      id: 'itin-1',
      tourId: 'tour-1',
      dayNumber: 1,
      date: '2026-10-15',
      portCode: 'SGPIN',
      portName: 'Marina Bay Cruise Centre',
      arrivalTime: '08:00',
      departureTime: '17:00',
      status: 'Departed',
      scheduledActivitiesCount: 6,
      berthNumber: 'Berth 01',
      notes: 'Guest embarkation, safety muster drill completed at 15:30.'
    },
    {
      id: 'itin-2',
      tourId: 'tour-1',
      dayNumber: 2,
      date: '2026-10-16',
      portCode: 'SEA',
      portName: 'At Sea (South China Sea Passage)',
      arrivalTime: '—',
      departureTime: '—',
      status: 'At Sea',
      scheduledActivitiesCount: 14,
      berthNumber: 'N/A',
      notes: 'Full sea day with guest gala dinner and captain cocktail reception.'
    },
    {
      id: 'itin-3',
      tourId: 'tour-1',
      dayNumber: 3,
      date: '2026-10-17',
      portCode: 'VNSGN',
      portName: 'Saigon Port (Phu My Terminal)',
      arrivalTime: '07:30',
      departureTime: '20:00',
      status: 'Docked',
      scheduledActivitiesCount: 8,
      berthNumber: 'Pier B2',
      notes: 'Shore excursions to Ho Chi Minh City and Mekong Delta tours.'
    },
    {
      id: 'itin-4',
      tourId: 'tour-1',
      dayNumber: 5,
      date: '2026-10-19',
      portCode: 'VNDAD',
      portName: 'Tien Sa International Terminal',
      arrivalTime: '08:00',
      departureTime: '18:30',
      status: 'Upcoming',
      scheduledActivitiesCount: 9,
      berthNumber: 'Berth 3',
      notes: 'Heritage tour to Hoi An Ancient Town and Ba Na Hills.'
    },
    {
      id: 'itin-5',
      tourId: 'tour-1',
      dayNumber: 10,
      date: '2026-10-25',
      portCode: 'JPTYO',
      portName: 'Tokyo International Cruise Terminal',
      arrivalTime: '06:00',
      departureTime: '18:00',
      status: 'Upcoming',
      scheduledActivitiesCount: 4,
      berthNumber: 'Berth Main',
      notes: 'Final disembarkation and turn-around port procedures.'
    }
  ],

  ports: [
    {
      id: 'port-1',
      code: 'VNSGN',
      name: 'Saigon Port - Phu My',
      country: 'Vietnam',
      city: 'Ba Ria - Vung Tau',
      coordinates: '10.5847° N, 107.0392° E',
      maxDraftMeters: 13.5,
      berthsCount: 4,
      harborMasterContact: '+84 254 389 3122',
      status: 'Open'
    },
    {
      id: 'port-2',
      code: 'SGPIN',
      name: 'Marina Bay Cruise Centre Singapore',
      country: 'Singapore',
      city: 'Singapore',
      coordinates: '1.2678° N, 103.8601° E',
      maxDraftMeters: 12.0,
      berthsCount: 2,
      harborMasterContact: '+65 6604 8305',
      status: 'Open'
    },
    {
      id: 'port-3',
      code: 'VNDAD',
      name: 'Tien Sa Port - Da Nang',
      country: 'Vietnam',
      city: 'Da Nang',
      coordinates: '16.1264° N, 108.2173° E',
      maxDraftMeters: 11.0,
      berthsCount: 3,
      harborMasterContact: '+84 236 382 2565',
      status: 'Open'
    },
    {
      id: 'port-4',
      code: 'JPTYO',
      name: 'Tokyo International Cruise Terminal',
      country: 'Japan',
      city: 'Tokyo',
      coordinates: '35.6174° N, 139.7761° E',
      maxDraftMeters: 11.5,
      berthsCount: 2,
      harborMasterContact: '+81 3 5500 2410',
      status: 'Open'
    },
    {
      id: 'port-5',
      code: 'THLCH',
      name: 'Laem Chabang Cruise Port',
      country: 'Thailand',
      city: 'Chonburi / Bangkok',
      coordinates: '13.0841° N, 100.8872° E',
      maxDraftMeters: 14.0,
      berthsCount: 3,
      harborMasterContact: '+66 38 490 000',
      status: 'Congested'
    }
  ],

  passengers: [
    {
      id: 'pass-1',
      passengerCode: 'PAX-8801',
      passportNumber: 'B91823719',
      fullName: 'Dr. Alexander Vance',
      nationality: 'United Kingdom',
      email: 'a.vance@oxon.ac.uk',
      phone: '+44 7700 900412',
      cabinNumber: 'D-802',
      cabinDeck: 'Deck 8 (Sapphire Balcony)',
      tourId: 'tour-1',
      emergencyContact: 'Eleanor Vance (+44 7700 900413)',
      loyaltyTier: 'Gold Admiral',
      status: 'Boarded'
    },
    {
      id: 'pass-2',
      passengerCode: 'PAX-8802',
      passportNumber: 'E44019283',
      fullName: 'Nguyen Minh Tri',
      nationality: 'Vietnam',
      email: 'tri.nguyen@techsea.vn',
      phone: '+84 908 123 456',
      cabinNumber: 'D-804',
      cabinDeck: 'Deck 8 (Sapphire Balcony)',
      tourId: 'tour-1',
      emergencyContact: 'Nguyen Thu Huong (+84 912 345 678)',
      loyaltyTier: 'VIP Sapphire',
      status: 'Boarded'
    },
    {
      id: 'pass-3',
      passengerCode: 'PAX-8803',
      passportNumber: 'K90182746',
      fullName: 'Hiroshi Takahashi',
      nationality: 'Japan',
      email: 'h_takahashi@kyoto-trade.jp',
      phone: '+81 90 1234 5678',
      cabinNumber: 'C-714',
      cabinDeck: 'Deck 7 (Ocean View)',
      tourId: 'tour-1',
      emergencyContact: 'Yoko Takahashi (+81 90 8765 4321)',
      loyaltyTier: 'Silver Marine',
      status: 'Boarded'
    },
    {
      id: 'pass-4',
      passengerCode: 'PAX-8804',
      passportNumber: 'US87129031',
      fullName: 'Catherine Sterling',
      nationality: 'United States',
      email: 'catherine.sterling@apexlaw.com',
      phone: '+1 415 555 0198',
      cabinNumber: 'S-1002',
      cabinDeck: 'Deck 10 (Owner Suite)',
      tourId: 'tour-1',
      emergencyContact: 'Marcus Sterling (+1 415 555 0199)',
      loyaltyTier: 'VIP Sapphire',
      status: 'Boarded'
    },
    {
      id: 'pass-5',
      passengerCode: 'PAX-8805',
      passportNumber: 'SG3389012',
      fullName: 'Rachel Lim Zhi En',
      nationality: 'Singapore',
      email: 'rachel.lim@dbs-group.sg',
      phone: '+65 9123 4567',
      cabinNumber: 'B-521',
      cabinDeck: 'Deck 5 (Interior Stateroom)',
      tourId: 'tour-1',
      emergencyContact: 'David Lim (+65 9876 5432)',
      loyaltyTier: 'Standard',
      status: 'Boarded'
    },
    {
      id: 'pass-6',
      passengerCode: 'PAX-8806',
      passportNumber: 'FR77218390',
      fullName: 'Jean-Luc Fontaine',
      nationality: 'France',
      email: 'jl.fontaine@sorbonne.fr',
      phone: '+33 6 12 34 56 78',
      cabinNumber: 'D-815',
      cabinDeck: 'Deck 8 (Sapphire Balcony)',
      tourId: 'tour-2',
      emergencyContact: 'Claire Fontaine (+33 6 87 65 43 21)',
      loyaltyTier: 'Silver Marine',
      status: 'Pre-Checkin'
    }
  ],

  activities: [
    {
      id: 'act-1',
      title: 'Grand Broadway Symphony: Phantom of the Sea',
      category: 'Entertainment',
      locationDeck: 'Deck 4 - Royal Starlight Theater',
      startTime: '20:30',
      endTime: '22:15',
      maxCapacity: 650,
      bookedCount: 580,
      surchargeUSD: 0,
      status: 'Scheduled',
      description: 'Full live orchestra theatrical performance with international cast.'
    },
    {
      id: 'act-2',
      title: 'Masterclass: Sommelier Wine & Artisan Cheese Pairing',
      category: 'Culinary & Dining',
      locationDeck: 'Deck 6 - Cellar Reserve Lounge',
      startTime: '16:00',
      endTime: '17:30',
      maxCapacity: 35,
      bookedCount: 35,
      surchargeUSD: 45,
      status: 'Scheduled',
      description: 'Exclusive tasting of 6 premium maritime vintages guided by Master Sommelier.'
    },
    {
      id: 'act-3',
      title: 'Sunrise Vinyasa Yoga on Helipad Deck',
      category: 'Wellness & Spa',
      locationDeck: 'Deck 14 - Forward Vista Deck',
      startTime: '06:30',
      endTime: '07:30',
      maxCapacity: 40,
      bookedCount: 28,
      surchargeUSD: 15,
      status: 'Scheduled',
      description: 'Revitalizing open-air ocean horizon yoga session for all skill levels.'
    },
    {
      id: 'act-4',
      title: 'Ocean Acoustics: Sunset Acoustic Jazz Quartet',
      category: 'Entertainment',
      locationDeck: 'Deck 9 - Observation Skylounge',
      startTime: '18:00',
      endTime: '19:45',
      maxCapacity: 120,
      bookedCount: 95,
      surchargeUSD: 0,
      status: 'Scheduled',
      description: 'Relaxed jazz standards and maritime cocktails with panoramic sunset views.'
    },
    {
      id: 'act-5',
      title: 'Aqua Spin & Deep-Water Fitness Circuit',
      category: 'Sports & Fitness',
      locationDeck: 'Deck 11 - Midship Lido Pool',
      startTime: '10:00',
      endTime: '11:00',
      maxCapacity: 20,
      bookedCount: 16,
      surchargeUSD: 20,
      status: 'Completed',
      description: 'High-energy cardiovascular training with submerged hydro-spin equipment.'
    }
  ],

  bookings: [
    {
      id: 'bk-1',
      bookingRef: 'BK-2026-7701',
      passengerId: 'pass-1',
      passengerName: 'Dr. Alexander Vance',
      targetType: 'Cruise Tour',
      targetTitle: 'Pacific Horizon & East Asia Odyssey',
      bookingDate: '2026-06-12',
      guestsCount: 2,
      totalAmountUSD: 4200,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    },
    {
      id: 'bk-2',
      bookingRef: 'BK-2026-7702',
      passengerId: 'pass-2',
      passengerName: 'Nguyen Minh Tri',
      targetType: 'Cruise Tour',
      targetTitle: 'Pacific Horizon & East Asia Odyssey',
      bookingDate: '2026-07-04',
      guestsCount: 2,
      totalAmountUSD: 4200,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    },
    {
      id: 'bk-3',
      bookingRef: 'BK-2026-7703',
      passengerId: 'pass-4',
      passengerName: 'Catherine Sterling',
      targetType: 'Cruise Tour',
      targetTitle: 'Pacific Horizon & East Asia Odyssey (Suite)',
      bookingDate: '2026-05-18',
      guestsCount: 1,
      totalAmountUSD: 7800,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    },
    {
      id: 'bk-4',
      bookingRef: 'BK-2026-7704',
      passengerId: 'pass-2',
      passengerName: 'Nguyen Minh Tri',
      targetType: 'Activity',
      targetTitle: 'Masterclass: Sommelier Wine & Artisan Cheese Pairing',
      bookingDate: '2026-10-15',
      guestsCount: 2,
      totalAmountUSD: 90,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Charged to Cabin'
    },
    {
      id: 'bk-5',
      bookingRef: 'BK-2026-7705',
      passengerId: 'pass-1',
      passengerName: 'Dr. Alexander Vance',
      targetType: 'Shore Excursion',
      targetTitle: 'Mekong Delta Riverboat & Coconut Grove Journey',
      bookingDate: '2026-10-16',
      guestsCount: 2,
      totalAmountUSD: 230,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    }
  ],

  services: [
    {
      id: 'srv-1',
      code: 'SPA-01',
      name: 'Deep Sea Magnesium Body Scrub & Massage',
      category: 'Spa & Wellness',
      description: '80-minute restorative therapy using oceanic mineral salts and warm bamboo rollers.',
      unitPriceUSD: 145,
      status: 'Available'
    },
    {
      id: 'srv-2',
      code: 'DIN-03',
      name: 'Chef Table 7-Course Degustation with Pairing',
      category: 'Dining & Bars',
      description: 'Private 12-seat kitchen experience curated by Executive Chef with premier vintage wines.',
      unitPriceUSD: 120,
      status: 'Available'
    },
    {
      id: 'srv-3',
      code: 'NET-01',
      name: 'High-Speed Starlink Satellite Internet (Full Voyage)',
      category: 'Telecommunications',
      description: 'Unlimited 100Mbps low-latency satellite connectivity across two mobile devices.',
      unitPriceUSD: 180,
      status: 'Available'
    },
    {
      id: 'srv-4',
      code: 'LND-02',
      name: 'Same-Day Express Laundry & Steaming Service',
      category: 'Laundry',
      description: 'Complete wardrobe wash, delicate press, and return within 4 hours to stateroom.',
      unitPriceUSD: 40,
      status: 'Available'
    },
    {
      id: 'srv-5',
      code: 'CAB-01',
      name: 'Private Lido Sunset Cabana Day Package',
      category: 'Cabin Concierge',
      description: 'Reserved shaded luxury cabana on Deck 12, includes chilled Champagne and fresh fruit skewers.',
      unitPriceUSD: 210,
      status: 'Available'
    }
  ],

  servicePurchases: [
    {
      id: 'sp-1',
      invoiceRef: 'INV-2026-1001',
      cabinNumber: 'D-802',
      passengerId: 'pass-1',
      passengerName: 'Dr. Alexander Vance',
      serviceId: 'srv-3',
      serviceName: 'High-Speed Starlink Satellite Internet (Full Voyage)',
      quantity: 1,
      unitPriceUSD: 180,
      totalAmountUSD: 180,
      purchaseDate: '2026-10-15 09:30',
      paymentStatus: 'Billed to Cabin',
      cashierStaff: 'Guest Relations Desk'
    },
    {
      id: 'sp-2',
      invoiceRef: 'INV-2026-1002',
      cabinNumber: 'D-804',
      passengerId: 'pass-2',
      passengerName: 'Nguyen Minh Tri',
      serviceId: 'srv-1',
      serviceName: 'Deep Sea Magnesium Body Scrub & Massage',
      quantity: 2,
      unitPriceUSD: 145,
      totalAmountUSD: 290,
      purchaseDate: '2026-10-16 14:15',
      paymentStatus: 'Billed to Cabin',
      cashierStaff: 'Mandara Ocean Spa Desk'
    },
    {
      id: 'sp-3',
      invoiceRef: 'INV-2026-1003',
      cabinNumber: 'S-1002',
      passengerId: 'pass-4',
      passengerName: 'Catherine Sterling',
      serviceId: 'srv-2',
      serviceName: 'Chef Table 7-Course Degustation with Pairing',
      quantity: 2,
      unitPriceUSD: 120,
      totalAmountUSD: 240,
      purchaseDate: '2026-10-16 19:00',
      paymentStatus: 'Settled Direct',
      cashierStaff: 'Maitre D'
    },
    {
      id: 'sp-4',
      invoiceRef: 'INV-2026-1004',
      cabinNumber: 'D-802',
      passengerId: 'pass-1',
      passengerName: 'Dr. Alexander Vance',
      serviceId: 'srv-4',
      serviceName: 'Same-Day Express Laundry & Steaming Service',
      quantity: 1,
      unitPriceUSD: 40,
      totalAmountUSD: 40,
      purchaseDate: '2026-10-17 11:20',
      paymentStatus: 'Billed to Cabin',
      cashierStaff: 'Housekeeping Services'
    }
  ],

  shoreExcursions: [
    {
      id: 'exc-1',
      code: 'EXC-VNSGN-01',
      title: 'Mekong Delta Riverboat & Coconut Grove Journey',
      portCode: 'VNSGN',
      portName: 'Saigon Port - Phu My',
      tourId: 'tour-1',
      durationHours: 7.5,
      difficulty: 'Moderate',
      departureTime: '08:30',
      maxParticipants: 45,
      enrolledCount: 38,
      pricePerPersonUSD: 115,
      guideName: 'Le Hoang Nam (Licensed English/French Guide)',
      status: 'Open'
    },
    {
      id: 'exc-2',
      code: 'EXC-VNDAD-02',
      title: 'Ancient Hoi An Lantern Town & Marble Mountains',
      portCode: 'VNDAD',
      portName: 'Tien Sa Port - Da Nang',
      tourId: 'tour-1',
      durationHours: 6.0,
      difficulty: 'Easy',
      departureTime: '09:00',
      maxParticipants: 50,
      enrolledCount: 42,
      pricePerPersonUSD: 95,
      guideName: 'Tran Mai Phuong',
      status: 'Open'
    },
    {
      id: 'exc-3',
      code: 'EXC-JPTYO-01',
      title: 'Tokyo Heritage: Meiji Shrine & Asakusa Senso-ji',
      portCode: 'JPTYO',
      portName: 'Tokyo International Cruise Terminal',
      tourId: 'tour-1',
      durationHours: 8.0,
      difficulty: 'Moderate',
      departureTime: '08:00',
      maxParticipants: 35,
      enrolledCount: 35,
      pricePerPersonUSD: 160,
      guideName: 'Kenji Sato',
      status: 'Full'
    },
    {
      id: 'exc-4',
      code: 'EXC-SGPIN-01',
      title: 'Gardens by the Bay & Marina Bay Sands SkyPark',
      portCode: 'SGPIN',
      portName: 'Marina Bay Cruise Centre',
      tourId: 'tour-1',
      durationHours: 4.5,
      difficulty: 'Easy',
      departureTime: '13:00',
      maxParticipants: 60,
      enrolledCount: 48,
      pricePerPersonUSD: 85,
      guideName: 'Alvin Tan',
      status: 'Completed'
    }
  ],

  expenses: [
    {
      id: 'exp-1',
      expenseCode: 'EXP-2026-901',
      category: 'Bunker Fuel',
      description: 'VLSFO Marine Bunker Fuel Bunkering (420 Metric Tons at Singapore Anchorage)',
      amountUSD: 285600,
      incurDate: '2026-10-14',
      vendor: 'Shell Marine Fuels Global',
      approvalStatus: 'Settled',
      approvedBy: 'Chief Engineer K. Holmgren'
    },
    {
      id: 'exp-2',
      expenseCode: 'EXP-2026-902',
      category: 'Port Dues & Pilotage',
      description: 'Berthing fees, pilotage escort, and tugboat assistance at Phu My Terminal',
      amountUSD: 14850,
      incurDate: '2026-10-17',
      vendor: 'Saigon Port Authority',
      approvalStatus: 'Approved',
      approvedBy: 'Captain M. Sterling'
    },
    {
      id: 'exp-3',
      expenseCode: 'EXP-2026-903',
      category: 'Provisions & F&B',
      description: 'Fresh seafood, artisan dairy, and organic produce provisioning delivery',
      amountUSD: 42100,
      incurDate: '2026-10-15',
      vendor: 'SingaMarine Provisioners Ltd',
      approvalStatus: 'Settled',
      approvedBy: 'Hotel Director G. Rossi'
    },
    {
      id: 'exp-4',
      expenseCode: 'EXP-2026-904',
      category: 'Entertainment Licensing',
      description: 'Theatrical music rights and guest performer appearance fees for Oct 2026',
      amountUSD: 8900,
      incurDate: '2026-10-10',
      vendor: 'Broadway Maritime Productions',
      approvalStatus: 'Approved',
      approvedBy: 'Cruise Director S. Bennett'
    },
    {
      id: 'exp-5',
      expenseCode: 'EXP-2026-905',
      category: 'Maintenance & Drydock',
      description: 'Quarterly overhaul of secondary desalination reverse-osmosis unit',
      amountUSD: 12400,
      incurDate: '2026-10-08',
      vendor: 'Wartsila Marine Technical Services',
      approvalStatus: 'Settled',
      approvedBy: 'Chief Engineer K. Holmgren'
    }
  ]
};

// Load or initialize
export const getOperationalData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse stored operational data, resetting to baseline', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

export const saveOperationalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save operational data', e);
  }
};

// Generic CRUD operations
export const operationalStore = {
  getAll: (collection) => {
    const data = getOperationalData();
    return data[collection] || [];
  },

  getById: (collection, id) => {
    const data = getOperationalData();
    return (data[collection] || []).find(item => item.id === id);
  },

  add: (collection, item) => {
    const data = getOperationalData();
    const newItem = {
      ...item,
      id: item.id || `${collection.slice(0, 3)}-${Date.now()}`
    };
    data[collection] = [newItem, ...(data[collection] || [])];
    saveOperationalData(data);
    return newItem;
  },

  update: (collection, id, updates) => {
    const data = getOperationalData();
    data[collection] = (data[collection] || []).map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    saveOperationalData(data);
    return data[collection].find(item => item.id === id);
  },

  delete: (collection, id) => {
    const data = getOperationalData();
    data[collection] = (data[collection] || []).filter(item => item.id !== id);
    saveOperationalData(data);
    return true;
  },

  resetToDefault: () => {
    saveOperationalData(initialData);
    return initialData;
  },

  // Computed metrics strictly from existing domain records
  computeMetrics: () => {
    const data = getOperationalData();
    const tours = data.cruiseTours || [];
    const activeTours = tours.filter(t => t.status === 'In Progress' || t.status === 'Planning');
    const passengers = data.passengers || [];
    const bookings = data.bookings || [];
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'Confirmed');
    const services = data.services || [];
    const purchases = data.servicePurchases || [];
    const excursions = data.shoreExcursions || [];
    const expenses = data.expenses || [];

    const totalServiceRevenue = purchases.reduce((acc, p) => acc + (Number(p.totalAmountUSD) || 0), 0);
    const totalTourBookingRevenue = bookings.reduce((acc, b) => acc + (Number(b.totalAmountUSD) || 0), 0);
    const totalGrossRevenue = totalServiceRevenue + totalTourBookingRevenue;
    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amountUSD) || 0), 0);
    const netBalance = totalGrossRevenue - totalExpenses;

    return {
      activeToursCount: activeTours.length,
      totalToursCount: tours.length,
      totalPassengersCount: passengers.length,
      confirmedBookingsCount: confirmedBookings.length,
      totalBookingsCount: bookings.length,
      activeExcursionsCount: excursions.filter(e => e.status === 'Open').length,
      totalServicesCatalogCount: services.length,
      servicePurchasesCount: purchases.length,
      totalServiceRevenueUSD: totalServiceRevenue,
      totalTourBookingRevenueUSD: totalTourBookingRevenue,
      totalGrossRevenueUSD: totalGrossRevenue,
      totalOperatingExpensesUSD: totalExpenses,
      netBalanceUSD: netBalance,
      openPortsCount: (data.ports || []).filter(p => p.status === 'Open').length
    };
  }
};
