export const navigationHome = { page: 'home', path: '', label: 'Home' };

export const navigationGroups = [
  {
    id: 'personalise',
    label: 'Personalise',
    items: [
      { page: 'lithophane', path: 'lithophane/', label: 'Lithophanes' },
      { page: 'fan', path: 'folding-fan/', label: 'Fans' },
      { page: 'nameplates', path: 'nameplates/', label: 'Nameplates' },
      { page: 'keyrings', path: 'keyrings/', label: 'Keyrings' },
      { page: 'clickers', path: 'clickers/', label: 'Clickers' },
    ],
  },
  {
    id: 'home-living',
    label: 'Home & Living',
    items: [
      { page: 'coasters', path: 'coasters/', label: 'Coasters' },
      { page: 'kitchen', path: 'kitchen/', label: 'Kitchen' },
      { page: 'bathroom', path: 'bathroom/', label: 'Bathroom' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { page: 'desk', path: 'desk/', label: 'Desk collection' },
      { page: 'mounts', path: 'mounts/', label: 'Desk mounts' },
      { page: 'pegboards', path: 'pegboards/', label: 'Pegboards' },
    ],
  },
  {
    id: 'hobbies-games',
    label: 'Hobbies & Games',
    items: [
      { page: 'seeds', path: 'seeds/', label: 'Seed starting' },
      { page: 'crochet', path: 'crochet/', label: 'Crochet' },
      { page: 'games', path: 'games/', label: 'Board games' },
    ],
  },
];
