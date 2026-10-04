// Career content, adapted from WAYPOINTS data.js. Stops are drawn in the order listed (oldest first).
import type { CareerStop, Profile, Text } from './types';

const t = (fr: string, en: string): Text => ({ en, fr });

const FRANCE = t('France', 'France');
const AUSTRALIA = t('Australie', 'Australia');
const MALAYSIA = t('Malaisie', 'Malaysia');
const WORKING_HOLIDAY = t('Visa vacances-travail', 'Working holiday visa');
const FRONT_END = t('Développeur front-end', 'Front-end developer');

export const PROFILE: Profile = {
  location: t('Saint-Herblain, France', 'Saint-Herblain, France'),
  name: 'Dylan J. Gerrits',
  tagline: t(
    'Véritable couteau franco-suisse, plus de dix ans à concevoir, développer et mettre en production des solutions logicielles, de l’architecture au déploiement.',
    'A true Franco-Swiss army knife: over ten years designing, building and shipping software, from architecture to deployment.',
  ),
  title: t(
    'Ingénieur polyvalent en architecture et développement de systèmes d’information et d’outillage IA',
    'Versatile engineer in information systems architecture, development and AI tooling',
  ),
};

export const CAREER: readonly CareerStop[] = [
  {
    caption: t(
      'Étudiant, je distribue des journaux et je compte des étagères. Il faut bien payer le loyer.',
      'As a student, I hand out newspapers and count shelves. Rent doesn’t pay itself.',
    ),
    country: FRANCE,
    entries: [
      {
        company: 'INTERVALLES',
        from: '2011-03',
        role: t('Démarcheur / Distributeur', 'Street canvasser / Distributor'),
        to: '2012-06',
      },
      { company: 'RGIS', from: '2011-03', role: t('Inventoriste', 'Inventory clerk'), to: '2011-04' },
    ],
    kind: 'job',
    motifs: ['newspaper', 'barcode'],
    place: t('Lyon', 'Lyon'),
    split: true,
  },
  {
    caption: t(
      'Premier poste de développeur : des millions de comptes clients, et bientôt une petite équipe à coordonner.',
      'First developer job: millions of customer accounts, and soon a small team to lead.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          t(
            'Pilotage d’un traitement de refacturation de 30 millions de comptes clients.',
            'Led a re-billing run across 30 million customer accounts.',
          ),
          t(
            'Coordination de l’équipe, priorisation avec les clients, suivi des livrables.',
            'Coordinated the team, set priorities with clients, tracked deliverables.',
          ),
          t(
            'Maintenance des scripts et processus d’injection de données.',
            'Maintained data injection scripts and processes.',
          ),
          t('Automatisation des rapports d’activité quotidiens.', 'Automated the daily activity reports.'),
        ],
        company: 'Accenture',
        from: '2013-06',
        role: t('Développeur | Chef d’équipe', 'Developer | Team lead'),
        summary: t(
          'Développement, maintenance applicative et coordination pour des fournisseurs d’énergie, en environnements SAP IS-U et CRM.',
          'Development, application maintenance and coordination for energy suppliers, on SAP IS-U and CRM.',
        ),
        to: '2016-08',
      },
    ],
    kind: 'job',
    motifs: ['bolt'],
    place: t('Nantes', 'Nantes'),
  },
  {
    caption: t('Dans des champs sans fin, je traque les mauvaises herbes.', 'In endless fields, I hunt weeds.'),
    chapter: t(
      'Trois ans plus tard, je pose le clavier pour voyager. J’atteris en l’Australie, un visa vacances-travail en poche.',
      'Three years in, I put the keyboard down to travel. I land in Australia, a working holiday visa in my pocket.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'CWC Professional AG Contractors',
        context: WORKING_HOLIDAY,
        from: '2016-11',
        role: t('Contractant agricole', 'Agricultural contractor'),
        summary: t(
          'Détection de Chondrilla juncea dans les champs, dans le cadre d’un visa vacances-travail.',
          'Scouting fields for Chondrilla juncea (skeleton weed) on a working holiday visa.',
        ),
        to: '2016-12',
      },
    ],
    kind: 'job',
    motifs: ['skeletonWeed'],
    place: t('Merredin', 'Merredin'),
    // The way Dylan went to Australia, its main stops (Dylan, 2026-10-04).
    route: [
      { at: [6.1, 46.2], name: t('Genève', 'Geneva'), side: 'right' },
      { at: [37.6, 55.8], name: t('Moscou', 'Moscow'), side: 'above' },
      { at: [100.5, 13.8], name: t('Bangkok', 'Bangkok'), side: 'right' },
      { at: [101.7, 3.1], name: t('Kuala Lumpur', 'Kuala Lumpur'), side: 'left' },
      { at: [103.8, 1.3], name: t('Singapour', 'Singapore'), side: 'right' },
      { at: [106.8, -6.2], name: t('Jakarta', 'Jakarta'), side: 'left' },
      { at: [115.9, -31.9], name: t('Perth', 'Perth'), side: 'left' },
    ],
  },
  {
    caption: t(
      'Une cuisine de bar, des services qui s’enchaînent. Les mains apprennent autre chose.',
      'A bar kitchen, one shift after another. My hands learn something new.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'Gramercy Bar & Kitchen',
        context: WORKING_HOLIDAY,
        from: '2017-01',
        role: t('Commis de cuisine', 'Kitchen hand'),
        to: '2017-07',
      },
    ],
    kind: 'job',
    motifs: ['pan'],
    place: t('Perth', 'Perth'),
  },
  {
    caption: t(
      'Retour à la terre : du bétail et des moutons à marquer.',
      'Back on the land, marking cattle and sheep.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'J.A. Long & L.A. Cameron',
        context: WORKING_HOLIDAY,
        from: '2017-09',
        role: t('Contractant agricole', 'Agricultural contractor'),
        summary: t('Marquage bovin et ovin.', 'Cattle and sheep marking.'),
        to: '2017-11',
      },
    ],
    kind: 'job',
    motifs: ['pickets'],
    place: t('Dubbo', 'Dubbo'),
    signpost: true,
  },
  {
    caption: t(
      'À Bali, je rouvre l’ordinateur. Le code peut voyager avec moi.',
      'In Bali I open the laptop again. Code can travel with me.',
    ),
    chapter: t('L’Asie, sac au dos.', 'Asia, backpack on.'),
    country: t('Indonésie', 'Indonesia'),
    entries: [
      {
        bullets: [
          t(
            'Galerie de réalisations filtrable par projet et matériau.',
            'Portfolio gallery filterable by project and material.',
          ),
          t(
            'Formulaire de devis avec estimation préliminaire automatisée.',
            'Quote form with an automatic preliminary estimate.',
          ),
        ],
        company: 'Freelance',
        from: '2017-11',
        role: FRONT_END,
        summary: t('Site vitrine pour un menuisier.', 'Showcase website for a carpenter.'),
        to: '2017-12',
      },
    ],
    kind: 'job',
    motifs: ['candiBentar', 'browserGallery'],
    place: t('Ubud', 'Ubud'),
    way: 'backpack',
  },
  {
    caption: t(
      'Nomade, je construis une plateforme pour une agence de voyage, depuis la route.',
      'On the move, I build a platform for a travel agency, from the road.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          t('Interfaces de réservation et paiement en ligne.', 'Booking and online payment interfaces.'),
          t(
            'Espace opérateurs pour gérer le catalogue d’activités.',
            'Operator area to manage the activity catalogue.',
          ),
          t('Interface bilingue anglais / malais.', 'Bilingual English / Malay interface.'),
        ],
        company: 'Freelance',
        from: '2018-02',
        role: FRONT_END,
        summary: t(
          'Plateforme de réservation d’activités pour une agence touristique et deux prestataires.',
          'Activity booking platform for a travel agency and two operators.',
        ),
        to: '2018-04',
      },
    ],
    kind: 'job',
    motifs: ['browserCode'],
    place: t('George Town', 'George Town'),
    remoteFrom: [
      t('Munich, Allemagne', 'Munich, Germany'),
      t('Prague, Tchéquie', 'Prague, Czechia'),
      t('Vienne, Autriche', 'Vienna, Austria'),
      t('Bratislava, Slovaquie', 'Bratislava, Slovakia'),
      t('Budapest, Hongrie', 'Budapest, Hungary'),
      t('Sofia, Bulgarie', 'Sofia, Bulgaria'),
      t('Bangkok, Thaïlande', 'Bangkok, Thailand'),
    ],
  },
  {
    caption: t(
      'Un hôtel à Taïwan, ses chambres, sa réservation en ligne.',
      'A hotel in Taiwan, its rooms, its online booking.',
    ),
    country: t('Taïwan', 'Taiwan'),
    entries: [
      {
        bullets: [
          t('Calendrier interactif des disponibilités.', 'Interactive availability calendar.'),
          t('Parcours de paiement en ligne.', 'Online payment flow.'),
          t('Galerie photo filtrable par type de chambre.', 'Photo gallery filterable by room type.'),
        ],
        company: 'Freelance',
        from: '2018-05',
        role: FRONT_END,
        summary: t('Site web d’un hôtel et son parcours de réservation.', 'Hotel website and its booking flow.'),
        to: '2018-06',
      },
    ],
    kind: 'job',
    motifs: ['browserCalendar'],
    place: t('Taichung', 'Taichung'),
  },
  {
    caption: t(
      'Je passe côté serveur, pour aider des ambulances à trouver le bon hôpital.',
      'I move to the back end, helping ambulances find the right hospital.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          t(
            'Calcul d’itinéraires selon spécialité médicale, distance et trafic.',
            'Route planning by medical specialty, distance and traffic.',
          ),
          t('Priorisation des urgences selon la gravité.', 'Emergency triage by severity.'),
          t(
            'Intégration aux systèmes hospitaliers (lits, équipements).',
            'Integration with hospital systems (beds, equipment).',
          ),
          t('CI/CD avec GitLab, Docker et Amazon EC2.', 'CI/CD with GitLab, Docker and Amazon EC2.'),
        ],
        company: 'Freelance',
        from: '2018-09',
        role: t('Développeur back-end', 'Back-end developer'),
        summary: t(
          'API de géolocalisation et d’aide à l’orientation pour une société d’ambulances.',
          'Geolocation and dispatch-routing API for an ambulance company.',
        ),
        to: '2018-12',
      },
    ],
    kind: 'job',
    motifs: ['ambulance'],
    place: t('Kuala Lumpur', 'Kuala Lumpur'),
    remoteFrom: [t('Langkawi, Malaisie', 'Langkawi, Malaysia')],
  },
  {
    caption: t('Pour la première fois, c’est moi qui mène le projet.', 'For the first time, I lead the project.'),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          t('Tableaux de bord et visualisations revenus / dépenses.', 'Income / expense dashboards and charts.'),
          t('Catégories et dépenses récurrentes.', 'Categories and recurring expenses.'),
          t('Exports CSV filtrables et personnalisables.', 'Filterable, customisable CSV exports.'),
        ],
        company: 'Freelance',
        from: '2019-01',
        role: t('(Lead) Développeur front-end', '(Lead) Front-end developer'),
        summary: t(
          'Front-end d’une application serverless de gestion budgétaire pour un indépendant.',
          'Front end of a serverless budgeting app for a self-employed client.',
        ),
        to: '2019-06',
      },
    ],
    kind: 'job',
    motifs: ['bars'],
    place: t('Malacca', 'Malacca'),
    remoteFrom: [
      t('Die, France', 'Die, France'),
      t('Lyon, France', 'Lyon, France'),
      t('Nantes, France', 'Nantes, France'),
    ],
  },
  {
    caption: t('Entre deux contrats, je travaille sur le tarmac.', 'Between contracts, I work on the tarmac.'),
    chapter: t('La France, le retour.', 'France, coming home.'),
    country: FRANCE,
    entries: [
      {
        company: 'AviaPartner Nantes-Atlantique',
        from: '2019-11',
        role: t('Agent de trafic', 'Ramp agent'),
        to: '2019-12',
      },
    ],
    kind: 'job',
    motifs: ['plane'],
    place: t('Bouguenais', 'Bouguenais'),
  },
  {
    caption: t(
      'Depuis Nantes, un chatbot pour une plateforme à l’autre bout du monde.',
      'From Nantes, a chatbot for a platform on the other side of the world.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          t(
            'Chatbot adossé à une base de plus de 500 questions fréquentes.',
            'Chatbot backed by a base of over 500 frequently asked questions.',
          ),
          t(
            'Interface d’administration pour faire vivre la base de connaissances.',
            'Admin interface to keep the knowledge base alive.',
          ),
        ],
        company: 'Freelance',
        from: '2020-02',
        role: t('Développeur full-stack', 'Full-stack developer'),
        summary: t(
          'Outil de support client automatisé pour une plateforme multiservice.',
          'Automated customer support tool for a multi-service platform.',
        ),
        to: '2020-05',
      },
    ],
    kind: 'job',
    motifs: ['bubble'],
    place: t('Kuala Lumpur', 'Kuala Lumpur'),
    remoteFrom: [t('Nantes, France', 'Nantes, France')],
  },
  {
    caption: t(
      'J’officialise ce que la route m’a appris : un titre de développeur.',
      'I make official what the road taught me: a developer’s diploma.',
    ),
    entries: [
      {
        company: 'ENI École Informatique',
        from: '2020-06',
        remote: true,
        role: t('Développeur web et web mobile', 'Web and mobile web developer'),
        summary: t(
          'Titre professionnel de niveau 5 (Bac+2) : Java, Java EE, PHP et Symfony, SQL Server, JavaScript, Android.',
          'Level 5 professional title (two-year degree): Java, Java EE, PHP and Symfony, SQL Server, JavaScript, Android.',
        ),
        to: '2020-11',
      },
    ],
    kind: 'training',
    label: t('Formation', 'Training'),
    motifs: ['mortarboard'],
    place: t('En ligne', 'Online'),
    remoteFrom: [
      t('Die, France', 'Die, France'),
      t('Londres, Royaume-Uni', 'London, United Kingdom'),
      t('Bucarest, Roumanie', 'Bucharest, Romania'),
      t('Varna, Bulgarie', 'Varna, Bulgaria'),
      t('Bourgas, Bulgarie', 'Burgas, Bulgaria'),
      t('Istanbul, Turquie', 'Istanbul, Türkiye'),
      t('Die, France', 'Die, France'),
    ],
  },
  {
    caption: t(
      'Une plateforme de cours, conçue et livrée en deux semaines.',
      'A course platform, designed and shipped in two weeks.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          t('Achats de modules et crédits de réservation.', 'Module purchases and booking credits.'),
          t('Gestion des utilisateurs et paiements en ligne.', 'User management and online payments.'),
          t('Blog avec administration et modération.', 'Blog with administration and moderation.'),
          t('Contenus interactifs pour l’anglais et l’espagnol.', 'Interactive content for English and Spanish.'),
        ],
        company: 'The Inspire Academy',
        from: '2020-11',
        role: t('Développeur full-stack', 'Full-stack developer'),
        summary: t(
          'Application de vente de cours et de réservation de cours particuliers, conçue et livrée en deux semaines.',
          'App for selling courses and booking private lessons, designed and shipped in two weeks.',
        ),
        to: '2021-01',
      },
    ],
    kind: 'job',
    motifs: ['book'],
    place: t('Biarritz', 'Biarritz'),
    remoteFrom: [t('Istanbul, Turquie', 'Istanbul, Türkiye'), t('Die, France', 'Die, France')],
  },
  {
    caption: t(
      'À Istanbul, je mène l’équipe d’une plateforme pour un collectif d’artistes.',
      'In Istanbul, I lead the team behind a platform for an artists’ collective.',
    ),
    country: t('Turquie', 'Türkiye'),
    entries: [
      {
        bullets: [
          t('Parcours d’achat direct et d’offre négociable.', 'Direct purchase and negotiable-offer flows.'),
          t('Impressions déclinées en formats et supports.', 'Prints offered in several sizes and media.'),
          t(
            'Paiements multidevises, remboursements, paiements échelonnés.',
            'Multi-currency payments, refunds, instalments.',
          ),
        ],
        company: 'Freelance',
        from: '2021-02',
        role: t('(Lead) Développeur full-stack', '(Lead) Full-stack developer'),
        summary: t(
          'Plateforme de vente d’œuvres d’art pour un collectif d’artistes.',
          'Artwork sales platform for an artists’ collective.',
        ),
        to: '2021-06',
      },
    ],
    kind: 'job',
    motifs: ['frame'],
    place: t('Istanbul', 'Istanbul'),
    remoteFrom: [t('Die, France', 'Die, France'), 'on-site', t('Charm el-Cheikh, Égypte', 'Sharm El Sheikh, Egypt')],
  },
  {
    caption: t(
      'Un cran plus haut : je me forme à l’architecture logicielle.',
      'A step up: I train in software architecture.',
    ),
    entries: [
      {
        company: 'OpenClassrooms',
        from: '2021-06',
        remote: true,
        role: t(
          'Expert en développement logiciel, architecture logicielle',
          'Software development expert, software architecture',
        ),
        summary: t(
          'Titre de niveau 7 (Bac+5) : analyse et conception d’architectures logicielles, validation de solutions, coordination d’équipe, relation client et parties prenantes.',
          'Level 7 title (master’s level): software architecture analysis and design, solution validation, team coordination, client and stakeholder relations.',
        ),
        to: '2022-06',
      },
    ],
    kind: 'training',
    label: t('Formation', 'Training'),
    motifs: ['mortarboard'],
    place: t('En ligne', 'Online'),
    remoteFrom: [
      t('Le Caire, Égypte', 'Cairo, Egypt'),
      t('Nantes, France', 'Nantes, France'),
      t('Playa del Carmen, Mexique', 'Playa del Carmen, Mexico'),
      t('Bogota, Colombie', 'Bogotá, Colombia'),
      t('Lima, Pérou', 'Lima, Peru'),
    ],
  },
  {
    caption: t(
      'À Lima, je dessine l’architecture avant qu’on écrive la première ligne.',
      'In Lima, I draw the architecture before the first line is written.',
    ),
    country: t('Pérou', 'Peru'),
    entries: [
      {
        bullets: [
          t(
            'Architecture cible documentée, pensée performance et évolutivité.',
            'Documented target architecture, designed for performance and scalability.',
          ),
          t(
            'Spécifications techniques : flux, modèles de données, interfaces.',
            'Technical specifications: flows, data models, interfaces.',
          ),
          t('Estimation des charges, planning et budget complet.', 'Effort estimates, schedule and full budget.'),
        ],
        company: 'Freelance',
        from: '2022-05',
        role: t('Architecte logiciel', 'Software architect'),
        summary: t(
          'Cadrage technique d’un MVP pour une société d’assurance.',
          'Technical scoping of an MVP for an insurance company.',
        ),
        to: '2022-07',
      },
    ],
    kind: 'job',
    motifs: ['blueprint'],
    place: t('Lima', 'Lima'),
  },
  {
    caption: t(
      'Retour à Lyon, là où tout a commencé. Développeur sénior, cette fois.',
      'Back in Lyon, where it all began. A senior developer this time.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          t(
            'Web app SSR, back-office de contenus et majeure partie de l’app mobile.',
            'SSR web app, content back office and most of the mobile app.',
          ),
          t(
            'Messagerie instantanée et appels vidéo web et mobile.',
            'Instant messaging and video calls, web and mobile.',
          ),
          t(
            'API REST, modèles de données, types front générés depuis le back.',
            'REST API, data models, front-end types generated from the back end.',
          ),
          t('Reprise de la coordination projet avec le client.', 'Took over project coordination with the client.'),
        ],
        company: 'Rubrash · Working in Lyon',
        from: '2022-08',
        role: t('Développeur full-stack sénior', 'Senior full-stack developer'),
        summary: t(
          'Deux produits : une plateforme de contenus pour une société de gestion de patrimoine et une application logistique pour la grande distribution.',
          'Two products: a content platform for a wealth management firm and a logistics app for large retailers.',
        ),
        to: '2023-03',
      },
    ],
    kind: 'job',
    motifs: ['phone'],
    place: t('Lyon', 'Lyon'),
  },
  {
    caption: t(
      'À mon tour de transmettre. Mes apprenants tracent leur propre ligne.',
      'My turn to pass it on. My learners draw lines of their own.',
    ),
    country: FRANCE,
    entries: [
      {
        company: 'OpenClassrooms',
        from: '2023-03',
        remote: true,
        role: t('Mentor et évaluateur', 'Mentor and assessor'),
        summary: t(
          'Mentorat hebdomadaire et évaluation des parcours développement et intégration web. Une dizaine d’apprenants menés jusqu’au titre.',
          'Weekly mentoring and assessment on the web development and integration tracks. About ten learners taken through to their diploma.',
        ),
        to: null,
      },
      {
        company: 'École O’clock',
        from: '2023-03',
        remote: true,
        role: t('Formateur · Tuteur pédagogique', 'Trainer · Academic tutor'),
        summary: t(
          'Modules back, front, mobile, GraphQL, microservices, sécurité, conteneurisation, CI/CD et Docker avancé.',
          'Modules on back end, front end, mobile, GraphQL, microservices, security, containers, CI/CD and advanced Docker.',
        ),
        to: '2025-02',
      },
      {
        company: 'EPSI',
        from: '2025-01',
        role: t('Formateur · Tuteur · Jury', 'Trainer · Tutor · Examiner'),
        summary: t(
          'Module CI/CD, tutorat de mémoires et jurys du titre Expert en informatique et SI (RNCP).',
          'CI/CD module, thesis tutoring and juries for the IT and Information Systems Expert title (RNCP).',
        ),
        to: '2025-07',
      },
    ],
    kind: 'job',
    label: t('Transmission', 'Teaching'),
    motifs: ['apprentices'],
    place: t('Nantes', 'Nantes'),
  },
  {
    caption: t(
      'Le paiement, là où chaque erreur se compte en euros.',
      'Payments, where every bug is counted in euros.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          t(
            'Architecture logicielle selon la clean architecture.',
            'Software architecture following clean architecture.',
          ),
          t(
            'APIs et services serverless Node.js / Express sur Google Cloud.',
            'Serverless Node.js / Express APIs and services on Google Cloud.',
          ),
          t('Infrastructure Terraform, livraisons GitLab CI.', 'Terraform infrastructure, GitLab CI delivery.'),
          t(
            'App React Native / Expo, notifications Firebase Cloud Messaging.',
            'React Native / Expo app, Firebase Cloud Messaging notifications.',
          ),
          t('Bibliothèque QA réutilisable pour les tests E2E.', 'Reusable QA library for E2E tests.'),
          t(
            'Intégration de l’IA dans les pratiques et outils internes.',
            'Brought AI into internal practices and tools.',
          ),
        ],
        company: 'HiPay',
        from: '2025-03',
        role: t('Ingénieur logiciel sénior', 'Senior software engineer'),
        summary: t(
          'APIs et application mobile dans le paiement, dont une solution SoftPOS d’encaissement sur terminaux mobiles.',
          'Payment APIs and a mobile app, including a SoftPOS solution for taking payments on mobile devices.',
        ),
        to: null,
      },
    ],
    kind: 'job',
    label: t('Paiement', 'Payments'),
    motifs: ['card'],
    place: t('Nantes', 'Nantes'),
  },
  {
    caption: t(
      'Aujourd’hui, de l’architecture à la production, tout le back-end entre mes mains.',
      'Today, from architecture to production, the whole back end in my hands.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          t(
            'API Elysia + TypeScript sur Cloudflare Workers, client typé Eden Treaty.',
            'Elysia + TypeScript API on Cloudflare Workers, typed Eden Treaty client.',
          ),
          t(
            'Supabase + réplique de lecture Cloudflare D1, resynchronisation toutes les 6 h.',
            'Supabase with a Cloudflare D1 read replica, resynced every 6 hours.',
          ),
          t(
            'Supabase Auth, RLS, chat temps réel et notifications.',
            'Supabase Auth, RLS, real-time chat and notifications.',
          ),
          t(
            'Images sur R2, cartes Open Graph générées avec Satori + WebAssembly.',
            'Images on R2, Open Graph cards generated with Satori + WebAssembly.',
          ),
          t('En production pour 5 €/mois d’infrastructure.', 'In production for €5 a month in infrastructure.'),
        ],
        company: 'Freelance',
        from: '2026-01',
        role: t(
          '(Lead) Architecte logiciel et développeur back-end',
          '(Lead) Software architect and back-end developer',
        ),
        summary: t(
          'Tout le back-end d’une plateforme communautaire reliant artistes et clients, jusqu’à la production.',
          'The entire back end of a community platform connecting artists and clients, through to production.',
        ),
        to: '2026-06',
      },
    ],
    kind: 'job',
    label: t('Freelance', 'Freelance'),
    motifs: ['cloud'],
    place: t('Paris', 'Paris'),
    remoteFrom: [t('Saint-Herblain, France', 'Saint-Herblain, France')],
  },
];
