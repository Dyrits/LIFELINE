// Career content, adapted from WAYPOINTS data.js. Stops are drawn in the order listed (oldest first).
import type { CareerStop, Profile, Text } from './types';

const t = (fr: string, en: string): Text => ({ fr, en });

const FRANCE = t('France', 'France');
const AUSTRALIA = t('Australie', 'Australia');
const MALAYSIA = t('Malaisie', 'Malaysia');
const WORKING_HOLIDAY = t('Visa vacances-travail', 'Working holiday visa');
const FRONT_END = t('Développeur front-end', 'Front-end developer');

export const PROFILE: Profile = {
  name: 'Dylan J. Gerrits',
  title: t(
    'Ingénieur polyvalent en architecture et développement de systèmes d’information et d’outillage IA',
    'Versatile engineer in information systems architecture, development and AI tooling',
  ),
  tagline: t(
    'Véritable couteau franco-suisse, plus de dix ans à concevoir, développer et mettre en production des solutions logicielles, de l’architecture au déploiement.',
    'A true Franco-Swiss army knife: over ten years designing, building and shipping software, from architecture to deployment.',
  ),
  location: t('Saint-Herblain, France', 'Saint-Herblain, France'),
};

export const CAREER: readonly CareerStop[] = [
  {
    kind: 'job',
    place: t('Lyon', 'Lyon'),
    country: FRANCE,
    motifs: ['door', 'barcode'],
    entries: [
      {
        company: 'INTERVALLES',
        role: t('Démarcheur / Distributeur', 'Door-to-door canvasser / Distributor'),
        from: '2011-03',
        to: '2012-06',
      },
      { company: 'RGIS', role: t('Inventoriste', 'Inventory clerk'), from: '2011-03', to: '2011-04' },
    ],
  },
  {
    kind: 'job',
    place: t('Nantes', 'Nantes'),
    country: FRANCE,
    motifs: ['bolt'],
    entries: [
      {
        company: 'Accenture',
        role: t('Développeur | Chef d’équipe', 'Developer | Team lead'),
        from: '2013-06',
        to: '2016-08',
        summary: t(
          'Développement, maintenance applicative et coordination pour des fournisseurs d’énergie, en environnements SAP IS-U et CRM.',
          'Development, application maintenance and coordination for energy suppliers, on SAP IS-U and CRM.',
        ),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('Merredin', 'Merredin'),
    country: AUSTRALIA,
    motifs: ['furrows'],
    entries: [
      {
        company: 'CWC Professional AG Contractors',
        role: t('Contractant agricole', 'Agricultural contractor'),
        from: '2016-11',
        to: '2016-12',
        summary: t(
          'Détection de Chondrilla juncea dans les champs, dans le cadre d’un visa vacances-travail.',
          'Scouting fields for Chondrilla juncea (skeleton weed) on a working holiday visa.',
        ),
        context: WORKING_HOLIDAY,
      },
    ],
  },
  {
    kind: 'job',
    place: t('Perth', 'Perth'),
    country: AUSTRALIA,
    motifs: ['pan'],
    entries: [
      {
        company: 'Gramercy Bar & Kitchen',
        role: t('Commis de cuisine', 'Kitchen hand'),
        from: '2017-01',
        to: '2017-07',
        context: WORKING_HOLIDAY,
      },
    ],
  },
  {
    kind: 'job',
    place: t('Dubbo', 'Dubbo'),
    country: AUSTRALIA,
    motifs: ['pickets'],
    entries: [
      {
        company: 'J.A. Long & L.A. Cameron',
        role: t('Contractant agricole', 'Agricultural contractor'),
        from: '2017-09',
        to: '2017-11',
        summary: t('Marquage bovin et ovin.', 'Cattle and sheep marking.'),
        context: WORKING_HOLIDAY,
      },
    ],
  },
  {
    kind: 'job',
    place: t('Ubud', 'Ubud'),
    country: t('Indonésie', 'Indonesia'),
    motifs: ['browserGallery'],
    entries: [
      {
        company: 'Freelance',
        role: FRONT_END,
        from: '2017-11',
        to: '2017-12',
        summary: t('Site vitrine pour un menuisier.', 'Showcase website for a carpenter.'),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('George Town', 'George Town'),
    country: MALAYSIA,
    motifs: ['browserCode'],
    remoteFrom: [
      t('Munich, Allemagne', 'Munich, Germany'),
      t('Prague, Tchéquie', 'Prague, Czechia'),
      t('Vienne, Autriche', 'Vienna, Austria'),
      t('Bratislava, Slovaquie', 'Bratislava, Slovakia'),
      t('Budapest, Hongrie', 'Budapest, Hungary'),
      t('Sofia, Bulgarie', 'Sofia, Bulgaria'),
      t('Bangkok, Thaïlande', 'Bangkok, Thailand'),
    ],
    entries: [
      {
        company: 'Freelance',
        role: FRONT_END,
        from: '2018-02',
        to: '2018-04',
        summary: t(
          'Plateforme de réservation d’activités pour une agence touristique et deux prestataires.',
          'Activity booking platform for a travel agency and two operators.',
        ),
        bullets: [
          t('Interfaces de réservation et paiement en ligne.', 'Booking and online payment interfaces.'),
          t(
            'Espace opérateurs pour gérer le catalogue d’activités.',
            'Operator area to manage the activity catalogue.',
          ),
          t('Interface bilingue anglais / malais.', 'Bilingual English / Malay interface.'),
        ],
      },
    ],
  },
  {
    kind: 'job',
    place: t('Taichung', 'Taichung'),
    country: t('Taïwan', 'Taiwan'),
    motifs: ['browserCalendar'],
    entries: [
      {
        company: 'Freelance',
        role: FRONT_END,
        from: '2018-05',
        to: '2018-06',
        summary: t('Site web d’un hôtel et son parcours de réservation.', 'Hotel website and its booking flow.'),
        bullets: [
          t('Calendrier interactif des disponibilités.', 'Interactive availability calendar.'),
          t('Parcours de paiement en ligne.', 'Online payment flow.'),
          t('Galerie photo filtrable par type de chambre.', 'Photo gallery filterable by room type.'),
        ],
      },
    ],
  },
  {
    kind: 'job',
    place: t('Kuala Lumpur', 'Kuala Lumpur'),
    country: MALAYSIA,
    motifs: ['routeCross'],
    remoteFrom: [t('Langkawi, Malaisie', 'Langkawi, Malaysia')],
    entries: [
      {
        company: 'Freelance',
        role: t('Développeur back-end', 'Back-end developer'),
        from: '2018-09',
        to: '2018-12',
        summary: t(
          'API de géolocalisation et d’aide à l’orientation pour une société d’ambulances.',
          'Geolocation and dispatch-routing API for an ambulance company.',
        ),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('Malacca', 'Malacca'),
    country: MALAYSIA,
    motifs: ['bars'],
    remoteFrom: [
      t('Die, France', 'Die, France'),
      t('Lyon, France', 'Lyon, France'),
      t('Nantes, France', 'Nantes, France'),
    ],
    entries: [
      {
        company: 'Freelance',
        role: t('(Lead) Développeur front-end', '(Lead) Front-end developer'),
        from: '2019-01',
        to: '2019-06',
        summary: t(
          'Front-end d’une application serverless de gestion budgétaire pour un indépendant.',
          'Front end of a serverless budgeting app for a self-employed client.',
        ),
        bullets: [
          t('Tableaux de bord et visualisations revenus / dépenses.', 'Income / expense dashboards and charts.'),
          t('Catégories et dépenses récurrentes.', 'Categories and recurring expenses.'),
          t('Exports CSV filtrables et personnalisables.', 'Filterable, customisable CSV exports.'),
        ],
      },
    ],
  },
  {
    kind: 'job',
    place: t('Bouguenais', 'Bouguenais'),
    country: FRANCE,
    motifs: ['plane'],
    entries: [
      {
        company: 'AviaPartner Nantes-Atlantique',
        role: t('Agent de trafic', 'Ramp agent'),
        from: '2019-11',
        to: '2019-12',
      },
    ],
  },
  {
    kind: 'job',
    place: t('Kuala Lumpur', 'Kuala Lumpur'),
    country: MALAYSIA,
    motifs: ['bubble'],
    remoteFrom: [t('Nantes, France', 'Nantes, France')],
    entries: [
      {
        company: 'Freelance',
        role: t('Développeur full-stack', 'Full-stack developer'),
        from: '2020-02',
        to: '2020-05',
        summary: t(
          'Outil de support client automatisé pour une plateforme multiservice.',
          'Automated customer support tool for a multi-service platform.',
        ),
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
      },
    ],
  },
  {
    kind: 'training',
    place: t('En ligne', 'Online'),
    label: t('Formation', 'Training'),
    motifs: ['mortarboard'],
    remoteFrom: [
      t('Die, France', 'Die, France'),
      t('Londres, Royaume-Uni', 'London, United Kingdom'),
      t('Bucarest, Roumanie', 'Bucharest, Romania'),
      t('Varna, Bulgarie', 'Varna, Bulgaria'),
      t('Bourgas, Bulgarie', 'Burgas, Bulgaria'),
      t('Istanbul, Turquie', 'Istanbul, Türkiye'),
      t('Die, France', 'Die, France'),
    ],
    entries: [
      {
        company: 'ENI École Informatique',
        role: t('Développeur web et web mobile', 'Web and mobile web developer'),
        from: '2020-06',
        to: '2020-11',
        remote: true,
        summary: t(
          'Titre professionnel de niveau 5 (Bac+2) : Java, Java EE, PHP et Symfony, SQL Server, JavaScript, Android.',
          'Level 5 professional title (two-year degree): Java, Java EE, PHP and Symfony, SQL Server, JavaScript, Android.',
        ),
      },
    ],
  },
  {
    kind: 'job',
    place: t('Biarritz', 'Biarritz'),
    country: FRANCE,
    motifs: ['book'],
    remoteFrom: [t('Istanbul, Turquie', 'Istanbul, Türkiye'), t('Die, France', 'Die, France')],
    entries: [
      {
        company: 'The Inspire Academy',
        role: t('Développeur full-stack', 'Full-stack developer'),
        from: '2020-11',
        to: '2021-01',
        summary: t(
          'Application de vente de cours et de réservation de cours particuliers, conçue et livrée en deux semaines.',
          'App for selling courses and booking private lessons, designed and shipped in two weeks.',
        ),
        bullets: [
          t('Achats de modules et crédits de réservation.', 'Module purchases and booking credits.'),
          t('Gestion des utilisateurs et paiements en ligne.', 'User management and online payments.'),
          t('Blog avec administration et modération.', 'Blog with administration and moderation.'),
          t('Contenus interactifs pour l’anglais et l’espagnol.', 'Interactive content for English and Spanish.'),
        ],
      },
    ],
  },
  {
    kind: 'job',
    place: t('Istanbul', 'Istanbul'),
    country: t('Turquie', 'Türkiye'),
    motifs: ['frame'],
    remoteFrom: [t('Die, France', 'Die, France'), 'on-site', t('Charm el-Cheikh, Égypte', 'Sharm El Sheikh, Egypt')],
    entries: [
      {
        company: 'Freelance',
        role: t('(Lead) Développeur full-stack', '(Lead) Full-stack developer'),
        from: '2021-02',
        to: '2021-06',
        summary: t(
          'Plateforme de vente d’œuvres d’art pour un collectif d’artistes.',
          'Artwork sales platform for an artists’ collective.',
        ),
        bullets: [
          t('Parcours d’achat direct et d’offre négociable.', 'Direct purchase and negotiable-offer flows.'),
          t('Impressions déclinées en formats et supports.', 'Prints offered in several sizes and media.'),
          t(
            'Paiements multidevises, remboursements, paiements échelonnés.',
            'Multi-currency payments, refunds, instalments.',
          ),
        ],
      },
    ],
  },
  {
    kind: 'training',
    place: t('En ligne', 'Online'),
    label: t('Formation', 'Training'),
    motifs: ['mortarboard'],
    remoteFrom: [
      t('Le Caire, Égypte', 'Cairo, Egypt'),
      t('Nantes, France', 'Nantes, France'),
      t('Playa del Carmen, Mexique', 'Playa del Carmen, Mexico'),
      t('Bogota, Colombie', 'Bogotá, Colombia'),
      t('Lima, Pérou', 'Lima, Peru'),
    ],
    entries: [
      {
        company: 'OpenClassrooms',
        role: t(
          'Expert en développement logiciel, architecture logicielle',
          'Software development expert, software architecture',
        ),
        from: '2021-06',
        to: '2022-06',
        remote: true,
        summary: t(
          'Titre de niveau 7 (Bac+5) : analyse et conception d’architectures logicielles, validation de solutions, coordination d’équipe, relation client et parties prenantes.',
          'Level 7 title (master’s level): software architecture analysis and design, solution validation, team coordination, client and stakeholder relations.',
        ),
      },
    ],
  },
  {
    kind: 'job',
    place: t('Lima', 'Lima'),
    country: t('Pérou', 'Peru'),
    motifs: ['blueprint'],
    entries: [
      {
        company: 'Freelance',
        role: t('Architecte logiciel', 'Software architect'),
        from: '2022-05',
        to: '2022-07',
        summary: t(
          'Cadrage technique d’un MVP pour une société d’assurance.',
          'Technical scoping of an MVP for an insurance company.',
        ),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('Lyon', 'Lyon'),
    country: FRANCE,
    motifs: ['phone'],
    entries: [
      {
        company: 'Rubrash · Working in Lyon',
        role: t('Développeur full-stack sénior', 'Senior full-stack developer'),
        from: '2022-08',
        to: '2023-03',
        summary: t(
          'Deux produits : une plateforme de contenus pour une société de gestion de patrimoine et une application logistique pour la grande distribution.',
          'Two products: a content platform for a wealth management firm and a logistics app for large retailers.',
        ),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('Nantes', 'Nantes'),
    country: FRANCE,
    label: t('Transmission', 'Teaching'),
    motifs: ['apprentices'],
    entries: [
      {
        company: 'OpenClassrooms',
        role: t('Mentor et évaluateur', 'Mentor and assessor'),
        from: '2023-03',
        to: null,
        remote: true,
        summary: t(
          'Mentorat hebdomadaire et évaluation des parcours développement et intégration web. Une dizaine d’apprenants menés jusqu’au titre.',
          'Weekly mentoring and assessment on the web development and integration tracks. About ten learners taken through to their diploma.',
        ),
      },
      {
        company: 'École O’clock',
        role: t('Formateur · Tuteur pédagogique', 'Trainer · Academic tutor'),
        from: '2023-03',
        to: '2025-02',
        remote: true,
        summary: t(
          'Modules back, front, mobile, GraphQL, microservices, sécurité, conteneurisation, CI/CD et Docker avancé.',
          'Modules on back end, front end, mobile, GraphQL, microservices, security, containers, CI/CD and advanced Docker.',
        ),
      },
      {
        company: 'EPSI',
        role: t('Formateur · Tuteur · Jury', 'Trainer · Tutor · Examiner'),
        from: '2025-01',
        to: '2025-07',
        summary: t(
          'Module CI/CD, tutorat de mémoires et jurys du titre Expert en informatique et SI (RNCP).',
          'CI/CD module, thesis tutoring and juries for the IT and Information Systems Expert title (RNCP).',
        ),
      },
    ],
  },
  {
    kind: 'job',
    place: t('Nantes', 'Nantes'),
    country: FRANCE,
    label: t('Paiement', 'Payments'),
    motifs: ['card'],
    entries: [
      {
        company: 'HiPay',
        role: t('Ingénieur logiciel sénior', 'Senior software engineer'),
        from: '2025-03',
        to: null,
        summary: t(
          'APIs et application mobile dans le paiement, dont une solution SoftPOS d’encaissement sur terminaux mobiles.',
          'Payment APIs and a mobile app, including a SoftPOS solution for taking payments on mobile devices.',
        ),
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
      },
    ],
  },
  {
    kind: 'job',
    place: t('Paris', 'Paris'),
    country: FRANCE,
    label: t('Freelance', 'Freelance'),
    motifs: ['cloud'],
    remoteFrom: [t('Saint-Herblain, France', 'Saint-Herblain, France')],
    entries: [
      {
        company: 'Freelance',
        role: t(
          '(Lead) Architecte logiciel et développeur back-end',
          '(Lead) Software architect and back-end developer',
        ),
        from: '2026-01',
        to: '2026-06',
        summary: t(
          'Tout le back-end d’une plateforme communautaire reliant artistes et clients, jusqu’à la production.',
          'The entire back end of a community platform connecting artists and clients, through to production.',
        ),
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
      },
    ],
  },
];
