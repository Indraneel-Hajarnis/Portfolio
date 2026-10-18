// ============================================================
// PROJECTS — add, edit, reorder or remove projects here.
// Each project is one block inside the list below. The carousel,
// the "01 / 04" counter and the mobile layout update by themselves.
//
//   title        Heading of the card
//   subtitle     Subheading (e.g. tech stack or one-line summary)
//   techStack    (optional) List of technologies shown as tags above the
//                description, e.g. ['Python', 'Flask', 'React'].
//                A comma-separated text also works: 'Python, Flask, React'
//   description  Text, or a list of texts for several paragraphs
//   url          GitHub repository or deployed website (https://...)
//                — leave '' until the link is ready
//   linkLabel    (optional) Button text, default "View Project"
//   image        (optional) Image path, e.g. 'assets/images/project1.jpg'
//                — leave '' to show the "Image" placeholder
//   imageAlt     (optional) Short description of the image
//
// To add a project, copy one block, paste it before the closing "];"
// and fill it in. Remember the comma after each block.
// ============================================================
window.PROJECTS = [
  {
    title: 'Cardexa',
    subtitle: 'Managing credit cards, subscriptions and spending',
    techStack: ['React Native', 'Expo', 'SQLite', 'Zustand', 'NativeWind', 'Python', 'Regex', 'AI/ML'],
    description: 'Cardexa is a local-first, privacy-focused personal finance application that unifies and optimizes your credit card spending and provides intelligent recommendations. It displays a user\'s credit cards with a detailed breakdown of its subscriptions and spending, parses transaction SMS messages from banks to automatically detect and categorize recurring payments and free trials, and notifies users of upcoming subscription renewals.',
    url: 'https://github.com/Indraneel-Hajarnis/Cardexa',
    image: 'assets/images/projects/cardexa.png',
    imageAlt: 'Cardexa'
  },
  {
    title: 'eDNA Biodiversity Pipeline',
    subtitle: 'Assessing marine biodiversity from DNA datasets',
    techStack: ['Python', 'TensorFlow', 'Flask', 'VAE', 'Pandas', 'NumPy', 'Scikit-learn', 'UMAP', 'HDBSCAN', 'Bioinformatics', 'ML'],
    description: 'A bioinformatics pipeline that analyses environmental DNA samples to assess ecosystem biodiversity. Processed 20,000+ DNA sequences for de novo taxonomic identification. Variational Autoencoders reduce dimensionality, UMAP handles visualization, and HDBSCAN clusters species distributions — all surfaced through an interactive Flask web interface having end-to-end pipeline integration, 2D visualizations and 4 biodiversity metrics.',
    url: 'https://github.com/d-mahi14/eDNA-project',
    image: 'assets/images/projects/edna.png',
    imageAlt: 'eDNA Biodiversity Pipeline'
  },
  {
    title: 'SmartCV - AI Resume Builder',
    subtitle: 'Intelligent Resume Optimization and Feedback',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'NLP', 'TF-IDF', 'Cosine Similarity', 'Tailwind CSS'],
    description: 'SmartCV streamlines resume creation and optimization using NLP techniques like TF-IDF and Cosine Similarity to match resumes against job descriptions. The platform allows resume storage, editing, template switching, ATS scoring, and PDF downloads - making resume management simple and efficient for everyone. It provides actionable feedback through a full-stack platform featuring JWT authentication and a responsive React UI.',
    url: 'https://smart-cv-an-ai-powered-resume-build.vercel.app/',
    image: 'assets/images/projects/smartcv.png',
    imageAlt: 'SmartCV - AI Resume Builder'
  },
  {
    title: 'UrbanLink',
    subtitle: 'Local Issue Reporting Platform for Mumbai',
    techStack: ['React', 'Node.js', 'Express', 'Python', 'JWT', 'Generative AI', 'Recharts'],
    description: 'UrbanLink is a modern, role-based governance platform designed to bridge the gap between citizens and local authorities. It empowers residents to report and track civic issues directly, provides tools for efficient resolution tracking, and offers the Mayor a bird\'s-eye view of urban health through real-time analytics. Modelled for Mumbai, it enables residents to engage with municipal authorities to improve their neighborhoods.',
    url: 'https://github.com/Indraneel-Hajarnis/UrbanLink---Local-Issue-Reporting-Platform',
    image: 'assets/images/projects/urbanlink.png',
    imageAlt: 'UrbanLink'
  }
];
