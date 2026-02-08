export type Lang = 'fr' | 'en' | 'ar';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  fr: {
    // Login
    'login.title': 'Connexion',
    'login.subtitle': 'Accède à ta balance des actions',
    'login.username': "Nom d'utilisateur",
    'login.usernamePlaceholder': 'Ton pseudo',
    'login.password': 'Mot de passe',
    'login.passwordPlaceholder': 'Ton mot de passe',
    'login.submit': 'Se connecter',
    'login.loading': 'Connexion...',
    'login.noAccount': 'Pas encore de compte ?',
    'login.createAccount': 'Créer un compte',
    'login.error': 'Identifiants incorrects',

    // Register
    'register.title': 'Inscription',
    'register.subtitle': 'Crée ton compte pour suivre tes actions',
    'register.username': "Nom d'utilisateur",
    'register.usernamePlaceholder': 'Choisis un pseudo',
    'register.email': 'Email',
    'register.emailPlaceholder': 'ton.email@exemple.com',
    'register.password': 'Mot de passe',
    'register.passwordPlaceholder': 'Minimum 6 caractères',
    'register.submit': 'Créer mon compte',
    'register.loading': 'Inscription...',
    'register.hasAccount': 'Déjà un compte ?',
    'register.login': 'Se connecter',
    'register.error': "Erreur lors de l'inscription",

    // Navbar
    'nav.balance': 'Balance',
    'nav.history': 'Historique',
    'nav.advice': 'Conseil IA',

    // Balance
    'balance.subtitle': 'Pèse tes actions du jour',
    'balance.badLabel': 'سيئات',
    'balance.goodLabel': 'حسنات',
    'balance.weight': 'poids:',
    'balance.positive': 'حسناتك أثقل',
    'balance.negative': 'سيئاتك أثقل',
    'balance.neutral': 'تعادل',
    'balance.reload': 'Recharger',

    // History
    'history.title': 'Historique',
    'history.subtitle': 'Suivi de ta balance sur les 30 derniers jours',
    'history.loading': 'Chargement...',
    'history.empty': 'Aucun historique pour le moment. Commence par cocher tes actions du jour !',
    'history.positiveDays': 'Jours positifs',
    'history.negativeDays': 'Jours négatifs',
    'history.neutralDays': 'Jours neutres',
    'history.badLabel': 'سيئات',
    'history.goodLabel': 'حسنات',

    // Advice
    'advice.title': 'Conseil du jour',
    'advice.subtitle': 'Un conseil personnalisé basé sur ta balance du jour',
    'advice.loading': "L'IA réfléchit à ton conseil...",
    'advice.sectionAdvice': 'Conseil',
    'advice.sectionDua': 'دعاء',
    'advice.sectionRef': 'Référence',
    'advice.empty': 'Clique ci-dessous pour recevoir ton conseil personnalisé',
    'advice.newAdvice': 'Nouveau conseil',
    'advice.getAdvice': 'Obtenir un conseil',
  },

  en: {
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Access your deeds balance',
    'login.username': 'Username',
    'login.usernamePlaceholder': 'Your username',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Your password',
    'login.submit': 'Log in',
    'login.loading': 'Logging in...',
    'login.noAccount': 'No account yet?',
    'login.createAccount': 'Create an account',
    'login.error': 'Invalid credentials',

    // Register
    'register.title': 'Sign Up',
    'register.subtitle': 'Create your account to track your deeds',
    'register.username': 'Username',
    'register.usernamePlaceholder': 'Choose a username',
    'register.email': 'Email',
    'register.emailPlaceholder': 'your.email@example.com',
    'register.password': 'Password',
    'register.passwordPlaceholder': 'Minimum 6 characters',
    'register.submit': 'Create my account',
    'register.loading': 'Signing up...',
    'register.hasAccount': 'Already have an account?',
    'register.login': 'Log in',
    'register.error': 'Registration error',

    // Navbar
    'nav.balance': 'Balance',
    'nav.history': 'History',
    'nav.advice': 'AI Advice',

    // Balance
    'balance.subtitle': 'Weigh your daily deeds',
    'balance.badLabel': 'Bad deeds',
    'balance.goodLabel': 'Good deeds',
    'balance.weight': 'weight:',
    'balance.positive': 'Good deeds outweigh',
    'balance.negative': 'Bad deeds outweigh',
    'balance.neutral': 'Balanced',
    'balance.reload': 'Reload',

    // History
    'history.title': 'History',
    'history.subtitle': 'Your balance over the last 30 days',
    'history.loading': 'Loading...',
    'history.empty': 'No history yet. Start by checking today\'s deeds!',
    'history.positiveDays': 'Positive days',
    'history.negativeDays': 'Negative days',
    'history.neutralDays': 'Neutral days',
    'history.badLabel': 'Bad',
    'history.goodLabel': 'Good',

    // Advice
    'advice.title': 'Daily Advice',
    'advice.subtitle': 'Personalized advice based on today\'s balance',
    'advice.loading': 'AI is thinking about your advice...',
    'advice.sectionAdvice': 'Advice',
    'advice.sectionDua': 'Supplication',
    'advice.sectionRef': 'Reference',
    'advice.empty': 'Click below to get your personalized advice',
    'advice.newAdvice': 'New advice',
    'advice.getAdvice': 'Get advice',
  },

  ar: {
    // Login
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'ادخل إلى ميزان أعمالك',
    'login.username': 'اسم المستخدم',
    'login.usernamePlaceholder': 'اسم المستخدم',
    'login.password': 'كلمة المرور',
    'login.passwordPlaceholder': 'كلمة المرور',
    'login.submit': 'تسجيل الدخول',
    'login.loading': '...جاري الدخول',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.createAccount': 'إنشاء حساب',
    'login.error': 'بيانات الدخول غير صحيحة',

    // Register
    'register.title': 'التسجيل',
    'register.subtitle': 'أنشئ حسابك لمتابعة أعمالك',
    'register.username': 'اسم المستخدم',
    'register.usernamePlaceholder': 'اختر اسم مستخدم',
    'register.email': 'البريد الإلكتروني',
    'register.emailPlaceholder': 'بريدك@مثال.com',
    'register.password': 'كلمة المرور',
    'register.passwordPlaceholder': '٦ أحرف على الأقل',
    'register.submit': 'إنشاء حسابي',
    'register.loading': '...جاري التسجيل',
    'register.hasAccount': 'لديك حساب بالفعل؟',
    'register.login': 'تسجيل الدخول',
    'register.error': 'خطأ أثناء التسجيل',

    // Navbar
    'nav.balance': 'الميزان',
    'nav.history': 'السجل',
    'nav.advice': 'نصيحة ذكية',

    // Balance
    'balance.subtitle': 'زِن أعمال يومك',
    'balance.badLabel': 'سيئات',
    'balance.goodLabel': 'حسنات',
    'balance.weight': 'الوزن:',
    'balance.positive': 'حسناتك أثقل',
    'balance.negative': 'سيئاتك أثقل',
    'balance.neutral': 'تعادل',
    'balance.reload': 'إعادة تحميل',

    // History
    'history.title': 'السجل',
    'history.subtitle': 'متابعة ميزانك خلال ٣٠ يوما',
    'history.loading': '...جاري التحميل',
    'history.empty': 'لا يوجد سجل بعد. ابدأ بتحديد أعمال يومك!',
    'history.positiveDays': 'أيام إيجابية',
    'history.negativeDays': 'أيام سلبية',
    'history.neutralDays': 'أيام متعادلة',
    'history.badLabel': 'سيئات',
    'history.goodLabel': 'حسنات',

    // Advice
    'advice.title': 'نصيحة اليوم',
    'advice.subtitle': 'نصيحة مخصصة بناءً على ميزان يومك',
    'advice.loading': '...الذكاء الاصطناعي يفكر في نصيحتك',
    'advice.sectionAdvice': 'نصيحة',
    'advice.sectionDua': 'دعاء',
    'advice.sectionRef': 'مرجع',
    'advice.empty': 'اضغط أدناه للحصول على نصيحتك المخصصة',
    'advice.newAdvice': 'نصيحة جديدة',
    'advice.getAdvice': 'الحصول على نصيحة',
  },
};