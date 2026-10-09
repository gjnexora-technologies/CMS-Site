import { SiteSettings, Page, PageSection, NavigationItem, MediaItem } from '../types';

const now = new Date().toISOString();
const school = 'APG Matriculation Higher Secondary School';
const campus = 'FCI Road, Ganapathy, Coimbatore';
const photos = {
  hero: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=85',
  classroom: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=85',
  library: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&auto=format&fit=crop&q=85',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=85',
  students: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=900&auto=format&fit=crop&q=85',
};

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'default',
  general: {
    site_name: school,
    site_title: `${school} | Learn, Grow, Shine`,
    site_description: 'A welcoming learning community in Ganapathy, Coimbatore, helping every student build knowledge, confidence and character.',
    logo_url: '',
    favicon_url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%231e5631"/%3E%3Cpath d="M14 25 32 14l18 11v24H14z" fill="%23fff"/%3E%3Cpath d="M25 49V34h14v15M20 28h24" stroke="%23d59c37" stroke-width="4" fill="none"/%3E%3C/svg%3E',
    website_url: '', contact_email: '', phone_number: '', address: campus,
  },
  branding: { primary_color: '#1e5631', secondary_color: '#16432a', accent_color: '#d59c37', font_family: 'Plus Jakarta Sans', border_radius: 'lg', dark_mode_enabled: false },
  seo: { site_title: `${school} | Learn, Grow, Shine`, meta_description: 'Discover APG Matriculation Higher Secondary School in Ganapathy, Coimbatore: academics, student life, admissions and campus information.', keywords: 'APG school, matriculation school, higher secondary, Ganapathy, Coimbatore', og_image: photos.hero, social_sharing_title: school, social_sharing_description: 'A place to learn, grow and shine in Ganapathy, Coimbatore.', canonical_url: '' },
  social_media: { facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '', whatsapp: '' },
  header: { layout: 'standard', is_sticky: true, show_cta: true, cta_text: 'Explore Admissions', cta_link: '/admissions', bg_style: 'solid' },
  footer: { show_newsletter: false, newsletter_title: 'School Updates', newsletter_desc: 'Keep up with school news and events.', copyright_text: `© ${new Date().getFullYear()} ${school}. All rights reserved.`, show_social: false, legal_links: [] },
  updated_at: now,
};

const page = (id: string, title: string, slug: string, sort_order: number, description: string, is_home = false): Page => ({
  id, title, slug, status: 'published', is_home, sort_order,
  seo: { title: `${title === 'Home' ? school : `${title} | ${school}`}`, description, keywords: 'APG Matriculation Higher Secondary School, Coimbatore', og_image: photos.hero, no_index: false },
  created_at: now, updated_at: now, published_at: now,
});

export const INITIAL_PAGES: Page[] = [
  page('page-home', 'Home', '', 0, 'Welcome to APG Matriculation Higher Secondary School, FCI Road, Ganapathy, Coimbatore.', true),
  page('page-about', 'About Us', 'about', 1, 'Learn about our school community, values and approach to learning.'),
  page('page-academics', 'Academics', 'academics', 2, 'Explore learning from foundational years through higher secondary.'),
  page('page-campus', 'Campus Life', 'campus-life', 3, 'Discover the activities, facilities and experiences that make school life rewarding.'),
  page('page-admissions', 'Admissions', 'admissions', 4, 'Find out how to enquire about admissions at APG Matriculation Higher Secondary School.'),
  page('page-contact', 'Contact Us', 'contact', 5, `Get in touch or find our campus at ${campus}.`),
];

const section = (id: string, page_id: string, section_type: PageSection['section_type'], content: Record<string, any>, sort_order: number, background_style: PageSection['settings']['background_style'] = 'default'): PageSection => ({
  id, page_id, section_type, content, settings: { background_style, padding_y: 'normal', alignment: 'center' }, sort_order, is_visible: true, created_at: now, updated_at: now,
});

export const INITIAL_SECTIONS: PageSection[] = [
  section('home-hero', 'page-home', 'hero', { badge: 'Welcome to APG School', heading: 'A bright beginning for every learner', description: `At ${school}, we nurture curiosity, confidence and a lifelong love of learning. Visit us on ${campus}.`, primary_btn_text: 'Discover Our School', primary_btn_link: '/about', secondary_btn_text: 'Admissions Enquiry', secondary_btn_link: '/admissions', image_url: photos.hero, stats: [{ label: 'Learning', value: 'Every day' }, { label: 'Our community', value: 'Growing together' }, { label: 'Location', value: 'Coimbatore' }] }, 0, 'gradient'),
  section('home-values', 'page-home', 'bento_grid', { badge: 'The APG Experience', heading: 'Room to learn. Support to thrive.', description: 'A school experience built around strong foundations, thoughtful guidance and opportunities to explore.', items: [
    { title: 'Strong foundations', desc: 'Build understanding and confidence through a supportive learning environment.', icon: 'Layers', badge: 'Learning' },
    { title: 'Curious minds', desc: 'Encourage questions, discovery and a habit of learning beyond the classroom.', icon: 'Sparkles', badge: 'Explore' },
    { title: 'Character & care', desc: 'Grow respect, responsibility and kindness as part of everyday school life.', icon: 'Shield', badge: 'Values' },
    { title: 'A place to belong', desc: 'Help every child feel welcomed, known and encouraged to do their best.', icon: 'Activity', badge: 'Community' },
  ] }, 1, 'dark'),
  section('home-about', 'page-home', 'about', { badge: 'Who We Are', heading: 'Learning with purpose, growing with confidence', description: `${school} is a learning community serving families in Ganapathy, Coimbatore. We aim to help students develop academically and personally, with care, encouragement and a sense of belonging.`, image_url: photos.classroom, points: ['A welcoming and supportive school community', 'Learning that builds strong foundations', 'Encouragement to explore interests and talents', 'A focus on confidence, respect and responsibility'], cta_text: 'More About APG', cta_link: '/about' }, 2, 'muted'),
  section('home-academics', 'page-home', 'services', { badge: 'Learning at APG', heading: 'Growing through every stage', description: 'A broad school journey that supports students as their interests and abilities develop.', items: [
    { title: 'Foundational learning', desc: 'Build confidence, communication and essential skills in the early years.', icon: 'Sparkles' },
    { title: 'Middle school', desc: 'Strengthen core subject knowledge and encourage independent thinking.', icon: 'BookOpen' },
    { title: 'Secondary education', desc: 'Develop focus, subject depth and readiness for the next step.', icon: 'GraduationCap' },
    { title: 'Higher secondary', desc: 'Support students as they pursue their academic goals and future plans.', icon: 'Target' },
  ] }, 3),
  section('home-campus', 'page-home', 'projects', { badge: 'A Day at School', heading: 'More than lessons', description: 'Learning also happens through discovery, creativity, friendship and shared experiences.', items: [
    { title: 'Learn together', category: 'Classrooms', desc: 'A positive space for participation, practice and new ideas.', image_url: photos.classroom },
    { title: 'Discover more', category: 'Learning spaces', desc: 'Encouraging reading, research and a curious outlook.', image_url: photos.library },
    { title: 'Explore and experiment', category: 'Hands-on learning', desc: 'Make room for observation, questions and discovery.', image_url: photos.science },
  ] }, 4),
  section('home-cta', 'page-home', 'cta', { heading: 'Come and get to know APG', description: `We welcome families to learn more about our school and admissions. Find us at ${campus}.`, primary_btn_text: 'Admissions Enquiry', primary_btn_link: '/admissions', secondary_btn_text: 'Contact the School', secondary_btn_link: '/contact' }, 5),

  section('about-hero', 'page-about', 'hero', { badge: 'About Our School', heading: 'A community where every learner matters', description: `${school} is located at ${campus}. We believe children learn best when they feel supported, inspired and encouraged to take part.`, image_url: photos.students, primary_btn_text: 'Explore Academics', primary_btn_link: '/academics' }, 0, 'gradient'),
  section('about-story', 'page-about', 'rich_text', { title: 'Our approach', content: '<p>School is a place to discover strengths, ask questions and build the knowledge that opens new possibilities. At APG, we value consistent effort, thoughtful teaching and a caring relationship between students, families and educators.</p><p>We encourage students to take pride in their progress, respect one another and approach each new challenge with confidence.</p>' }, 1),
  section('about-approach', 'page-about', 'bento_grid', { badge: 'Our Values', heading: 'Guided by care and high expectations', description: 'The habits and values we practice help create a positive place to learn.', items: [
    { title: 'Respect', desc: 'Listen, care for others and value different perspectives.', icon: 'Shield' },
    { title: 'Curiosity', desc: 'Ask questions and take an active part in learning.', icon: 'Sparkles' },
    { title: 'Perseverance', desc: 'Keep trying, learn from feedback and celebrate progress.', icon: 'Activity' },
    { title: 'Responsibility', desc: 'Take ownership of choices, learning and community.', icon: 'CheckCircle' },
  ] }, 2, 'dark'),

  section('academics-hero', 'page-academics', 'hero', { badge: 'Academics', heading: 'A strong foundation for what comes next', description: 'Learning at every stage is an opportunity to build understanding, independence and confidence.', image_url: photos.classroom, primary_btn_text: 'Ask About Admissions', primary_btn_link: '/admissions' }, 0, 'gradient'),
  section('academics-programmes', 'page-academics', 'services', { badge: 'Learning Journey', heading: 'Support at every stage', description: 'Our school brings students through a connected journey from early learning to higher secondary.', items: [
    { title: 'Primary years', desc: 'Develop literacy, numeracy, communication and a positive approach to school.', icon: 'BookOpen' },
    { title: 'Middle years', desc: 'Broaden subject understanding and build strong study habits.', icon: 'Layers' },
    { title: 'Secondary years', desc: 'Deepen knowledge, apply ideas and prepare for important assessments.', icon: 'Target' },
    { title: 'Higher secondary', desc: 'Focus on chosen subjects and prepare for future study and career pathways.', icon: 'GraduationCap' },
  ] }, 1),
  section('academics-note', 'page-academics', 'about', { badge: 'Learning Together', heading: 'Learning is a partnership', description: 'Students make their best progress when school and home work together. We encourage regular attendance, open communication and a steady commitment to learning.', image_url: photos.library, points: ['Regular attendance and a steady routine', 'Open communication between home and school', 'Encouragement to ask questions and seek support'], cta_text: 'Contact Our School', cta_link: '/contact' }, 2, 'muted'),

  section('campus-hero', 'page-campus', 'hero', { badge: 'Campus Life', heading: 'A school day full of possibility', description: 'Friendships, activities and new experiences help make each school day memorable.', image_url: photos.students, primary_btn_text: 'Visit Our Campus', primary_btn_link: '/contact' }, 0, 'gradient'),
  section('campus-gallery', 'page-campus', 'gallery', { badge: 'Explore', heading: 'Spaces to learn and grow', description: 'A glimpse of the places and experiences that support learning and school life.', images: [
    { title: 'Classroom learning', url: photos.classroom, category: 'Learning' }, { title: 'Reading and discovery', url: photos.library, category: 'Learning' }, { title: 'Science and exploration', url: photos.science, category: 'Learning' }, { title: 'Students learning together', url: photos.students, category: 'Community' },
  ] }, 1),
  section('campus-life', 'page-campus', 'services', { badge: 'Beyond the Classroom', heading: 'Discover, participate, belong', description: 'School life gives students opportunities to try new things and learn alongside one another.', items: [
    { title: 'Creative expression', desc: 'Make space for imagination, ideas and self-expression.', icon: 'Sparkles' },
    { title: 'Physical wellbeing', desc: 'Encourage movement, teamwork and healthy habits.', icon: 'Activity' },
    { title: 'Shared celebrations', desc: 'Bring the school community together through events and traditions.', icon: 'Globe' },
  ] }, 2, 'muted'),

  section('admissions-hero', 'page-admissions', 'hero', { badge: 'Admissions', heading: 'Begin your APG school journey', description: `We invite families to connect with us and learn about the admission process. Our campus is at ${campus}.`, image_url: photos.hero, primary_btn_text: 'Contact Admissions', primary_btn_link: '/contact', secondary_btn_text: 'Explore Academics', secondary_btn_link: '/academics' }, 0, 'gradient'),
  section('admissions-steps', 'page-admissions', 'services', { badge: 'Getting Started', heading: 'Three simple steps', description: 'Our school team can guide you through the information you need.', items: [
    { title: 'Get in touch', desc: 'Contact the school to share your child’s grade and ask your questions.', icon: 'Phone' },
    { title: 'Visit and learn', desc: 'Connect with our team to understand the school and its learning environment.', icon: 'MapPin' },
    { title: 'Discuss next steps', desc: 'Our team will explain the current application requirements and process.', icon: 'CheckCircle' },
  ] }, 1),
  section('admissions-faq', 'page-admissions', 'faq', { badge: 'Helpful Information', heading: 'Admissions questions', description: 'For current availability, documents and timings, please contact the school directly.', items: [
    { question: 'Where is the school located?', answer: campus + '.' },
    { question: 'How can I ask about available classes?', answer: 'Use the contact form or call the school office to discuss the current admissions availability.' },
    { question: 'What documents are required?', answer: 'Please contact the school office for the latest document checklist and application guidance.' },
  ] }, 2, 'muted'),

  section('contact-hero', 'page-contact', 'hero', { badge: 'Contact Us', heading: 'We would love to hear from you', description: `Reach the school to ask a question, discuss admissions or arrange a visit. We are located at ${campus}.` }, 0, 'gradient'),
  section('contact-form', 'page-contact', 'contact_form', { badge: 'Get in Touch', heading: 'Send an enquiry', description: 'Share your question and the school team will follow up.', address: campus, email: '', phone: '', hours: 'Please contact the school for office hours.' }, 1),
];

export const INITIAL_NAVIGATION: NavigationItem[] = [
  { id: 'nav-home', label: 'Home', url: '/', target: '_self', sort_order: 0, is_visible: true },
  { id: 'nav-about', label: 'About Us', url: '/about', target: '_self', sort_order: 1, is_visible: true },
  { id: 'nav-academics', label: 'Academics', url: '/academics', target: '_self', sort_order: 2, is_visible: true },
  { id: 'nav-campus', label: 'Campus Life', url: '/campus-life', target: '_self', sort_order: 3, is_visible: true },
  { id: 'nav-admissions', label: 'Admissions', url: '/admissions', target: '_self', sort_order: 4, is_visible: true },
  { id: 'nav-contact', label: 'Contact', url: '/contact', target: '_self', sort_order: 5, is_visible: true },
];

export const INITIAL_MEDIA: MediaItem[] = [
  { id: 'med-1', name: 'Students learning', url: photos.hero, type: 'image', size: 245000, format: 'image/jpeg', alt_text: 'Students learning together at school', caption: 'A welcoming school community', created_at: now },
  { id: 'med-2', name: 'Classroom', url: photos.classroom, type: 'image', size: 310000, format: 'image/jpeg', alt_text: 'Bright classroom with students', caption: 'Classroom learning', created_at: now },
  { id: 'med-3', name: 'School library', url: photos.library, type: 'image', size: 198000, format: 'image/jpeg', alt_text: 'Bookshelves in a school library', caption: 'Reading and discovery', created_at: now },
  { id: 'med-4', name: 'Science learning', url: photos.science, type: 'image', size: 215000, format: 'image/jpeg', alt_text: 'Science learning and experimentation', caption: 'Hands-on discovery', created_at: now },
  { id: 'med-5', name: 'Student community', url: photos.students, type: 'image', size: 215000, format: 'image/jpeg', alt_text: 'Students learning and growing together', caption: 'School life at APG', created_at: now },
];
