// Career content, adapted from WAYPOINTS data.js. Stops are drawn in the order listed (oldest first).
import { bilingual, type CareerStop } from './types';

const FRANCE = bilingual('France', 'France');
const AUSTRALIA = bilingual('Australie', 'Australia');
const MALAYSIA = bilingual('Malaisie', 'Malaysia');
const WORKING_HOLIDAY = bilingual('Visa vacances-travail', 'Working holiday visa');
const FRONT_END = bilingual('Développeur front-end', 'Front-end developer');

/** Dylan’s career, one stop per place, oldest first. */
export const CAREER: readonly CareerStop[] = [
  {
    caption: bilingual(
      'Étudiant, je distribue des journaux et je compte des étagères. Il faut bien payer le loyer.',
      'As a student, I hand out newspapers and count shelves. Rent doesn’t pay itself.',
    ),
    country: FRANCE,
    entries: [
      {
        company: 'INTERVALLES',
        from: '2011-03',
        role: bilingual('Démarcheur / Distributeur', 'Street canvasser / Distributor'),
        to: '2012-06',
      },
      { company: 'RGIS', from: '2011-03', role: bilingual('Inventoriste', 'Inventory clerk'), to: '2011-04' },
    ],
    kind: 'Job',
    motifs: ['Newspaper', 'Barcode'],
    place: bilingual('Lyon', 'Lyon'),
    split: true,
  },
  {
    caption: bilingual(
      'Premier poste de développeur : des millions de comptes clients, et bientôt une petite équipe à coordonner.',
      'First developer job: millions of customer accounts, and soon a small team to lead.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          bilingual(
            'Pilotage d’un traitement de refacturation de 30 millions de comptes clients.',
            'Led a re-billing run across 30 million customer accounts.',
          ),
          bilingual(
            'Coordination de l’équipe, priorisation avec les clients, suivi des livrables.',
            'Coordinated the team, set priorities with clients, tracked deliverables.',
          ),
          bilingual(
            'Maintenance des scripts et processus d’injection de données.',
            'Maintained data injection scripts and processes.',
          ),
          bilingual('Automatisation des rapports d’activité quotidiens.', 'Automated the daily activity reports.'),
        ],
        company: 'Accenture',
        from: '2013-06',
        role: bilingual('Développeur | Chef d’équipe', 'Developer | Team lead'),
        summary: bilingual(
          'Développement, maintenance applicative et coordination pour des fournisseurs d’énergie, en environnements SAP IS-U et CRM.',
          'Development, application maintenance and coordination for energy suppliers, on SAP IS-U and CRM.',
        ),
        to: '2016-08',
      },
    ],
    kind: 'Job',
    motifs: ['Bolt'],
    place: bilingual('Nantes', 'Nantes'),
  },
  {
    caption: bilingual('Dans des champs sans fin, je traque les mauvaises herbes.', 'In endless fields, I hunt weeds.'),
    chapter: bilingual(
      'Trois ans plus tard, je pose le clavier pour voyager. J’atteris en l’Australie, un visa vacances-travail en poche.',
      'Three years in, I put the keyboard down to travel. I land in Australia, a working holiday visa in my pocket.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'CWC Professional AG Contractors',
        context: WORKING_HOLIDAY,
        from: '2016-11',
        role: bilingual('Contractant agricole', 'Agricultural contractor'),
        summary: bilingual(
          'Détection de Chondrilla juncea dans les champs, dans le cadre d’un visa vacances-travail.',
          'Scouting fields for Chondrilla juncea (skeleton weed) on a working holiday visa.',
        ),
        to: '2016-12',
      },
    ],
    kind: 'Job',
    motifs: ['SkeletonWeed'],
    place: bilingual('Merredin', 'Merredin'),
    // The way Dylan went to Australia, its main stops (Dylan, 2026-10-04).
    route: [
      { at: [6.1, 46.2], name: bilingual('Genève', 'Geneva'), side: 'Right' },
      { at: [37.6, 55.8], name: bilingual('Moscou', 'Moscow'), side: 'Above' },
      { at: [100.5, 13.8], name: bilingual('Bangkok', 'Bangkok'), side: 'Right' },
      { at: [101.7, 3.1], name: bilingual('Kuala Lumpur', 'Kuala Lumpur'), side: 'Left' },
      { at: [103.8, 1.3], name: bilingual('Singapour', 'Singapore'), side: 'Right' },
      { at: [106.8, -6.2], name: bilingual('Jakarta', 'Jakarta'), side: 'Left' },
      { at: [115.9, -31.9], name: bilingual('Perth', 'Perth'), side: 'Left' },
    ],
  },
  {
    caption: bilingual(
      'Une cuisine de bar, des services qui s’enchaînent. Les mains apprennent autre chose.',
      'A bar kitchen, one shift after another. My hands learn something new.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'Gramercy Bar & Kitchen',
        context: WORKING_HOLIDAY,
        from: '2017-01',
        role: bilingual('Commis de cuisine', 'Kitchen hand'),
        to: '2017-07',
      },
    ],
    kind: 'Job',
    motifs: ['Pan'],
    place: bilingual('Perth', 'Perth'),
  },
  {
    caption: bilingual(
      'Retour à la terre : du bétail et des moutons à marquer.',
      'Back on the land, marking cattle and sheep.',
    ),
    country: AUSTRALIA,
    entries: [
      {
        company: 'J.A. Long & L.A. Cameron',
        context: WORKING_HOLIDAY,
        from: '2017-09',
        role: bilingual('Contractant agricole', 'Agricultural contractor'),
        summary: bilingual('Marquage bovin et ovin.', 'Cattle and sheep marking.'),
        to: '2017-11',
      },
    ],
    kind: 'Job',
    motifs: ['Pickets'],
    place: bilingual('Dubbo', 'Dubbo'),
    signpost: true,
  },
  {
    caption: bilingual(
      'À Bali, je rouvre l’ordinateur. Le code peut voyager avec moi.',
      'In Bali I open the laptop again. Code can travel with me.',
    ),
    chapter: bilingual('L’Asie, sac au dos.', 'Asia, backpack on.'),
    country: bilingual('Indonésie', 'Indonesia'),
    entries: [
      {
        bullets: [
          bilingual(
            'Galerie de réalisations filtrable par projet et matériau.',
            'Portfolio gallery filterable by project and material.',
          ),
          bilingual(
            'Formulaire de devis avec estimation préliminaire automatisée.',
            'Quote form with an automatic preliminary estimate.',
          ),
        ],
        company: 'Freelance',
        from: '2017-11',
        role: FRONT_END,
        summary: bilingual('Site vitrine pour un menuisier.', 'Showcase website for a carpenter.'),
        to: '2017-12',
      },
    ],
    kind: 'Job',
    motifs: ['CandiBentar', 'BrowserGallery'],
    place: bilingual('Ubud', 'Ubud'),
    way: 'Backpack',
  },
  {
    caption: bilingual(
      'Nomade, je construis une plateforme pour une agence de voyage, depuis la route.',
      'On the move, I build a platform for a travel agency, from the road.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          bilingual('Interfaces de réservation et paiement en ligne.', 'Booking and online payment interfaces.'),
          bilingual(
            'Espace opérateurs pour gérer le catalogue d’activités.',
            'Operator area to manage the activity catalogue.',
          ),
          bilingual('Interface bilingue anglais / malais.', 'Bilingual English / Malay interface.'),
        ],
        company: 'Freelance',
        from: '2018-02',
        role: FRONT_END,
        summary: bilingual(
          'Plateforme de réservation d’activités pour une agence touristique et deux prestataires.',
          'Activity booking platform for a travel agency and two operators.',
        ),
        to: '2018-04',
      },
    ],
    kind: 'Job',
    motifs: ['BrowserCode'],
    place: bilingual('George Town', 'George Town'),
    remoteFrom: [
      bilingual('Munich, Allemagne', 'Munich, Germany'),
      bilingual('Prague, Tchéquie', 'Prague, Czechia'),
      bilingual('Vienne, Autriche', 'Vienna, Austria'),
      bilingual('Bratislava, Slovaquie', 'Bratislava, Slovakia'),
      bilingual('Budapest, Hongrie', 'Budapest, Hungary'),
      bilingual('Sofia, Bulgarie', 'Sofia, Bulgaria'),
      bilingual('Bangkok, Thaïlande', 'Bangkok, Thailand'),
    ],
  },
  {
    caption: bilingual(
      'Un hôtel à Taïwan, ses chambres, sa réservation en ligne.',
      'A hotel in Taiwan, its rooms, its online booking.',
    ),
    country: bilingual('Taïwan', 'Taiwan'),
    entries: [
      {
        bullets: [
          bilingual('Calendrier interactif des disponibilités.', 'Interactive availability calendar.'),
          bilingual('Parcours de paiement en ligne.', 'Online payment flow.'),
          bilingual('Galerie photo filtrable par type de chambre.', 'Photo gallery filterable by room type.'),
        ],
        company: 'Freelance',
        from: '2018-05',
        role: FRONT_END,
        summary: bilingual(
          'Site web d’un hôtel et son parcours de réservation.',
          'Hotel website and its booking flow.',
        ),
        to: '2018-06',
      },
    ],
    kind: 'Job',
    motifs: ['BrowserCalendar'],
    place: bilingual('Taichung', 'Taichung'),
  },
  {
    caption: bilingual(
      'Je passe côté serveur, pour aider des ambulances à trouver le bon hôpital.',
      'I move to the back end, helping ambulances find the right hospital.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          bilingual(
            'Calcul d’itinéraires selon spécialité médicale, distance et trafic.',
            'Route planning by medical specialty, distance and traffic.',
          ),
          bilingual('Priorisation des urgences selon la gravité.', 'Emergency triage by severity.'),
          bilingual(
            'Intégration aux systèmes hospitaliers (lits, équipements).',
            'Integration with hospital systems (beds, equipment).',
          ),
          bilingual('CI/CD avec GitLab, Docker et Amazon EC2.', 'CI/CD with GitLab, Docker and Amazon EC2.'),
        ],
        company: 'Freelance',
        from: '2018-09',
        role: bilingual('Développeur back-end', 'Back-end developer'),
        summary: bilingual(
          'API de géolocalisation et d’aide à l’orientation pour une société d’ambulances.',
          'Geolocation and dispatch-routing API for an ambulance company.',
        ),
        to: '2018-12',
      },
    ],
    kind: 'Job',
    motifs: ['Ambulance'],
    place: bilingual('Kuala Lumpur', 'Kuala Lumpur'),
    remoteFrom: [bilingual('Langkawi, Malaisie', 'Langkawi, Malaysia')],
  },
  {
    caption: bilingual(
      'Pour la première fois, c’est moi qui mène le projet.',
      'For the first time, I lead the project.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          bilingual(
            'Tableaux de bord et visualisations revenus / dépenses.',
            'Income / expense dashboards and charts.',
          ),
          bilingual('Catégories et dépenses récurrentes.', 'Categories and recurring expenses.'),
          bilingual('Exports CSV filtrables et personnalisables.', 'Filterable, customisable CSV exports.'),
        ],
        company: 'Freelance',
        from: '2019-01',
        role: bilingual('(Lead) Développeur front-end', '(Lead) Front-end developer'),
        summary: bilingual(
          'Front-end d’une application serverless de gestion budgétaire pour un indépendant.',
          'Front end of a serverless budgeting app for a self-employed client.',
        ),
        to: '2019-06',
      },
    ],
    kind: 'Job',
    motifs: ['Bars'],
    place: bilingual('Malacca', 'Malacca'),
    remoteFrom: [
      bilingual('Die, France', 'Die, France'),
      bilingual('Lyon, France', 'Lyon, France'),
      bilingual('Nantes, France', 'Nantes, France'),
    ],
  },
  {
    caption: bilingual('Entre deux contrats, je travaille sur le tarmac.', 'Between contracts, I work on the tarmac.'),
    chapter: bilingual('La France, le retour.', 'France, coming home.'),
    country: FRANCE,
    entries: [
      {
        company: 'AviaPartner Nantes-Atlantique',
        from: '2019-11',
        role: bilingual('Agent de trafic', 'Ramp agent'),
        to: '2019-12',
      },
    ],
    kind: 'Job',
    motifs: ['Plane'],
    place: bilingual('Bouguenais', 'Bouguenais'),
  },
  {
    caption: bilingual(
      'Depuis Nantes, un chatbot pour une plateforme à l’autre bout du monde.',
      'From Nantes, a chatbot for a platform on the other side of the world.',
    ),
    country: MALAYSIA,
    entries: [
      {
        bullets: [
          bilingual(
            'Chatbot adossé à une base de plus de 500 questions fréquentes.',
            'Chatbot backed by a base of over 500 frequently asked questions.',
          ),
          bilingual(
            'Interface d’administration pour faire vivre la base de connaissances.',
            'Admin interface to keep the knowledge base alive.',
          ),
        ],
        company: 'Freelance',
        from: '2020-02',
        role: bilingual('Développeur full-stack', 'Full-stack developer'),
        summary: bilingual(
          'Outil de support client automatisé pour une plateforme multiservice.',
          'Automated customer support tool for a multi-service platform.',
        ),
        to: '2020-05',
      },
    ],
    kind: 'Job',
    motifs: ['Bubble'],
    place: bilingual('Kuala Lumpur', 'Kuala Lumpur'),
    remoteFrom: [bilingual('Nantes, France', 'Nantes, France')],
  },
  {
    caption: bilingual(
      'J’officialise ce que la route m’a appris : un titre de développeur.',
      'I make official what the road taught me: a developer’s diploma.',
    ),
    entries: [
      {
        company: 'ENI École Informatique',
        from: '2020-06',
        remote: true,
        role: bilingual('Développeur web et web mobile', 'Web and mobile web developer'),
        summary: bilingual(
          'Titre professionnel de niveau 5 (Bac+2) : Java, Java EE, PHP et Symfony, SQL Server, JavaScript, Android.',
          'Level 5 professional title (two-year degree): Java, Java EE, PHP and Symfony, SQL Server, JavaScript, Android.',
        ),
        to: '2020-11',
      },
    ],
    kind: 'Training',
    label: bilingual('Formation', 'Training'),
    motifs: ['Mortarboard'],
    place: bilingual('En ligne', 'Online'),
    remoteFrom: [
      bilingual('Die, France', 'Die, France'),
      bilingual('Londres, Royaume-Uni', 'London, United Kingdom'),
      bilingual('Bucarest, Roumanie', 'Bucharest, Romania'),
      bilingual('Varna, Bulgarie', 'Varna, Bulgaria'),
      bilingual('Bourgas, Bulgarie', 'Burgas, Bulgaria'),
      bilingual('Istanbul, Turquie', 'Istanbul, Türkiye'),
      bilingual('Die, France', 'Die, France'),
    ],
  },
  {
    caption: bilingual(
      'Une plateforme de cours, conçue et livrée en deux semaines.',
      'A course platform, designed and shipped in two weeks.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          bilingual('Achats de modules et crédits de réservation.', 'Module purchases and booking credits.'),
          bilingual('Gestion des utilisateurs et paiements en ligne.', 'User management and online payments.'),
          bilingual('Blog avec administration et modération.', 'Blog with administration and moderation.'),
          bilingual(
            'Contenus interactifs pour l’anglais et l’espagnol.',
            'Interactive content for English and Spanish.',
          ),
        ],
        company: 'The Inspire Academy',
        from: '2020-11',
        role: bilingual('Développeur full-stack', 'Full-stack developer'),
        summary: bilingual(
          'Application de vente de cours et de réservation de cours particuliers, conçue et livrée en deux semaines.',
          'App for selling courses and booking private lessons, designed and shipped in two weeks.',
        ),
        to: '2021-01',
      },
    ],
    kind: 'Job',
    motifs: ['Book'],
    place: bilingual('Biarritz', 'Biarritz'),
    remoteFrom: [bilingual('Istanbul, Turquie', 'Istanbul, Türkiye'), bilingual('Die, France', 'Die, France')],
  },
  {
    caption: bilingual(
      'À Istanbul, je mène l’équipe d’une plateforme pour un collectif d’artistes.',
      'In Istanbul, I lead the team behind a platform for an artists’ collective.',
    ),
    country: bilingual('Turquie', 'Türkiye'),
    entries: [
      {
        bullets: [
          bilingual('Parcours d’achat direct et d’offre négociable.', 'Direct purchase and negotiable-offer flows.'),
          bilingual('Impressions déclinées en formats et supports.', 'Prints offered in several sizes and media.'),
          bilingual(
            'Paiements multidevises, remboursements, paiements échelonnés.',
            'Multi-currency payments, refunds, instalments.',
          ),
        ],
        company: 'Freelance',
        from: '2021-02',
        role: bilingual('(Lead) Développeur full-stack', '(Lead) Full-stack developer'),
        summary: bilingual(
          'Plateforme de vente d’œuvres d’art pour un collectif d’artistes.',
          'Artwork sales platform for an artists’ collective.',
        ),
        to: '2021-06',
      },
    ],
    kind: 'Job',
    motifs: ['Frame'],
    place: bilingual('Istanbul', 'Istanbul'),
    remoteFrom: [
      bilingual('Die, France', 'Die, France'),
      'OnSite',
      bilingual('Charm el-Cheikh, Égypte', 'Sharm El Sheikh, Egypt'),
    ],
  },
  {
    caption: bilingual(
      'Un cran plus haut : je me forme à l’architecture logicielle.',
      'A step up: I train in software architecture.',
    ),
    entries: [
      {
        company: 'OpenClassrooms',
        from: '2021-06',
        remote: true,
        role: bilingual(
          'Expert en développement logiciel, architecture logicielle',
          'Software development expert, software architecture',
        ),
        summary: bilingual(
          'Titre de niveau 7 (Bac+5) : analyse et conception d’architectures logicielles, validation de solutions, coordination d’équipe, relation client et parties prenantes.',
          'Level 7 title (master’s level): software architecture analysis and design, solution validation, team coordination, client and stakeholder relations.',
        ),
        to: '2022-06',
      },
    ],
    kind: 'Training',
    label: bilingual('Formation', 'Training'),
    motifs: ['Mortarboard'],
    place: bilingual('En ligne', 'Online'),
    remoteFrom: [
      bilingual('Le Caire, Égypte', 'Cairo, Egypt'),
      bilingual('Nantes, France', 'Nantes, France'),
      bilingual('Playa del Carmen, Mexique', 'Playa del Carmen, Mexico'),
      bilingual('Bogota, Colombie', 'Bogotá, Colombia'),
      bilingual('Lima, Pérou', 'Lima, Peru'),
    ],
  },
  {
    caption: bilingual(
      'À Lima, je dessine l’architecture avant qu’on écrive la première ligne.',
      'In Lima, I draw the architecture before the first line is written.',
    ),
    country: bilingual('Pérou', 'Peru'),
    entries: [
      {
        bullets: [
          bilingual(
            'Architecture cible documentée, pensée performance et évolutivité.',
            'Documented target architecture, designed for performance and scalability.',
          ),
          bilingual(
            'Spécifications techniques : flux, modèles de données, interfaces.',
            'Technical specifications: flows, data models, interfaces.',
          ),
          bilingual(
            'Estimation des charges, planning et budget complet.',
            'Effort estimates, schedule and full budget.',
          ),
        ],
        company: 'Freelance',
        from: '2022-05',
        role: bilingual('Architecte logiciel', 'Software architect'),
        summary: bilingual(
          'Cadrage technique d’un MVP pour une société d’assurance.',
          'Technical scoping of an MVP for an insurance company.',
        ),
        to: '2022-07',
      },
    ],
    kind: 'Job',
    motifs: ['Blueprint'],
    place: bilingual('Lima', 'Lima'),
  },
  {
    caption: bilingual(
      'Retour à Lyon, là où tout a commencé. Développeur sénior, cette fois.',
      'Back in Lyon, where it all began. A senior developer this time.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          bilingual(
            'Web app SSR, back-office de contenus et majeure partie de l’app mobile.',
            'SSR web app, content back office and most of the mobile app.',
          ),
          bilingual(
            'Messagerie instantanée et appels vidéo web et mobile.',
            'Instant messaging and video calls, web and mobile.',
          ),
          bilingual(
            'API REST, modèles de données, types front générés depuis le back.',
            'REST API, data models, front-end types generated from the back end.',
          ),
          bilingual(
            'Reprise de la coordination projet avec le client.',
            'Took over project coordination with the client.',
          ),
        ],
        company: 'Rubrash · Working in Lyon',
        from: '2022-08',
        role: bilingual('Développeur full-stack sénior', 'Senior full-stack developer'),
        summary: bilingual(
          'Deux produits : une plateforme de contenus pour une société de gestion de patrimoine et une application logistique pour la grande distribution.',
          'Two products: a content platform for a wealth management firm and a logistics app for large retailers.',
        ),
        to: '2023-03',
      },
    ],
    kind: 'Job',
    motifs: ['Phone'],
    place: bilingual('Lyon', 'Lyon'),
  },
  {
    caption: bilingual(
      'À mon tour de transmettre. Mes apprenants tracent leur propre ligne.',
      'My turn to pass it on. My learners draw lines of their own.',
    ),
    country: FRANCE,
    entries: [
      {
        company: 'OpenClassrooms',
        from: '2023-03',
        remote: true,
        role: bilingual('Mentor et évaluateur', 'Mentor and assessor'),
        summary: bilingual(
          'Mentorat hebdomadaire et évaluation des parcours développement et intégration web. Une dizaine d’apprenants menés jusqu’au titre.',
          'Weekly mentoring and assessment on the web development and integration tracks. About ten learners taken through to their diploma.',
        ),
        to: null,
      },
      {
        company: 'École O’clock',
        from: '2023-03',
        remote: true,
        role: bilingual('Formateur · Tuteur pédagogique', 'Trainer · Academic tutor'),
        summary: bilingual(
          'Modules back, front, mobile, GraphQL, microservices, sécurité, conteneurisation, CI/CD et Docker avancé.',
          'Modules on back end, front end, mobile, GraphQL, microservices, security, containers, CI/CD and advanced Docker.',
        ),
        to: '2025-02',
      },
      {
        company: 'EPSI',
        from: '2025-01',
        role: bilingual('Formateur · Tuteur · Jury', 'Trainer · Tutor · Examiner'),
        summary: bilingual(
          'Module CI/CD, tutorat de mémoires et jurys du titre Expert en informatique et SI (RNCP).',
          'CI/CD module, thesis tutoring and juries for the IT and Information Systems Expert title (RNCP).',
        ),
        to: '2025-07',
      },
    ],
    kind: 'Job',
    label: bilingual('Transmission', 'Teaching'),
    motifs: ['Apprentices'],
    place: bilingual('Nantes', 'Nantes'),
  },
  {
    caption: bilingual(
      'Le paiement, là où chaque erreur se compte en euros.',
      'Payments, where every bug is counted in euros.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          bilingual(
            'Architecture logicielle selon la clean architecture.',
            'Software architecture following clean architecture.',
          ),
          bilingual(
            'APIs et services serverless Node.js / Express sur Google Cloud.',
            'Serverless Node.js / Express APIs and services on Google Cloud.',
          ),
          bilingual('Infrastructure Terraform, livraisons GitLab CI.', 'Terraform infrastructure, GitLab CI delivery.'),
          bilingual(
            'App React Native / Expo, notifications Firebase Cloud Messaging.',
            'React Native / Expo app, Firebase Cloud Messaging notifications.',
          ),
          bilingual('Bibliothèque QA réutilisable pour les tests E2E.', 'Reusable QA library for E2E tests.'),
          bilingual(
            'Intégration de l’IA dans les pratiques et outils internes.',
            'Brought AI into internal practices and tools.',
          ),
        ],
        company: 'HiPay',
        from: '2025-03',
        role: bilingual('Ingénieur logiciel sénior', 'Senior software engineer'),
        summary: bilingual(
          'APIs et application mobile dans le paiement, dont une solution SoftPOS d’encaissement sur terminaux mobiles.',
          'Payment APIs and a mobile app, including a SoftPOS solution for taking payments on mobile devices.',
        ),
        to: null,
      },
    ],
    kind: 'Job',
    label: bilingual('Paiement', 'Payments'),
    motifs: ['Card'],
    place: bilingual('Nantes', 'Nantes'),
  },
  {
    caption: bilingual(
      'Aujourd’hui, de l’architecture à la production, tout le back-end entre mes mains.',
      'Today, from architecture to production, the whole back end in my hands.',
    ),
    country: FRANCE,
    entries: [
      {
        bullets: [
          bilingual(
            'API Elysia + TypeScript sur Cloudflare Workers, client typé Eden Treaty.',
            'Elysia + TypeScript API on Cloudflare Workers, typed Eden Treaty client.',
          ),
          bilingual(
            'Supabase + réplique de lecture Cloudflare D1, resynchronisation toutes les 6 h.',
            'Supabase with a Cloudflare D1 read replica, resynced every 6 hours.',
          ),
          bilingual(
            'Supabase Auth, RLS, chat temps réel et notifications.',
            'Supabase Auth, RLS, real-time chat and notifications.',
          ),
          bilingual(
            'Images sur R2, cartes Open Graph générées avec Satori + WebAssembly.',
            'Images on R2, Open Graph cards generated with Satori + WebAssembly.',
          ),
          bilingual('En production pour 5 €/mois d’infrastructure.', 'In production for €5 a month in infrastructure.'),
        ],
        company: 'Freelance',
        from: '2026-01',
        role: bilingual(
          '(Lead) Architecte logiciel et développeur back-end',
          '(Lead) Software architect and back-end developer',
        ),
        summary: bilingual(
          'Tout le back-end d’une plateforme communautaire reliant artistes et clients, jusqu’à la production.',
          'The entire back end of a community platform connecting artists and clients, through to production.',
        ),
        to: '2026-06',
      },
    ],
    kind: 'Job',
    label: bilingual('Freelance', 'Freelance'),
    motifs: ['Cloud'],
    place: bilingual('Paris', 'Paris'),
    remoteFrom: [bilingual('Saint-Herblain, France', 'Saint-Herblain, France')],
  },
];
